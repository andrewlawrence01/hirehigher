const KEY = "resumeV2";
const FIELDS = ["name", "email", "phone", "location", "link", "summary", "skills", "accent", "preset"];
const SECTIONS = ["summary", "skills", "jobs", "schools", "projects"];
const DEFAULT_ACCENT = "#0e3a60";

// Convert old named accent colors to their hexadecimal values.
// This allows previously saved resumes to continue working.
const OLD_ACCENTS = {
  navy: "#0e3a60",
  forest: "#1d5a33",
  plum: "#6b2d8f",
  rose: "#b0245f",
  slate: "#333a44"
};

/* ---------- resume types ----------
   Each type decides: which sections appear, what order they go in,
   what each section heading says, and which style it starts with. */

const PRESETS = {
  professional: {
    template: "classic",
    hint: "Classic layout. Summary, Experience, Skills, then Education. Best if you have work history.",
    order: ["summary", "jobs", "skills", "schools"],
    titles: {
      summary: "Summary",
      jobs: "Experience",
      skills: "Skills",
      schools: "Education",
      projects: "Projects"
    },
  },

  student: {
    template: "modern",
    hint: "Modern layout. Leads with Education and Projects. Best for students and first jobs.",
    order: ["summary", "schools", "projects", "skills", "jobs"],
    titles: {
      summary: "Objective",
      jobs: "Work & Volunteer Experience",
      skills: "Skills",
      schools: "Education",
      projects: "Projects"
    },
  },

  changer: {
    template: "compact",
    hint: "Compact layout. Leads with Skills and Projects so your abilities stand out. Best when switching fields.",
    order: ["summary", "skills", "projects", "jobs", "schools"],
    titles: {
      summary: "Profile",
      skills: "Key Skills",
      projects: "Relevant Projects",
      jobs: "Relevant Experience",
      schools: "Education"
    },
  },
};

const KINDS = {
  jobs: {
    container: "jobs",
    noun: "job",
    fields: [
      { key: "title", label: "Job title", ph: "Cashier" },
      { key: "company", label: "Company", ph: "Fresh Mart" },
      { key: "dates", label: "Dates", ph: "Jun 2024 – Aug 2025" },
      {
        key: "bullets",
        label: "What you did",
        ph: "Helped 100+ customers per shift\nBalanced the register at close",
        rows: 3,
        hint: "Put each bullet on its own line."
      },
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

  projects: {
    container: "projects",
    noun: "project",
    fields: [
      { key: "name", label: "Project name", ph: "Class website" },
      { key: "link", label: "Link (optional)", ph: "github.com/jordanlee/site" },
      {
        key: "bullets",
        label: "What it is / what you did",
        ph: "Built a 5-page site with HTML and CSS\nPresented it to the class",
        rows: 3,
        hint: "Put each bullet on its own line."
      },
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

const lines = (text) =>
  text.split("\n")
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);

const hasText = (obj) => Object.values(obj).some((x) => x.trim());

/* ---------- resume types ---------- */

// Show only the form parts the chosen type uses. With reset = true, also
// tick the section boxes to that type's defaults.

function applyPreset(id, reset) {
  const p = PRESETS[id] || PRESETS.professional;

  el("presetHint").textContent = p.hint;

  SECTIONS.forEach((s) => {
    const used = p.order.includes(s);
    const box = el("show-" + s);

    box.closest("label").hidden = !used;

    const group = el("group-" + s); // summary lives inside "About you", so it has no group of its own

    if (group) group.hidden = !used;

    if (reset) box.checked = used;
  });
}

/* ---------- repeatable entries (jobs, schools, projects) ---------- */

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
  el(KINDS[kind].container).replaceChildren(
    ...items.map((item) => buildEntry(kind, item))
  );

  numberEntries();
}

/* ---------- reading the form ---------- */

function collect() {
  const data = {};

  FIELDS.forEach((id) => (data[id] = el(id).value));

  data.show = {};

  SECTIONS.forEach((s) => (data.show[s] = el("show-" + s).checked));

  Object.entries(KINDS).forEach(([kind, { container }]) => {
    data[kind] = [...el(container).children].map((box) =>
      Object.fromEntries(
        [...box.querySelectorAll("[data-key]")].map((i) => [i.dataset.key, i.value])
      )
    );
  });

  return data;
}

/* ---------- drawing the resume ---------- */

function render(v) {
  preview.replaceChildren();

  // Use the custom color selected by the user.
  preview.style.setProperty("--accent", v.accent || DEFAULT_ACCENT);

  const preset = PRESETS[v.preset] || PRESETS.professional;
  const T = preset.titles;

  preview.className = "tpl-" + preset.template; // the resume type decides the style

  const jobs = v.show.jobs ? v.jobs.filter(hasText) : [];
  const schools = v.show.schools ? v.schools.filter(hasText) : [];
  const projects = v.show.projects ? v.projects.filter(hasText) : [];

  const basics = ["name", "email", "phone", "location", "link", "summary", "skills"];

  if (!basics.some((k) => v[k].trim()) && !jobs.length && !schools.length && !projects.length) {
    add("p", "Your resume preview will appear here.");
    return;
  }

  const head = add("div", "", preview, "r-head");

  add("h1", v.name.trim() || "Your Name", head);

  const contact = [v.location, v.email, v.phone, v.link]
    .map((s) => s.trim())
    .filter(Boolean)
    .join("  •  ");

  if (contact) add("p", contact, head, "r-contact");

  const draw = {
    summary() {
      if (v.show.summary && v.summary.trim()) {
        add("h2", T.summary);
        add("p", v.summary.trim());
      }
    },

    skills() {
      const skills = v.skills.split(",").map((s) => s.trim()).filter(Boolean);

      if (v.show.skills && skills.length) {
        add("h2", T.skills);
        add("p", skills.join("  •  "));
      }
    },

    jobs() {
      if (!jobs.length) return;

      add("h2", T.jobs);

      jobs.forEach((j) => {
        const box = add("div", "", preview, "r-entry");
        const row = add("div", "", box, "r-row");

        add("strong", j.title.trim() || j.company.trim(), row);

        if (j.dates.trim()) add("span", j.dates.trim(), row, "r-dates");

        if (j.title.trim() && j.company.trim()) {
          add("div", j.company.trim(), box, "r-sub");
        }

        const bullets = lines(j.bullets);

        if (bullets.length) {
          const ul = add("ul", "", box);
          bullets.forEach((l) => add("li", l, ul));
        }
      });
    },

    schools() {
      if (!schools.length) return;

      add("h2", T.schools);

      schools.forEach((s) => {
        const box = add("div", "", preview, "r-entry");
        const row = add("div", "", box, "r-row");

        add("strong", s.school.trim() || s.degree.trim(), row);

        if (s.dates.trim()) add("span", s.dates.trim(), row, "r-dates");

        if (s.school.trim() && s.degree.trim()) {
          add("div", s.degree.trim(), box, "r-sub");
        }

        lines(s.details).forEach((l) => add("p", l, box));
      });
    },

    projects() {
      if (!projects.length) return;

      add("h2", T.projects);

      projects.forEach((p) => {
        const box = add("div", "", preview, "r-entry");
        const row = add("div", "", box, "r-row");

        add("strong", p.name.trim() || p.link.trim(), row);

        if (p.name.trim() && p.link.trim()) {
          add("span", p.link.trim(), row, "r-dates");
        }

        const bullets = lines(p.bullets);

        if (bullets.length) {
          const ul = add("ul", "", box);
          bullets.forEach((l) => add("li", l, ul));
        }
      });
    },
  };

  preset.order.forEach((name) => draw[name]());
}

/* ---------- saving and loading ---------- */

function update() {
  const data = collect();

  render(data);

  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { }
}

// Pull in a resume saved by the older, simpler version of this page

function migrateOld() {
  try {
    const old = JSON.parse(localStorage.getItem("resume") || "null");

    if (!old) return null;

    const eduLines = (old.education || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    return {
      name: old.name,
      email: old.email,
      phone: old.phone,
      summary: old.summary,
      skills: old.skills,
      jobs: old.experience ? [{ bullets: old.experience }] : [],
      schools: eduLines.length
        ? [{ school: eduLines[0], details: eduLines.slice(1).join("\n") }]
        : [],
    };
  } catch {
    return null;
  }
}

function load() {
  let saved = null;

  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch { }

  if (!saved) saved = migrateOld() || {};

  // Load previously saved values.
  FIELDS.forEach((id) => {
    if (typeof saved[id] === "string") {
      el(id).value = saved[id];
    }
  });

  // Convert any older named accent color to a hex color.
  if (OLD_ACCENTS[el("accent").value]) {
    el("accent").value = OLD_ACCENTS[el("accent").value];
  }

  // If the saved accent is missing or invalid, use the default.
  if (!/^#[0-9a-fA-F]{6}$/.test(el("accent").value)) {
    el("accent").value = DEFAULT_ACCENT;
  }

  SECTIONS.forEach((s) => {
    if (saved.show && typeof saved.show[s] === "boolean") {
      el("show-" + s).checked = saved.show[s];
    }
  });

  if (!PRESETS[el("preset").value]) {
    el("preset").value = "professional";
  }

  applyPreset(el("preset").value, false); // keep the saved style and checkboxes

  Object.keys(KINDS).forEach((kind) => {
    setEntries(
      kind,
      Array.isArray(saved[kind]) && saved[kind].length
        ? saved[kind]
        : [{}]
    );
  });
}

/* ---------- wiring ---------- */

document.addEventListener("DOMContentLoaded", () => {
  load();

  const form = el("resumeForm");

  // Picking a resume type resets the section boxes to that type's defaults.
  // This runs before the form-wide listener below redraws the resume.
  el("preset").addEventListener("input", () => {
    applyPreset(el("preset").value, true);
  });

  form.addEventListener("input", update);

  // Move / remove buttons inside job, school and project entries
  form.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");

    if (!btn) return;

    const box = btn.closest(".entry");
    const tools = btn.parentElement;
    const action = btn.dataset.action;

    if (action === "remove") {
      const filled = [...box.querySelectorAll("[data-key]")]
        .some((i) => i.value.trim());

      if (filled && !confirm("Remove this entry?")) return;

      box.remove();
    } else if (action === "up" && box.previousElementSibling) {
      box.previousElementSibling.before(box);
    } else if (action === "down" && box.nextElementSibling) {
      box.nextElementSibling.after(box);
    }

    numberEntries();
    update();

    if (btn.isConnected) {
      (btn.disabled ? tools.querySelector("button:not(:disabled)") : btn)?.focus();
    }
  });

  [["addJob", "jobs"], ["addSchool", "schools"], ["addProject", "projects"]]
    .forEach(([btnId, kind]) => {
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

    el("preset").value = "professional";

    // Reset the color picker to the default navy.
    el("accent").value = DEFAULT_ACCENT;

    applyPreset(el("preset").value, true); // also puts the checkboxes back to defaults

    Object.keys(KINDS).forEach((kind) => setEntries(kind, [{}]));

    update();
  });

  // Name the saved PDF after the person
  let originalTitle = document.title;

  window.addEventListener("beforeprint", () => {
    originalTitle = document.title;

    const name = el("name").value.trim();

    document.title = name ? `${name} - Resume` : "Resume";
  });

  window.addEventListener("afterprint", () => {
    document.title = originalTitle;
  });

  update();
});