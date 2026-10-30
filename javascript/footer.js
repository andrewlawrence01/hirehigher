document.addEventListener("DOMContentLoaded", async () => {
  const footerContainer =
    document.getElementById("footer-placeholder");

  if (!footerContainer) return;

  const prefix = window.location.pathname.includes("child%20pages") ? "../" : "";

  try {
<<<<<<< HEAD
    const footerScript = document.querySelector('script[src*="footer.js"]');
    const footerUrl = new URL("../footer.html", footerScript.src);
    const response = await fetch(footerUrl);
=======
    const response = await fetch(prefix + "footer.html");
>>>>>>> a54d4da4dbb411eed0148487517a3145a641ee97

    if (!response.ok) {
      throw new Error("Failed to load footer");
    }

    footerContainer.innerHTML = await response.text();
  } catch (error) {
    console.error("Error loading footer:", error);
  }
});