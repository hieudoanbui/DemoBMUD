import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

// This dependency only throws: boundary tests cannot manufacture database success.
const unavailableDb = { execute: async () => { throw new Error('Do not expose connection secrets or this stack'); } };
const config = { port: 5000, frontendUrl: 'http://localhost:5173', sessionSecret: 'boundary-tests-only-'.repeat(3), labMode: true };
const app = createApp({ db: unavailableDb, config });
const local = (req) => req.set('Host', 'localhost:5000');

test('chưa đăng nhập: cả hai endpoint sản phẩm đều trả 401', async () => {
  for (const mode of ['vulnerable', 'secure']) {
    const response = await local(request(app).get(`/api/${mode}/phones/search`));
    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'UNAUTHENTICATED');
  }
});
test('Host ngoài loopback và DNS rebinding bị chặn', async () => {
  const response = await request(app).get('/api/health').set('Host', 'evil.example');
  assert.equal(response.status, 403);
  assert.equal(response.body.code, 'LOCAL_ONLY');
});
test('Origin ngoài lab và POST thiếu Origin bị chặn', async () => {
  const foreign = await local(request(app).post('/api/secure/login')).set('Origin', 'https://evil.example').send({});
  assert.equal(foreign.status, 403);
  const missing = await local(request(app).post('/api/secure/login')).send({});
  assert.equal(missing.status, 403);
});
test('không tin reverse proxy hoặc header forwarded', async () => {
  for (const header of ['Forwarded', 'X-Forwarded-For', 'X-Forwarded-Host', 'X-Forwarded-Proto']) {
    const response = await local(request(app).get('/api/health')).set(header, 'untrusted');
    assert.equal(response.status, 403);
  }
});
test('LAB_MODE=false vô hiệu hóa toàn bộ Vulnerable endpoints', async () => {
  const disabled = createApp({ db: unavailableDb, config: { ...config, labMode: false } });
  const response = await local(request(disabled).post('/api/vulnerable/login')).set('Origin', config.frontendUrl).send({ username: 'admin', password: 'x' });
  assert.equal(response.status, 403);
  assert.equal(response.body.code, 'LAB_DISABLED');
  assert.equal((await local(request(disabled).get('/api/vulnerable/phones/search'))).status, 403);
});
test('lỗi database không lộ stack trace hay chi tiết nội bộ', async () => {
  const response = await local(request(app).get('/api/health'));
  assert.equal(response.status, 503);
  assert.equal(response.body.code, 'DATABASE_UNAVAILABLE');
  assert.doesNotMatch(response.text, /connection secrets|Error:|security\.test|stack/);
});
test('validation secure input và JSON sai trả 400', async () => {
  const response = await local(request(app).post('/api/secure/login')).set('Origin', config.frontendUrl).send({ username: [], password: 'x' });
  assert.equal(response.status, 400);
  const badJson = await local(request(app).post('/api/secure/login')).set('Origin', config.frontendUrl).set('Content-Type', 'application/json').send('{invalid');
  assert.equal(badJson.status, 400);
  assert.equal(badJson.body.code, 'INVALID_JSON');
});
