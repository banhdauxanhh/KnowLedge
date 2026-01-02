let questions=[], current=0, score=0;
let selected=null, locked=false;
let states=[], history=[];
let time=50*60, timer;
let startTime=0;

const quiz=document.getElementById("quiz");
const timerEl=document.getElementById("timer");
const result=document.getElementById("result");
const startBtn=document.getElementById("startBtn");
const subjectSelect=document.getElementById("subjectSelect");
const progressText=document.getElementById("progressText");
const progressFill=document.getElementById("progressFill");
const navigatorEl=document.getElementById("navigator");

for(let s in subjects)
  subjectSelect.innerHTML+=`<option value="${s}">${s}</option>`;

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    let j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

startBtn.onclick=()=>{
  if(!subjectSelect.value) return alert("Chọn môn");
  questions=shuffle([...subjects[subjectSelect.value]]);
  current=0; score=0;
  states=Array(questions.length).fill(null);
  result.innerHTML="";
  startTime=Date.now();
  buildNav();
  startTimer();
  show();
};

function startTimer(){
  clearInterval(timer);
  time=50*60;
  timer=setInterval(()=>{
    time--;
    let m=Math.floor(time/60), s=time%60;
    timerEl.innerText=`⏰ ${m}:${String(s).padStart(2,"0")}`;
    if(time<=60){ timerEl.style.color="red"; navigator.vibrate?.(80); }
    else if(time<=300) timerEl.style.color="orange";
    else timerEl.style.color="";
    if(time<=0){ clearInterval(timer); finish(); }
  },1000);
}

function updateProgress(){
  progressText.innerText=`Câu ${current+1} / ${questions.length}`;
  progressFill.style.width=((current+1)/questions.length*100)+"%";
}

function buildNav(){
  navigatorEl.innerHTML="";
  questions.forEach((_,i)=>{
    let b=document.createElement("button");
    b.className="nav";
    b.innerText=i+1;
    b.onclick=()=>{ current=i; show(); };
    navigatorEl.appendChild(b);
  });
}

function updateNav(){
  [...navigatorEl.children].forEach((b,i)=>{
    b.className="nav";
    if(states[i]==="ok") b.classList.add("ok");
    if(states[i]==="wrong") b.classList.add("wrong");
    if(i===current) b.classList.add("cur");
  });
}

function show(){
  locked=false; selected=null;
  let q=questions[current];
  quiz.innerHTML=`
  <div class="question">
    <b>Câu ${current+1}:</b> ${q.question}<br><br>
    ${q.options.map((o,i)=>`
      <label><input type="radio" name="a" value="${i}"> ${o}</label><br>
    `).join("")}

    <div style="
      display:flex;
      justify-content:space-between;
      gap:10px;
      margin-top:10px;
    ">
      <button id="check">🔍 Kiểm tra</button>
      <button id="next" disabled>➡️ Câu tiếp theo</button>
      <button id="submit">📝 Nộp bài</button>
    </div>

    <div id="fb"></div>
  </div>`;

  updateProgress(); updateNav();

  document.querySelectorAll("input[name='a']").forEach(r=>{
    r.onchange=()=>{ if(!locked) selected=+r.value; };
  });

  document.getElementById("check").onclick=check;

  document.getElementById("next").onclick=()=>{
    if(current<questions.length-1){ current++; show(); }
    else finish();
  };

  document.getElementById("submit").onclick=()=>{
    if(confirm("Nộp bài?")) finish();
  };
}

function check(){
  if(locked) return;
  if(selected===null) return alert("Chọn đáp án");
  locked=true;
  let q=questions[current];
  let fb=document.getElementById("fb");

  if(selected===q.answer){
    score++; states[current]="ok";
    fb.innerHTML="✅ ĐÚNG";
  }else{
    states[current]="wrong";
    fb.innerHTML="❌ SAI";
  }

  document.getElementById("next").disabled=false;
  updateNav();
}

function finish(){
  clearInterval(timer);
  quiz.innerHTML="";
  let total=questions.length;
  let percent=Math.round(score/total*100);
  let spent=Math.round((Date.now()-startTime)/1000);
  history=JSON.parse(localStorage.getItem("history")||"[]");
  history.push({date:new Date().toLocaleString(),percent});
  localStorage.setItem("history",JSON.stringify(history));

  result.innerHTML=`
    <h3>📊 Kết quả</h3>
    <p>${score}/${total} (${percent}%)</p>
    <p>⏱ ${Math.floor(spent/60)}:${String(spent%60).padStart(2,"0")}</p>
    <h4>Lịch sử</h4>
    ${history.slice(-5).map(h=>`<div>${h.date}: ${h.percent}%</div>`).join("")}
    <br><button onclick="location.reload()">🔁 Làm lại</button>`;
}
