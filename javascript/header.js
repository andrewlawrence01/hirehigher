document.addEventListener("DOMContentLoaded", async () => {
  const headerContainer =
    document.getElementById("header-placeholder");

  if (!headerContainer) return;

  try {
    const response = await fetch("/header.html");

    if (!response.ok) {
      throw new Error("Failed to load header");
    }

    headerContainer.innerHTML = await response.text();
  } catch (error) {
    console.error("Error loading header:", error);
  }
});
