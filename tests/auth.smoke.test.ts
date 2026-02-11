import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/server';
import pool from '../src/config/database';

const runDbTests = process.env.RUN_DB_TESTS === '1';
const email = `smoke_${Date.now()}@example.com`;
const password = 'test1234';
const name = 'Smoke Test';

describe('auth', () => {
  if (!runDbTests) {
    it.skip('skipped (set RUN_DB_TESTS=1 to enable)', () => {});
    return;
  }

  it('register -> login -> me', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ name, email, password });

    expect(register.status).toBe(201);
    expect(register.body).toHaveProperty('token');
    expect(register.body).toHaveProperty('user');
    expect(register.body.user).toMatchObject({ email, name });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(login.status).toBe(200);
    expect(login.body).toHaveProperty('token');

    const token = login.body.token as string;

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(me.status).toBe(200);
    expect(me.body).toHaveProperty('user');
    expect(me.body.user).toMatchObject({ email, name });
  });
});

if (runDbTests) {
  afterAll(async () => {
    try {
      await pool.execute('DELETE FROM users WHERE email = ?', [email]);
    } finally {
      await pool.end();
    }
  });
}
