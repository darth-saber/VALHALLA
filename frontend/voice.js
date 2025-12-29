const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.continuous = true;

recognition.onresult = (event) => {
  const transcript =
    event.results[event.results.length - 1][0].transcript.toLowerCase();

  if (transcript.includes("valhalla")) {
    const cmd = transcript.replace("valhalla", "").trim();
    speak("Yes?");
    sendCommand(cmd);
  }
};

recognition.start();

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.95;
  msg.pitch = 0.9;
  speechSynthesis.speak(msg);
}
window.onload = () => {
  speak("VALHALLA online. Awaiting your command.");
};
