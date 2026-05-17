import styles from "./_scroll-progress.css?raw";
import { registerComponent, registerStyles } from "../_utils.js";

function clampProgress(value) {
  return Math.min(Math.max(value, 0), 1);
}

export class ScrollProgress extends HTMLElement {
  static {
    registerStyles("scroll-progress", styles);
    registerComponent("scroll-progress", ScrollProgress);
  }

  connectedCallback() {
    if (this.dataset.ready === "true") return;

    this.dataset.ready = "true";
    this.setAttribute("aria-hidden", "true");

    this._currentProgress = 0;
    this._targetProgress = 0;
    this._frame = 0;

    this._commitProgress = (value) => {
      const nextValue = clampProgress(value);
      this.style.setProperty("--scroll-progress-value", nextValue.toFixed(4));
    };

    this._readTargetProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      return scrollable > 0 ? clampProgress(window.scrollY / scrollable) : 0;
    };

    this._shouldReduceMotion = () => {
      return (
        document.documentElement.hasAttribute("data-reduce-motion") ||
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true
      );
    };

    this._stepProgress = () => {
      const delta = this._targetProgress - this._currentProgress;

      if (Math.abs(delta) <= 0.001 || this._shouldReduceMotion()) {
        this._currentProgress = this._targetProgress;
        this._commitProgress(this._currentProgress);
        this._frame = 0;
        return;
      }

      this._currentProgress += delta * 0.18;
      this._commitProgress(this._currentProgress);
      this._frame = window.requestAnimationFrame(this._stepProgress);
    };

    this._updateProgress = () => {
      this._targetProgress = this._readTargetProgress();

      if (this._shouldReduceMotion()) {
        this._currentProgress = this._targetProgress;
        this._commitProgress(this._currentProgress);
        if (this._frame) {
          window.cancelAnimationFrame(this._frame);
          this._frame = 0;
        }
        return;
      }

      if (!this._frame) {
        this._frame = window.requestAnimationFrame(this._stepProgress);
      }
    };

    window.addEventListener("scroll", this._updateProgress, { passive: true });
    window.addEventListener("resize", this._updateProgress, { passive: true });
    this._updateProgress();
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this._updateProgress);
    window.removeEventListener("resize", this._updateProgress);

    if (this._frame) {
      window.cancelAnimationFrame(this._frame);
      this._frame = 0;
    }
  }
}
