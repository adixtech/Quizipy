import Quiz from '../models/Quiz.js';
import Leaderboard from "../models/Leaderboard.js"; //
import Result from '../models/result.js'; //
import { nanoid } from 'nanoid';

// Create a quiz abho dala hu 29 oct
// import { nanoid } from "nanoid"; // ✅ Correct import (curly braces)

import Quiz from '../models/Quiz.js';

// ✅ CREATE QUIZ (FINAL FIXED VERSION)
export const createQuiz = async (req, res) => {
  try {
    const { title, description, timer, questions } = req.body;

    // 🔐 Basic validation
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "At least one question is required" });
    }

    // ✅ Let MODEL generate quizCode automatically
    const quiz = new Quiz({
      title: title || "Untitled Quiz",
      description: description || "",
      timer: Number(timer) || 0,
      questions,
      createdBy: req.user.id   // ✅ correct JWT usage
    });

    await quiz.save();

    console.log("✅ Quiz created with code:", quiz.quizCode);

    // ✅ IMPORTANT: Return quizCode to frontend
    res.status(201).json({
      message: "Quiz created successfully",
      quizCode: quiz.quizCode,
      quizId: quiz._id
    });

  } catch (err) {
    console.error("❌ Error creating quiz:", err);

    // Duplicate quizCode safety (very rare)
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate quiz code generated, please retry"
      });
    }

    res.status(500).json({
      message: "Failed to create quiz",
      error: err.message
    });
  }
};



// ✅ Fetch quiz by code (case-insensitive search)
// ✅ Get Quiz by Code
export const getQuizById = async (req, res) => {
  try {
    const quizCode = req.params.quizcode?.trim().toUpperCase();
    console.log("🎯 Fetching quiz by code:", quizCode);

    if (!quizCode) {
      return res.status(400).json({ error: "Quiz code is required" });
    }

    const quiz = await Quiz.findOne({ quizCode });

    if (!quiz) {
      console.warn("⚠ No quiz found for code:", quizCode);
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json({
      title: quiz.title,
      description: quiz.description,
      timer: quiz.timer,
      quizCode: quiz.quizCode,
      questions: quiz.questions.map(q => ({
        text: q.text,
        options: q.options,
      }))
    });
  } catch (err) {
    console.error("❌ Error fetching quiz:", err);
    res.status(500).json({ error: "Server error fetching quiz" });
  }
};



export const submitQuiz = async (req, res) => {
    try {
        const { code } = req.params;
        const { userName, answers } = req.body;

        console.log("🔍 Received quiz submission for code:", code);
        console.log("🔍 User:", userName, "Answers:", answers);
           
        // Find the quiz by code
        const quiz = await Quiz.findOne({ quizCode: code });

        if (!quiz) {
            console.log("❌ Quiz not found for code:", code);
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // ✅ Calculate score
        let score = 0;
        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correct) {
                score++;
            }
        });

        // ✅ Create leaderboard entry
        const newLeaderboardEntry = new Leaderboard({
            userName,
            quizCode: code,
            quizTitle: quiz.title,
            score,
            timeTaken: quiz.timer // Assuming full timer used
        });

        console.log("🔹 New Leaderboard Entry:", newLeaderboardEntry);

        // ✅ Save to Leaderboard
        await newLeaderboardEntry.save();
        console.log("✅ Leaderboard Entry Saved Successfully!");

        // ✅ Create results entry
        const newResultEntry = new Result({
            userName,
            quizId: quiz._id.toString(),
            quizTitle: quiz.title,
            score,
            timeTaken: quiz.timer
        });

        console.log("🔹 New Result Entry:", newResultEntry);

        // ✅ Save to Results
        await newResultEntry.save();
        console.log("✅ Results Entry Saved Successfully!");

        res.status(200).json({ message: 'Quiz submitted successfully', score });
    } catch (error) {
        console.error("❌ Error submitting quiz:", error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
};

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id })
      .select("title description quizCode questions createdAt")
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    // Map to include questionCount for dashboard
    const withCounts = quizzes.map(q => ({
      ...q,
      questionCount: q.questions ? q.questions.length : 0
    }));

    res.json(withCounts);
  } catch (err) {
    console.error("❌ Error fetching quizzes:", err);
    res.status(500).json({ error: "Failed to load quizzes" });
  }
};
