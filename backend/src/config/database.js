import { readFileSync } from 'node:fs';
import mysql from 'mysql2/promise';
import { ConfigurationError } from './env.js';

export function databaseOptions(env = process.env) {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter((name) => !env[name]);
  if (missing.length) {
    throw new ConfigurationError(`Chưa cấu hình Aiven MySQL: thiếu ${missing.join(', ')}. Xem backend/.env.example.`);
  }
  const port = Number(env.DB_PORT || 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigurationError('DB_PORT phải là số nguyên từ 1 đến 65535.');
  }
  const local = ['localhost', '127.0.0.1', '::1'].includes(env.DB_HOST);
  const mode = env.DB_SSL_MODE || 'required';
  let ssl;
  if (mode === 'disabled' && local) {
    ssl = undefined;
  } else if (mode === 'required') {
    if (!env.DB_SSL_CA_PATH) throw new ConfigurationError('Cần DB_SSL_CA_PATH trỏ tới CA certificate của Aiven.');
    let ca;
    try { ca = readFileSync(env.DB_SSL_CA_PATH, 'utf8'); }
    catch { throw new ConfigurationError('Không đọc được CA certificate. Kiểm tra DB_SSL_CA_PATH.'); }
    // Keep hostname verification and certificate-chain verification enabled.
    ssl = { ca, rejectUnauthorized: true, verifyIdentity: true, minVersion: 'TLSv1.2' };
  } else {
    throw new ConfigurationError('Chỉ cho phép tắt TLS khi DB_HOST là loopback; Aiven bắt buộc TLS và CA hợp lệ.');
  }
  return {
    host: env.DB_HOST, port, user: env.DB_USER, password: env.DB_PASSWORD,
    database: env.DB_NAME, ssl, waitForConnections: true, connectionLimit: 5,
    queueLimit: 20, connectTimeout: 10000, multipleStatements: false,
    charset: 'utf8mb4', decimalNumbers: true,
  };
}

export function createDatabase(env = process.env) {
  return mysql.createPool(databaseOptions(env));
}
