/* ================== BIẾN TOÀN CỤC ================== */
let questions = [];
let current = 0;
let score = 0;
let selected = null;
let checked = false;

let answersState = []; // null | "ok" | "wrong"
let wrongQuestions = [];

let time = 50 * 60; // 50 phút
let timerInterval;
let startTime = 0;

/* ================== DOM ================== */
const quiz = document.getElementById("quiz");
const timerEl = document.getElementById("timer");
const result = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
const startBtn = document.getElementById("startBtn");
const subjectSelect = document.getElementById("subjectSelect");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const navigatorEl = document.getElementById("navigator");

/* ================== LOAD MÔN ================== */
for (let s in subjects) {
  subjectSelect.innerHTML += `<option value="${s}">${s}</option>`;
}

/* ================== RANDOM (FISHER–YATES) ================== */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ================== START ================== */
startBtn.onclick = () => {
  if (!subjectSelect.value) {
    alert("Hãy chọn môn học");
    return;
  }

  questions = shuffle([...subjects[subjectSelect.value]]); // 100 câu
  current = 0;
  score = 0;
  selected = null;
  checked = false;

  answersState = Array(questions.length).fill(null);
  wrongQuestions = [];

  result.innerHTML = "";
  submitBtn.style.display = "inline-block";

  buildNavigator();
  startTime = Date.now();
  startTimer();
  showQuestion();
};

/* ================== TIMER + CẢNH BÁO ================== */
function startTimer() {
  clearInterval(timerInterval);
  time = 50 * 60;

  timerInterval = setInterval(() => {
    time--;

    const m = Math.floor(time / 60);
    const s = time % 60;
    timerEl.innerText = `⏰ ${m}:${String(s).padStart(2, "0")}`;

    // 5 phút cuối → cam
    if (time <= 300 && time > 60) {
      timerEl.style.color = "orange";
    }
    // 1 phút cuối → đỏ + rung nhẹ
    else if (time <= 60) {
      timerEl.style.color = "red";
      if (navigator.vibrate) navigator.vibrate(80);
    } else {
      timerEl.style.color = "";
    }

    if (time <= 0) {
      clearInterval(timerInterval);
      finish();
    }
  }, 1000);
}

/* ================== PROGRESS ================== */
function updateProgress() {
  progressText.innerText = `Câu ${current + 1} / ${questions.length}`;
  progressFill.style.width =
    ((current + 1) / questions.length) * 100 + "%";
}

/* ================== NAVIGATOR ================== */
function buildNavigator() {
  navigatorEl.innerHTML = "";
  questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.className = "nav-btn nav-un";
    btn.innerText = i + 1;
    btn.onclick = () => {
      current = i;
      showQuestion();
    };
    navigatorEl.appendChild(btn);
  });
}

function updateNavigator() {
  [...navigatorEl.children].forEach((btn, i) => {
    btn.classList.remove("nav-un", "nav-sel", "nav-ok", "nav-wrong");

    if (i === current) btn.classList.add("nav-sel");
    else if (answersState[i] === "ok") btn.classList.add("nav-ok");
    else if (answersState[i] === "wrong") btn.classList.add("nav-wrong");
    else btn.classList.add("nav-un");
  });
}

/* ================== SHOW QUESTION ================== */
function showQuestion() {
  selected = null;
  checked = false;

  const q = questions[current];

  quiz.innerHTML = `
    <div class="question fade-enter">
      <p><b>Câu ${current + 1}:</b> ${q.question}</p>

      ${q.options
        .map(
          (o, i) => `
        <label>
          <input type="radio" name="answer" value="${i}">
          ${o}
        </label><br>
      `
        )
        .join("")}

      <br>
      <button id="checkBtn">🔍 Kiểm tra</button>
      <p id="feedback"></p>
    </div>
  `;

  updateProgress();
  updateNavigator();

  document.querySelectorAll("input[name='answer']").forEach((r) => {
    r.onchange = () => {
      if (!checked) selected = Number(r.value);
    };
  });

  document.getElementById("checkBtn").onclick = checkAnswer;
}

/* ================== CHECK (KHOÁ + AUTO NEXT) ================== */
function checkAnswer() {
  if (checked) return;
  if (selected === null) {
    alert("Hãy chọn đáp án");
    return;
  }

  checked = true;
  const q = questions[current];
  const labels = quiz.querySelectorAll("label");
  const feedback = document.getElementById("feedback");

  labels.forEach((l, i) => {
    if (i === q.answer) l.style.color = "green";
    if (i === selected && selected !== q.answer) l.style.color = "red";
  });

  // khoá đổi đáp án
  document
    .querySelectorAll("input[name='answer']")
    .forEach((r) => (r.disabled = true));

  if (selected === q.answer) {
    score++;
    answersState[current] = "ok";
    feedback.innerText = "✅ ĐÚNG";
    feedback.style.color = "green";
  } else {
    answersState[current] = "wrong";
    feedback.innerText = "❌ SAI";
    feedback.style.color = "red";
    wrongQuestions.push({ question: q, selected });
  }

  updateNavigator();

  // tự sang câu sau 2s
  setTimeout(() => {
    if (current < questions.length - 1) {
      current++;
      showQuestion();
    } else {
      finish();
    }
  }, 2000);
}

/* ================== NỘP BÀI ================== */
submitBtn.onclick = () => {
  if (confirm("Bạn chắc chắn muốn nộp bài?")) {
    finish();
  }
};

/* ================== FINISH + LƯU LỊCH SỬ ================== */
function finish() {
  clearInterval(timerInterval);
  quiz.innerHTML = "";
  submitBtn.style.display = "none";

  const total = questions.length;
  const percent = Math.round((score / total) * 100);
  const spent = Math.round((Date.now() - startTime) / 1000);

  // lưu lịch sử
  const history = JSON.parse(localStorage.getItem("history") || "[]");
  history.push({
    date: new Date().toLocaleString(),
    score,
    total,
    percent,
    spent,
  });
  localStorage.setItem("history", JSON.stringify(history));

  result.innerHTML = `
    <h3>📊 KẾT QUẢ</h3>
    <p>Đúng: <b>${score}/${total}</b> (${percent}%)</p>
    <p>⏱ Thời gian: ${Math.floor(spent / 60)}:${String(
    spent % 60
  ).padStart(2, "0")}</p>

    <h4>🕘 Lịch sử gần đây</h4>
    ${history
      .slice(-5)
      .map((h) => `<div>${h.date} — ${h.percent}%</div>`)
      .join("")}

    <br>
    <button onclick="location.reload()">🔁 Làm lại</button>
  `;
}
