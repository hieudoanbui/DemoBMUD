import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import { localOnly } from './middlewares/labOnlyMiddleware.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { authRoutes } from './routes/authRoutes.js';
import { secureRoutes } from './routes/secureRoutes.js';
import { vulnerableRoutes } from './routes/vulnerableRoutes.js';

export function createApp({ db, config }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', false);
  app.use(helmet());
  app.use(localOnly(config));
  app.use(cors({ origin: config.frontendUrl, credentials: true }));
  app.use(express.json({ limit: '8kb' }));
  app.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  // MemoryStore intentionally scoped to a single local lab process, not deployment.
  app.use(session({
    name: 'sql-lab.sid', secret: config.sessionSecret, resave: false, saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'strict', secure: false, maxAge: 60 * 60 * 1000 },
  }));
  app.get('/api/health', async (_req, res) => {
    await db.execute('SELECT 1 AS ready');
    res.json({ status: 'ok', database: 'connected', labMode: config.labMode });
  });
  app.use('/api/auth', authRoutes());
  app.use('/api/secure', secureRoutes(db));
  app.use('/api/vulnerable', vulnerableRoutes(db, config));
  app.use((_req, res) => res.status(404).json({ error: 'Không tìm thấy endpoint.', code: 'NOT_FOUND' }));
  app.use(errorMiddleware);
  return app;
}
