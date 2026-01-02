let questions = [];
let current = 0;
let score = 0;
let selected = null;
let checked = false;

let time = 50 * 60;
let timerInterval;

const quiz = document.getElementById("quiz");
const timerEl = document.getElementById("timer");
const result = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
const subjectSelect = document.getElementById("subjectSelect");

/* ===== LOAD MÔN ===== */
for (let s in subjects) {
  subjectSelect.innerHTML += `<option value="${s}">${s}</option>`;
}

/* ===== RANDOM ===== */
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

/* ===== BẮT ĐẦU ===== */
function startQuiz() {
  if (!subjectSelect.value) {
    alert("Hãy chọn môn học");
    return;
  }

  questions = shuffle([...subjects[subjectSelect.value]]);
  current = 0;
  score = 0;
  selected = null;
  checked = false;

  result.innerHTML = "";
  submitBtn.style.display = "inline-block";

  startTimer();
  showQuestion();
}

/* ===== TIMER 50 PHÚT ===== */
function startTimer() {
  clearInterval(timerInterval);
  time = 50 * 60;

  timerInterval = setInterval(() => {
    time--;
    const m = Math.floor(time / 60);
    const s = time % 60;
    timerEl.innerText = `⏰ ${m}:${s.toString().padStart(2, "0")}`;

    if (time <= 0) {
      clearInterval(timerInterval);
      finish();
    }
  }, 1000);
}

/* ===== HIỂN THỊ CÂU HỎI ===== */
function showQuestion() {
  selected = null;
  checked = false;

  const q = questions[current];

  quiz.innerHTML = `
    <div class="question">
      <p><b>Câu ${current + 1}:</b> ${q.question}</p>

      ${q.options.map((o, i) => `
        <label>
          <input type="radio" name="answer" value="${i}">
          ${o}
        </label><br>
      `).join("")}

      <button id="checkBtn">🔍 Kiểm tra</button>
      <p id="feedback"></p>
    </div>
  `;

  document.querySelectorAll("input[name='answer']").forEach(r => {
    r.onchange = () => {
      if (!checked) selected = Number(r.value);
    };
  });

  document.getElementById("checkBtn").onclick = checkAnswer;
}

/* ===== KIỂM TRA ===== */
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

  if (selected === q.answer) {
    score++;
    feedback.innerHTML = "✅ ĐÚNG";
    feedback.style.color = "green";
  } else {
    feedback.innerHTML = "❌ SAI";
    feedback.style.color = "red";
  }

  const nextBtn = document.createElement("button");
  nextBtn.innerText = "➡️ Câu tiếp theo";
  nextBtn.onclick = () => {
    current++;
    if (current < questions.length) showQuestion();
    else finish();
  };

  quiz.appendChild(nextBtn);
}

/* ===== NỘP BÀI ===== */
submitBtn.onclick = () => {
  if (confirm("Bạn chắc chắn muốn nộp bài?")) {
    finish();
  }
};

/* ===== KẾT QUẢ ===== */
function finish() {
  clearInterval(timerInterval);
  quiz.innerHTML = "";
  submitBtn.style.display = "none";

  const total = questions.length;
  const percent = Math.round((score / total) * 100);

  let rank = "🔴 Chưa đạt";
  let color = "red";

  if (percent >= 90) {
    rank = "🟢 Xuất sắc"; color = "green";
  } else if (percent >= 75) {
    rank = "🔵 Tốt"; color = "blue";
  } else if (percent >= 50) {
    rank = "🟡 Đạt"; color = "orange";
  }

  result.innerHTML = `
    <h3>🎯 KẾT QUẢ BÀI THI</h3>
    <p>✔ Đúng: <b>${score}</b> / ${total}</p>
    <p>📊 ${percent}%</p>
    <p style="color:${color}; font-size:18px">
      🏅 ${rank}
    </p>
    <button onclick="location.reload()">🔁 Làm lại</button>
  `;
}
