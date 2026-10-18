import { Router } from 'express';
import { secureController } from '../controllers/secureController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export function secureRoutes(db) {
  const router = Router();
  const controller = secureController(db);
  router.post('/login', controller.login);
  router.get('/phones/search', authMiddleware, controller.search);
  return router;
}
