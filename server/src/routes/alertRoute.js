import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  dismissAlert,
  getAlerts,
  getUnreadCount,
  markAlertRead,
  markAllAlertsRead,
} from '../controllers/alertController.js';

const AlertRouter = express.Router();

AlertRouter.get('/', authMiddleware, getAlerts);
AlertRouter.get('/unread-count', authMiddleware, getUnreadCount);
AlertRouter.patch('/mark-all-read', authMiddleware, markAllAlertsRead);
AlertRouter.patch('/:alertId/read', authMiddleware, markAlertRead);
AlertRouter.delete('/:alertId', authMiddleware, dismissAlert);

export default AlertRouter;
