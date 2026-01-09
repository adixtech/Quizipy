import Leaderboard from '../models/Leaderboard.js';

// Submit quiz responses
export const submitQuiz = async (req, res) => {
  try {
    const { userName, score, timeTaken, quizTitle } = req.body;
    const { code } = req.params;

    if (!userName || score === undefined) {
      return res.status(400).json({ error: "Missing required fields: userName or score" });
    }

    const newEntry = new Leaderboard({
      userName,
      quizCode: code,
      quizTitle: quizTitle || "Unknown Quiz",
      score,
      timeTaken: timeTaken || 0,
      submittedAt: new Date()
    });

    await newEntry.save();

    return res.status(200).json({
      message: "Quiz submitted successfully!",
      score,
      entry: newEntry
    });
  } catch (error) {
    console.error("❌ Error submitting quiz:", error);
    return res.status(500).json({ error: "Failed to submit quiz" });
  }
};

// Get leaderboard data (route handler)
export const getLeaderboard = async (req, res) => {
  try {
    const quizCode = req.params?.quizCode || null;
    let leaderboardData;

    if (quizCode) {
      leaderboardData = await Leaderboard.find({ quizCode })
        .sort({ score: -1, timeTaken: 1 })
        .limit(100);
    } else {
      leaderboardData = await Leaderboard.find()
        .sort({ score: -1, timeTaken: 1 })
        .limit(100);
    }

    return res.status(200).json(leaderboardData);
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

// Get leaderboard statistics
export const getLeaderboardStats = async (req, res) => {
  try {
    const stats = await Leaderboard.aggregate([
      {
        $group: {
          _id: "$quizCode",
          quizTitle: { $first: "$quizTitle" },
          avgScore: { $avg: "$score" },
          highScore: { $max: "$score" },
          submissions: { $sum: 1 }
        }
      },
      { $sort: { submissions: -1 } }
    ]);

    return res.status(200).json(stats);
  } catch (error) {
    console.error("❌ Error fetching leaderboard stats:", error);
    return res.status(500).json({ error: "Failed to fetch leaderboard statistics" });
  }
};

// Get top performers across all quizzes
export const getTopPerformers = async (req, res) => {
  try {
    const topPerformers = await Leaderboard.aggregate([
      {
        $group: {
          _id: "$userName",
          avgScore: { $avg: "$score" },
          quizzesTaken: { $sum: 1 },
          bestScore: { $max: "$score" }
        }
      },
      { $sort: { avgScore: -1 } },
      { $limit: 10 }
    ]);

    return res.status(200).json(topPerformers);
  } catch (error) {
    console.error("❌ Error fetching top performers:", error);
    return res.status(500).json({ error: "Failed to fetch top performers" });
  }
};