document.addEventListener("DOMContentLoaded", async () => {
  const footerContainer =
    document.getElementById("footer-placeholder");

  if (!footerContainer) return;

  try {
    const footerScript = document.querySelector('script[src*="footer.js"]');
    const footerUrl = new URL("/footer.html", footerScript.src);
    const response = await fetch(footerUrl);

    if (!response.ok) {
      throw new Error("Failed to load footer");
    }

    footerContainer.innerHTML = await response.text();
  } catch (error) {
    console.error("Error loading footer:", error);
  }
});
