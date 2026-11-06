// Loads partials/header.html into #header-placeholder.
// The site root is computed from this script's own URL (javascript/ lives one level below root),
// so it works on Live Server (http://127.0.0.1:5500/) and GitHub Pages (https://user.github.io/hirehigher/).
(function () {
    const root = new URL('../', document.currentScript.src).href;

    function addStylesheet(href) {
        if (document.querySelector('link[href="' + href + '"]')) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    function setupMenu() {
        const hamburger = document.getElementById('hamburger');
        const menu = document.getElementById('hamburger-menu');
        const backdrop = document.getElementById('menu-backdrop');
        const closeBtn = document.getElementById('menu-close');
        if (!hamburger || !menu) return;

        const open = () => {
            menu.classList.add('open');
            if (backdrop) backdrop.classList.add('open');
        };
        const close = () => {
            menu.classList.remove('open');
            if (backdrop) backdrop.classList.remove('open');
        };

        hamburger.addEventListener('click', open);
        if (closeBtn) closeBtn.addEventListener('click', close);
        if (backdrop) backdrop.addEventListener('click', close);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });
    }

    async function loadHeader() {
        const placeholder = document.getElementById('header-placeholder');
        if (!placeholder) return;
        try {
            const res = await fetch(root + 'partials/header.html');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const html = await res.text();
            placeholder.innerHTML = html.replaceAll('{{root}}', root);
            addStylesheet(root + 'css/partials/header.css');
            setupMenu();
        } catch (err) {
            console.error('Could not load header:', err);
        }
    }

    loadHeader();
})();