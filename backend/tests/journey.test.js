const request = require('supertest');
const { app } = require('../server');
const prisma = require('../config/database');

describe('Journey API', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates and fetches journey records without removing unrelated records', async () => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createRes = await request(app)
      .post('/api/madu/journey')
      .send({
        title: `Test Journey ${uniqueSuffix}`,
        organization: 'JAIWA Team',
        date: '2026-07-04',
        description: 'Regression test entry'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);

    const listRes = await request(app).get('/api/madu/journey');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data.journey)).toBe(true);
    expect(listRes.body.data.journey.some((item) => item.title.includes(uniqueSuffix))).toBe(true);
  });
});
