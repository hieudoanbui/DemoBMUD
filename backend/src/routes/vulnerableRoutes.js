import { Router } from 'express';
import { vulnerableController } from '../controllers/vulnerableController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { labOnlyMiddleware } from '../middlewares/labOnlyMiddleware.js';

export function vulnerableRoutes(db, config) {
  const router = Router();
  const controller = vulnerableController(db);
  router.use(labOnlyMiddleware(config));
  router.post('/login', controller.login);
  router.get('/phones/search', authMiddleware, controller.search);
  return router;
}
