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
const mobileNav = document.getElementById('mobileNav');
const loadingIndicator = document.getElementById('loadingIndicator');

let selectedVoice = 'default';
let reminders = [];
let conversationHistory = [];
let searchHistory = [];
let isListening = false;

voiceSelect.addEventListener('change', ()=> selectedVoice = voiceSelect.value);

// Mobile navigation functionality
if (mobileNav) {
    const navButtons = mobileNav.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const panelId = btn.getAttribute('data-panel');
            const panel = document.getElementById(panelId);
            if (panel) {
                // Scroll to panel
                panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Highlight panel briefly
                panel.style.boxShadow = '0 0 20px #00ffea';
                setTimeout(() => {
                    panel.style.boxShadow = '';
                }, 1000);
            }
        });
    });
}

// Loading indicator functions
function showLoading(message = 'Processing...') {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
        const loadingText = loadingIndicator.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
}

function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

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

// Enhanced AI command with history and search support
async function sendCommand(command){
  if(!command) return;
  
  // Add to conversation history
  conversationHistory.push({
    type: 'user',
    message: command,
    timestamp: new Date().toISOString()
  });
  
  // Handle special commands
  if(command.toLowerCase().includes('search')) {
    searchHistory.push(command);
    if(searchHistory.length > 10) searchHistory.shift(); // Keep last 10 searches
  }
  
  floatPanel(responsePanel);
  
  try {
    const response = await fetch('/ask',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({command})
    });
    
    if(!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Add to conversation history
    conversationHistory.push({
      type: 'assistant',
      message: data.response,
      timestamp: new Date().toISOString()
    });
    
    // Keep conversation history to last 50 messages
    if(conversationHistory.length > 50) {
      conversationHistory = conversationHistory.slice(-50);
    }
    
    typeWriter(responseArea,`VALHALLA: ${data.response}`);
    speak(data.response);
    
    if(command.toLowerCase().includes("remind me")) {
      addReminder(command);
    }
    
    // Add search results to history display
    if(command.toLowerCase().includes("search")) {
      addNotification(`Search completed: ${command}`);
    }
    
    // Weather joke notification
    if(command.toLowerCase().includes("joke")) {
      addNotification("Weather joke delivered! 😄");
    }
    
  } catch (error) {
    console.error('Error sending command:', error);
    typeWriter(responseArea,`VALHALLA: Sorry, I encountered an error: ${error.message}`);
    speak("Sorry, I encountered an error. Please try again.");
    addNotification(`Error: ${error.message}`);
  }
}

sendBtn.addEventListener('click', ()=>sendCommand(userInput.value));

// Enhanced Voice recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang='en-US';
recognition.continuous = false;
recognition.interimResults = false;

speakBtn.addEventListener('click', ()=> {
  if(isListening) {
    recognition.stop();
    isListening = false;
    speakBtn.textContent = '🎤 Speak';
    speakBtn.classList.remove('listening');
  } else {
    recognition.start();
    isListening = true;
    speakBtn.textContent = '🛑 Stop';
    speakBtn.classList.add('listening');
    addNotification('Voice recognition started. Speak now!');
  }
});

recognition.onstart = () => {
  isListening = true;
  speakBtn.textContent = '🛑 Stop';
  speakBtn.classList.add('listening');
};

recognition.onend = () => {
  isListening = false;
  speakBtn.textContent = '🎤 Speak';
  speakBtn.classList.remove('listening');
};

recognition.onerror = (event) => {
  console.error('Speech recognition error:', event.error);
  isListening = false;
  speakBtn.textContent = '🎤 Speak';
  speakBtn.classList.remove('listening');
  addNotification(`Voice recognition error: ${event.error}`);
  speak("Voice recognition error. Please try again.");
};

recognition.onresult = (event)=>{
  const speech = event.results[0][0].transcript;
  const confidence = event.results[0][0].confidence;
  
  if(confidence > 0.5) {
    userInput.value = speech;
    addNotification(`Voice recognized (${Math.round(confidence * 100)}% confidence): ${speech}`);
    sendCommand(speech);
  } else {
    addNotification(`Voice recognition confidence too low (${Math.round(confidence * 100)}%). Please try again.`);
    speak("I didn't understand that clearly. Please try again.");
  }
};

// File upload
uploadBtn.addEventListener('click', ()=> fileInput.click());
// Enhanced file upload with progress and validation
fileInput.addEventListener('change', async ()=>{
  const file = fileInput.files[0]; 
  if(!file) return;
  
  // File size validation (10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if(file.size > maxSize) {
    addNotification(`File too large: ${(file.size / (1024*1024)).toFixed(1)}MB. Maximum is 10MB.`);
    speak("File too large. Please choose a smaller file.");
    return;
  }
  
  // File type validation
  const allowedTypes = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg', 'image/gif'];
  if(!allowedTypes.includes(file.type)) {
    addNotification(`Unsupported file type: ${file.type}`);
    speak("Unsupported file type. Please use PDF, TXT, PNG, JPG, or GIF.");
    return;
  }
  
  addNotification(`Uploading ${file.name} (${(file.size / 1024).toFixed(1)}KB)...`);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/upload',{
      method:'POST',
      body:formData
    });
    
    if(!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    const data = await response.json();
    addNotification(`Upload successful: ${file.name}`);
    typeWriter(responseArea,`VALHALLA: ${data.response}`);
    speak(data.response);
    
  } catch (error) {
    console.error('Upload error:', error);
    addNotification(`Upload failed: ${error.message}`);
    speak("File upload failed. Please try again.");
  }
});

// Enhanced keyboard shortcuts
document.addEventListener('keydown', (event)=>{
  // Ctrl+Enter or Cmd+Enter to send command
  if((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    sendCommand(userInput.value);
  }
  
  // Ctrl+L or Cmd+L to clear input
  if((event.ctrlKey || event.metaKey) && event.key === 'l') {
    event.preventDefault();
    userInput.value = '';
    userInput.focus();
  }
  
  // Ctrl+J or Cmd+J for weather joke
  if((event.ctrlKey || event.metaKey) && event.key === 'j') {
    event.preventDefault();
    sendCommand('tell me a weather joke');
  }
  
  // Ctrl+S or Cmd+S for search
  if((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    userInput.focus();
    userInput.value = 'search for ';
  }
});

// Enhanced time/weather display with error handling
setInterval(()=>{
  try {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    
    document.getElementById('timeInfo').innerText = `Time: ${timeString}\nDate: ${dateString}`;
    
    // Update weather every 10 minutes
    if(now.getMinutes() % 10 === 0 && now.getSeconds() === 0) {
      updateWeatherInfo();
    }
  } catch (error) {
    console.error('Error updating time/weather:', error);
  }
},1000);

// Function to update weather information
async function updateWeatherInfo() {
  try {
    // Default to a major city if user hasn't specified
    const response = await fetch('/ask',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({command:'weather Toronto'})
    });
    
    const data = await response.json();
    const weatherText = data.response.split('.')[0] + '.'; // Get first sentence
    document.getElementById('weatherInfo').innerText = weatherText;
    
  } catch (error) {
    console.error('Error updating weather:', error);
    document.getElementById('weatherInfo').innerText = 'Weather: Unable to fetch data';
  }
}

// Initialize weather info
updateWeatherInfo();

// Enhanced JARVIS-like voice feedback
function speak(text, options = {}) {
  // Skip empty or invalid text
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('JARVIS: Invalid text for speech synthesis');
    return;
  }

  // Wait for voices to be loaded
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.addEventListener('voiceschanged', () => speak(text, options));
    return;
  }

  let utter = new SpeechSynthesisUtterance(text);
  
  // JARVIS-like voice configuration
  let voices = speechSynthesis.getVoices();
  
  // Prefer British English or high-quality voices for JARVIS effect
  let preferredVoices = [
    // British voices (closer to JARVIS accent)
    'Google UK English Male',
    'Microsoft James Online (Natural) - English (United Kingdom)',
    'Alex', // macOS British voice
    'Daniel', // macOS British voice
    'Fiona', // macOS Scottish voice
    'Moira', // macOS Irish voice
    
    // High-quality English voices
    'Microsoft David Online (Natural) - English (United States)',
    'Microsoft Mark Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Google US English',
    'Samantha', // macOS US voice
    'Victoria', // macOS US voice
    'Allison', // macOS US voice
    'Ava', // macOS US voice
  ];
  
  // Select best available voice
  let selectedVoice = null;
  
  // First try to find a preferred voice
  for (let preferredVoiceName of preferredVoices) {
    selectedVoice = voices.find(v => v.name === preferredVoiceName);
    if (selectedVoice) break;
  }
  
  // Fallback to any English voice
  if (!selectedVoice) {
    selectedVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('google'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }
  
  if (selectedVoice) {
    utter.voice = selectedVoice;
  }
  
  // JARVIS-like voice settings (slightly slower, deeper, more formal)
  utter.rate = options.rate || 0.85;  // Slower, more deliberate speech
  utter.pitch = options.pitch || 0.9;  // Slightly lower pitch
  utter.volume = options.volume || 0.95;  // Slightly lower volume for sophistication
  
  // Enhanced event handlers with JARVIS personality
  utter.onstart = () => {
    console.log('JARVIS: Speech synthesis initiated');
    // Add visual feedback
    if (speakBtn) {
      speakBtn.classList.add('voice-active');
    }
  };
  
  utter.onend = () => {
    console.log('JARVIS: Speech synthesis completed');
    // Remove visual feedback
    if (speakBtn) {
      speakBtn.classList.remove('voice-active');
    }
  };
  
  utter.onerror = (event) => {
    console.error('JARVIS: Speech synthesis error:', event.error);
    // Don't show error notifications for canceled speech
    if (event.error !== 'canceled') {
      addNotification(`Voice synthesis error: ${event.error}`);
    }
    if (speakBtn) {
      speakBtn.classList.remove('voice-active');
    }
  };
  
  // Queue management for smooth speech - improved handling
  try {
    // Cancel any ongoing speech with a small delay to avoid conflicts
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      // Small delay to ensure cancellation completes
      setTimeout(() => {
        speechSynthesis.speak(utter);
      }, 100);
    } else {
      speechSynthesis.speak(utter);
    }
  } catch (error) {
    console.error('JARVIS: Error managing speech queue:', error);
    addNotification('Voice synthesis unavailable');
  }
}

// JARVIS-style greeting function
function jarvisGreet() {
  const greetings = [
    "Good day. I am VALHALLA, at your service.",
    "Welcome. I am online and ready to assist.",
    "Hello. VALHALLA systems are fully operational.",
    "Greetings. How may I be of assistance today?"
  ];
  
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  speak(greeting);
}

// Add welcome message with JARVIS greeting
setTimeout(()=>{
  addNotification("Welcome! VALHALLA is ready.");
  jarvisGreet();
  const welcomeMessage = "How may I help you?";
  setTimeout(() => {
    speak(welcomeMessage);
    typeWriter(responseArea, `VALHALLA: ${welcomeMessage}`);
  }, 2000);
}, 1000);
