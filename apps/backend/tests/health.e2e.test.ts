import request from 'supertest';

import { createApp } from '../src/app';

describe('health check', () => {
  it('returns ok status', async () => {
    const app = createApp();
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
