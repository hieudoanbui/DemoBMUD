import { loginInput, searchInput } from '../services/validation.js';
import { loginQuery, searchQuery } from '../services/queryService.js';
import { establishSession } from '../services/authService.js';

export function createControllers(db, mode) {
  return {
    async login(req, res) {
      const input = loginInput(req.body);
      const result = await loginQuery(db, mode, input);
      if (!result.user) return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.', code: 'INVALID_CREDENTIALS', trace: result.trace });
      await establishSession(req, result.user);
      res.json(result);
    },
    async search(req, res) {
      res.json(await searchQuery(db, mode, searchInput(req.query)));
    },
  };
}
