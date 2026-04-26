import styles from "./_accent-color-selector.css?raw";
import { registerComponent, registerStyles } from "../_utils.js";

const STORAGE_KEY = "pixu:accent-pair";
const root = document.documentElement;
const options = [
  { value: "sea-glass", label: "Sea glass", primary: "#7dd8ff", secondary: "#b99cff" },
  { value: "sage-blush", label: "Sage blush", primary: "#8ee6b6", secondary: "#ff9fbc" },
  { value: "peach-fuzz", label: "Peach fuzz", primary: "#ffb18e", secondary: "#8ebcff" },
  { value: "lavender-mint", label: "Lavender mint", primary: "#cab2ff", secondary: "#8df1dc" },
  { value: "butter-plum", label: "Butter plum", primary: "#ffd477", secondary: "#c7a4ff" },
];
let nextId = 0;

function readStoredAccent() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return options.some((option) => option.value === value) ? value : "sea-glass";
  } catch {
    return "sea-glass";
  }
}

function storeAccent(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {}
}

export class AccentColorSelector extends HTMLElement {
  static {
    registerStyles("accent-color-selector", styles);
    registerComponent("accent-color-selector", AccentColorSelector);
  }

  connectedCallback() {
    if (this.dataset.ready === "true") return;

    this.dataset.ready = "true";
    this.setAttribute("role", "radiogroup");
    this.setAttribute("aria-label", "Accent color pair");

    const groupName = `accent-color-${nextId}`;

    nextId += 1;

    for (const option of options) {
      const label = document.createElement("label");

      label.dataset.option = option.value;
      label.style.setProperty("--swatch-a", option.primary);
      label.style.setProperty("--swatch-b", option.secondary);
      label.setAttribute("aria-label", option.label);
      label.innerHTML = `<input type="radio" name="${groupName}" value="${option.value}" ${readStoredAccent() === option.value ? "checked" : ""} /><span data-swatch aria-hidden="true"></span><span data-label>${option.label}</span>`;

      this.append(label);
    }

    this.addEventListener("change", this);
    root.dataset.accent = this.value;
  }

  disconnectedCallback() {
    this.removeEventListener("change", this);
  }

  get value() {
    return this.querySelector("input:checked")?.value || "sea-glass";
  }

  handleEvent(event) {
    const input = event.target.closest("input[type='radio']");

    if (event.type !== "change" || !input || !this.contains(input)) return;

    storeAccent(input.value);
    root.dataset.accent = input.value;
  }
}
