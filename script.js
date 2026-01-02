let questions = [];
let currentIndex = 0;
let score = 0;
let wrong = [];
let timer = 50 * 60;
let interval;

let selectedAnswer = null;
let checked = false;

const quizEl = document.getElementById("quiz");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");
const select = document.getElementById("subjectSelect");

// load môn học
for (let s in subjects) {
  select.innerHTML += `<option value="${s}">${s}</option>`;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function startQuiz() {
  const subject = select.value;
  if (!subject) return alert("Hãy chọn môn học");

  questions = shuffle([...subjects[subject]]);
  currentIndex = 0;
  score = 0;
  wrong = [];

  quizEl.innerHTML = "";
  resultEl.innerHTML = "";

  startTimer();
  renderQuestion();
}

function startTimer() {
  clearInterval(interval);
  timer = 50 * 60;

  interval = setInterval(() => {
    timer--;
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    timerEl.innerText = `⏰ ${m}:${s.toString().padStart(2, "0")}`;
    if (timer <= 0) submitQuiz();
  }, 1000);
}

function renderQuestion() {
  selectedAnswer = null;
  checked = false;

  const q = questions[currentIndex];

  quizEl.innerHTML = `
    <div class="question">
      <p><b>Câu ${currentIndex + 1}:</b> ${q.question}</p>

      ${q.options.map((o, i) => `
        <label>
          <input type="radio" name="opt" value="${i}">
          ${o}
        </label><br>
      `).join("")}

      <button id="checkBtn">🔍 Kiểm tra</button>
      <div id="feedback"></div>
    </div>
  `;

  document.querySelectorAll("input[name='opt']").forEach(radio => {
    radio.addEventListener("change", e => {
      if (!checked) selectedAnswer = Number(e.target.value);
    });
  });

  document.getElementById("checkBtn").addEventListener("click", checkAnswer);
}

function checkAnswer() {
  if (checked) return;
  if (selectedAnswer === null) {
    alert("Hãy chọn một đáp án!");
    return;
  }

  checked = true;

  const q = questions[currentIndex];
  const labels = quizEl.querySelectorAll("label");
  const feedback = document.getElementById("feedback");

  labels.forEach((label, i) => {
    if (i === q.answer) label.classList.add("correct");
    if (i === selectedAnswer && selectedAnswer !== q.answer)
      label.classList.add("wrong");
  });

  // khoá đáp án
  document.querySelectorAll("input[name='opt']").forEach(r => r.disabled = true);

  if (selectedAnswer === q.answer) {
    score++;
    feedback.innerHTML = `<p class="correct">✅ ĐÚNG</p>`;
  } else {
    wrong.push(q);
    feedback.innerHTML = `<p class="wrong">❌ SAI</p>`;
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "➡️ Câu tiếp theo";
  nextBtn.onclick = nextQuestion;
  quizEl.appendChild(nextBtn);
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    submitQuiz();
  }
}

function submitQuiz() {
  clearInterval(interval);

  quizEl.innerHTML = "";
  resultEl.innerHTML = `
    <h3>🎯 Kết quả</h3>
    <p>Điểm: ${score} / ${questions.length}</p>
    <button onclick="reviewWrong()">Ôn lại câu sai</button>
  `;

  localStorage.setItem("wrong", JSON.stringify(wrong));
}

function reviewWrong() {
  const w = JSON.parse(localStorage.getItem("wrong")) || [];
  quizEl.innerHTML = w.map((q, i) => `
    <div class="question">
      <p><b>Câu sai ${i + 1}:</b> ${q.question}</p>
      <p>✅ Đáp án đúng: ${q.options[q.answer]}</p>
    </div>
  `).join("");
}
