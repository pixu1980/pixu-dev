import styles from "./_pointer-glow.css?raw";
import { registerComponent, registerStyles } from "../_utils.js";

export class PointerGlow extends HTMLElement {
  static {
    registerStyles("pointer-glow", styles);
    registerComponent("pointer-glow", PointerGlow);
  }

  connectedCallback() {
    if (this.dataset.ready === "true") return;

    this.dataset.ready = "true";
    this.setAttribute("aria-hidden", "true");

    if (window.matchMedia("(pointer: coarse)").matches) return;

    this._handleMove = (event) => {
      this.style.setProperty("--x", `${event.clientX}px`);
      this.style.setProperty("--y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", this._handleMove, { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener("pointermove", this._handleMove);
  }
}
