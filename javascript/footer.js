document.addEventListener("DOMContentLoaded", async () => {
  const footerContainer =
    document.getElementById("footer-placeholder");

  if (!footerContainer) return;

  const prefix = window.location.pathname.includes("child%20pages") ? "../" : "";

  try {
<<<<<<< HEAD
    const footerScript = document.querySelector('script[src*="footer.js"]');
    const footerUrl = new URL("footer.html", footerScript.src);
    const response = await fetch(footerUrl);
=======
    const response = await fetch(prefix + "footer.html");
>>>>>>> 3a86953ac64453eb6ae2b4cf0870027ddd336285

    if (!response.ok) {
      throw new Error("Failed to load footer");
    }

    const html = (await response.text())
      .replaceAll('href="', 'href="' + prefix)
      .replaceAll('src="', 'src="' + prefix);

    footerContainer.innerHTML = html;
  } catch (error) {
    console.error("Error loading footer:", error);
  }
});