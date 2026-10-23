const root = document.documentElement;

const saved = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
root.dataset.theme = saved || (prefersDark ? "dark" : "light");

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (!form) return;

    const current = form.querySelector(`input[name="theme"][value="${root.dataset.theme}"]`);
    if (current) current.checked = true;

    form.querySelectorAll('input[name="theme"]').forEach((radio) => {
        radio.addEventListener("change", () => {
            root.dataset.theme = radio.value;
        });
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault(); // stop the page from reloading
        const choice = form.querySelector('input[name="theme"]:checked').value;
        root.dataset.theme = choice;
        localStorage.setItem("theme", choice);
    });
});