import express from 'express';
import {
  addBusiness,
  deleteBusiness,
  getBusinesses,
  getDashboardData,
  getSerpApiBudget,
  refreshBusiness,
  updateBusiness,
} from '../controllers/buisnessController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const BusinessRouter = express.Router();

BusinessRouter.get('/', authMiddleware, getBusinesses);
BusinessRouter.post('/', authMiddleware, addBusiness);
BusinessRouter.get('/dashboard', authMiddleware, getDashboardData);
BusinessRouter.get('/serpapi-budget', authMiddleware, getSerpApiBudget);
BusinessRouter.post('/:businessId/refresh', authMiddleware, refreshBusiness);
BusinessRouter.patch('/:businessId', authMiddleware, updateBusiness);
BusinessRouter.delete('/:businessId', authMiddleware, deleteBusiness);

export default BusinessRouter;
