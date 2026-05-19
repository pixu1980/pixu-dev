function noop() {}

export function initScrollSpy(options = {}) {
  const liveWindow = options.window;
  const liveDocument = options.document || liveWindow?.document || globalThis.document;
  const header = options.header || liveDocument?.querySelector("[data-header]") || null;
  const nav = options.nav || liveDocument?.querySelector("[data-nav]") || null;
  const navLinks =
    options.navLinks || Array.from(liveDocument?.querySelectorAll("[data-nav-link]") || []);
  const sections =
    options.sections || Array.from(liveDocument?.querySelectorAll("main > section[id]") || []);
  const mobileQuery =
    options.mobileQuery ||
    (typeof liveWindow?.matchMedia === "function"
      ? liveWindow.matchMedia("(max-width: 992px)")
      : { matches: false });
  const closeNavigation = options.closeNavigation || noop;

  if (!liveWindow || !nav || !navLinks.length || !sections.length) {
    return { destroy: noop };
  }

  const requestFrame =
    typeof liveWindow.requestAnimationFrame === "function"
      ? liveWindow.requestAnimationFrame.bind(liveWindow)
      : (callback) => liveWindow.setTimeout(callback, 16);
  const cancelFrame =
    typeof liveWindow.cancelAnimationFrame === "function"
      ? liveWindow.cancelAnimationFrame.bind(liveWindow)
      : liveWindow.clearTimeout.bind(liveWindow);

  let activeId = "";
  let scrollSpyObserver;
  let scrollSpyFrame = 0;
  let scrollSpyLockId = "";
  let scrollSpyLockFrame = 0;
  let scrollSpyObserverFrame = 0;

  function getHeaderOffset() {
    return Math.ceil((header?.getBoundingClientRect().height || 0) + 24);
  }

  function setActiveNav(nextId) {
    if (!nextId || nextId === activeId) return;

    activeId = nextId;
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${nextId}`;
      link.toggleAttribute("aria-current", isActive);
      link.dataset.active = String(isActive);
    });
  }

  function getScrollSpyAnchor() {
    return getHeaderOffset() + 16;
  }

  function getActiveSectionId() {
    const anchor = getScrollSpyAnchor();
    const viewportHeight =
      liveWindow.innerHeight || liveDocument?.documentElement?.clientHeight || 0;
    const metrics = sections
      .map((section) => {
        const rect = section.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, viewportHeight);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        return {
          anchorDistance: Math.abs(rect.top - anchor),
          containsAnchor: rect.top <= anchor && rect.bottom > anchor,
          id: section.id,
          rect,
          visibleRatio: rect.height > 0 ? visibleHeight / rect.height : 0,
        };
      })
      .filter(({ rect }) => rect.height > 0);

    const sortByPriority = (left, right) =>
      right.visibleRatio - left.visibleRatio || left.anchorDistance - right.anchorDistance;

    const anchored = metrics.filter(({ containsAnchor }) => containsAnchor).sort(sortByPriority);
    if (anchored[0]) {
      return anchored[0].id;
    }

    const visible = metrics
      .filter(({ rect }) => rect.bottom > 0 && rect.top < viewportHeight)
      .sort(sortByPriority);

    return visible[0]?.id || sections[0]?.id || "";
  }

  function stopScrollSpyLock() {
    scrollSpyLockId = "";

    if (!scrollSpyLockFrame) return;
    cancelFrame(scrollSpyLockFrame);
    scrollSpyLockFrame = 0;
  }

  function hasReachedScrollSpyAnchor(targetId) {
    const target = liveDocument.getElementById(targetId);
    if (!target) return true;

    const rect = target.getBoundingClientRect();
    const anchor = getScrollSpyAnchor();
    return rect.top <= anchor + 2 && rect.bottom > anchor;
  }

  function syncActiveNavToViewport() {
    scrollSpyFrame = 0;

    if (scrollSpyLockId) {
      if (!hasReachedScrollSpyAnchor(scrollSpyLockId)) {
        setActiveNav(scrollSpyLockId);
        return;
      }

      stopScrollSpyLock();
    }

    setActiveNav(getActiveSectionId());
  }

  function scheduleActiveNavSync() {
    if (scrollSpyFrame) return;

    scrollSpyFrame = requestFrame(() => {
      syncActiveNavToViewport();
    });
  }

  function lockScrollSpyToTarget(targetId) {
    stopScrollSpyLock();
    scrollSpyLockId = targetId;
    setActiveNav(targetId);

    let framesRemaining = 180;

    const tick = () => {
      if (!scrollSpyLockId) {
        scrollSpyLockFrame = 0;
        return;
      }

      scheduleActiveNavSync();
      framesRemaining -= 1;

      if (framesRemaining <= 0) {
        stopScrollSpyLock();
        scheduleActiveNavSync();
        return;
      }

      scrollSpyLockFrame = requestFrame(tick);
    };

    scrollSpyLockFrame = requestFrame(tick);
  }

  function connectScrollSpyObserver() {
    scrollSpyObserver?.disconnect();
    scrollSpyObserver = new liveWindow.IntersectionObserver(
      () => {
        scheduleActiveNavSync();
      },
      {
        rootMargin: `-${getHeaderOffset()}px 0px -30% 0px`,
        threshold: [0, 0.15, 0.3, 0.6, 1],
      },
    );

    sections.forEach((section) => {
      scrollSpyObserver.observe(section);
    });

    scheduleActiveNavSync();
  }

  function scheduleScrollSpyObserverRefresh() {
    if (scrollSpyObserverFrame) return;

    scrollSpyObserverFrame = requestFrame(() => {
      scrollSpyObserverFrame = 0;
      connectScrollSpyObserver();
    });
  }

  function updateActiveNavFallback() {
    stopScrollSpyLock();
    setActiveNav(getActiveSectionId());
  }

  function handleObserverResize() {
    scheduleScrollSpyObserverRefresh();
    scheduleActiveNavSync();
  }

  function handleNavClick(event) {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;

    const target = liveDocument.getElementById(anchor.getAttribute("href").slice(1));
    if (!target) return;

    event.preventDefault();

    const top = Math.max(
      target.getBoundingClientRect().top + liveWindow.scrollY - getHeaderOffset(),
      0,
    );
    const prefersReducedMotion =
      typeof liveWindow.matchMedia === "function" &&
      liveWindow.matchMedia("(prefers-reduced-motion: reduce)").matches;

    lockScrollSpyToTarget(target.id);
    liveWindow.history?.pushState?.(null, "", `#${target.id}`);
    liveWindow.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    scheduleActiveNavSync();

    if (mobileQuery.matches) {
      closeNavigation();
    }
  }

  nav.addEventListener("click", handleNavClick);

  if (typeof liveWindow.IntersectionObserver === "function") {
    connectScrollSpyObserver();
    liveWindow.addEventListener("resize", handleObserverResize, { passive: true });
  } else {
    liveWindow.addEventListener("scroll", updateActiveNavFallback, { passive: true });
    liveWindow.addEventListener("resize", updateActiveNavFallback, { passive: true });
    updateActiveNavFallback();
  }

  return {
    destroy() {
      nav.removeEventListener("click", handleNavClick);
      liveWindow.removeEventListener("scroll", updateActiveNavFallback);
      liveWindow.removeEventListener("resize", updateActiveNavFallback);
      liveWindow.removeEventListener("resize", handleObserverResize);
      scrollSpyObserver?.disconnect();

      if (scrollSpyFrame) {
        cancelFrame(scrollSpyFrame);
        scrollSpyFrame = 0;
      }

      if (scrollSpyObserverFrame) {
        cancelFrame(scrollSpyObserverFrame);
        scrollSpyObserverFrame = 0;
      }

      stopScrollSpyLock();
    },
  };
}
