const request = require('supertest');
const express = require('express');
import router from './index.js';

const app = express();
app.use('/api', router);

describe('Health Check API', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
