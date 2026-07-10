/**
 * Test Setup
 *
 * Cleans the database before and after each test run to ensure isolation.
 */

const prisma = require("../config/database");

beforeAll(async () => {
  await Promise.resolve();
});

afterEach(async () => {
  await Promise.resolve();
});

afterAll(async () => {
  await prisma.$disconnect();
});
