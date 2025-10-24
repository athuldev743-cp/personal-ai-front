const responseDiv = document.getElementById("response");
const commandInput = document.getElementById("command");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

sendBtn.addEventListener("click", sendCommand);
voiceBtn.addEventListener("click", startListening);

async function sendCommand() {
  const text = commandInput.value.trim();
  if (!text) return;

  responseDiv.textContent = "⏳ Sending command...";

  try {
    const res = await fetch("http://192.168.1.5:8000/ask", {  // replace with your PC's LAN IP
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const data = await res.json();
    responseDiv.textContent = data.response;
    speakText(data.response);
    commandInput.value = "";
  } catch (err) {
    console.error(err);
    responseDiv.textContent = "❌ Error connecting to backend.";
  }
}

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    responseDiv.textContent = "🎧 Listening...";
  };

  recognition.onerror = (event) => {
    responseDiv.textContent = "❌ Error: " + event.error;
  };

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    commandInput.value = spokenText;
    sendCommand();
  };

  recognition.start();
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}
