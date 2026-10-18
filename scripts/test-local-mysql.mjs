import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const image = 'mysql:8.4@sha256:24989179f58856db763f418010c1169fecc944e3ec1ea7e921572d83eb070f70';
const name = `querylab-test-${process.pid}-${randomBytes(3).toString('hex')}`;
const rootPassword = randomBytes(32).toString('hex');
const readerPassword = randomBytes(32).toString('hex');
let connection;
let created = false;

function command(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} đã thoát với mã ${code}`)));
  });
}

try {
  if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) throw new Error('Cần Docker daemon để chạy MySQL fixture thật. Không dùng mock thay thế.');
  console.log('Tạo MySQL 8.4 fixture tạm thời, chỉ publish loopback. Không dùng cấu hình Aiven.');
  await command('docker', ['run', '--rm', '-d', '--name', name, '-p', '127.0.0.1::3306',
    '-e', 'MYSQL_ROOT_PASSWORD', '-e', 'MYSQL_ROOT_HOST=%', '-e', 'MYSQL_DATABASE=querylab_test', image],
  { env: { ...process.env, MYSQL_ROOT_PASSWORD: rootPassword } });
  created = true;
  const binding = spawnSync('docker', ['port', name, '3306/tcp'], { encoding: 'utf8' });
  if (binding.status !== 0 || !/^127\.0\.0\.1:\d+\s*$/.test(binding.stdout)) throw new Error('Docker phải publish MySQL duy nhất trên 127.0.0.1.');
  const port = Number(binding.stdout.trim().split(':').pop());
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      connection = await mysql.createConnection({ host: '127.0.0.1', port, user: 'root', password: rootPassword, database: 'querylab_test', multipleStatements: false, connectTimeout: 1500 });
      await connection.execute('SELECT 1');
      break;
    } catch {
      if (connection) { await connection.end().catch(() => {}); connection = null; }
      if (attempt === 59) throw new Error('MySQL fixture không sẵn sàng sau 60 lần kiểm tra.');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  const initializerEnv = {
    ...process.env, DB_HOST: '127.0.0.1', DB_PORT: String(port), DB_USER: 'root', DB_PASSWORD: rootPassword,
    DB_NAME: 'querylab_test', DB_SSL_MODE: 'disabled', DB_INIT_CONFIRM: 'lab-only',
  };
  // Exercise the documented init command itself, twice to prove repeatability.
  await command('npm', ['run', 'db:init'], { env: initializerEnv });
  await command('npm', ['run', 'db:init'], { env: initializerEnv });
  await connection.query("CREATE USER 'lab_reader'@'%' IDENTIFIED BY ?", [readerPassword]);
  await connection.query("GRANT SELECT ON querylab_test.users TO 'lab_reader'@'%'");
  await connection.query("GRANT SELECT ON querylab_test.phones TO 'lab_reader'@'%'");
  const [[version]] = await connection.execute('SELECT VERSION() AS version');
  console.log(`MySQL ${version.version}: schema/seed đã chạy; app user chỉ có SELECT trên users và phones.`);
  await connection.end(); connection = null;
  const env = {
    ...process.env, DB_HOST: '127.0.0.1', DB_PORT: String(port), DB_USER: 'lab_reader', DB_PASSWORD: readerPassword,
    DB_NAME: 'querylab_test', DB_SSL_MODE: 'disabled', TEST_DB_CONFIRM: 'lab-only',
    SESSION_SECRET: randomBytes(48).toString('hex'), LAB_MODE: 'true', FRONTEND_URL: 'http://localhost:5173', PORT: '5000',
    ...(spawnSync('test', ['-x', '/usr/bin/chromium']).status === 0 && !process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: '/usr/bin/chromium' } : {}),
  };
  for (const script of ['test', 'build', 'test:integration', 'test:e2e']) await command('npm', ['run', script], { env });
  console.log('Hoàn tất: unit/component, build, integration và browser E2E đều thành công trên MySQL fixture thật. Aiven chưa được kiểm tra.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end().catch(() => {});
  if (created) spawnSync('docker', ['rm', '-f', name], { stdio: 'ignore' });
}
