// FIREBASE JAVASCRIPT DO NOT DELETE - MOLLI >:(

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-ai.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtciBVV4S0wmyhtg_Gqx3iNmoMOVIEChs",
    authDomain: "hirehigher-e3ae2.firebaseapp.com",
    projectId: "hirehigher-e3ae2",
    storageBucket: "hirehigher-e3ae2.firebasestorage.app",
    messagingSenderId: "993932231802",
    appId: "1:993932231802:web:d23d3a7f71eda1c40c27c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// FIREBASE JAVASCRIPT DO NOT DELETE - MOLLI >:(


// ---------- AI INTERVIEW COACH ----------
const ai = getAI(app, { backend: new GoogleAIBackend() });

const model = getGenerativeModel(ai, {
  model: "gemini-3.5-flash-lite",
  systemInstruction: `You are a friendly, honest job interview coach.
  Ask ONE interview question at a time based on the job title given.
  After the user answers, give 2-3 sentences of concrete feedback
  (use the STAR method where relevant), then ask the next question.
  Keep the reply under 150 words. Stay on the topic of interview prep.

  Respond ONLY with JSON, no markdown, in this format:
  {"score": <integer 1-5 or null>, "tip": "<one short sentence of advice>", "reply": "<your feedback followed by your next question>"}

  Put your feedback and your next question together in "reply".
  Score the candidate's latest answer: 1 = off-topic/very weak, 2 = weak,
  3 = acceptable, 4 = good, 5 = excellent. Judge relevance, clarity,
  specificity, and concrete examples. Be a tough but fair grader.
  Use null for the score if the message isn't an interview answer
  (e.g. they're just telling you the job title).`,
    generationConfig: {
      maxOutputTokens: 800,
      responseMimeType: "application/json",
    },
});

let chat = model.startChat();

// ---------- SAVING CHATS ----------
const db = getFirestore(app);
let chatId = crypto.randomUUID();

// This browser's list of past chats
function getIndex() {
  try { return JSON.parse(localStorage.getItem("chatIndex")) || []; }
  catch { return []; }
}

function addToIndex(id, title) {
  try {
    const list = getIndex();
    if (list.some(c => c.id === id)) return;
    list.unshift({ id, title: title.slice(0, 40), createdAt: Date.now() });
    localStorage.setItem("chatIndex", JSON.stringify(list.slice(0, 50)));
  } catch (e) {}
}

async function saveMessage(role, text) {
  try {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      role,
      text,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Save failed", e);
  }
}

async function sendMessage(text) {
  const userText = text.slice(0, 2000);
  addToIndex(chatId, userText);
  saveMessage("user", userText);
  try {
    const result = await chat.sendMessage(userText);
    const reply = result.response.text();
    saveMessage("model", reply);
    return reply;
  } catch (e) {
    console.error(e);
    return "The coach is busy right now. Please try again in a few minutes.";
  }
}

// ---------- PAST CHATS ----------
window.getPastChats = getIndex;

window.newChat = () => {
  chatId = crypto.randomUUID();
  chat = model.startChat();
};

window.openChat = async (id) => {
  try {
    const q = query(collection(db, "chats", id, "messages"), orderBy("createdAt"));
    const snap = await getDocs(q);
    const msgs = snap.docs.map(d => ({ role: d.data().role, text: d.data().text }));
    chat = model.startChat({
      history: msgs.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    });
    chatId = id;
    return msgs;
  } catch (e) {
    console.error(e);
    return [];
  }
};

window.sendMessage = sendMessage;