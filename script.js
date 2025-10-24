const responseDiv = document.getElementById("response");
const commandInput = document.getElementById("command");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

// Replace with your backend URL
const API_URL = "https://presonal-agent.onrender.com";

sendBtn.addEventListener("click", () => sendCommand());
voiceBtn.addEventListener("click", async () => {
  try {
    // Start listening and wait for user to speak
    const spokenText = await startListening();
    commandInput.value = spokenText;
    sendCommand(true); // true = triggered by user gesture
  } catch (err) {
    responseDiv.textContent = "❌ Voice input error: " + err;
  }
});

// Send command to backend
async function sendCommand(userGesture = false) {
  const text = commandInput.value.trim();
  if (!text) return;

  responseDiv.textContent = "⏳ Sending command...";

  try {
    const res = await fetch(`${API_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const data = await res.json();
    responseDiv.textContent = data.response;

    // Speak only if triggered by a user gesture (mobile restriction)
    if (userGesture || typeof window.orientation === "undefined") {
      speakText(data.response);
    }

  } catch (err) {
    console.error(err);
    responseDiv.textContent = "❌ Error connecting to backend.";
  }
}

// Voice input
function startListening() {
  return new Promise((resolve, reject) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => responseDiv.textContent = "🎧 Listening...";
    recognition.onerror = (event) => reject(event.error);

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      resolve(spokenText);
    };

    recognition.start();
  });
}

// Voice output
function speakText(text) {
  if (!window.speechSynthesis) return; // fallback for unsupported browsers
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}
