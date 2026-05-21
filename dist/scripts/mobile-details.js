const supportsPopover =
  typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

export function initMobileDetails() {
  const triggers = Array.from(document.querySelectorAll("[data-item-detail-trigger]"));
  const details = Array.from(document.querySelectorAll("[data-item-detail]"));

  if (!triggers.length && !details.length) {
    return;
  }

  if (!supportsPopover) {
    document.documentElement.dataset.popoverFallback = "inline";
    document.documentElement.dataset.itemDetailsReady = "true";
    return;
  }

  details.forEach((detail) => {
    detail.setAttribute("popover", "auto");
  });

  triggers.forEach((trigger) => {
    const popoverId = trigger.getAttribute("popovertarget");
    const popover = popoverId ? document.getElementById(popoverId) : null;
    const summaryCard = trigger.closest("[data-timeline-item-summary], [data-summary]");

    if (!popover) {
      return;
    }

    let openedByTrigger = false;

    const togglePopover = (event) => {
      if (!popover.hasAttribute("popover") || typeof popover.showPopover !== "function") {
        return;
      }

      event.preventDefault();
      openedByTrigger = true;

      if (popover.matches(":popover-open")) {
        popover.hidePopover();
        return;
      }

      popover.showPopover();
    };

    trigger.addEventListener("click", togglePopover);
    summaryCard?.addEventListener("click", (event) => {
      if (event.target?.closest?.("[data-item-detail-trigger]") === trigger) {
        return;
      }

      togglePopover(event);
    });

    popover.querySelectorAll("[data-popover-close]").forEach((closeButton) => {
      closeButton.addEventListener("click", (event) => {
        if (typeof popover.hidePopover !== "function" || !popover.matches(":popover-open")) {
          return;
        }

        event.preventDefault();
        popover.hidePopover();
      });
    });

    popover.addEventListener("toggle", (event) => {
      const isOpen = event.newState === "open";

      popover.dataset.open = String(isOpen);
      trigger.setAttribute("aria-expanded", String(isOpen));

      if (!isOpen && openedByTrigger) {
        trigger.focus();
        openedByTrigger = false;
      }
    });
  });

  document.documentElement.dataset.itemDetailsReady = "true";
}
