const KEY = "resumeV2";
const FIELDS = ["name", "email", "phone", "location", "link", "summary", "skills", "accent"];
const ACCENTS = { navy: "#0e3a60", forest: "#1d5a33", plum: "#6b2d8f", rose: "#b0245f", slate: "#333a44" };

const KINDS = {
  jobs: {
    container: "jobs",
    noun: "job",
    fields: [
      { key: "title", label: "Job title", ph: "Cashier" },
      { key: "company", label: "Company", ph: "Fresh Mart" },
      { key: "dates", label: "Dates", ph: "Jun 2024 – Aug 2025" },
      { key: "bullets", label: "What you did", ph: "Helped 100+ customers per shift\nBalanced the register at close", rows: 3, hint: "Put each bullet on its own line." },
    ],
  },
  schools: {
    container: "schools",
    noun: "school",
    fields: [
      { key: "school", label: "School", ph: "Rexburg High School" },
      { key: "degree", label: "Degree or program", ph: "Diploma" },
      { key: "dates", label: "Dates", ph: "2020 – 2024" },
      { key: "details", label: "Details (optional)", ph: "GPA 3.8, Honor Roll", rows: 2 },
    ],
  },
};

const el = (id) => document.getElementById(id);
const preview = el("preview");

/* ---------- helpers ---------- */

function add(tag, text, parent = preview, cls) {
  const node = document.createElement(tag);
  if (text) node.textContent = text; // textContent keeps user input from running as HTML
  if (cls) node.className = cls;
  parent.appendChild(node);
  return node;
}

const lines = (text) => text.split("\n").map((l) => l.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean);
const hasText = (obj) => Object.values(obj).some((x) => x.trim());

/* ---------- repeatable entries (jobs, schools) ---------- */

function buildEntry(kind, data = {}) {
  const { fields, noun } = KINDS[kind];
  const box = document.createElement("div");
  box.className = "entry";

  const bar = add("div", "", box, "entry-bar");
  add("strong", "", bar, "entry-title");
  const tools = add("div", "", bar, "entry-tools");
  [
    ["up", "↑", `Move ${noun} up`],
    ["down", "↓", `Move ${noun} down`],
    ["remove", "✕", `Remove ${noun}`],
  ].forEach(([action, symbol, label]) => {
    const b = add("button", symbol, tools, "icon-btn");
    b.type = "button";
    b.dataset.action = action;
    b.setAttribute("aria-label", label);
  });

  fields.forEach((f) => {
    const wrap = add("div", "", box, "field");
    const label = add("label", f.label, wrap);
    const input = document.createElement(f.rows ? "textarea" : "input");
    if (f.rows) input.rows = f.rows;
    else input.type = "text";
    input.placeholder = f.ph;
    input.dataset.key = f.key;
    input.value = data[f.key] || "";
    label.appendChild(input);
    if (f.hint) add("p", f.hint, wrap, "hint");
  });

  return box;
}

function numberEntries() {
  Object.values(KINDS).forEach(({ container, noun }) => {
    const boxes = [...el(container).children];
    const name = noun[0].toUpperCase() + noun.slice(1);
    boxes.forEach((box, i) => {
      box.querySelector(".entry-title").textContent = `${name} ${i + 1}`;
      box.querySelector('[data-action="up"]').disabled = i === 0;
      box.querySelector('[data-action="down"]').disabled = i === boxes.length - 1;
    });
  });
}

function setEntries(kind, items) {
  el(KINDS[kind].container).replaceChildren(...items.map((item) => buildEntry(kind, item)));
  numberEntries();
}

/* ---------- reading the form ---------- */

function collect() {
  const data = {};
  FIELDS.forEach((id) => (data[id] = el(id).value));
  Object.entries(KINDS).forEach(([kind, { container }]) => {
    data[kind] = [...el(container).children].map((box) =>
      Object.fromEntries([...box.querySelectorAll("[data-key]")].map((i) => [i.dataset.key, i.value]))
    );
  });
  return data;
}

/* ---------- drawing the resume ---------- */

function render(v) {
  preview.replaceChildren();
  preview.style.setProperty("--accent", ACCENTS[v.accent] || ACCENTS.navy);

  const jobs = v.jobs.filter(hasText);
  const schools = v.schools.filter(hasText);
  const basics = ["name", "email", "phone", "location", "link", "summary", "skills"];
  if (!basics.some((k) => v[k].trim()) && !jobs.length && !schools.length) {
    add("p", "Your resume preview will appear here.");
    return;
  }

  const head = add("div", "", preview, "r-head");
  add("h1", v.name.trim() || "Your Name", head);
  const contact = [v.location, v.email, v.phone, v.link].map((s) => s.trim()).filter(Boolean).join("  •  ");
  if (contact) add("p", contact, head, "r-contact");

  if (v.summary.trim()) {
    add("h2", "Summary");
    add("p", v.summary.trim());
  }

  const skills = v.skills.split(",").map((s) => s.trim()).filter(Boolean);
  if (skills.length) {
    add("h2", "Skills");
    add("p", skills.join("  •  "));
  }

  if (jobs.length) {
    add("h2", "Experience");
    jobs.forEach((j) => {
      const box = add("div", "", preview, "r-entry");
      const row = add("div", "", box, "r-row");
      add("strong", j.title.trim() || j.company.trim(), row);
      if (j.dates.trim()) add("span", j.dates.trim(), row, "r-dates");
      if (j.title.trim() && j.company.trim()) add("div", j.company.trim(), box, "r-sub");
      const bullets = lines(j.bullets);
      if (bullets.length) {
        const ul = add("ul", "", box);
        bullets.forEach((l) => add("li", l, ul));
      }
    });
  }

  if (schools.length) {
    add("h2", "Education");
    schools.forEach((s) => {
      const box = add("div", "", preview, "r-entry");
      const row = add("div", "", box, "r-row");
      add("strong", s.school.trim() || s.degree.trim(), row);
      if (s.dates.trim()) add("span", s.dates.trim(), row, "r-dates");
      if (s.school.trim() && s.degree.trim()) add("div", s.degree.trim(), box, "r-sub");
      lines(s.details).forEach((l) => add("p", l, box));
    });
  }
}

/* ---------- saving and loading ---------- */

function update() {
  const data = collect();
  render(data);
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

// Pull in a resume saved by the older, simpler version of this page
function migrateOld() {
  try {
    const old = JSON.parse(localStorage.getItem("resume") || "null");
    if (!old) return null;
    const eduLines = (old.education || "").split("\n").map((l) => l.trim()).filter(Boolean);
    return {
      name: old.name, email: old.email, phone: old.phone, summary: old.summary, skills: old.skills,
      jobs: old.experience ? [{ bullets: old.experience }] : [],
      schools: eduLines.length ? [{ school: eduLines[0], details: eduLines.slice(1).join("\n") }] : [],
    };
  } catch {
    return null;
  }
}

function load() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}
  if (!saved) saved = migrateOld() || {};
  FIELDS.forEach((id) => { if (typeof saved[id] === "string") el(id).value = saved[id]; });
  setEntries("jobs", Array.isArray(saved.jobs) && saved.jobs.length ? saved.jobs : [{}]);
  setEntries("schools", Array.isArray(saved.schools) && saved.schools.length ? saved.schools : [{}]);
}

/* ---------- wiring ---------- */

document.addEventListener("DOMContentLoaded", () => {
  load();

  const form = el("resumeForm");
  form.addEventListener("input", update);

  // Move / remove buttons inside job and school entries
  form.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const box = btn.closest(".entry");
    const tools = btn.parentElement;
    const action = btn.dataset.action;

    if (action === "remove") {
      const filled = [...box.querySelectorAll("[data-key]")].some((i) => i.value.trim());
      if (filled && !confirm("Remove this entry?")) return;
      box.remove();
    } else if (action === "up" && box.previousElementSibling) {
      box.previousElementSibling.before(box);
    } else if (action === "down" && box.nextElementSibling) {
      box.nextElementSibling.after(box);
    }

    numberEntries();
    update();
    if (btn.isConnected) (btn.disabled ? tools.querySelector("button:not(:disabled)") : btn)?.focus();
  });

  [["addJob", "jobs"], ["addSchool", "schools"]].forEach(([btnId, kind]) => {
    el(btnId).addEventListener("click", () => {
      const box = buildEntry(kind);
      el(KINDS[kind].container).appendChild(box);
      numberEntries();
      update();
      box.querySelector("[data-key]").focus();
    });
  });

  el("printBtn").addEventListener("click", () => window.print());

  el("clearBtn").addEventListener("click", () => {
    if (!confirm("Clear everything in your resume?")) return;
    FIELDS.forEach((id) => (el(id).value = ""));
    el("accent").selectedIndex = 0;
    setEntries("jobs", [{}]);
    setEntries("schools", [{}]);
    update();
  });

  // Name the saved PDF after the person
  let originalTitle = document.title;
  window.addEventListener("beforeprint", () => {
    originalTitle = document.title;
    const name = el("name").value.trim();
    document.title = name ? `${name} - Resume` : "Resume";
  });
  window.addEventListener("afterprint", () => { document.title = originalTitle; });

  update();
});