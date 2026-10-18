import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });

export class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
    this.status = 503;
    this.code = 'CONFIGURATION_REQUIRED';
    this.publicMessage = message;
  }
}

export function readRuntimeConfig(env = process.env) {
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
    throw new ConfigurationError('Cần SESSION_SECRET ít nhất 32 ký tự trong backend/.env.');
  }
  const port = Number(env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigurationError('PORT phải là số nguyên từ 1 đến 65535.');
  }
  const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
  let url;
  try { url = new URL(frontendUrl); } catch { /* handled below */ }
  if (!url || url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      || url.origin !== frontendUrl || url.username || url.password) {
    throw new ConfigurationError('FRONTEND_URL phải là HTTP origin localhost, không kèm đường dẫn.');
  }
  return { port, frontendUrl, sessionSecret: env.SESSION_SECRET, labMode: env.LAB_MODE === 'true' };
}
