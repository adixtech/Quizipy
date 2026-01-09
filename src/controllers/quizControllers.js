import Quiz from '../models/Quiz.js';
import Leaderboard from "../models/Leaderboard.js"; //
import Result from '../models/result.js'; //
import { nanoid } from 'nanoid';

// Create a quiz abho dala hu 29 oct
// import { nanoid } from "nanoid"; // ✅ Correct import (curly braces)

export const createQuiz = async (req, res) => {
  try {
    const { title, description, timer, questions } = req.body;

    // ✅ Generate a unique quiz code using nanoid
    let quizCode = nanoid(6).toUpperCase();

    // ✅ Ensure code is unique
    while (await Quiz.findOne({ $or: [{ code: quizCode }, { quizCode }] })) {
      quizCode = nanoid(6).toUpperCase();
    }

    // ✅ Create quiz document
    const quiz = new Quiz({
      title: title || "Untitled Quiz",
      description: description || "",
      timer: timer || 0,
      questions: Array.isArray(questions) ? questions : [],
      code: quizCode,        // ✅ Required for unique index
      quizCode: quizCode,    // ✅ For consistent lookup
      createdBy: req.user?._id || null,
      questionCount: questions.length // ✅ add this line
    });

    await quiz.save();

    console.log("✅ Quiz created successfully with code:", quizCode);

    res.status(201).json({
      message: "Quiz created successfully",
      quizCode,
      id: quiz._id,
    });
  } catch (err) {
    console.error("❌ Error creating quiz:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        error: "Duplicate quiz code. Please retry.",
        details: err.message,
      });
    }
    res.status(500).json({
      error: "Failed to create quiz",
      details: err.message,
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
      .lean();

    // include questionCount for dashboard
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
