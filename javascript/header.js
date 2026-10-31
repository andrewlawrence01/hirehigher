
document.addEventListener("DOMContentLoaded", async () => {
    const headerContainer = document.getElementById("header-placeholder");

    if (!headerContainer) return;

    const basePath = "/hirehigher/";

    try {
        const response = await fetch(`${basePath}header.html`);

        if (!response.ok) {
            throw new Error("Failed to load header");
        }

        const html = await response.text();
        headerContainer.innerHTML = html;

        // Load the header stylesheet
        if (!document.querySelector("#header-stylesheet")) {
            const link = document.createElement("link");
            link.id = "header-stylesheet";
            link.rel = "stylesheet";
            link.href = `${basePath}css/partials/header.css`;
            document.head.appendChild(link);
        }

        // Set up the hamburger menu
        const hamburger = document.getElementById("hamburger");
        const menu = document.getElementById("hamburger-menu");
        const backdrop = document.getElementById("menu-backdrop");
        const closeBtn = document.getElementById("menu-close");

        if (!hamburger || !menu || !backdrop || !closeBtn) {
            console.warn("One or more hamburger menu elements were not found.");
            return;
        }

        function setMenu(open) {
            menu.classList.toggle("open", open);
            backdrop.classList.toggle("open", open);
            hamburger.setAttribute("aria-expanded", String(open));
        }

        hamburger.addEventListener("click", () => {
            setMenu(!menu.classList.contains("open"));
        });

        closeBtn.addEventListener("click", () => setMenu(false));
        backdrop.addEventListener("click", () => setMenu(false));

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                setMenu(false);
            }
        });

    } catch (error) {
        console.error("Error loading header:", error);
    }
});