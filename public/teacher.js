// public/teacher.js (replace file)
document.addEventListener("DOMContentLoaded", () => {
  const quizForm = document.getElementById("quiz-form");
  const addQuestionBtn = document.getElementById("add-question");
  const questionsContainer = document.getElementById("questions-container");
  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("Unauthorized: Please log in.");
    window.location.href = "login.html";
    return;
  }

  addQuestionBtn?.addEventListener("click", () => {
    const idx = questionsContainer.children.length;
    const wrapper = document.createElement("div");
    wrapper.className = "question-block";
    wrapper.innerHTML = `
      <input name="question-${idx}" placeholder="Question text" required />
      <input name="opt0-${idx}" placeholder="Option 1" required />
      <input name="opt1-${idx}" placeholder="Option 2" required />
      <input name="opt2-${idx}" placeholder="Option 3" />
      <input name="opt3-${idx}" placeholder="Option 4" />
      <select name="correct-${idx}">
        <option value="0">Option 1</option>
        <option value="1">Option 2</option>
        <option value="2">Option 3</option>
        <option value="3">Option 4</option>
      </select>
    `;
    questionsContainer.appendChild(wrapper);
  });

  quizForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Read inputs by id (teacher.html uses id attributes)
    const title = document.getElementById("quiz-title").value.trim() || "Untitled Quiz";
    const description = document.getElementById("quiz-description").value.trim() || "";
    const timer = Number(document.getElementById("quiz-timer").value) || 0;

    // Build questions array to match backend schema: { text, options, correct }
    const questions = Array.from(questionsContainer.children).map((block, i) => {
      const qText = block.querySelector(`[name="question-${i}"]`)?.value?.trim() || "";
      const options = [
        block.querySelector(`[name="opt0-${i}"]`)?.value?.trim() || "",
        block.querySelector(`[name="opt1-${i}"]`)?.value?.trim() || "",
        block.querySelector(`[name="opt2-${i}"]`)?.value?.trim() || "",
        block.querySelector(`[name="opt3-${i}"]`)?.value?.trim() || ""
      ].filter(Boolean);
      const correct = Number(block.querySelector(`[name="correct-${i}"]`)?.value || 0);
      return { text: qText, options, correct };
    }).filter(q => q.text && q.options.length >= 2);

    const payload = { title, description, timer, questions };

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Create quiz failed:", data);
        alert("Failed to create quiz. Check console.");
        return;
      }
      alert(`Quiz created. Code: ${data.code || data.quizCode || "N/A"}`);
      // Optionally redirect to dashboard
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Error creating quiz:", err);
      alert("Error creating quiz, check console.");
    }
  });
});
