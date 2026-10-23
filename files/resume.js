const ids = ["name", "email", "phone", "summary", "skills", "experience", "education"];
const el = (id) => document.getElementById(id);
const preview = el("preview");

function add(tag, text, parent = preview) {
  const node = document.createElement(tag);
  node.textContent = text; // textContent keeps user input from running as HTML
  parent.appendChild(node);
  return node;
}
function lines(text) { return text.split("\n").map((l) => l.trim()).filter(Boolean); }

function render() {
  preview.replaceChildren();
  const v = Object.fromEntries(ids.map((id) => [id, el(id).value.trim()]));
  if (!ids.some((id) => v[id])) { add("p", "Your resume preview will appear here."); return; }
  add("h1", v.name || "Your Name");
  const contact = [v.email, v.phone].filter(Boolean).join(" | ");
  if (contact) add("p", contact);
  if (v.summary) { add("h2", "Summary"); add("p", v.summary); }
  if (v.skills) {
    add("h2", "Skills");
    const ul = add("ul", "");
    ul.className = "chips";
    v.skills.split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => add("li", s, ul));
  }
  if (v.experience) { add("h2", "Experience"); const ul = add("ul", ""); lines(v.experience).forEach((l) => add("li", l, ul)); }
  if (v.education) { add("h2", "Education"); lines(v.education).forEach((l) => add("p", l)); }
}

function save() { try { localStorage.setItem("resume", JSON.stringify(Object.fromEntries(ids.map((id) => [id, el(id).value])))); } catch {} }

document.addEventListener("DOMContentLoaded", () => {
  try { const d = JSON.parse(localStorage.getItem("resume") || "{}"); ids.forEach((id) => { if (d[id]) el(id).value = d[id]; }); } catch {}
  ids.forEach((id) => el(id).addEventListener("input", () => { render(); save(); }));
  el("printBtn").addEventListener("click", () => window.print());
  el("clearBtn").addEventListener("click", () => {
    if (!confirm("Clear everything in your resume?")) return;
    ids.forEach((id) => (el(id).value = ""));
    render(); save();
  });
  render();
});
