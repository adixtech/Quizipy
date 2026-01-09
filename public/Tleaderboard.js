// Teacher leaderboard view - copy to public/Tleaderboard.js
document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Unauthorized: Please log in.");
    window.location.href = "login.html";
    return;
  }

  const quizSelect = document.getElementById("quiz-select");
  const leaderboardBody = document.getElementById("leaderboard-body");

  async function loadData() {
    try {
      const [qRes, lRes] = await Promise.all([
        fetch("/api/quizzes", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/leaderboard", { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      if (!qRes.ok || !lRes.ok) throw new Error("Fetch failed");
      const quizzes = await qRes.json();
      const results = await lRes.json();
      quizSelect.innerHTML = `<option value="all">All Quizzes</option>`;
      quizzes.forEach(q => {
        const opt = document.createElement("option");
        opt.value = q.quizCode || q._id;
        opt.textContent = q.title || q.quizCode;
        quizSelect.appendChild(opt);
      });
      renderResults(results);
    } catch (err) {
      console.error("Error loading data:", err);
      leaderboardBody.innerHTML = `<tr><td colspan="5">Unable to load data</td></tr>`;
    }
  }

  function renderResults(results) {
    if (!Array.isArray(results) || results.length === 0) {
      leaderboardBody.innerHTML = `<tr><td colspan="5">No results</td></tr>`;
      return;
    }
    const selected = quizSelect.value;
    const filtered = selected === "all" ? results : results.filter(r => r.quizCode === selected || r.quizId === selected);
    filtered.sort((a, b) => b.score - a.score);
    leaderboardBody.innerHTML = filtered.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.userName || "Anonymous"}</td>
        <td>${r.quizTitle || "-"}</td>
        <td>${r.score}%</td>
        <td>${r.timeTaken ?? "-"}</td>
      </tr>
    `).join("");
  }

  quizSelect.addEventListener("change", async () => {
    const res = await fetch("/api/leaderboard", { headers: { "Authorization": `Bearer ${token}` } });
    if (!res.ok) return;
    const results = await res.json();
    renderResults(results);
  });

  loadData();
});