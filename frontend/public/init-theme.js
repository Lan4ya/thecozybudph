// Sets the initial theme before React is loaded to avoid FOUC

// This file should be called inside the head of index.html
// like so: <script src="/init-theme.js"></script>

(function () {
  const style = document.createElement("style");
  style.textContent = `
    :root {
      --fg: oklch(0.145 0 0);
      --bg: #f0e3d9;
    }
    body {
      background-color: var(--bg) !important;
      color: var(--fg) !important;
    }
  `;
  document.head.appendChild(style);
})();
