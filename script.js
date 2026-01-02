let questions = [];
let currentIndex = 0;
let score = 0;
let wrong = [];
let timer = 50 * 60;
let interval;
let selectedAnswer = null;

const quizEl = document.getElementById("quiz");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
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
  submitBtn.style.display = "none";

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
  const q = questions[currentIndex];

  quizEl.innerHTML = `
    <div class="question">
      <p><b>Câu ${currentIndex + 1}:</b> ${q.question}</p>

      ${q.options.map((o, i) => `
        <label>
          <input type="radio" name="opt" onclick="selectAnswer(${i})">
          ${o}
        </label><br>
      `).join("")}

      <button onclick="checkAnswer()">🔍 Kiểm tra</button>
      <div id="feedback"></div>
    </div>
  `;
}

function selectAnswer(index) {
  selectedAnswer = index;
}

function checkAnswer() {
  if (selectedAnswer === null) {
    alert("Hãy chọn một đáp án!");
    return;
  }

  const q = questions[currentIndex];
  const labels = document.querySelectorAll("label");
  const feedback = document.getElementById("feedback");

  labels.forEach((l, i) => {
    if (i === q.answer) l.classList.add("correct");
    if (i === selectedAnswer && selectedAnswer !== q.answer)
      l.classList.add("wrong");
  });

  if (selectedAnswer === q.answer) {
    score++;
    feedback.innerHTML = `<p class="correct">✅ ĐÚNG</p>`;
  } else {
    wrong.push(q);
    feedback.innerHTML = `<p class="wrong">❌ SAI</p>`;
  }

  quizEl.innerHTML += `
    <button onclick="nextQuestion()">➡️ Câu tiếp theo</button>
  `;
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
  localStorage.setItem("score", score);
  localStorage.setItem("wrong", JSON.stringify(wrong));

  quizEl.innerHTML = "";
  resultEl.innerHTML = `
    <h3>🎯 Kết quả</h3>
    <p>Điểm: ${score} / ${questions.length}</p>
    <button onclick="reviewWrong()">Ôn lại câu sai</button>
  `;
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
