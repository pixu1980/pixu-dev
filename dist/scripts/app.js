import "./components/index.js";
import { initScrollSpy } from "./components/scroll-spy/index.js";
import { initMobileDetails } from "./mobile-details.js";

const root = document.documentElement;
const header = document.querySelector("[data-header]");
const footer = document.querySelector("[data-footer]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const liveRegion = document.querySelector("[data-live-region]");
const mobileQuery = window.matchMedia("(max-width: 992px)");

let navMode = "";
let footerObserver;

function announce(message) {
  if (!liveRegion) return;
  liveRegion.textContent = "";
  window.requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
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

function syncFooterHeightVar() {
  const footerHeight = footer ? Math.ceil(footer.getBoundingClientRect().height) : 0;
  root.style.setProperty("--footer-height", `${Math.max(footerHeight, 0)}px`);
}

function initFooterHeightVar() {
  syncFooterHeightVar();

  if (!footer || typeof window.ResizeObserver !== "function") return;

  footerObserver = new window.ResizeObserver(() => {
    syncFooterHeightVar();
  });
  footerObserver.observe(footer);
}

navToggle?.addEventListener("click", () => {
  setNavOpen(root.dataset.navState !== "open", { announce: true });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !mobileQuery.matches || root.dataset.navState !== "open") return;
  event.preventDefault();
  setNavOpen(false, { focusToggle: true, announce: true });
});

window.addEventListener(
  "resize",
  () => {
    syncNavMode();
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
initFooterHeightVar();
initReveal();
initScrollSpy({
  closeNavigation: () => {
    setNavOpen(false);
  },
  header,
  mobileQuery,
  nav,
  window,
});
initMobileDetails();

window.addEventListener("beforeunload", () => {
  footerObserver?.disconnect();
});
