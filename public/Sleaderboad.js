// Student leaderboard (socket + fetch) - copy to public/Sleaderboad.js
document.addEventListener("DOMContentLoaded", () => {
  const socket = io({
    transports: ["websocket", "polling"]
  });

  const quizSelect = document.getElementById("quiz-select");
  const leaderboardBody = document.getElementById("leaderboard-body");
  const token = sessionStorage.getItem("token");
  if (!token) {
    // Not logged in
    console.warn("Unauthorized: token missing");
    return;
  }

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  async function loadQuizzes() {
    try {
      const res = await fetch("/api/quizzes", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Quizzes fetch failed: ${res.status}`);
      const quizzes = await res.json();
      quizSelect.innerHTML = `<option value="all">All Quizzes</option>`;
      quizzes.forEach(q => {
        const opt = document.createElement("option");
        opt.value = q.quizCode || q._id;
        opt.textContent = q.title || q.quizCode;
        quizSelect.appendChild(opt);
      });
      await fetchLeaderboard();
    } catch (err) {
      console.error("Error loading quizzes:", err);
      leaderboardBody.innerHTML = `<tr><td colspan="5">Unable to load quizzes</td></tr>`;
    }
  }

  async function fetchLeaderboard() {
    const code = quizSelect.value || "all";
    const url = code === "all" ? "/api/leaderboard" : `/api/leaderboard/${code}`;
    try {
      const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Leaderboard fetch failed: ${res.status}`);
      const data = await res.json();
      renderLeaderboard(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      leaderboardBody.innerHTML = `<tr><td colspan="5">Unable to load leaderboard</td></tr>`;
    }
  }

  function getRankClass(i) {
    return i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
  }

  function renderLeaderboard(list) {
    if (!list || list.length === 0) {
      leaderboardBody.innerHTML = `<tr><td colspan="5">No leaderboard data</td></tr>`;
      return;
    }
    list.sort((a, b) => b.score - a.score);
    leaderboardBody.innerHTML = list.map((entry, i) => `
      <tr class="${getRankClass(i)}">
        <td>${i + 1}</td>
        <td>${entry.userName || entry.name || "Anonymous"}</td>
        <td>${entry.quizTitle || entry.title || "-"}</td>
        <td>${entry.score}%</td>
        <td>${entry.timeTaken ?? "-"}</td>
      </tr>
    `).join("");
  }

  quizSelect.addEventListener("change", fetchLeaderboard);
  socket.on("leaderboardUpdate", fetchLeaderboard);

  loadQuizzes();
});