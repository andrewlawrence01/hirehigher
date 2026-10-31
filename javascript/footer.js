
document.addEventListener("DOMContentLoaded", async () => {
    const footerContainer = document.getElementById("footer-placeholder");

    if (!footerContainer) return;

    const basePath = "/hirehigher/";

    try {
        const response = await fetch(`${basePath}footer.html`);

        if (!response.ok) {
            throw new Error("Failed to load footer");
        }

        const html = await response.text();
        footerContainer.innerHTML = html;

        // Load the footer stylesheet
        if (!document.querySelector("#footer-stylesheet")) {
            const link = document.createElement("link");
            link.id = "footer-stylesheet";
            link.rel = "stylesheet";
            link.href = `${basePath}css/partials/footer.css`;
            document.head.appendChild(link);
        }

    } catch (error) {
        console.error("Error loading footer:", error);
    }
});