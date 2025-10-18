// Sets the initial theme before React is loaded to avoid FOUC

// This file should be called inside the head index.html
// like so: <script src="/init-theme.js"></script>

(function () {
  const style = document.createElement("style");
  style.textContent = `
    :root {
      --fg: oklch(0.985 0 0); 
      --bg: rgb(25, 27, 28);
    }
    body {
      background-color: var(--bg) !important;
      color: var(--fg) !important;
    }
  `;
  document.head.appendChild(style);
})();
