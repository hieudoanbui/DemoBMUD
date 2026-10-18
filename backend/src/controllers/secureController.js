import { createControllers } from './controllerFactory.js';
export const secureController = (db) => createControllers(db, 'secure');
