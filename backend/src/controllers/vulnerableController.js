import { createControllers } from './controllerFactory.js';
export const vulnerableController = (db) => createControllers(db, 'vulnerable');
