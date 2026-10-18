import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createDatabase } from '../src/config/database.js';
import { createApp } from '../src/app.js';
import { readRuntimeConfig } from '../src/config/env.js';

// Fail loudly when not configured: a zero-test/skip run must not claim readiness.
if (process.env.TEST_DB_CONFIRM !== 'lab-only') throw new Error('Cần TEST_DB_CONFIRM=lab-only và DB_* trỏ tới schema đã seed riêng cho kiểm thử. Có thể chạy npm run test:lab để dùng MySQL Docker thật.');
const db = createDatabase();
const config = readRuntimeConfig();
const app = createApp({ db, config });
const post = (agent, path, data) => agent.post(path).set('Host', `localhost:${config.port}`).set('Origin', config.frontendUrl).send(data);
const get = (agent, path) => agent.get(path).set('Host', `localhost:${config.port}`);
const credentials = { username: 'admin', password: 'admin123' };
const injection = { username: "admin' -- ", password: 'anything' };
const payload = "' OR 1=1 -- ";

before(async () => {
  const [[counts]] = await db.query("SELECT (SELECT COUNT(*) FROM users) AS users, (SELECT COUNT(*) FROM phones WHERE status='on') AS visible, (SELECT COUNT(*) FROM phones WHERE status='off') AS hidden");
  assert.deepEqual(counts, { users: 5, visible: 6, hidden: 4 }, 'Phải dùng schema seed chuẩn, không dùng dữ liệu thật.');
});
after(async () => { await db.end(); });

test('TC01: Vulnerable chấp nhận tài khoản đúng và ghi nhận credentials session', async () => {
  const agent = request.agent(app);
  const response = await post(agent, '/api/vulnerable/login', credentials);
  assert.equal(response.status, 200);
  assert.equal(response.body.user.authentication, 'credentials');
  assert.equal(response.body.user.role, undefined);
  assert.equal((await get(agent, '/api/auth/me')).body.user.username, 'admin');
  assert.doesNotMatch(JSON.stringify(response.body), /admin123/);
  assert.match(response.headers['set-cookie'][0], /HttpOnly/);
  assert.match(response.headers['set-cookie'][0], /SameSite=Strict/);
});
test('TC02: Secure chấp nhận cùng tài khoản đúng bằng Prepared Statement', async () => {
  const response = await post(request(app), '/api/secure/login', credentials);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.trace.parameters, ['admin', '••••••••']);
  assert.doesNotMatch(JSON.stringify(response.body), /admin123/);
});
for (const [id, mode] of [['TC03', 'vulnerable'], ['TC04', 'secure']]) {
  test(`${id}: ${mode} từ chối mật khẩu sai`, async () => {
    const response = await post(request(app), `/api/${mode}/login`, { username: 'admin', password: 'wrong-password' });
    assert.equal(response.status, 401);
    assert.equal(response.body.trace.result.authenticated, false);
    assert.doesNotMatch(JSON.stringify(response.body), /wrong-password/);
  });
}
test('TC05: MySQL thật cho phép bypass Vulnerable, chỉ tạo Injection Demo Session', async () => {
  const agent = request.agent(app);
  const response = await post(agent, '/api/vulnerable/login', injection);
  assert.equal(response.status, 200);
  assert.equal(response.body.user.authentication, 'injection-demo');
  assert.equal(response.body.user.labSession, true);
  assert.equal(response.body.user.role, undefined);
  assert.equal((await get(agent, '/api/auth/me')).body.user.authentication, 'injection-demo');
});
test('TC06: MySQL thật từ chối chính xác cùng payload trên Secure', async () => {
  const response = await post(request(app), '/api/secure/login', injection);
  assert.equal(response.status, 401);
  assert.equal(response.body.trace.result.matchedRows, 0);
});

async function authenticatedAgent() {
  const agent = request.agent(app);
  assert.equal((await post(agent, '/api/secure/login', credentials)).status, 200);
  return agent;
}
for (const [id, mode] of [['TC07', 'vulnerable'], ['TC08', 'secure']]) {
  test(`${id}: ${mode} tìm iPhone chỉ trả sản phẩm ON phù hợp`, async () => {
    const agent = await authenticatedAgent();
    const response = await get(agent, `/api/${mode}/phones/search?q=iPhone`);
    assert.equal(response.status, 200);
    assert.equal(response.body.count, 2);
    assert.ok(response.body.phones.every((phone) => phone.status === 'on' && phone.name.includes('iPhone')));
  });
}
test('TC09: payload thật thay đổi predicate và trả 10 sản phẩm, gồm 4 OFF', async () => {
  const agent = await authenticatedAgent();
  const response = await get(agent, '/api/vulnerable/phones/search').query({ q: payload });
  assert.equal(response.status, 200);
  assert.equal(response.body.count, 10);
  assert.equal(response.body.hiddenCount, 4);
  assert.equal(response.body.exposed, true);
  assert.equal(response.body.phones.filter((phone) => phone.status === 'off').length, 4);
});
test('TC10: cùng payload Secure không trả OFF, input luôn là parameter', async () => {
  const agent = await authenticatedAgent();
  const response = await get(agent, '/api/secure/phones/search').query({ q: payload });
  assert.equal(response.status, 200);
  assert.equal(response.body.count, 0);
  assert.equal(response.body.hiddenCount, 0);
  assert.equal(response.body.exposed, false);
  assert.deepEqual(response.body.trace.parameters, [`%${payload}%`]);
});
test('payload khác chứng minh không hardcode: chỉ lộ đúng 1 sản phẩm OFF được chọn bởi predicate', async () => {
  const agent = await authenticatedAgent();
  const q = "no-match' OR id = 7 -- ";
  const response = await get(agent, '/api/vulnerable/phones/search').query({ q });
  assert.equal(response.status, 200);
  assert.equal(response.body.count, 1);
  assert.equal(response.body.hiddenCount, 1);
  assert.equal(response.body.phones[0].id, 7);
  const secure = await get(agent, '/api/secure/phones/search').query({ q });
  assert.equal(secure.body.count, 0);
  assert.equal(secure.body.hiddenCount, 0);
});
test('TC12: logout phá hủy session và không thể sử dụng lại cookie cũ', async () => {
  const agent = request.agent(app);
  const login = await post(agent, '/api/secure/login', credentials);
  const oldCookie = login.headers['set-cookie'][0].split(';')[0];
  assert.equal((await post(agent, '/api/auth/logout', {})).status, 200);
  assert.equal((await get(agent, '/api/auth/me')).status, 401);
  assert.equal((await get(request(app), '/api/auth/me').set('Cookie', oldCookie)).status, 401);
});
test('session fixation: đăng nhập lần nữa đổi session ID', async () => {
  const agent = request.agent(app);
  const first = await post(agent, '/api/secure/login', credentials);
  const second = await post(agent, '/api/secure/login', credentials);
  assert.notEqual(first.headers['set-cookie'][0].split(';')[0], second.headers['set-cookie'][0].split(';')[0]);
});
test('tìm mặc định trả đúng 6 ON ở cả hai chế độ; wildcard không làm lộ OFF ở Secure', async () => {
  const agent = await authenticatedAgent();
  for (const mode of ['vulnerable', 'secure']) {
    const response = await get(agent, `/api/${mode}/phones/search`);
    assert.equal(response.body.count, 6);
    assert.equal(response.body.hiddenCount, 0);
  }
  const wildcard = await get(agent, '/api/secure/phones/search').query({ q: '%' });
  assert.equal(wildcard.body.count, 6);
  assert.equal(wildcard.body.hiddenCount, 0);
});
test('multiple statements bị từ chối mà không thay đổi dữ liệu', async () => {
  const agent = await authenticatedAgent();
  const response = await get(agent, '/api/vulnerable/phones/search').query({ q: "'; SELECT 1 -- " });
  assert.equal(response.status, 400);
  assert.equal(response.body.code, 'QUERY_REJECTED');
  assert.equal((await get(agent, '/api/secure/phones/search')).body.count, 6);
});
test('tài khoản runtime chỉ có quyền SELECT, không được UPDATE dữ liệu seed', async () => {
  // A harmless no-op UPDATE verifies the actual permission boundary.
  await assert.rejects(() => db.query('UPDATE phones SET quantity = quantity WHERE id = -1'), (error) => error.code === 'ER_TABLEACCESS_DENIED_ERROR');
});
test('PhoneStore compact response giữ nguyên Login/Search thật nhưng không gửi SQL trace', async () => {
  for (const mode of ['vulnerable', 'secure']) {
    const agent = request.agent(app);
    const response = await post(agent, `/api/${mode}/login`, credentials).set('X-Lab-Trace', 'omit');
    assert.equal(response.status, 200);
    assert.deepEqual(Object.keys(response.body), ['user']);
    assert.equal((await get(agent, '/api/auth/me')).body.user.username, 'admin');
    const phones = await get(agent, `/api/${mode}/phones/search`).query({ q: payload }).set('X-Lab-Trace', 'omit');
    assert.equal(phones.status, 200);
    assert.deepEqual(Object.keys(phones.body).sort(), ['count', 'phones']);
    assert.equal(phones.body.count, mode === 'vulnerable' ? 10 : 0);
    const failed = await post(agent, `/api/${mode}/login`, { username: 'admin', password: 'wrong-password' }).set('X-Lab-Trace', 'omit');
    assert.equal(failed.status, 401);
    assert.equal(failed.body.code, 'INVALID_CREDENTIALS');
    assert.equal(failed.body.trace, undefined);
  }
});
