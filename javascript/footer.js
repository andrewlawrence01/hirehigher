// Loads partials/footer.html into #footer-placeholder (see header.js for how the root is found).
(function () {
    const root = new URL('../', document.currentScript.src).href;

    async function loadFooter() {
        const placeholder = document.getElementById('footer-placeholder');
        if (!placeholder) return;
        try {
            const res = await fetch(root + 'partials/footer.html');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const html = await res.text();
            placeholder.innerHTML = html.replaceAll('{{root}}', root);

            const href = root + 'css/partials/footer.css';
            if (!document.querySelector('link[href="' + href + '"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
            }
        } catch (err) {
            console.error('Could not load footer:', err);
        }
    }

    loadFooter();
})();