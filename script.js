const responsePanel = document.getElementById('responsePanel');
const reminderList = document.getElementById('reminderList');
const notificationList = document.getElementById('notificationList');
const voiceSelect = document.getElementById('voiceSelect');
const speakBtn = document.getElementById('speakBtn');
const sendBtn = document.getElementById('sendBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const userInput = document.getElementById('userInput');
const responseArea = document.getElementById('responseArea');

let selectedVoice = 'default';
let reminders = [];

voiceSelect.addEventListener('change', ()=> selectedVoice = voiceSelect.value);

function speak(text){
  let utter = new SpeechSynthesisUtterance(text);
  if(selectedVoice!=='default'){
    let voices = speechSynthesis.getVoices();
    let voice = voices.find(v=>v.name.toLowerCase().includes(selectedVoice)) || voices[0];
    utter.voice = voice;
  }
  speechSynthesis.speak(utter);
}

function floatPanel(panel){
  panel.classList.add('animate');
  setTimeout(()=>panel.classList.remove('animate'), 600);
}

function addNotification(message){
  const li = document.createElement('li');
  li.innerText = message;
  notificationList.appendChild(li);
  li.animate([{transform:'translateY(-20px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:500});
  speak(`Notification: ${message}`);
}

function addReminder(reminder){
  const li = document.createElement('li');
  li.innerText = reminder;
  reminderList.appendChild(li);
  li.animate([{transform:'translateY(-10px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:500});
  addNotification(reminder);
}

// Typewriter effect
function typeWriter(el,text){
  let i=0; el.innerText=''; let interval=setInterval(()=>{
    el.innerText += text.charAt(i); i++; if(i>=text.length) clearInterval(interval);
  },20);
}

// AI command
async function sendCommand(command){
  if(!command) return;
  floatPanel(responsePanel);
  const response = await fetch('/ask',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({command})
  });
  const data = await response.json();
  typeWriter(responseArea,`VALHALLA: ${data.response}`);
  speak(data.response);
  if(command.toLowerCase().includes("remind me")) addReminder(command);
}

sendBtn.addEventListener('click', ()=>sendCommand(userInput.value));

// Voice recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang='en-US';
speakBtn.addEventListener('click', ()=> recognition.start());
recognition.onresult = (event)=>{
  const speech = event.results[0][0].transcript;
  userInput.value = speech;
  sendCommand(speech);
};

// File upload
uploadBtn.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', async ()=>{
  const file = fileInput.files[0]; if(!file) return;
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/upload',{method:'POST',body:formData});
  const data = await response.json();
  addNotification(data.response);
  typeWriter(responseArea,`VALHALLA: ${data.response}`);
  speak(data.response);
});

// Update time/weather
setInterval(()=>{
  const now = new Date();
  document.getElementById('timeInfo').innerText = `Time: ${now.toLocaleTimeString()}`;
},1000);
