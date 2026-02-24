import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getReviews } from '../controllers/reviewController.js';

const ReviewRouter = express.Router();

ReviewRouter.get('/', authMiddleware, getReviews);

export default ReviewRouter;
