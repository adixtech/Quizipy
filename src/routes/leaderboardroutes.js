import express from 'express';
import { createQuiz, getQuizById, submitQuiz, getQuizzes } from '../controllers/quizControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Leaderboard from '../models/Leaderboard.js';
import { getIO } from '../services/socket.js';

const router = express.Router();

// Protected routes
router.post('/', authMiddleware, createQuiz);
router.get('/', authMiddleware, getQuizzes);

// Public routes
router.get('/:code', getQuizById);

// Quiz submission with real-time updates
router.post('/:code/submit', async (req, res) => {
    try {
        const { userName, score, timeTaken, quizTitle } = req.body;
        const { code } = req.params;

        if (!userName || score === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newEntry = new Leaderboard({
            userName,
            quizCode: code,
            quizTitle: quizTitle || "Unknown Quiz",
            score,
            timeTaken: timeTaken || 0
        });
        await newEntry.save();

        // Emit update using socket service
        try {
            const io = getIO();
            io.emit('leaderboardUpdate', { type: 'new-submission', entry: newEntry });
        } catch (err) {
            console.warn('Socket emission failed:', err);
        }

        res.status(200).json({ 
            message: "Quiz submitted successfully",
            score,
            entry: newEntry
        });
    } catch (error) {
        console.error("Quiz submission error:", error);
        res.status(500).json({ error: "Failed to submit quiz" });
    }
});

export default router;