const supportsPopover =
  typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;
const mobileDetailsQuery =
  typeof window !== "undefined" ? window.matchMedia("(max-width: 639px)") : null;

export function initMobileDetails() {
  const triggers = Array.from(document.querySelectorAll("[data-item-detail-trigger]"));
  const talkDetails = Array.from(document.querySelectorAll('[data-item-detail="talk"]'));

  if (!triggers.length && !talkDetails.length) {
    return;
  }

  if (!supportsPopover) {
    document.documentElement.dataset.popoverFallback = "inline";
    return;
  }

  const syncTalkDetailMode = () => {
    const usePopover = mobileDetailsQuery?.matches !== false;

    talkDetails.forEach((detail) => {
      if (usePopover) {
        detail.setAttribute("popover", "auto");
        return;
      }

      if (detail.matches(":popover-open")) {
        detail.hidePopover();
      }

      detail.removeAttribute("popover");
      detail.dataset.open = "false";
    });

    triggers.forEach((trigger) => {
      if (trigger.dataset.detailKind === "talk" && !usePopover) {
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  };

  syncTalkDetailMode();
  mobileDetailsQuery?.addEventListener("change", syncTalkDetailMode);

  triggers.forEach((trigger) => {
    const popoverId = trigger.getAttribute("popovertarget");
    const popover = popoverId ? document.getElementById(popoverId) : null;

    if (!popover) {
      return;
    }

    let openedByTrigger = false;

    trigger.addEventListener("click", () => {
      openedByTrigger = true;
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
}
