import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('health', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(typeof res.body.timestamp).toBe('string');
  });
});
