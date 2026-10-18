import { createApp } from './src/app.js';
import { readRuntimeConfig } from './src/config/env.js';
import { createDatabase } from './src/config/database.js';

let db;
try {
  const config = readRuntimeConfig();
  db = createDatabase();
  await db.execute('SELECT 1 AS ready');
  const app = createApp({ db, config });
  const server = app.listen(config.port, '127.0.0.1', () => {
    console.log(`SQL Lab API đang chạy trên loopback, cổng ${config.port}. MySQL đã phản hồi truy vấn kiểm tra.`);
    console.log(`Vulnerable endpoints: ${config.labMode ? 'bật (lab only)' : 'tắt'}.`);
  });
  server.on('error', async () => {
    console.error('Không thể mở cổng backend. Kiểm tra PORT và tiến trình đang dùng cổng.');
    await db.end();
    process.exitCode = 1;
  });
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    server.close(async () => { await db.end(); process.exit(0); });
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
} catch (error) {
  console.error(error.publicMessage || 'Không kết nối được Aiven MySQL. Kiểm tra DB_*, CA certificate, quyền và mạng. Không có dữ liệu giả lập thay thế.');
  if (db) await db.end();
  process.exitCode = 1;
}
