import styles from "./_skip-link.css?raw";
import { registerComponent, registerStyles } from "../_utils.js";

export class SkipLink extends HTMLElement {
  static {
    registerStyles("skip-link", styles);
    registerComponent("skip-link", SkipLink);
  }

  connectedCallback() {
    if (this.dataset.ready === "true") return;

    this.dataset.ready = "true";
    this.setAttribute("role", "link");
    this.setAttribute("tabindex", "0");

    if (!this.textContent.trim()) this.textContent = "Skip to content";

    this._handleSkip = (event) => {
      if (event.type !== "click" && !(event.type === "keydown" && event.key === "Enter")) return;

      const target = document.getElementById((this.getAttribute("href") || "#main").slice(1));

      if (!target) return;

      event.preventDefault();
      target.tabIndex = -1;
      target.focus();
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    };

    this.addEventListener("click", this._handleSkip);
    this.addEventListener("keydown", this._handleSkip);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this._handleSkip);
    this.removeEventListener("keydown", this._handleSkip);
  }
}
