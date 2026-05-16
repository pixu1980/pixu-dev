import styles from "./_scroll-progress.css?raw";
import { registerComponent, registerStyles } from "../_utils.js";

export class ScrollProgress extends HTMLElement {
  static {
    registerStyles("scroll-progress", styles);
    registerComponent("scroll-progress", ScrollProgress);
  }

  connectedCallback() {
    if (this.dataset.ready === "true") return;

    this.dataset.ready = "true";
    this.setAttribute("aria-hidden", "true");

    this._updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;

      this.style.setProperty("--progress", `${Math.min(Math.max(ratio, 0), 1) * 100}%`);
    };

    window.addEventListener("scroll", this._updateProgress, { passive: true });
    this._updateProgress();
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this._updateProgress);
  }
}
