// Content starts fully readable. Add independent, keyboard-operable tab groups.
for (const group of document.querySelectorAll("[data-tabs]")) {
  const tablist = group.querySelector("[data-tablist]");
  const tabs = Array.from(tablist.querySelectorAll("[data-panel]"));
  const panels = tabs.map((tab) => document.getElementById(tab.dataset.panel));
  if (!tabs.length || panels.some((panel) => !panel)) continue;

  const activate = (index, focus = false) => {
    tabs.forEach((tab, candidate) => {
      const selected = candidate === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[candidate].hidden = !selected;
    });
    if (focus) tabs[index].focus();
  };

  tablist.setAttribute("role", "tablist");
  tabs.forEach((tab, index) => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panels[index].id);
    panels[index].setAttribute("role", "tabpanel");
    panels[index].setAttribute("aria-labelledby", tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener("click", () => activate(index));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight" || event.key === "ArrowDown")
        next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp")
        next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activate(next, true);
      }
    });
  });
  group.classList.add("tabs-ready");
  tablist.hidden = false;
  activate(0);
}

// Only deliberate same-page navigation animates. Native focus scrolling stays
// immediate, so focusing a disclosure cannot race a subsequent pointer click.
document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !(event.target instanceof Element)
  )
    return;
  const anchor = event.target.closest("a[href]");
  if (
    !anchor ||
    anchor.hasAttribute("download") ||
    (anchor.target && anchor.target !== "_self")
  )
    return;
  const url = new URL(anchor.href);
  if (
    url.origin !== location.origin ||
    url.pathname !== location.pathname ||
    url.search !== location.search ||
    !url.hash
  )
    return;
  let id;
  try {
    id = decodeURIComponent(url.hash.slice(1));
  } catch {
    return;
  }
  const destination = document.getElementById(id);
  if (!destination) return;
  event.preventDefault();
  if (location.hash !== url.hash) history.pushState(null, "", url);
  if (
    !destination.matches("a[href], button, input, select, textarea, [tabindex]")
  ) {
    destination.tabIndex = -1;
    destination.addEventListener(
      "blur",
      () => destination.removeAttribute("tabindex"),
      { once: true },
    );
  }
  destination.focus({ preventScroll: true });
  destination.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
});

for (const button of document.querySelectorAll("[data-copy]")) {
  const code = document.getElementById(button.dataset.copy);
  const status = button
    .closest(".code-block")
    ?.querySelector('[role="status"]');
  if (!code || !status) continue;
  button.hidden = false;
  let reset;
  button.addEventListener("click", async () => {
    clearTimeout(reset);
    status.textContent = "";
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = "Copied";
      status.textContent = "Copied to clipboard.";
    } catch {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      button.textContent = "Copy";
      status.textContent =
        "Automatic copy is unavailable. The text is selected; press Ctrl+C or Command+C to copy it.";
    }
    reset = setTimeout(() => {
      button.textContent = "Copy";
    }, 2400);
  });
}

// Cross-page fragment scrolling can precede font layout in WebKit. Reconcile
// that initial destination once layout is ready, without interrupting the user.
if (location.hash) {
  const initialHash = location.hash;
  let interrupted = false;
  const interrupt = () => {
    interrupted = true;
  };
  const intentEvents = ["wheel", "touchstart", "pointerdown", "keydown"];
  for (const event of intentEvents)
    window.addEventListener(event, interrupt, { passive: true });
  const loaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) =>
          window.addEventListener("load", resolve, { once: true }),
        );
  loaded
    .then(() => document.fonts.ready)
    .then(() =>
      requestAnimationFrame(() => {
        for (const event of intentEvents)
          window.removeEventListener(event, interrupt);
        if (interrupted || location.hash !== initialHash) return;
        let id;
        try {
          id = decodeURIComponent(initialHash.slice(1));
        } catch {
          return;
        }
        document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
      }),
    );
}

// Animate one request and response, once. A live reduced-motion change stops it.
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const diagram = document.querySelector("[data-diagram]");
if (diagram && "IntersectionObserver" in window && !motionPreference.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        if (!motionPreference.matches) diagram.classList.add("is-flowing");
        observer.disconnect();
      }
    },
    { threshold: 0.4 },
  );
  observer.observe(diagram);
  motionPreference.addEventListener("change", (event) => {
    if (event.matches) {
      observer.disconnect();
      diagram.classList.remove("is-flowing");
    }
  });
}
