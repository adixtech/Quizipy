// Student quiz client - copy to public/student.js
document.addEventListener("DOMContentLoaded", () => {
  const socket = io({
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    timeout: 5000
  });

  socket.on("connect", () => console.log("Socket connected:", socket.id));
  socket.on("disconnect", () => console.log("Socket disconnected"));

  const startBtn = document.getElementById("start-quiz");
  const userNameInput = document.getElementById("user-name");
  const quizCodeInput = document.getElementById("quiz-code");
  const quizEntry = document.getElementById("quiz-entry");
  const quizContent = document.getElementById("quiz-content");
  const submitBtn = document.getElementById("submit-quiz");

  let currentQuiz = null;
  let userAnswers = [];
  let startTime = null;

async function loadQuiz(code) {
  console.log("🎯 Fetching quiz:", code);
  try {
    const res = await fetch(`/api/quizzes/${code}`);
    if (!res.ok) throw new Error("Quiz not found");
    const quiz = await res.json();
    console.log("✅ Quiz loaded:", quiz);
    return quiz;
  } catch (err) {
    console.error("❌ Error loading quiz:", err);
    throw err;
  }
}

  function startTimer() {
    startTime = Date.now();
  }

  function calculateScore(quiz) {
    if (!quiz || !Array.isArray(quiz.questions)) return 0;
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (userAnswers[i] == null) return;
      if (q.correctOption === userAnswers[i]) score += 1;
    });
    return Math.round((score / quiz.questions.length) * 100);
  }

  startBtn?.addEventListener("click", async () => {
    const userName = (userNameInput?.value || "").trim();
    const code = (quizCodeInput?.value || "").trim().toUpperCase();
    if (!userName) return alert("Enter your name");
    if (!code) return alert("Enter quiz code");
    try {
      currentQuiz = await loadQuiz(code);
      userAnswers = new Array(currentQuiz.questions.length).fill(null);
      quizEntry?.classList.add("hidden");
      quizContent?.classList.remove("hidden");
      document.getElementById("quiz-title-display").textContent = currentQuiz.title || "Quiz";
      startTimer();
      localStorage.setItem("userName", userName);
    } catch (err) {
      console.error(err);
      alert("Failed to load quiz. Check code.");
    }
  });

  submitBtn?.addEventListener("click", async () => {
    if (!currentQuiz) return alert("No quiz loaded");
    const token = sessionStorage.getItem("token") || "";
    const userName = localStorage.getItem("userName") || "Guest";
    const score = calculateScore(currentQuiz);
    const timeTaken = Math.round((Date.now() - startTime) / 1000 / 60); // minutes
    try {
      const res = await fetch(`/api/quizzes/${currentQuiz.quizCode}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userName,
          score,
          timeTaken,
          quizTitle: currentQuiz.title
        })
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(body || `Submit failed ${res.status}`);
      }
      const result = await res.json();
      alert(`Quiz submitted! Score: ${result.score ?? score}%`);
      socket.emit("updateLeaderboard");
      window.location.href = `./Sleaderboad.html?code=${currentQuiz.quizCode}`;
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit quiz.");
    }
  });
});