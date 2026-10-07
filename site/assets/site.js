const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

function activateTab(tab, focus = false) {
  for (const candidate of tabs) {
    const selected = candidate === tab;
    candidate.setAttribute("aria-selected", String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    document.getElementById(candidate.getAttribute("aria-controls")).hidden =
      !selected;
  }
  if (focus) tab.focus();
}

for (const [index, tab] of tabs.entries()) {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft")
      next = (index + tabs.length - 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      activateTab(tabs[next], true);
    }
  });
}

for (const button of document.querySelectorAll("[data-copy]")) {
  button.hidden = false;
  button.addEventListener("click", async () => {
    const code = document.getElementById(button.dataset.copy);
    const status = button.closest(".install").querySelector('[role="status"]');
    try {
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = "Commands copied. Paste them in your terminal.";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent =
        "Automatic copy is unavailable. The commands are selected for manual copying.";
    }
  });
}
