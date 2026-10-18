import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { destroySession } from '../services/authService.js';

export function authRoutes() {
  const router = Router();
  router.get('/me', authMiddleware, (req, res) => res.json({ user: req.session.user }));
  router.post('/logout', async (req, res) => {
    await destroySession(req);
    res.clearCookie('sql-lab.sid', { path: '/', httpOnly: true, sameSite: 'strict', secure: false });
    res.json({ message: 'Đã đăng xuất.' });
  });
  return router;
}
