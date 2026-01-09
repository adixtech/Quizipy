import express from 'express';
import { getLeaderboard, addResult } from '../controllers/leaderboardcontroller.js';
const router = express.Router();

router.get('/', getLeaderboard);  // Fetch leaderboard
router.post('/', addResult);      // Add new quiz result

export default router;
// import express from 'express';
// import { 
//     getLeaderboard, 
//     getLeaderboardStats,
//     getTopPerformers 
// } from '../controllers/leaderboardcontroller.js';
// import authMiddleware from '../middleware/authMiddleware.js';

// const router = express.Router();

// // Get full leaderboard or filtered by quiz
// router.get('/', getLeaderboard);
// router.get('/:quizCode', getLeaderboard);

// // Stats routes (protected)
// router.get('/stats/overview', authMiddleware, getLeaderboardStats);
// router.get('/stats/top-performers', authMiddleware, getTopPerformers);

// export default router;