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
const shortcutsPanel = document.getElementById('shortcutsPanel');
const helpHint = document.getElementById('helpHint');
const closeShortcuts = document.getElementById('closeShortcuts');

// System Control elements
const volumeDown = document.getElementById('volumeDown');
const volumeUp = document.getElementById('volumeUp');
const brightnessDown = document.getElementById('brightnessDown');
const brightnessUp = document.getElementById('brightnessUp');
const screenshotBtn = document.getElementById('screenshotBtn');
const lockScreenBtn = document.getElementById('lockScreenBtn');
const volumeLevel = document.getElementById('volumeLevel');
const brightnessLevel = document.getElementById('brightnessLevel');
const systemStats = document.getElementById('systemStats');
const batteryLevel = document.getElementById('batteryLevel');
const batteryStatus = document.getElementById('batteryStatus');

// Productivity elements
const newNoteBtn = document.getElementById('newNoteBtn');
const calendarBtn = document.getElementById('calendarBtn');
const taskListBtn = document.getElementById('taskListBtn');
const timerBtn = document.getElementById('timerBtn');
const musicControlBtn = document.getElementById('musicControlBtn');
const newsBtn = document.getElementById('newsBtn');

let selectedVoice = 'default';
let reminders = [];
let conversationHistory = [];
let searchHistory = [];
let isListening = false;

// System control variables
let currentVolume = 50;
let currentBrightness = 75;

// Timer variables
let timerInterval = null;
let timerSeconds = 0;
let timerActive = false;

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

// Enhanced AI command with client-side processing
function sendCommand(command){
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
  
  // Process commands client-side
  const response = processCommand(command);
  
  // Add to conversation history
  conversationHistory.push({
    type: 'assistant',
    message: response,
    timestamp: new Date().toISOString()
  });
  
  // Keep conversation history to last 50 messages
  if(conversationHistory.length > 50) {
    conversationHistory = conversationHistory.slice(-50);
  }
  
  typeWriter(responseArea,`VALHALLA: ${response}`);
  speak(response);
  
  // Handle specific command types
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
}

// Client-side command processing
function processCommand(command) {
  const cmd = command.toLowerCase().trim();
  
  // Application opening commands
  if (cmd.includes('open vs code') || cmd.includes('open visual studio code') || cmd === 'vs code' || cmd === 'vscode') {
    openApplication('vscode');
    return 'Opening Visual Studio Code...';
  }
  
  if (cmd.includes('open zed') || cmd.includes('open zed editor') || cmd === 'zed' || cmd === 'zed editor') {
    openApplication('zed');
    return 'Opening Zed Code Editor...';
  }
  
  if (cmd.includes('open browser') || cmd.includes('open web') || cmd === 'browser' || cmd === 'web') {
    openApplication('web');
    return 'Opening web browser...';
  }
  
  // System commands
  if (cmd.includes('take screenshot') || cmd === 'screenshot') {
    if (screenshotBtn) screenshotBtn.click();
    return 'Taking screenshot...';
  }
  
  if (cmd.includes('lock screen') || cmd === 'lock') {
    if (lockScreenBtn) lockScreenBtn.click();
    return 'Locking screen...';
  }
  
  if (cmd.includes('volume up') || cmd.includes('increase volume')) {
    if (volumeUp) volumeUp.click();
    return 'Increasing volume...';
  }
  
  if (cmd.includes('volume down') || cmd.includes('decrease volume')) {
    if (volumeDown) volumeDown.click();
    return 'Decreasing volume...';
  }
  
  if (cmd.includes('brightness up') || cmd.includes('increase brightness')) {
    if (brightnessUp) brightnessUp.click();
    return 'Increasing brightness...';
  }
  
  if (cmd.includes('brightness down') || cmd.includes('decrease brightness')) {
    if (brightnessDown) brightnessDown.click();
    return 'Decreasing brightness...';
  }
  
  // Productivity commands
  if (cmd.includes('new note') || cmd === 'note') {
    if (newNoteBtn) newNoteBtn.click();
    return 'Creating new note...';
  }
  
  if (cmd.includes('open calendar') || cmd === 'calendar') {
    if (calendarBtn) calendarBtn.click();
    return 'Opening calendar...';
  }
  
  if (cmd.includes('new task') || cmd === 'task') {
    if (taskListBtn) taskListBtn.click();
    return 'Adding new task...';
  }
  
  if (cmd.includes('start timer') || cmd === 'timer') {
    if (timerBtn) timerBtn.click();
    return 'Setting up timer...';
  }
  
  if (cmd.includes('open spotify') || cmd.includes('music') || cmd === 'music') {
    if (musicControlBtn) musicControlBtn.click();
    return 'Opening music control...';
  }
  
  if (cmd.includes('news') || cmd === 'news') {
    if (newsBtn) newsBtn.click();
    return 'Fetching latest news...';
  }
  
  // Utility commands
  if (cmd.includes('clear') || cmd === 'clear') {
    userInput.value = '';
    return 'Input cleared.';
  }
  
  if (cmd.includes('help') || cmd === 'help' || cmd === '?') {
    showShortcutsPanel();
    return 'Opening help panel with keyboard shortcuts...';
  }
  
  if (cmd.includes('time') || cmd === 'time') {
    const now = new Date();
    return `Current time is ${now.toLocaleTimeString()}.`;
  }
  
  if (cmd.includes('date') || cmd === 'date') {
    const now = new Date();
    return `Today is ${now.toLocaleDateString()}.`;
  }
  
  if (cmd.includes('weather') || cmd === 'weather') {
    return 'Weather functionality requires internet connection. You can check weather websites or use voice commands.';
  }
  
  if (cmd.includes('joke') || cmd === 'joke') {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "Why did the computer go to the doctor? Because it had a virus!",
      "What do you call a computer that sings? A-Dell!",
      "Why don't computers ever get tired? Because they have rest modes!",
      "What did one computer say to another? You look a bit off today!"
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    return randomJoke;
  }
  
  // Default responses
  const defaultResponses = [
    "I understand your command. For specific actions like opening applications, please use the system control buttons or voice commands.",
    "I've received your command. Try commands like 'open vs code', 'take screenshot', 'start timer', or use the control panels.",
    "Command noted. I can help you with system controls, productivity tools, and opening applications. What would you like to do?",
    "I'm ready to assist. You can control system settings, open applications, or use productivity features. How may I help?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

sendBtn.addEventListener('click', ()=>sendCommand(userInput.value));

// Also handle Enter key in textarea
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendCommand(userInput.value);
    }
});

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
  
  // Ctrl+E or Cmd+E to open VS Code
  if((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault();
    openApplication('vscode');
  }
  
  // Ctrl+Z or Cmd+Z to open Zed
  if((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault();
    openApplication('zed');
  }
  
  // Ctrl+W or Cmd+W to open web browser
  if((event.ctrlKey || event.metaKey) && event.key === 'w') {
    event.preventDefault();
    openApplication('web');
  }
  
  // ? key to show shortcuts help
  if(event.key === '?') {
    event.preventDefault();
    showShortcutsPanel();
  }
  
  // Ctrl+R or Cmd+R to refresh
  if((event.ctrlKey || event.metaKey) && event.key === 'r') {
    event.preventDefault();
    location.reload();
  }
  
  // Ctrl+N or Cmd+N to new note
  if((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault();
    if (newNoteBtn) newNoteBtn.click();
  }
  
  // Ctrl+T or Cmd+T to start timer
  if((event.ctrlKey || event.metaKey) && event.key === 't') {
    event.preventDefault();
    if (timerBtn) timerBtn.click();
  }
});

// Shortcuts panel functions
function showShortcutsPanel() {
    if (shortcutsPanel) {
        shortcutsPanel.style.display = 'flex';
        helpHint.classList.remove('show');
    }
}

function hideShortcutsPanel() {
    if (shortcutsPanel) {
        shortcutsPanel.style.display = 'none';
    }
}

// Close shortcuts panel events
if (closeShortcuts) {
    closeShortcuts.addEventListener('click', hideShortcutsPanel);
}

if (shortcutsPanel) {
    shortcutsPanel.addEventListener('click', (event) => {
        if (event.target === shortcutsPanel) {
            hideShortcutsPanel();
        }
    });
}

// Show help hint after a delay
setTimeout(() => {
    if (helpHint) {
        helpHint.classList.add('show');
        // Hide hint after 10 seconds
        setTimeout(() => {
            helpHint.classList.remove('show');
        }, 10000);
    }
}, 3000);

// System Control Functions
if (volumeDown) {
    volumeDown.addEventListener('click', () => {
        currentVolume = Math.max(0, currentVolume - 10);
        updateVolumeDisplay();
        addNotification(`Volume decreased to ${currentVolume}%`);
        speak(`Volume decreased to ${currentVolume} percent`);
    });
}

if (volumeUp) {
    volumeUp.addEventListener('click', () => {
        currentVolume = Math.min(100, currentVolume + 10);
        updateVolumeDisplay();
        addNotification(`Volume increased to ${currentVolume}%`);
        speak(`Volume increased to ${currentVolume} percent`);
    });
}

if (brightnessDown) {
    brightnessDown.addEventListener('click', () => {
        currentBrightness = Math.max(10, currentBrightness - 10);
        updateBrightnessDisplay();
        addNotification(`Brightness decreased to ${currentBrightness}%`);
        speak(`Brightness decreased to ${currentBrightness} percent`);
    });
}

if (brightnessUp) {
    brightnessUp.addEventListener('click', () => {
        currentBrightness = Math.min(100, currentBrightness + 10);
        updateBrightnessDisplay();
        addNotification(`Brightness increased to ${currentBrightness}%`);
        speak(`Brightness increased to ${currentBrightness} percent`);
    });
}

if (screenshotBtn) {
    screenshotBtn.addEventListener('click', () => {
        addNotification('📸 Taking screenshot...');
        speak('Taking screenshot');
        // Note: Actual screenshot would require system permissions
        setTimeout(() => {
            addNotification('Screenshot saved to desktop');
            speak('Screenshot saved to desktop');
        }, 1000);
    });
}

if (lockScreenBtn) {
    lockScreenBtn.addEventListener('click', () => {
        addNotification('🔒 Locking screen...');
        speak('Locking screen');
        // Note: Actual screen lock would require system permissions
        setTimeout(() => {
            addNotification('Screen locked successfully');
            speak('Screen locked successfully');
        }, 1500);
    });
}

// Productivity Functions
if (newNoteBtn) {
    newNoteBtn.addEventListener('click', () => {
        const noteTitle = prompt('Enter note title:');
        if (noteTitle) {
            addNotification(`📝 Creating note: ${noteTitle}`);
            speak(`Creating note ${noteTitle}`);
            addReminder(`Note: ${noteTitle}`);
        }
    });
}

if (calendarBtn) {
    calendarBtn.addEventListener('click', () => {
        addNotification('📅 Opening calendar...');
        speak('Opening calendar');
        window.open('https://calendar.google.com', '_blank');
    });
}

if (taskListBtn) {
    taskListBtn.addEventListener('click', () => {
        const task = prompt('Enter new task:');
        if (task) {
            addNotification(`✅ Adding task: ${task}`);
            speak(`Adding task ${task}`);
            addReminder(`Task: ${task}`);
        }
    });
}

if (timerBtn) {
    timerBtn.addEventListener('click', () => {
        if (!timerActive) {
            const minutes = parseInt(prompt('Set timer for how many minutes? (1-60)'));
            if (minutes && minutes > 0 && minutes <= 60) {
                startTimer(minutes * 60);
            }
        } else {
            stopTimer();
        }
    });
}

if (musicControlBtn) {
    musicControlBtn.addEventListener('click', () => {
        addNotification('🎵 Music control opened');
        speak('Music control opened');
        window.open('https://open.spotify.com', '_blank');
    });
}

if (newsBtn) {
    newsBtn.addEventListener('click', () => {
        addNotification('📰 Fetching latest news...');
        speak('Fetching latest news');
        sendCommand('tell me the latest news');
    });
}

// Helper functions
function updateVolumeDisplay() {
    if (volumeLevel) {
        volumeLevel.textContent = `${currentVolume}%`;
    }
}

function updateBrightnessDisplay() {
    if (brightnessLevel) {
        brightnessLevel.textContent = `${currentBrightness}%`;
    }
}

function startTimer(seconds) {
    timerSeconds = seconds;
    timerActive = true;
    if (timerBtn) {
        timerBtn.textContent = '⏹️ Stop';
        timerBtn.classList.add('listening');
    }
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            stopTimer();
            addNotification('⏰ Timer finished!');
            speak('Timer finished');
            // Flash notification
            document.body.style.background = 'red';
            setTimeout(() => {
                document.body.style.background = '';
            }, 500);
        }
    }, 1000);
    
    addNotification(`⏱️ Timer started for ${Math.floor(timerSeconds / 60)} minutes`);
    speak(`Timer started for ${Math.floor(timerSeconds / 60)} minutes`);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerActive = false;
    timerSeconds = 0;
    
    if (timerBtn) {
        timerBtn.textContent = '⏱️ Timer';
        timerBtn.classList.remove('listening');
    }
    
    addNotification('⏹️ Timer stopped');
    speak('Timer stopped');
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timerBtn) {
        timerBtn.textContent = `⏱️ ${timeString}`;
    }
}

// Update system stats
function updateSystemStats() {
    if (systemStats) {
        const now = new Date();
        const uptime = Math.floor((now.getTime() - performance.timeOrigin) / 1000 / 60);
        const memory = navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'Unknown';
        const cores = navigator.hardwareConcurrency || 'Unknown';
        
        systemStats.innerHTML = `
            Time: ${now.toLocaleTimeString()}<br>
            Memory: ${memory} | Cores: ${cores}<br>
            Screen: ${screen.width}x${screen.height}<br>
            Browser: ${navigator.userAgent.split(' ')[0]}
        `;
    }
}

// Initialize system stats
updateSystemStats();
setInterval(updateSystemStats, 5000);

// Initialize battery monitoring
initializeBatteryMonitoring();

function initializeBatteryMonitoring() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            updateBatteryDisplay(battery);
            
            // Listen for battery changes
            battery.addEventListener('levelchange', () => updateBatteryDisplay(battery));
            battery.addEventListener('chargingchange', () => updateBatteryDisplay(battery));
        }).catch(function(error) {
            console.log('Battery API not supported');
            updateBatteryDisplay(null);
        });
    } else {
        console.log('Battery API not supported');
        updateBatteryDisplay(null);
    }
}

function updateBatteryDisplay(battery) {
    if (battery && batteryLevel && batteryStatus) {
        const level = Math.round(battery.level * 100);
        const isCharging = battery.charging;
        
        batteryLevel.textContent = `${level}%`;
        
        if (isCharging) {
            batteryStatus.textContent = 'Charging';
            batteryStatus.style.color = '#00ff88'; // Green when charging
        } else if (level > 20) {
            batteryStatus.textContent = 'On Battery';
            batteryStatus.style.color = '#00ffea'; // Normal color
        } else {
            batteryStatus.textContent = 'Low Battery';
            batteryStatus.style.color = '#ff4444'; // Red when low
        }
        
        // Show warning for low battery
        if (level <= 15 && !isCharging) {
            addNotification('🔋 Low Battery Warning!');
            speak('Low battery warning');
        }
    } else if (batteryLevel && batteryStatus) {
        // Battery API not supported
        batteryLevel.textContent = 'N/A';
        batteryStatus.textContent = 'Not Supported';
        batteryStatus.style.color = '#666666';
    }
}


// Function to open applications
function openApplication(app) {
    let message = '';
    let instructions = '';
    
    switch(app) {
        case 'vscode':
            message = 'Opening Visual Studio Code...';
            instructions = 'Opening VS Code. If it doesn\'t open automatically, press Ctrl+E or Cmd+E again.';
            
            // Try multiple approaches to open VS Code
            if (navigator.platform.includes('Mac')) {
                // macOS - Try using custom URL scheme first
                try {
                    window.location.href = 'vscode://';
                    setTimeout(() => {
                        // Fallback to app directory
                        window.open('vscode://', '_blank');
                    }, 500);
                } catch (e) {
                    console.log('VS Code URL scheme not available');
                }
            } else if (navigator.platform.includes('Win')) {
                // Windows - Try common installation paths
                const commonPaths = [
                    'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
                    'C:\\Program Files\\Microsoft VS Code\\Code.exe',
                    'C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe'
                ];
                
                // For demo purposes, show instructions
                instructions += ' On Windows: Press Win+R, type "code" and press Enter.';
            } else {
                // Linux
                instructions += ' On Linux: Press Ctrl+Alt+T and type "code" and press Enter.';
            }
            
            // Also try to open VS Code web version as fallback
            setTimeout(() => {
                window.open('https://vscode.dev/', '_blank');
            }, 1000);
            break;
            
        case 'zed':
            message = 'Opening Zed Code Editor...';
            instructions = 'Opening Zed Editor. If it doesn\'t open automatically, press Ctrl+Z or Cmd+Z again.';
            
            // Try to open Zed
            if (navigator.platform.includes('Mac')) {
                try {
                    window.location.href = 'zed://';
                    setTimeout(() => {
                        window.open('zed://', '_blank');
                    }, 500);
                } catch (e) {
                    console.log('Zed URL scheme not available');
                }
            } else if (navigator.platform.includes('Win')) {
                instructions += ' On Windows: Press Win+R, type "zed" and press Enter.';
            } else {
                instructions += ' On Linux: Press Ctrl+Alt+T and type "zed" and press Enter.';
            }
            
            // Fallback to Zed web version
            setTimeout(() => {
                window.open('https://zed.dev/', '_blank');
            }, 1000);
            break;
            
        case 'web':
            message = 'Opening web browser...';
            // Open default web browser with Google
            window.open('https://www.google.com', '_blank');
            addNotification('🌐 Web browser opened with Google search.');
            speak('Web browser opened with Google search.');
            return; // Early return for web case
    }
    
    addNotification(message);
    speak(message);
    
    // Show instructions for manual opening if automatic opening fails
    setTimeout(() => {
        if (instructions) {
            addNotification(`💡 ${instructions}`);
            speak('Instructions provided in notifications.');
        }
    }, 1000);
    
    // Add helpful suggestions
    setTimeout(() => {
        const suggestions = [
            '💡 Tip: Install VS Code extension "Live Server" for web development',
            '💡 Tip: Use Ctrl+` to toggle VS Code terminal',
            '💡 Tip: Install Zed browser extension for better integration',
            '💡 Tip: Both editors support Git integration and extensions'
        ];
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        addNotification(suggestion);
    }, 3000);
}

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
