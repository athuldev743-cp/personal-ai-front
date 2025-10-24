const responseDiv = document.getElementById("response");
const commandInput = document.getElementById("command");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

// Replace with your backend URL
const API_URL = "https://presonal-agent.onrender.com";

sendBtn.addEventListener("click", () => sendCommand(true));
voiceBtn.addEventListener("click", startListening);

async function sendCommand(triggerSpeech = false) {
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

        // Only trigger speech if user interaction (triggerSpeech)
        if (triggerSpeech) speakText(data.response);
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

    recognition.onresult = async (event) => {
        const spokenText = event.results[0][0].transcript;
        commandInput.value = spokenText;

        // Trigger command and speech after user gesture
        await sendCommand(true);
    };

    recognition.start();
}

function speakText(text) {
    if (!('speechSynthesis' in window)) {
        console.log("Speech synthesis not supported.");
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    // Mobile-friendly slight delay
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 100);
}
