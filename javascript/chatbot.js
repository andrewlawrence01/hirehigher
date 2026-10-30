const log = document.getElementById("chatLog");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.textContent = text; // textContent keeps this safe from injected HTML
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
}

async function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    if (typeof window.sendMessage !== "function") {
        addMessage("The coach is still loading. Give it a second and try again.", "coach");
        return;
    }
    input.value = "";
    addMessage(text, "you");
    sendBtn.disabled = true;
    const thinking = addMessage("Thinking...", "coach");
    const reply = await window.sendMessage(text);
    thinking.textContent = reply;
    sendBtn.disabled = false;
    input.focus();
}

sendBtn.addEventListener("click", handleSend);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

addMessage("Hi! I'm your interview coach. What job are you interviewing for?", "coach");