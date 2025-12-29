function log(text) {
  const logDiv = document.getElementById("log");
  logDiv.innerHTML += `<div>${text}</div>`;
}

function sendCommand(cmd = null) {
  const input = document.getElementById("commandInput");
  const command = cmd || input.value;
  input.value = "";

  log("YOU: " + command);

  fetch("http://127.0.0.1:8000/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command })
  })
    .then(res => res.json())
    .then(data => {
      log("VALHALLA: " + data.response);
      speak(data.response);
    });
}
