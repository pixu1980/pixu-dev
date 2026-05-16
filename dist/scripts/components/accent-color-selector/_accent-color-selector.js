import styles from "./_accent-color-selector.css?raw";
import { registerComponent, registerStyles } from "../_utils.js";

const STORAGE_KEY = "pixu:accent-color";
const root = document.documentElement;
const options = [
  { value: "blue", label: "Blue", color: "#0072b2" },
  { value: "green", label: "Green", color: "#007a5a" },
  { value: "orange", label: "Orange", color: "#b94700" },
  { value: "purple", label: "Purple", color: "#6d55b8" },
  { value: "rose", label: "Rose", color: "#9b3d73" },
];
let nextId = 0;

function readStoredAccent() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return options.some((option) => option.value === value) ? value : "blue";
  } catch {
    return "blue";
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
    this.setAttribute("aria-label", "Accent color");

    const groupName = `accent-color-${nextId}`;

    nextId += 1;

    for (const option of options) {
      const label = document.createElement("label");

      label.dataset.option = option.value;
      label.style.setProperty("--swatch-color", option.color);
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
    return this.querySelector("input:checked")?.value || "blue";
  }

  handleEvent(event) {
    const input = event.target.closest("input[type='radio']");

    if (event.type !== "change" || !input || !this.contains(input)) return;

    storeAccent(input.value);
    root.dataset.accent = input.value;
  }
}
