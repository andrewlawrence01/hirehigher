document.addEventListener("DOMContentLoaded", async () => {
  const footerContainer =
    document.getElementById("footer-placeholder");

  if (!footerContainer) return;

  const prefix = window.location.pathname.includes("child%20pages") ? "../" : "";

  try {
    const footerScript = document.querySelector('script[src*="footer.js"]');
    const footerUrl = new URL("/hirehigher/footer.html", footerScript.src);
    const response = await fetch(footerUrl);

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