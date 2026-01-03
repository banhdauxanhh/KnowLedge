let questions=[],current=0,score=0;
let selected=null,locked=false;
let states=[],wrongList=[];
let time=50*60,timer,startTime=0;

const quiz=document.getElementById("quiz");
const timerEl=document.getElementById("timer");
const result=document.getElementById("result");
const startBtn=document.getElementById("startBtn");
const subjectSelect=document.getElementById("subjectSelect");
const navigatorEl=document.getElementById("navigator");

/* load subjects */
for(let s in subjects)
  subjectSelect.innerHTML+=`<option value="${s}">${s}</option>`;

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
  const base=subjects[subjectSelect.value];
  const custom=JSON.parse(localStorage.getItem("customQuestions")||"[]");
  questions=shuffle([...base,...custom]);
  current=0;score=0;wrongList=[];
  states=Array(questions.length).fill(null);
  navigatorEl.style.display="flex";
  result.innerHTML="";
  startTime=Date.now();
  buildNav();startTimer();show();
};

/* timer */
function startTimer(){
  clearInterval(timer);
  time=50*60;
  timer=setInterval(()=>{
    time--;
    const m=Math.floor(time/60),s=time%60;
    timerEl.innerText=`⏰ ${m}:${String(s).padStart(2,"0")}`;
    if(time<=0){clearInterval(timer);finish();}
  },1000);
}

/* navigator */
function buildNav(){
  navigatorEl.innerHTML="";
  questions.forEach((_,i)=>{
    const b=document.createElement("button");
    b.className="nav";
    b.innerText=i+1;
    b.onclick=()=>{current=i;show();}
    navigatorEl.appendChild(b);
  });
}
function updateNav(){
  [...navigatorEl.children].forEach((b,i)=>{
    b.className="nav";
    if(states[i]==="ok")b.classList.add("ok");
    if(states[i]==="wrong")b.classList.add("wrong");
    if(i===current)b.classList.add("cur");
  });
}

/* show question */
function show(){
  locked=false;selected=null;
  const q=questions[current];
  quiz.innerHTML=`
  <div class="question">
    <b>Câu ${current+1}:</b> ${q.question}<br><br>
    ${q.options.map((o,i)=>`
      <label><input type="radio" name="a" value="${i}"> ${o}</label><br>
    `).join("")}

    <div style="display:flex;justify-content:space-between;margin-top:10px">
      <button id="check">🔍 Kiểm tra</button>
      <button id="next" style="display:none">➡ Câu tiếp theo</button>
      <button id="submit">📝 Nộp bài</button>
    </div>
    <div id="fb"></div>
  </div>`;
  updateNav();

  document.querySelectorAll("input[name='a']").forEach(r=>{
    r.onchange=()=>{if(!locked)selected=+r.value}
  });

  document.getElementById("check").onclick=check;
  document.getElementById("next").onclick=()=>{
    current<questions.length-1? (current++,show()):finish();
  };
  document.getElementById("submit").onclick=()=>{if(confirm("Nộp bài?"))finish();}
}

/* check */
function check(){
  if(locked||selected===null)return;
  locked=true;
  const q=questions[current];
  const fb=document.getElementById("fb");

  if(selected===q.answer){
    score++;states[current]="ok";
    fb.innerHTML="✅ ĐÚNG";
  }else{
    states[current]="wrong";
    const correctText=q.options[q.answer];
    fb.innerHTML=`❌ SAI | ✅ Đáp án đúng: <b>${correctText}</b>`;
    wrongList.push({
      index:current+1,
      question:q.question,
      correct:correctText,
      selected:q.options[selected]
    });
  }

  const labels=quiz.querySelectorAll("label");
  labels.forEach((l,i)=>{
    if(i===q.answer){l.style.color="#22c55e";l.style.fontWeight="bold";}
    if(i===selected&&selected!==q.answer)l.style.color="#ef4444";
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
  let rank=percent<50?"Chưa Đạt 😡":percent<=70?"Đạt 🥸":"Tốt 🥳";

  result.innerHTML=`
    <h3>Kết quả</h3>
    <p>${score}/${total} (${percent}%)</p>
    <p><b>${rank}</b></p>
    <h4>Câu sai</h4>
    ${wrongList.map(w=>`
      <div>
        <b>Câu ${w.index}:</b> ${w.question}<br>
        ❌ ${w.selected}<br>
        ✅ ${w.correct}
      </div>`).join("")||"🎉 Không có"}
    <br><button onclick="location.reload()">🔁 Làm lại</button>
  `;
}

/* QUESTION BANK */
function openQuestionBank(){
  document.getElementById("questionBankModal").style.display="flex";
}
function closeQuestionBank(){
  document.getElementById("questionBankModal").style.display="none";
}
function openUploader(){
  closeQuestionBank();
  document.getElementById("fileInput").click();
}
function handleUpload(e){
  const file=e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      const saved=JSON.parse(localStorage.getItem("customQuestions")||"[]");
      localStorage.setItem("customQuestions",JSON.stringify([...saved,...data]));
      alert(`✅ Đã upload ${data.length} câu`);
    }catch{alert("❌ File lỗi")}
  };
  reader.readAsText(file);
}
function openManualForm(){
  closeQuestionBank();
  const q=prompt("Câu hỏi:");
  const o1=prompt("Đáp án A:");
  const o2=prompt("Đáp án B:");
  const o3=prompt("Đáp án C:");
  const o4=prompt("Đáp án D:");
  const a=prompt("Đáp án đúng (0-3):");
  if(!q)return;
  const saved=JSON.parse(localStorage.getItem("customQuestions")||"[]");
  saved.push({question:q,options:[o1,o2,o3,o4],answer:Number(a)});
  localStorage.setItem("customQuestions",JSON.stringify(saved));
  alert("✅ Đã thêm câu hỏi");
}
