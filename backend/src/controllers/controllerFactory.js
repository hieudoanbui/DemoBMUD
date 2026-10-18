import { loginInput, searchInput } from '../services/validation.js';
import { loginQuery, searchQuery } from '../services/queryService.js';
import { establishSession } from '../services/authService.js';

export function createControllers(db, mode) {
  return {
    async login(req, res) {
      const input = loginInput(req.body);
      const result = await loginQuery(db, mode, input);
      // Store UI omits teaching traces; existing lab API clients remain compatible.
      // Queries, credential checks, and session creation are unchanged.
      const omitTrace = req.get('X-Lab-Trace') === 'omit';
      if (!result.user) return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.', code: 'INVALID_CREDENTIALS', ...(!omitTrace && { trace: result.trace }) });
      await establishSession(req, result.user);
      res.json(omitTrace ? { user: result.user } : result);
    },
    async search(req, res) {
      const result = await searchQuery(db, mode, searchInput(req.query));
      if (req.get('X-Lab-Trace') === 'omit') return res.json({ phones: result.phones, count: result.count });
      res.json(result);
    },
  };
}
