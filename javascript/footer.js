document.addEventListener("DOMContentLoaded", async () => {
  const footerContainer =
    document.getElementById("footer-placeholder");

  if (!footerContainer) return;

  const prefix = window.location.pathname.includes("child%20pages") ? "../" : "";

  try {
    const response = await fetch(prefix + "footer.html");

    if (!response.ok) {
      throw new Error("Failed to load footer");
    }

    footerContainer.innerHTML = await response.text();
  } catch (error) {
    console.error("Error loading footer:", error);
  }
});