import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { databaseOptions } from '../src/config/database.js';
import { readRuntimeConfig } from '../src/config/env.js';
import { loginInput, searchInput } from '../src/services/validation.js';

const databaseEnv = { DB_HOST: '127.0.0.1', DB_USER: 'fixture', DB_PASSWORD: 'test-only', DB_NAME: 'fixture', DB_SSL_MODE: 'disabled' };

test('TC14: thiếu cấu hình Aiven báo tên trường thiếu, không giả kết nối thành công', () => {
  assert.throws(() => databaseOptions({}), (error) => error.code === 'CONFIGURATION_REQUIRED' && /DB_HOST/.test(error.publicMessage) && /DB_PASSWORD/.test(error.publicMessage));
});
test('TC14 startup: backend thoát mã 1 khi thiếu Aiven, không mở cổng hay báo kết nối thành công', () => {
  const result = spawnSync(process.execPath, ['server.js'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8',
    env: { ...process.env, SESSION_SECRET: 'startup-test-only-'.repeat(3), DB_HOST: '', DB_USER: '', DB_PASSWORD: '', DB_NAME: '' },
    timeout: 5000,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Chưa cấu hình Aiven MySQL/);
  assert.doesNotMatch(result.stdout, /đang chạy|đã phản hồi/);
});
test('Aiven bắt buộc TLS; không cho phép tắt TLS từ xa', () => {
  assert.throws(() => databaseOptions({ ...databaseEnv, DB_HOST: 'lab.example.aivencloud.com' }), /TLS/);
  assert.throws(() => databaseOptions({ ...databaseEnv, DB_HOST: 'lab.example.aivencloud.com', DB_SSL_MODE: 'required' }), /DB_SSL_CA_PATH/);
});
test('TLS CA không tồn tại báo lỗi cấu hình rõ ràng', () => {
  assert.throws(() => databaseOptions({ ...databaseEnv, DB_SSL_MODE: 'required', DB_SSL_CA_PATH: '/nonexistent/querylab-ca.pem' }), /CA certificate/);
});
test('kết nối luôn tắt multipleStatements, pool hữu hạn', () => {
  const options = databaseOptions(databaseEnv);
  assert.equal(options.multipleStatements, false);
  assert.equal(options.connectionLimit, 5);
  assert.equal(options.queueLimit, 20);
});
test('runtime không chấp nhận session secret ngắn hoặc frontend ngoài localhost', () => {
  assert.throws(() => readRuntimeConfig({}), /SESSION_SECRET/);
  assert.throws(() => readRuntimeConfig({ SESSION_SECRET: 'a'.repeat(32), FRONTEND_URL: 'https://outside.example' }), /localhost/);
  assert.throws(() => readRuntimeConfig({ SESSION_SECRET: 'a'.repeat(32), PORT: 'wrong' }), /PORT/);
});
test('validation từ chối input có kiểu sai, mảng, ký tự điều khiển và quá dài', () => {
  assert.throws(() => loginInput({ username: { value: 'admin' }, password: 'x' }), /Username/);
  assert.throws(() => searchInput({ q: ['a', 'b'] }), /Từ khóa/);
  assert.throws(() => searchInput({ q: 'x'.repeat(201) }), /Từ khóa/);
  assert.throws(() => loginInput({ username: 'admin\n', password: 'x' }), /Username/);
});
