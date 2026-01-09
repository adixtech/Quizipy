import Result from '../models/result.js';

// ✅ Fetch all quiz results (sorted by highest score)
export const getResults = async (req, res) => {
  try {
    console.log("🔍 Fetching quiz results...");

    const results = await Result.find().sort({ score: -1 });

    if (!results || results.length === 0) {
      console.log("⚠ No quiz results found.");
      // return empty array instead of 404 so clients can render gracefully
      return res.status(200).json([]);
    }

    console.log("✅ Results Fetched:", results.length);
    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error fetching results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

// ✅ Save Quiz Results (Dynamically Calculates Score Based on Total Questions)
// ✅ Save Quiz Results (Dynamically Calculates Score Based on Total Questions)
export const saveQuizResult = async (req, res) => {
  try {
    const { userName, quizId, quizCode, quizTitle, selectedAnswers, correctAnswers } = req.body;

    // ✅ Validate required fields
    if (!userName || !quizId || !quizCode || !quizTitle || !selectedAnswers || !correctAnswers) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    // ✅ Calculate correct answers & total questions
    const totalQuestions = Array.isArray(correctAnswers) ? correctAnswers.length : 0;
    const correctCount = Array.isArray(correctAnswers)
      ? correctAnswers.filter((answer, index) => answer === selectedAnswers[index]).length
      : 0;

    const scorePercentage = totalQuestions > 0
      ? Number(((correctCount / totalQuestions) * 100).toFixed(2))
      : 0;

    console.log(`📊 User: ${userName} | Correct: ${correctCount}/${totalQuestions} | Score: ${scorePercentage}%`);

    // ✅ Save result to MongoDB (added quizCode)
    const newResult = new Result({
      userName,
      quizId,
      quizCode, // 🟢 ADD THIS LINE
      quizTitle,
      correctAnswers: correctCount,
      totalQuestions,
      score: scorePercentage,
      submittedAt: new Date()
    });

    await newResult.save();
    res.status(201).json({ message: "Result saved successfully!", score: scorePercentage });
  } catch (error) {
    console.error("❌ Error saving quiz result:", error);
    res.status(500).json({ message: "Failed to save result." });
  }
};
