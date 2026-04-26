import "./components/index.js";

const root = document.documentElement;
const header = document.querySelector("[data-site-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
const sections = Array.from(document.querySelectorAll("main > section[id]"));
const liveRegion = document.querySelector("[data-live-region]");
const mobileQuery = window.matchMedia("(max-width: 760px)");

let activeId = "";
let navMode = "";

function announce(message) {
  if (!liveRegion) return;
  liveRegion.textContent = "";
  window.requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

function getHeaderOffset() {
  return Math.ceil((header?.getBoundingClientRect().height || 0) + 24);
}

function setNavOpen(isOpen, options = {}) {
  if (!nav || !navToggle) return;

  if (!mobileQuery.matches) {
    root.dataset.navState = "open";
    navToggle.setAttribute("aria-expanded", "false");
    nav.inert = false;
    return;
  }

  root.dataset.navState = isOpen ? "open" : "closed";
  navToggle.setAttribute("aria-expanded", String(isOpen));
  nav.inert = !isOpen;

  if (options.focusToggle) {
    navToggle.focus();
  }

  if (options.announce) {
    announce(isOpen ? "Navigation opened" : "Navigation closed");
  }
}

function syncNavMode() {
  const nextMode = mobileQuery.matches ? "mobile" : "desktop";
  root.dataset.navMode = nextMode;

  if (nextMode !== navMode) {
    setNavOpen(nextMode === "desktop");
  }

  navMode = nextMode;
}

function getActiveSectionId() {
  const offset = getHeaderOffset() + 16;
  const anchor = window.scrollY + offset;
  const candidates = sections
    .map((section) => ({
      id: section.id,
      top: section.offsetTop,
      bottom: section.offsetTop + section.offsetHeight,
    }))
    .filter((section) => section.top <= anchor && section.bottom > anchor)
    .sort((left, right) => right.top - left.top);

  if (candidates[0]) return candidates[0].id;

  const passed = sections
    .map((section) => ({ id: section.id, top: section.offsetTop }))
    .filter((section) => section.top <= anchor)
    .sort((left, right) => right.top - left.top);

  return passed[0]?.id || sections[0]?.id || "";
}

function updateActiveNav() {
  const nextId = getActiveSectionId();
  if (!nextId || nextId === activeId) return;

  activeId = nextId;
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${nextId}`;
    link.toggleAttribute("aria-current", isActive);
    link.dataset.active = String(isActive);
  });
}

function handleNavClick(event) {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) return;

  const target = document.getElementById(anchor.getAttribute("href").slice(1));
  if (!target) return;

  event.preventDefault();
  const top = Math.max(target.offsetTop - getHeaderOffset(), 0);
  window.history.pushState(null, "", `#${target.id}`);
  window.scrollTo({ top, behavior: "smooth" });

  if (mobileQuery.matches) {
    setNavOpen(false);
  }
}

function initReveal() {
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!revealItems.length) return;
  root.dataset.revealReady = "true";
  const supportsScrollDrivenReveal =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("animation-timeline: view(block)");

  const pending = new Set(revealItems);
  let frame = 0;
  let observer;

  function reveal(item) {
    if (item.dataset.visible === "true") return;
    item.dataset.visible = "true";
    pending.delete(item);
    observer?.unobserve(item);
  }

  function shouldReveal(item) {
    const rect = item.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    return rect.top <= viewportHeight * 0.9 && rect.bottom >= viewportHeight * 0.08;
  }

  function teardown() {
    window.removeEventListener("scroll", scheduleReveal);
    window.removeEventListener("resize", scheduleReveal);
    observer?.disconnect();
  }

  function flushReveal() {
    frame = 0;
    pending.forEach((item) => {
      if (shouldReveal(item)) {
        reveal(item);
      }
    });

    if (!pending.size) {
      teardown();
    }
  }

  function scheduleReveal() {
    if (frame) return;
    frame = window.requestAnimationFrame(flushReveal);
  }

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-order", String(index % 6));
  });

  if (supportsScrollDrivenReveal) {
    // Keep attribute for diagnostics/tests, visual reveal handled by CSS timeline.
    revealItems.forEach(reveal);
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(reveal);
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && !shouldReveal(entry.target)) return;
        reveal(entry.target);
      });

      if (!pending.size) {
        teardown();
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: [0, 0.12] },
  );

  revealItems.forEach((item) => {
    if (shouldReveal(item)) {
      reveal(item);
      return;
    }
    observer.observe(item);
  });

  window.addEventListener("scroll", scheduleReveal, { passive: true });
  window.addEventListener("resize", scheduleReveal, { passive: true });
  scheduleReveal();
}

function normalizeExternalLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach((anchor) => {
    const tokens = new Set(
      String(anchor.getAttribute("rel") || "")
        .split(/\s+/)
        .filter(Boolean),
    );
    tokens.add("noopener");
    tokens.add("noreferrer");
    anchor.setAttribute("rel", Array.from(tokens).join(" "));
  });
}

navToggle?.addEventListener("click", () => {
  setNavOpen(root.dataset.navState !== "open", { announce: true });
});

nav?.addEventListener("click", handleNavClick);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !mobileQuery.matches || root.dataset.navState !== "open") return;
  event.preventDefault();
  setNavOpen(false, { focusToggle: true, announce: true });
});

window.addEventListener(
  "scroll",
  () => {
    updateActiveNav();
  },
  { passive: true },
);

window.addEventListener(
  "resize",
  () => {
    syncNavMode();
    updateActiveNav();
  },
  { passive: true },
);

if (typeof mobileQuery.addEventListener === "function") {
  mobileQuery.addEventListener("change", syncNavMode);
} else if (typeof mobileQuery.addListener === "function") {
  mobileQuery.addListener(syncNavMode);
}

syncNavMode();
normalizeExternalLinks();
initReveal();
updateActiveNav();
