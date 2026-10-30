document.addEventListener("DOMContentLoaded", async () => {
  const headerContainer =
    document.getElementById("header-placeholder");

  if (!headerContainer) return;

  const prefix = window.location.pathname.includes("child%20pages") ? "../" : "";

  try {
    const headerScript = document.querySelector('script[src*="header.js"]');
    const headerUrl = new URL("./header.html", headerScript.src);
    const response = await fetch(headerUrl);

    if (!response.ok) {
      throw new Error("Failed to load header");
    }

    const html = (await response.text())
      .replaceAll('href="', 'href="' + prefix)
      .replaceAll('src="', 'src="' + prefix);

    headerContainer.innerHTML = html;

    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("hamburger-menu");
    const backdrop = document.getElementById("menu-backdrop");
    const closeBtn = document.getElementById("menu-close");

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
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
  } catch (error) {
    console.error("Error loading header:", error);
  }
});