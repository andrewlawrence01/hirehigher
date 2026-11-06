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

const FACES = {
    1: { emoji: "😞", label: "Needs work" },
    2: { emoji: "🙁", label: "Weak" },
    3: { emoji: "😐", label: "Okay" },
    4: { emoji: "🙂", label: "Good" },
    5: { emoji: "😄", label: "Great" },
};

function parseCoachReply(raw) {
    try {
        const clean = raw.replace(/```json|```/g, "").trim();
        const data = JSON.parse(clean);
        const score = Number(data.score);
        return {
            score: score >= 1 && score <= 5 ? Math.round(score) : null,
            tip: data.tip || "",
            reply: data.reply || raw,
        };
    } catch {
        return { score: null, tip: "", reply: raw }; // fall back to plain text
    }
}

function addReaction(beforeEl, score, tip) {
    if (!score) return;
    const { emoji, label } = FACES[score];

    const row = document.createElement("div");
    row.className = "reaction r" + score;

    const face = document.createElement("span");
    face.className = "reaction-face";
    face.textContent = emoji;

    const text = document.createElement("span");
    text.className = "reaction-text";
    text.textContent = tip ? `${label} - ${tip}` : label;

    row.append(face, text);
    log.insertBefore(row, beforeEl); // goes right above the coach's reply
    log.scrollTop = log.scrollHeight;
}

async function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    if (typeof window.sendMessage !== "function") {
        addMessage("The coach is still loading. Give it a second and try again.", "coach");
        return;
    }
    input.value = "";
    const myMsg = addMessage(text, "you");       
    sendBtn.disabled = true;
    const thinking = addMessage("Thinking...", "coach");

    const raw = await window.sendMessage(text);
    const { score, tip, reply } = parseCoachReply(raw);

        thinking.textContent = reply;
        addReaction(thinking, score, tip);   // replaces addFace(myMsg, score, tip)                     

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