let questions=[], current=0, score=0;
let selected=null, locked=false;
let states=[], wrongList=[];
let time=50*60, timer, startTime=0;

const quiz=document.getElementById("quiz");
const timerEl=document.getElementById("timer");
const result=document.getElementById("result");
const startBtn=document.getElementById("startBtn");
const subjectSelect=document.getElementById("subjectSelect");
const progressText=document.getElementById("progressText");
const progressFill=document.getElementById("progressFill");
const navigatorEl=document.getElementById("navigator");

/* load subjects */
for(let s in subjects){
  subjectSelect.innerHTML+=`<option value="${s}">${s}</option>`;
}

/* shuffle */
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/* start */
startBtn.onclick=()=>{
  questions=shuffle([...subjects[subjectSelect.value]]);
  current=0; score=0; wrongList=[];
  states=Array(questions.length).fill(null);
  navigatorEl.style.display="flex";
  result.innerHTML="";
  startTime=Date.now();
  buildNav(); startTimer(); show();
};

/* timer */
function startTimer(){
  clearInterval(timer);
  time=50*60;
  timer=setInterval(()=>{
    time--;
    const m=Math.floor(time/60), s=time%60;
    timerEl.innerText=`⏰ ${m}:${String(s).padStart(2,"0")}`;
    if(time<=0){ clearInterval(timer); finish(); }
  },1000);
}

/* progress */
function updateProgress(){
  progressText.innerText=`Câu ${current+1} / ${questions.length}`;
  progressFill.style.width=((current+1)/questions.length*100)+"%";
}

/* navigator */
function buildNav(){
  navigatorEl.innerHTML="";
  questions.forEach((_,i)=>{
    const b=document.createElement("button");
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

/* show question */
function show(){
  locked=false; selected=null;
  const q=questions[current];

  quiz.innerHTML=`
  <div class="question">
    <b>Câu ${current+1}:</b> ${q.question}<br><br>
    ${q.options.map((o,i)=>`
      <label><input type="radio" name="a" value="${i}"> ${o}</label><br>
    `).join("")}

    <div style="display:flex;justify-content:space-between;margin-top:10px">
      <button id="check">🔍 Kiểm tra</button>
      <button id="next" style="display:none">➡️ Câu tiếp theo</button>
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
    current<questions.length-1 ? (current++,show()) : finish();
  };
  document.getElementById("submit").onclick=()=>{
    if(confirm("Nộp bài?")) finish();
  };
}

/* check */
function check(){
  if(locked || selected===null) return;
  locked=true;

  const q=questions[current];
  const fb=document.getElementById("fb");

  if(selected===q.answer){
    score++; states[current]="ok";
    fb.innerHTML="✅ ĐÚNG";
  }else{
    states[current]="wrong";
    const correctText=q.options[q.answer];
    fb.innerHTML=`
      <span style="color:red;font-weight:bold;">❌ SAI</span>
      <span style="margin-left:8px;color:#22c55e;">
        | ✅ Đáp án đúng: <b>${correctText}</b>
      </span>
    `;
    wrongList.push({
      index:current+1,
      question:q.question,
      correct:correctText,
      selected:q.options[selected]
    });
  }

  const labels=quiz.querySelectorAll("label");
  labels.forEach((label,i)=>{
    if(i===q.answer){
      label.style.color="#22c55e";
      label.style.fontWeight="bold";
    }
    if(i===selected && selected!==q.answer){
      label.style.color="#ef4444";
    }
  });

  document.getElementById("next").style.display="inline-block";
  updateNav();
}

/* finish */
function finish(){
  clearInterval(timer);
  quiz.innerHTML="";
  navigatorEl.style.display="none";

  const total=questions.length;
  const percent=Math.round(score/total*100);
  let rankText="", rankColor="";

  if(percent<50){
    rankText="❌ Chưa Đạt 😡"; rankColor="red";
  }else if(percent<=70){
    rankText="✅ Đạt 🥸"; rankColor="orange";
  }else{
    rankText="🌟 Tốt 🥳"; rankColor="green";
  }

  result.innerHTML=`
    <h3>📊 KẾT QUẢ</h3>
    <p>Điểm: ${score}/${total} (${percent}%)</p>
    <p style="font-size:18px;font-weight:bold;color:${rankColor};">
      ${rankText}
    </p>

    <h4>📋 Câu sai</h4>
    ${
      wrongList.length
      ? wrongList.map(w=>`
        <div>
          <b>Câu ${w.index}:</b> ${w.question}<br>
          ❌ ${w.selected}<br>
          ✅ ${w.correct}
        </div>
      `).join("")
      : "🎉 Không có câu sai"
    }

    <br><br>
    <button onclick="location.reload()">🔁 Làm lại</button>
  `;
}
