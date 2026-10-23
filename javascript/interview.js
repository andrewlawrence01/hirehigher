const QUESTIONS = {
  behavioral: [
    ["Tell me about a time you worked on a team.", "Use STAR: Situation, Task, Action, Result."],
    ["Describe a time you made a mistake. What did you do?", "Own it, then focus on what you fixed and learned."],
    ["Tell me about a time you handled a difficult customer or coworker.", "Stay calm and show how you listened."],
    ["Describe a time you had to learn something quickly.", "Give one concrete example with a result."]
  ],
  general: [
    ["Tell me about yourself.", "Keep it to 60 seconds: present, past, future."],
    ["Why do you want to work here?", "Mention something specific about the company."],
    ["Where do you see yourself in five years?", "Show you want to grow, not that you plan to leave."],
    ["Why should we hire you?", "Match your skills to what the job needs."]
  ],
  strengths: [
    ["What is your greatest strength?", "Pick one that fits the job and back it up with proof."],
    ["What is your biggest weakness?", "Choose a real one and explain how you are improving it."],
    ["How do you handle stress or pressure?", "Share a real habit, like making a priority list."]
  ],
  closing: [
    ["Do you have any questions for us?", "Always ask one. Try: What does success look like in this role?"],
    ["When could you start?", "Be honest and clear about your availability."],
    ["Is there anything else you want us to know?", "Finish with a short, confident summary."]
  ]
};
const SECONDS = 120;
const $ = (id) => document.getElementById(id);
let left = SECONDS, tick = null, answered = 0, last = -1;

function show() { $("timer").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`; }
function stop() { clearInterval(tick); tick = null; $("startBtn").textContent = "Start"; }
function reset() { stop(); left = SECONDS; show(); }

document.addEventListener("DOMContentLoaded", () => {
  try { $("notes").value = localStorage.getItem("interviewNotes") || ""; } catch {}
  $("notes").addEventListener("input", () => { try { localStorage.setItem("interviewNotes", $("notes").value); } catch {} });

  $("newBtn").addEventListener("click", () => {
    const list = QUESTIONS[$("category").value];
    let i;
    do { i = Math.floor(Math.random() * list.length); } while (list.length > 1 && i === last);
    last = i;
    $("question").textContent = list[i][0];
    $("tip").textContent = "Tip: " + list[i][1];
    $("notes").value = "";
    reset();
  });
  $("category").addEventListener("change", () => $("newBtn").click());
  $("doneBtn").addEventListener("click", () => { answered++; $("count").textContent = `Answered this session: ${answered}`; $("newBtn").click(); });
  $("startBtn").addEventListener("click", () => {
    if (tick) { stop(); return; }
    if (left === 0) left = SECONDS;
    $("startBtn").textContent = "Pause";
    tick = setInterval(() => { left--; show(); if (left <= 0) { stop(); $("timer").textContent = "Time's up"; } }, 1000);
  });
  $("resetBtn").addEventListener("click", reset);
  show();
});
