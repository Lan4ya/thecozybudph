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
