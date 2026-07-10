# Changelog

## [Feature 2] Production Authentication — 2026-07-01

### Added
- Prisma schema with `Role` enum (`USER`, `MADU`, `ADMIN`) and `RefreshToken` model
- `services/authService.js` — complete authentication business logic
- `services/tokenService.js` — JWT and refresh token management
- `services/userService.js` — user CRUD and query helpers
- `services/passwordService.js` — bcrypt hashing/comparison
- `services/emailService.js` — verification, reset, and email change emails
- `controllers/authController.js` — thin auth HTTP layer
- `controllers/maduController.js` — admin dashboard HTTP layer
- `middleware/auth/authenticate.js` — unified JWT verification
- `middleware/auth/authorizeRole.js` — role-based access control
- `middleware/validate/validateRequest.js` — Joi validation runner
- `validators/authValidator.js` + `validators/commonValidator.js` — request schemas
- `config/database.js` — Prisma client singleton
- Integration tests in `backend/tests/auth.test.js` (27 tests)
- `jest.config.js` and `tests/setup.js`

### Changed
- `config/env.js` — added auth, database, and email environment validation
- `.env.example` — documented all required environment variables
- `server.js` — uses `createApp()`, mounts new routes, conditional server start in tests
- `routes/authRoutes.js` — refactored with validators and new controllers
- `routes/maduRoutes.js` — refactored with auth + role middleware
- `assets/js/api.js` — `refreshAccessToken()` now saves the new rotated refresh token
- `assets/js/dashboard.js` and `assets/js/madu-rung.js` — logout sends refresh token

### Removed
- Legacy `authControllers.js`, `maduControllers.js`
- Legacy middleware: `authMiddleware.js`, `verifyToken.js`, `maduMiddleware.js`, `rateLimitMiddleware.js`, `loginLimiter.js`
- Duplicate `utils/passwordValidator.js`, `validators/passwordValidator.js`, `validators/usernameValidator.js`
- Old `models/prisma.js` (replaced by `config/database.js`)

### Security
- Refresh tokens are stored as SHA-256 hashes, rotated on every use, and revoked on logout
- Password reset/change revokes all refresh tokens
- Input validation via Joi on every endpoint
- Role-based access control enforced on admin routes
- Email verification required before login
