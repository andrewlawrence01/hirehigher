// FIREBASE JAVASCRIPT DO NOT DELETE - MOLLI >:(

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-ai.js";

// Your web app's Firebase configuration
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
Keep replies under 150 words. Stay on the topic of interview prep.`,
  generationConfig: { maxOutputTokens: 400 },
});

const chat = model.startChat();

async function sendMessage(text) {
  try {
    const result = await chat.sendMessage(text.slice(0, 2000));
    return result.response.text();
  } catch (e) {
    console.error(e);
    return "The coach is busy right now. Please try again in a few minutes.";
  }
}

// Makes the function available to the rest of your site
window.sendMessage = sendMessage;