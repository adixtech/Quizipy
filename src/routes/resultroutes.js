import express from 'express';
import { getResults, saveQuizResult } from '../controllers/resultControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getResults);
router.post('/', authMiddleware, saveQuizResult);

export default router;