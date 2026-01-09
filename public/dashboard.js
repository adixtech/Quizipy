// public/dashboard.js (replace file)
document.addEventListener("DOMContentLoaded", updateDashboard);

async function updateDashboard() {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Unauthorized: Please log in first.");
      window.location.href = "login.html";
      return;
    }

    // Fetch teacher's quizzes and results (protected endpoints)
    const [quizzesRes, resultsRes] = await Promise.all([
      fetch("/api/quizzes", { headers: { "Authorization": `Bearer ${token}` } }),
      fetch("/api/results", { headers: { "Authorization": `Bearer ${token}` } })
    ]);

    if (!quizzesRes.ok || !resultsRes.ok) {
      console.error("Fetch failed:", quizzesRes.status, resultsRes.status);
      alert("Failed to fetch dashboard data.");
      return;
    }

    const quizzes = await quizzesRes.json();
    const results = await resultsRes.json();

    document.getElementById("total-quizzes").textContent = Array.isArray(quizzes) ? quizzes.length : 0;
    document.getElementById("total-participants").textContent = Array.isArray(results) ? results.length : 0;

    if (Array.isArray(results) && results.length > 0) {
      const avg = Math.round(results.reduce((s, r) => s + (r.score || 0), 0) / results.length);
      document.getElementById("average-score").textContent = `${avg}%`;
    } else {
      document.getElementById("average-score").textContent = "0%";
    }

    const quizList = document.getElementById("quiz-list");
    if (Array.isArray(quizzes)) {
      quizList.innerHTML = quizzes.map(q => {
        const qCount = q.questionCount ?? (Array.isArray(q.questions) ? q.questions.length : 0);

const participants = Array.isArray(results)
  ? results.filter(r =>
      String(r.quizId) === String(q._id) || r.quizCode?.toUpperCase() === q.quizCode?.toUpperCase()
    ).length
  : 0;

        return `
          <div class="quiz-card">
            <h3>${q.title || "Untitled"}</h3>
            <p>${q.description || ""}</p>
            <p class="quiz-code">Code: ${q.quizCode || "-"}</p>
            <p class="quiz-stats">Questions: ${qCount || 0} | Participants: ${participants || 0}</p>
          </div>
        `;
      }).join("");
    } else {
      quizList.innerHTML = "<p>No quizzes available</p>";
    }
  } catch (err) {
    console.error("❌ Error fetching data:", err);
    alert("Failed to load dashboard data.");
  }
}

// Logout
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", async () => {
    sessionStorage.removeItem("token");
    window.location.href = "login.html";
  });
});
