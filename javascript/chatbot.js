const log = document.getElementById("chatLog");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

const FACES = {
    1: { emoji: "😞", label: "Needs work" },
    2: { emoji: "🙁", label: "Weak" },
    3: { emoji: "😐", label: "Okay" },
    4: { emoji: "🙂", label: "Good" },
    5: { emoji: "😄", label: "Great" },
};

// ---------- building elements ----------
function createMessageEl(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.textContent = text; // textContent keeps this safe from injected HTML
    return div;
}

function createReactionEl(score, tip) {
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
    return row;
}

function addMessage(text, who) {
    const div = createMessageEl(text, who);
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
}

function addReaction(beforeEl, score, tip) {
    if (!score) return;
    log.insertBefore(createReactionEl(score, tip), beforeEl);
    log.scrollTop = log.scrollHeight;
}

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

// ---------- past chats ----------
function renderSaved(msgs) {
    const frag = document.createDocumentFragment();
    for (const m of msgs) {
        if (m.role === "user") {
            frag.appendChild(createMessageEl(m.text, "you"));
        } else {
            const { score, tip, reply } = parseCoachReply(m.text);
            if (score) frag.appendChild(createReactionEl(score, tip));
            frag.appendChild(createMessageEl(reply, "coach"));
        }
    }
    return frag;
}

let activeChat = null;

// ---------- select mode (for deleting chats) ----------
let selectMode = false;
const selected = new Set();

const selectBtn = document.getElementById("selectBtn");
const selectActions = document.getElementById("selectActions");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

function setSelectMode(on) {
    selectMode = on;
    selected.clear();
    selectBtn.style.display = on ? "none" : "";
    selectActions.style.display = on ? "" : "none";
    updateDeleteBtn();
    refreshChatList();
}

function updateDeleteBtn() {
    deleteSelectedBtn.textContent = `Delete selected (${selected.size})`;
    deleteSelectedBtn.disabled = selected.size === 0;
}

function refreshChatList() {
    const list = document.getElementById("chatList");
    if (!list) return;
    list.innerHTML = "";
    for (const c of window.getPastChats?.() || []) {
        const row = document.createElement("div");
        row.className = "chat-row";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn small";
        btn.textContent = c.title || "Untitled";

        if (selectMode) {
            const box = document.createElement("input");
            box.type = "checkbox";
            box.checked = selected.has(c.id);
            const toggle = () => {
                box.checked ? selected.add(c.id) : selected.delete(c.id);
                updateDeleteBtn();
            };
            box.onchange = toggle;
            // clicking the title also ticks the box
            btn.onclick = () => { box.checked = !box.checked; toggle(); };
            row.append(box, btn);
        } else {
            if (c.id === activeChat) btn.classList.add("active");
            btn.onclick = () => openPastChat(c.id);
            row.append(btn);
        }
        list.appendChild(row);
    }
}

async function handleDeleteSelected() {
    const n = selected.size;
    if (!n) return;
    if (!confirm(`Delete ${n} chat${n > 1 ? "s" : ""}? This can't be undone.`)) return;
    if (typeof window.deleteChat !== "function") {
        alert("Deleting isn't available yet.");
        return;
    }

    for (const id of selected) {
        await window.deleteChat(id);
    }

    // if the chat you were viewing got deleted, reset to a fresh one
    if (selected.has(activeChat)) {
        window.newChat();
        activeChat = null;
        log.innerHTML = "";
        addMessage("Hi! I'm your interview coach. What job are you interviewing for?", "coach");
    }
    setSelectMode(false);
}

selectBtn.addEventListener("click", () => setSelectMode(true));
document.getElementById("cancelSelectBtn").addEventListener("click", () => setSelectMode(false));
deleteSelectedBtn.addEventListener("click", handleDeleteSelected);

// ---------- opening chats ----------
async function openPastChat(id) {
    const msgs = await window.openChat(id); // also restores the AI's memory
    activeChat = id;
    log.innerHTML = "";
    log.appendChild(renderSaved(msgs));
    log.scrollTop = log.scrollHeight;
    refreshChatList();
}

document.getElementById("newChatBtn").addEventListener("click", () => {
    window.newChat();
    activeChat = null;
    log.innerHTML = "";
    addMessage("Hi! I'm your interview coach. What job are you interviewing for?", "coach");
    refreshChatList();
});

// ---------- sending ----------
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

    const raw = await window.sendMessage(text);
    const { score, tip, reply } = parseCoachReply(raw);

    thinking.textContent = reply;
    addReaction(thinking, score, tip);

    sendBtn.disabled = false;
    input.focus();

    // the chat gets added to the list on its first message
    activeChat = activeChat || (window.getPastChats?.()[0]?.id ?? null);
    refreshChatList();
}

sendBtn.addEventListener("click", handleSend);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

addMessage("Hi! I'm your interview coach. What job are you interviewing for?", "coach");
window.addEventListener("load", refreshChatList);