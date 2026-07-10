const request = require('supertest');
const { app } = require('./server');

(async () => {
  const payload = { username: 'u_test_repro', email: 'test_repro@example.com', password: 'StrongP@ssw0rd' };
  const first = await request(app).post('/api/auth/register').send(payload);
  console.log('first', first.status, JSON.stringify(first.body));

  const second = await request(app).post('/api/auth/register').send({
    username: 'u_test_repro_2',
    email: payload.email,
    password: payload.password,
  });

  console.log('second', second.status, JSON.stringify(second.body));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
