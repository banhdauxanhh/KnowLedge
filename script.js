let questions = [];
let current = 0;
let score = 0;
let selected = null;
let checked = false;

const quiz = document.getElementById("quiz");
const timerEl = document.getElementById("timer");
const result = document.getElementById("result");
const subjectSelect = document.getElementById("subjectSelect");

for (let s in subjects) {
  subjectSelect.innerHTML += `<option value="${s}">${s}</option>`;
}

function startQuiz() {
  questions = [...subjects[subjectSelect.value]];
  current = 0;
  score = 0;
  result.innerHTML = "";
  showQuestion();
}

function showQuestion() {
  selected = null;
  checked = false;

  const q = questions[current];

  quiz.innerHTML = `
    <div class="question">
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

      <button id="checkBtn">🔍 Kiểm tra</button>
      <p id="feedback"></p>
    </div>
  `;

  document.querySelectorAll("input[name='answer']").forEach((r) => {
    r.onchange = () => {
      if (!checked) selected = Number(r.value);
    };
  });

  document.getElementById("checkBtn").onclick = checkAnswer;
}

function checkAnswer() {
  if (selected === null) {
    alert("Hãy chọn đáp án!");
    return;
  }

  if (checked) return;
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

function finish() {
  quiz.innerHTML = "";
  result.innerHTML = `
    <h3>🎯 Kết quả</h3>
    <p>Điểm: ${score} / ${questions.length}</p>
  `;
}
