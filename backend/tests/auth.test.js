/**
 * Authentication Integration Tests
 *
 * Tests every authentication endpoint end-to-end.
 * Uses Supertest to send HTTP requests and Jest for assertions.
 */

const request = require("supertest");
const crypto = require("crypto");
const { app } = require("../server");
const prisma = require("../config/database");
const passwordService = require("../services/passwordService");
const emailService = require("../services/emailService");

let userCounter = 0;

/**
 * Generates a valid test user payload.
 */
const generateUserPayload = (overrides = {}) => {
  userCounter += 1;
  const uniqueId = `${Date.now().toString(36)}${userCounter}`;

  return {
    username: `u_${uniqueId}`,
    email: `test_${uniqueId}@example.com`.toLowerCase(),
    password: "StrongP@ssw0rd",
    ...overrides,
  };
};

/**
 * Registers a test user and returns the response.
 */
const registerUser = async (payload) => {
  return request(app).post("/api/auth/register").send(payload);
};

/**
 * Creates a verified user directly in the database.
 */
const createVerifiedUser = async (role = "USER") => {
  const payload = generateUserPayload();
  const hashedPassword = await passwordService.hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      username: payload.username,
      email: payload.email,
      password: hashedPassword,
      role,
      isVerified: true,
    },
  });

  return { ...payload, id: user.id };
};

/**
 * Logs in a user and returns tokens.
 */
const loginUser = async (email, password, endpoint = "/api/auth/login") => {
  const response = await request(app)
    .post(endpoint)
    .send({ email, password });

  return response.body;
};

describe("Authentication API", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user and request verification code", async () => {
      const payload = generateUserPayload();
      const sendSpy = jest.spyOn(emailService, "sendVerificationEmail");

      const response = await registerUser(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(payload.email);
      expect(response.body.data.expiresAt).toBeDefined();
      expect(sendSpy).toHaveBeenCalledWith(
        payload.email,
        payload.username,
        expect.stringMatching(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
      );

      sendSpy.mockRestore();
    });

    it("should replace an existing pending registration when re-registering before verification", async () => {
      const payload = generateUserPayload();
      await registerUser(payload);

      const replacementPayload = {
        ...generateUserPayload(),
        email: payload.email,
        username: `u_${Date.now().toString(36)}_r`,
      };

      const response = await registerUser(replacementPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const pendingUsers = await prisma.pendingUser.findMany({
        where: { email: payload.email },
      });

      expect(pendingUsers).toHaveLength(1);
      expect(pendingUsers[0].username).toBe(replacementPayload.username);

      const verifiedUsers = await prisma.user.findMany({
        where: { email: payload.email },
      });

      expect(verifiedUsers).toHaveLength(0);
    });

    it("should reject invalid password", async () => {
      const payload = generateUserPayload({ password: "weak" });

      const response = await registerUser(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/auth/verify-email", () => {
    it("should verify a user's email with a valid code", async () => {
      const payload = generateUserPayload();
      const sendSpy = jest.spyOn(emailService, "sendVerificationEmail");
      await registerUser(payload);
      const code = sendSpy.mock.calls[0][2];
      sendSpy.mockRestore();

      const response = await request(app)
        .post("/api/auth/verify-email")
        .send({ email: payload.email, code });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const user = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      expect(user.isVerified).toBe(true);
      expect(user.verifyTokenHash).toBeNull();
    });

    it("should reject invalid verification code", async () => {
      const payload = generateUserPayload();
      await registerUser(payload);

      const response = await request(app)
        .post("/api/auth/verify-email")
        .send({ email: payload.email, code: "BADCODE1" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/resend-verification-code", () => {
    it("should resend a verification code", async () => {
      const payload = generateUserPayload();
      await registerUser(payload);
      const sendSpy = jest.spyOn(emailService, "sendVerificationEmail");

      const response = await request(app)
        .post("/api/auth/resend-verification-code")
        .send({ email: payload.email });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledWith(
        payload.email,
        payload.username,
        expect.stringMatching(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
      );

      sendSpy.mockRestore();
    });

    it("should return generic response for unknown email", async () => {
      const response = await request(app)
        .post("/api/auth/resend-verification-code")
        .send({ email: "notfound@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login a verified user and return tokens", async () => {
      const user = await createVerifiedUser("USER");

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: user.email, password: user.password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.role).toBe("user");
    });

    it("should reject unverified users", async () => {
      const payload = generateUserPayload();
      await registerUser(payload);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: payload.email, password: payload.password });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it("should reject incorrect password", async () => {
      const user = await createVerifiedUser("USER");

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: user.email, password: "WrongPassword1!" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should reject madu users on user login", async () => {
      const user = await createVerifiedUser("MADU");

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: user.email, password: user.password });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/madu-login", () => {
    it("should login a madu user", async () => {
      const user = await createVerifiedUser("MADU");

      const response = await request(app)
        .post("/api/auth/madu-login")
        .send({ email: user.email, password: user.password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe("madu");
    });

    it("should allow admin login", async () => {
      const user = await createVerifiedUser("ADMIN");

      const response = await request(app)
        .post("/api/auth/madu-login")
        .send({ email: user.email, password: user.password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should reject regular users", async () => {
      const user = await createVerifiedUser("USER");

      const response = await request(app)
        .post("/api/auth/madu-login")
        .send({ email: user.email, password: user.password });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user", async () => {
      const user = await createVerifiedUser("USER");
      const loginData = await loginUser(user.email, user.password);

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${loginData.data.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(user.email);
    });

    it("should reject missing token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should rotate refresh token and return new tokens", async () => {
      const user = await createVerifiedUser("USER");
      const loginData = await loginUser(user.email, user.password);
      const oldRefreshToken = loginData.data.refreshToken;

      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: oldRefreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.refreshToken).not.toBe(oldRefreshToken);

      // Old refresh token should be revoked
      const secondResponse = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: oldRefreshToken });

      expect(secondResponse.status).toBe(401);
    });

    it("should reject invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: "invalidtoken" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/auth/change-password", () => {
    it("should change password", async () => {
      const user = await createVerifiedUser("USER");
      const loginData = await loginUser(user.email, user.password);

      const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${loginData.data.accessToken}`)
        .send({ oldPassword: user.password, newPassword: "NewP@ssw0rd" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Old password should not work anymore
      const oldLogin = await loginUser(user.email, user.password);
      expect(oldLogin.success).toBe(false);

      // New password should work
      const newLogin = await loginUser(user.email, "NewP@ssw0rd");
      expect(newLogin.success).toBe(true);
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should send a password reset code", async () => {
      const user = await createVerifiedUser("USER");
      const sendSpy = jest.spyOn(emailService, "sendPasswordResetEmail");

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: user.email });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledWith(
        user.email,
        user.username,
        expect.stringMatching(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
      );

      sendSpy.mockRestore();
    });

    it("should return generic response for unknown email", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "notfound@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/verify-reset-code", () => {
    it("should verify a valid reset code", async () => {
      const user = await createVerifiedUser("USER");
      const sendSpy = jest.spyOn(emailService, "sendPasswordResetEmail");
      await request(app).post("/api/auth/forgot-password").send({ email: user.email });
      const code = sendSpy.mock.calls[0][2];
      sendSpy.mockRestore();

      const response = await request(app)
        .post("/api/auth/verify-reset-code")
        .send({ email: user.email, code });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should reject invalid reset code", async () => {
      const user = await createVerifiedUser("USER");

      const response = await request(app)
        .post("/api/auth/verify-reset-code")
        .send({ email: user.email, code: "BADCODE1" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should reset password with a valid code", async () => {
      const user = await createVerifiedUser("USER");
      const sendSpy = jest.spyOn(emailService, "sendPasswordResetEmail");
      await request(app).post("/api/auth/forgot-password").send({ email: user.email });
      const code = sendSpy.mock.calls[0][2];
      sendSpy.mockRestore();

      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ email: user.email, code, newPassword: "ResetP@ssw0rd" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const loginData = await loginUser(user.email, "ResetP@ssw0rd");
      expect(loginData.success).toBe(true);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout current device", async () => {
      const user = await createVerifiedUser("USER");
      const loginData = await loginUser(user.email, user.password);

      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${loginData.data.accessToken}`)
        .send({ refreshToken: loginData.data.refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Refresh token should be revoked
      const refreshResponse = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: loginData.data.refreshToken });

      expect(refreshResponse.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout-all", () => {
    it("should logout all devices", async () => {
      const user = await createVerifiedUser("USER");
      const loginData1 = await loginUser(user.email, user.password);
      const loginData2 = await loginUser(user.email, user.password);

      const response = await request(app)
        .post("/api/auth/logout-all")
        .set("Authorization", `Bearer ${loginData1.data.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Both refresh tokens should be revoked
      const refresh1 = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: loginData1.data.refreshToken });
      expect(refresh1.status).toBe(401);

      const refresh2 = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: loginData2.data.refreshToken });
      expect(refresh2.status).toBe(401);
    });
  });

  describe("PUT /api/auth/profile", () => {
    it("should update profile", async () => {
      const user = await createVerifiedUser("USER");
      const loginData = await loginUser(user.email, user.password);
      const newUsername = `upd_${Date.now().toString(36)}`;

      const response = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${loginData.data.accessToken}`)
        .send({ username: newUsername });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(newUsername);
    });
  });
});

describe("Madu Admin API", () => {
  it("should fetch dashboard stats", async () => {
    const user = await createVerifiedUser("MADU");
    const loginData = await loginUser(
      user.email,
      user.password,
      "/api/auth/madu-login"
    );

    const response = await request(app)
      .get("/api/madu/dashboard")
      .set("Authorization", `Bearer ${loginData.data.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.dashboard.totalUsers).toBeDefined();
  });

  it("should reject regular users", async () => {
    const user = await createVerifiedUser("USER");
    const loginData = await loginUser(user.email, user.password);

    const response = await request(app)
      .get("/api/madu/dashboard")
      .set("Authorization", `Bearer ${loginData.data.accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should update user role", async () => {
    const admin = await createVerifiedUser("ADMIN");
    const target = await createVerifiedUser("USER");
    const loginData = await loginUser(
      admin.email,
      admin.password,
      "/api/auth/madu-login"
    );

    const response = await request(app)
      .patch(`/api/madu/users/${target.id}/role`)
      .set("Authorization", `Bearer ${loginData.data.accessToken}`)
      .send({ role: "MADU" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.role).toBe("madu");
  });

  it("should delete a user", async () => {
    const admin = await createVerifiedUser("ADMIN");
    const target = await createVerifiedUser("USER");
    const loginData = await loginUser(
      admin.email,
      admin.password,
      "/api/auth/madu-login"
    );

    const response = await request(app)
      .delete(`/api/madu/users/${target.id}`)
      .set("Authorization", `Bearer ${loginData.data.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const deletedUser = await prisma.user.findUnique({
      where: { id: target.id },
    });
    expect(deletedUser).toBeNull();
  });
});
