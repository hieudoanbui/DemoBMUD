import { readFile } from 'node:fs/promises';
import { createDatabase } from '../src/config/database.js';

let db;
try {
  if (process.env.DB_INIT_CONFIRM !== 'lab-only') {
    throw new Error('Chỉ chạy trên schema lab riêng. Đặt DB_INIT_CONFIRM=lab-only để xác nhận nạp dữ liệu mẫu.');
  }
  db = createDatabase();
  for (const filename of ['schema.sql', 'seed.sql']) {
    const source = await readFile(new URL(`../../database/${filename}`, import.meta.url), 'utf8');
    // These controlled SQL files contain no semicolons inside literals/procedures.
    // Execute each statement separately; multipleStatements always remains false.
    const statements = source.replace(/^\s*--.*$/gm, '').split(';').map((s) => s.trim()).filter(Boolean);
    for (const statement of statements) await db.query(statement);
    console.log(`Đã thực thi database/${filename}.`);
  }
  const [[counts]] = await db.query("SELECT (SELECT COUNT(*) FROM users) AS users, (SELECT COUNT(*) FROM phones WHERE status = 'on') AS publicPhones, (SELECT COUNT(*) FROM phones WHERE status = 'off') AS hiddenPhones");
  console.log('Dữ liệu hiện có:', counts);
} catch (error) {
  console.error(error.publicMessage || (process.env.DB_INIT_CONFIRM !== 'lab-only' ? error.message : 'Không thể khởi tạo schema lab. Kiểm tra kết nối, TLS và quyền CREATE/INSERT/UPDATE của tài khoản khởi tạo.'));
  process.exitCode = 1;
} finally {
  if (db) await db.end();
}
