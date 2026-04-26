import styles from "./_color-scheme-selector.css?raw";
import { registerComponent, registerStyles } from "../_utils.js";

const STORAGE_KEY = "pixu:color-scheme";
const root = document.documentElement;
const media = window.matchMedia("(prefers-color-scheme: dark)");
const options = [
  {
    value: "light",
    label: "Light",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"></path></svg>`,
  },
  {
    value: "dark",
    label: "Dark",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.5 14.4A8.2 8.2 0 0 1 9.6 3.5a8.6 8.6 0 1 0 10.9 10.9Z"></path></svg>`,
  },
  {
    value: "system",
    label: "System",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8M12 16v4"></path></svg>`,
  },
];
let nextId = 0;

function readStoredScheme() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return options.some((option) => option.value === value) ? value : "system";
  } catch {
    return "system";
  }
}

function resolveScheme(value) {
  return value === "system" ? (media.matches ? "dark" : "light") : value;
}

function applyScheme(value) {
  const resolved = resolveScheme(value);
  root.dataset.colorScheme = value;
  root.dataset.resolvedScheme = resolved;
  root.style.colorScheme = resolved;
}

export class ColorSchemeSelector extends HTMLElement {
  static {
    registerStyles("color-scheme-selector", styles);
    registerComponent("color-scheme-selector", ColorSchemeSelector);
  }

  connectedCallback() {
    if (this.dataset.ready === "true") return;

    this.dataset.ready = "true";
    this.setAttribute("role", "radiogroup");
    this.setAttribute("aria-label", "Color scheme");

    this._handleSystemChange = () => {
      this.value === "system" && applyScheme("system");
    };

    const groupName = `color-scheme-${nextId}`;
    nextId += 1;

    for (const option of options) {
      const label = document.createElement("label");
      label.dataset.option = option.value;
      label.setAttribute("aria-label", option.label);
      label.innerHTML = `<input type="radio" name="${groupName}" value="${option.value}" ${readStoredScheme() === option.value ? "checked" : ""} /><span data-icon aria-hidden="true">${option.icon}</span><span data-label>${option.label}</span>`;
      this.append(label);
    }

    this.addEventListener("change", this);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", this._handleSystemChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(this._handleSystemChange);
    }

    applyScheme(this.value);
  }

  disconnectedCallback() {
    this.removeEventListener("change", this);

    if (typeof media.removeEventListener === "function") {
      media.removeEventListener("change", this._handleSystemChange);
    } else if (typeof media.removeListener === "function") {
      media.removeListener(this._handleSystemChange);
    }
  }

  get value() {
    return this.querySelector("input:checked")?.value || "system";
  }

  handleEvent(event) {
    const input = event.target.closest("input[type='radio']");

    if (event.type !== "change" || !input || !this.contains(input)) return;

    try {
      if (input.value === "system") {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, input.value);
      }
    } catch {}

    applyScheme(input.value);
  }
}
