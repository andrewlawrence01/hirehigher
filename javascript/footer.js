document.addEventListener("DOMContentLoaded", async () => {
  const footerContainer =
    document.getElementById("footer-placeholder");

  if (!footerContainer) return;

  try {
    const response = await fetch("/footer.html");

    if (!response.ok) {
      throw new Error("Failed to load footer");
    }

    footerContainer.innerHTML = await response.text();
  } catch (error) {
    console.error("Error loading footer:", error);
  }
});