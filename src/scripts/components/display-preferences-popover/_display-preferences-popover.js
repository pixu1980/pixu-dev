import "../accent-color-selector/index.js";
import styles from "./_display-preferences-popover.css?raw";
import { registerComponent, registerStyles } from "../_utils.js";

const STORAGE_KEY = "pixu:display-preferences";
const FONT_SCALE_OPTIONS = ["75%", "80%", "90%", "100%", "110%", "120%", "125%"];
const RADIUS_PRESET_OPTIONS = [
  {
    description: "Zero radius across cards and controls.",
    id: "square",
    label: "Square",
  },
  {
    description: "The default rounded interface.",
    id: "rounded",
    label: "Rounded",
  },
  {
    description: "A softer silhouette with larger curves.",
    id: "squircle",
    label: "Squircle",
  },
];
const ACCESSIBILITY_OPTIONS = [
  {
    attribute: "data-reduce-motion",
    description: "Tone down movement-heavy interactions.",
    label: "Reduce motion",
    name: "reduceMotion",
  },
  {
    attribute: "data-reduce-animations",
    description: "Minimize reveals, fades, and transitions.",
    label: "Reduce animations",
    name: "reduceAnimations",
  },
  {
    attribute: "data-reduce-transparency",
    description: "Swap glass effects for solid surfaces.",
    label: "Reduce transparency",
    name: "reduceTransparency",
  },
  {
    attribute: "data-increase-contrast",
    description: "Boost surface and text separation.",
    label: "Increase contrast",
    name: "increaseContrast",
  },
];
const HEADING_FONT_OPTIONS = [
  {
    id: "avenir-humanist",
    label: "Avenir Humanist",
    stack: '"Avenir Next", Inter, "Segoe UI Variable Text", "Helvetica Neue", sans-serif',
  },
  {
    id: "editorial-serif",
    label: "Editorial Serif",
    stack: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
  },
  {
    id: "system-sans",
    label: "System Sans",
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  {
    id: "book-serif",
    label: "Book Serif",
    stack: 'Baskerville, "Times New Roman", Georgia, serif',
  },
];
const BODY_FONT_OPTIONS = [
  {
    id: "inter-sans",
    label: "Inter Sans",
    stack:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  {
    id: "humanist-sans",
    label: "Humanist Sans",
    stack: '"Avenir Next", Inter, "Segoe UI Variable Text", "Helvetica Neue", sans-serif',
  },
  {
    id: "book-serif",
    label: "Book Serif",
    stack: 'Georgia, Cambria, "Times New Roman", serif',
  },
  {
    id: "editorial-serif",
    label: "Editorial Serif",
    stack: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
  },
];
const CODE_FONT_OPTIONS = [
  {
    id: "plex-mono",
    label: "Plex Mono",
    stack: '"IBM Plex Mono", "SFMono-Regular", "Cascadia Code", Consolas, monospace',
  },
  {
    id: "system-mono",
    label: "System Mono",
    stack: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace',
  },
  {
    id: "classic-mono",
    label: "Classic Mono",
    stack: '"Courier New", Courier, monospace',
  },
];
const FONT_OPTIONS = {
  bodyFont: BODY_FONT_OPTIONS,
  codeFont: CODE_FONT_OPTIONS,
  headingFont: HEADING_FONT_OPTIONS,
};
const DEFAULT_PREFERENCES = Object.freeze({
  bodyFont: "inter-sans",
  codeFont: "plex-mono",
  fontScale: "100%",
  headingFont: "avenir-humanist",
  increaseContrast: false,
  radiusPreset: "rounded",
  reduceAnimations: false,
  reduceMotion: false,
  reduceTransparency: false,
});
const supportsNativePopover =
  typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

let nextId = 0;

function getStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function findFontOption(groupName, optionId) {
  const options = FONT_OPTIONS[groupName] || [];
  return options.find((option) => option.id === optionId) || options[0];
}

function findRadiusPreset(optionId) {
  return (
    RADIUS_PRESET_OPTIONS.find((option) => option.id === optionId) ||
    RADIUS_PRESET_OPTIONS.find((option) => option.id === DEFAULT_PREFERENCES.radiusPreset)
  );
}

function normalizePreferences(preferences = {}) {
  const candidate = preferences && typeof preferences === "object" ? preferences : {};

  return {
    bodyFont: findFontOption("bodyFont", candidate.bodyFont).id,
    codeFont: findFontOption("codeFont", candidate.codeFont).id,
    fontScale: FONT_SCALE_OPTIONS.includes(candidate.fontScale)
      ? candidate.fontScale
      : DEFAULT_PREFERENCES.fontScale,
    headingFont: findFontOption("headingFont", candidate.headingFont).id,
    increaseContrast: candidate.increaseContrast === true,
    radiusPreset: findRadiusPreset(candidate.radiusPreset).id,
    reduceAnimations: candidate.reduceAnimations === true,
    reduceMotion: candidate.reduceMotion === true,
    reduceTransparency: candidate.reduceTransparency === true,
  };
}

function readPreferences() {
  const raw = getStorage()?.getItem(STORAGE_KEY);

  if (!raw) {
    return { ...DEFAULT_PREFERENCES };
  }

  try {
    return normalizePreferences(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

function writePreferences(preferences) {
  const normalized = normalizePreferences(preferences);

  getStorage()?.setItem(STORAGE_KEY, JSON.stringify(normalized));

  return normalized;
}

function toggleDocumentPreference(root, attributeName, isEnabled) {
  if (isEnabled) {
    root.setAttribute(attributeName, "true");
    return;
  }

  root.removeAttribute(attributeName);
}

export function applyPreferencesToDocument(preferences) {
  const normalized = normalizePreferences(preferences);

  if (typeof document === "undefined") {
    return normalized;
  }

  const root = document.documentElement;

  if (!root) {
    return normalized;
  }

  ACCESSIBILITY_OPTIONS.forEach((option) => {
    toggleDocumentPreference(root, option.attribute, normalized[option.name]);
  });

  if (normalized.fontScale === DEFAULT_PREFERENCES.fontScale) {
    root.style.removeProperty("font-size");
  } else {
    root.style.fontSize = normalized.fontScale;
  }

  root.style.setProperty(
    "--font-display",
    findFontOption("headingFont", normalized.headingFont).stack,
  );
  root.style.setProperty("--font-body", findFontOption("bodyFont", normalized.bodyFont).stack);
  root.style.setProperty("--font-mono", findFontOption("codeFont", normalized.codeFont).stack);
  root.setAttribute("data-radius-preset", normalized.radiusPreset);

  return normalized;
}

function renderSelectOptions(options, selectedValue) {
  return options
    .map((option) => {
      const selected = option.id === selectedValue ? " selected" : "";
      return `<option value="${option.id}"${selected}>${option.label}</option>`;
    })
    .join("");
}

function renderScaleOptions(selectedValue) {
  return FONT_SCALE_OPTIONS.map((option) => {
    const selected = option === selectedValue ? " selected" : "";
    return `<option value="${option}"${selected}>${option}</option>`;
  }).join("");
}

function renderRadiusPresetControls(panelId, selectedValue) {
  return RADIUS_PRESET_OPTIONS.map((option) => {
    const checked = option.id === selectedValue ? " checked" : "";
    const inputId = `${panelId}-radius-${option.id}`;

    return `
      <label data-choice for="${inputId}">
        <input id="${inputId}" type="radio" name="radiusPreset" value="${option.id}"${checked} />
        <span data-choice-preview data-radius-preview="${option.id}" aria-hidden="true">
          <span></span>
          <span></span>
        </span>
        <span data-choice-copy>
          <span data-choice-label>${option.label}</span>
          <span data-choice-hint>${option.description}</span>
        </span>
      </label>
    `;
  }).join("");
}

function renderAccessibilityOptions(panelId, preferences) {
  return ACCESSIBILITY_OPTIONS.map((option) => {
    const checked = preferences[option.name] ? " checked" : "";
    const inputId = `${panelId}-${option.name}`;

    return `
      <div data-checkbox>
        <input id="${inputId}" type="checkbox" name="${option.name}"${checked} />
        <label data-checkbox-copy for="${inputId}">
          <span data-checkbox-label>${option.label}</span>
          <span data-checkbox-hint>${option.description}</span>
        </label>
      </div>
    `;
  }).join("");
}

function renderPanelSections(panelId, preferences) {
  return `
    <div data-group>
      <div data-group-title>
        <h3>Accent color</h3>
        <p>Choose the palette used for links, actions, focus, and highlights.</p>
      </div>
      <accent-color-selector></accent-color-selector>
    </div>

    <section
      data-group="fieldset"
      role="group"
      aria-labelledby="${panelId}-corners-title"
    >
      <div data-group-title>
        <h3 id="${panelId}-corners-title">Corner style</h3>
        <p>Choose how rounded cards and controls should feel.</p>
      </div>
      <div data-choice-grid>
        ${renderRadiusPresetControls(panelId, preferences.radiusPreset)}
      </div>
    </section>

    <div data-group>
      <div data-group-title>
        <h3>Accessibility</h3>
        <p>Reduce friction when you want a calmer, sharper interface.</p>
      </div>
      <div data-checklist>
        ${renderAccessibilityOptions(panelId, preferences)}
      </div>
    </div>

    <div data-group>
      <div data-group-title>
        <h3>Typography</h3>
        <p>Adjust scale and font stacks across headings, body copy, and code.</p>
      </div>
      <div data-grid>
        <div data-field>
          <label for="${panelId}-font-scale">Font scale</label>
          <select id="${panelId}-font-scale" name="fontScale">
            ${renderScaleOptions(preferences.fontScale)}
          </select>
        </div>
        <div data-field>
          <label for="${panelId}-heading-font">Heading font</label>
          <select id="${panelId}-heading-font" name="headingFont">
            ${renderSelectOptions(HEADING_FONT_OPTIONS, preferences.headingFont)}
          </select>
        </div>
        <div data-field>
          <label for="${panelId}-body-font">Body font</label>
          <select id="${panelId}-body-font" name="bodyFont">
            ${renderSelectOptions(BODY_FONT_OPTIONS, preferences.bodyFont)}
          </select>
        </div>
        <div data-field>
          <label for="${panelId}-code-font">Code font</label>
          <select id="${panelId}-code-font" name="codeFont">
            ${renderSelectOptions(CODE_FONT_OPTIONS, preferences.codeFont)}
          </select>
        </div>
      </div>
    </div>
  `;
}

export class DisplayPreferencesPopover extends HTMLElement {
  static {
    registerStyles("display-preferences-popover", styles);
    applyPreferencesToDocument(readPreferences());
    registerComponent("display-preferences-popover", DisplayPreferencesPopover);
  }

  connectedCallback() {
    if (this.dataset.ready === "true") {
      this.preferences = applyPreferencesToDocument(readPreferences());
      this.syncFormControls();
      return;
    }

    this.dataset.ready = "true";
    this._panelId = `display-preferences-${nextId}`;
    this._titleId = `${this._panelId}-title`;
    nextId += 1;
    this.preferences = applyPreferencesToDocument(readPreferences());

    this.render();

    this._toggle = this.querySelector("[data-toggle]");
    this._panel = this.querySelector("[data-panel]");
    this._closeButton = this.querySelector("[data-panel-close]");
    this._controls = [...this.querySelectorAll("input, select")];
    this._handleToggleClick = () => {
      if (!this._panel) return;

      if (supportsNativePopover) {
        this.positionPanel();

        if (this.isOpen()) {
          this._panel.hidePopover();
        } else {
          this._panel.showPopover();
        }

        return;
      }

      this.syncOpenState(!this.isOpen());
    };
    this._handleCloseClick = () => {
      if (!this._panel || !this.isOpen()) {
        return;
      }

      if (supportsNativePopover) {
        this._panel.hidePopover();
        return;
      }

      this.syncOpenState(false);
      this._toggle?.focus();
    };
    this._handleDocumentKeydown = (event) => {
      if (supportsNativePopover) return;
      if (event.key !== "Escape" || !this.isOpen()) return;

      this.syncOpenState(false);
      this._toggle?.focus();
    };
    this._handleDocumentPointerDown = (event) => {
      if (supportsNativePopover) return;
      if (!this.isOpen() || this.contains(event.target)) return;
      this.syncOpenState(false);
    };
    this._handlePanelToggle = (event) => {
      const isOpen = event.newState === "open";

      this.syncOpenState(isOpen);

      if (isOpen) {
        this.positionPanel();
        return;
      }

      this._toggle?.focus();
    };
    this._handleViewportChange = () => {
      if (this.isOpen()) {
        this.positionPanel();
      }
    };
    this._handlePreferenceChange = (event) => {
      const control = event.target.closest("input, select");

      if (!control || !this.contains(control)) return;

      this.preferences = writePreferences(this.readFormPreferences());
      this.preferences = applyPreferencesToDocument(this.preferences);
      this.syncChoiceState();
    };

    this._toggle?.addEventListener("click", this._handleToggleClick);
    this._closeButton?.addEventListener("click", this._handleCloseClick);
    this._panel?.addEventListener("toggle", this._handlePanelToggle);
    this.addEventListener("change", this._handlePreferenceChange);
    document.addEventListener("keydown", this._handleDocumentKeydown);
    document.addEventListener("pointerdown", this._handleDocumentPointerDown);
    document.addEventListener("click", this._handleDocumentPointerDown);
    window.addEventListener("resize", this._handleViewportChange, { passive: true });
    this.syncFormControls();
    this.syncOpenState(false);
  }

  disconnectedCallback() {
    this._toggle?.removeEventListener("click", this._handleToggleClick);
    this._closeButton?.removeEventListener("click", this._handleCloseClick);
    this._panel?.removeEventListener("toggle", this._handlePanelToggle);
    this.removeEventListener("change", this._handlePreferenceChange);
    document.removeEventListener("keydown", this._handleDocumentKeydown);
    document.removeEventListener("pointerdown", this._handleDocumentPointerDown);
    document.removeEventListener("click", this._handleDocumentPointerDown);
    window.removeEventListener("resize", this._handleViewportChange);
  }

  render() {
    const fallbackStateAttributes = supportsNativePopover ? "" : ' aria-hidden="true" hidden';

    this.innerHTML = `
      <div data-shell>
        <button
          type="button"
          data-toggle
          aria-controls="${this._panelId}"
          aria-expanded="false"
          aria-haspopup="dialog"
          aria-label="Open display preferences"
          title="Display preferences"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path
              d="M7 10 12 15 17 10"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        </button>
        <section
          id="${this._panelId}"
          data-panel
          popover="auto"
          role="dialog"
          aria-labelledby="${this._titleId}"
          ${fallbackStateAttributes}
        >
          <div data-panel-header>
            <p data-panel-eyebrow data-panel-kicker>Display</p>
            <h2 id="${this._titleId}">Display preferences</h2>
            <p data-panel-lede>Tune typography, motion, contrast, and radius without leaving the page.</p>
            <button type="button" data-panel-close aria-label="Close display preferences">X</button>
          </div>
          ${renderPanelSections(this._panelId, this.preferences)}
        </section>
      </div>
    `;
  }

  readFormPreferences() {
    return normalizePreferences({
      bodyFont: this.querySelector('select[name="bodyFont"]')?.value,
      codeFont: this.querySelector('select[name="codeFont"]')?.value,
      fontScale: this.querySelector('select[name="fontScale"]')?.value,
      headingFont: this.querySelector('select[name="headingFont"]')?.value,
      increaseContrast: this.querySelector('input[name="increaseContrast"]')?.checked,
      radiusPreset: this.querySelector('input[name="radiusPreset"]:checked')?.value,
      reduceAnimations: this.querySelector('input[name="reduceAnimations"]')?.checked,
      reduceMotion: this.querySelector('input[name="reduceMotion"]')?.checked,
      reduceTransparency: this.querySelector('input[name="reduceTransparency"]')?.checked,
    });
  }

  syncFormControls() {
    if (!this.dataset.ready || !this.isConnected) return;

    this.preferences = normalizePreferences(this.preferences || readPreferences());

    for (const control of this._controls || []) {
      if (control instanceof HTMLInputElement) {
        if (control.type === "checkbox") {
          control.checked = this.preferences[control.name] === true;
        }

        if (control.type === "radio") {
          control.checked = this.preferences[control.name] === control.value;
        }

        continue;
      }

      control.value = this.preferences[control.name] || control.value;
    }

    this.syncChoiceState();
  }

  syncChoiceState() {
    this.querySelectorAll("[data-choice]").forEach((choice) => {
      choice.dataset.selected = String(
        Boolean(choice.querySelector('input[type="radio"]:checked')),
      );
    });
  }

  isOpen() {
    return this.dataset.open === "true";
  }

  positionPanel() {
    if (!this._toggle || !this._panel) return;

    const rect = this._toggle.getBoundingClientRect();

    this._panel.style.setProperty("--popover-top", `${Math.round(rect.bottom + 8)}px`);
    this._panel.style.setProperty(
      "--popover-right",
      `${Math.max(16, Math.round(window.innerWidth - rect.right))}px`,
    );
  }

  syncOpenState(isOpen) {
    this.dataset.open = String(isOpen);
    this._toggle?.setAttribute("aria-expanded", String(isOpen));

    if (!this._panel) return;

    this._panel.dataset.open = String(isOpen);

    if (supportsNativePopover) {
      !isOpen && this._panel.matches(":popover-open") && this._panel.hidePopover();

      this._panel.removeAttribute("aria-hidden");
      this._panel.hidden = false;

      return;
    }

    this._panel.setAttribute("aria-hidden", String(!isOpen));
    this._panel.hidden = !isOpen;
  }
}

export {
  ACCESSIBILITY_OPTIONS,
  BODY_FONT_OPTIONS,
  CODE_FONT_OPTIONS,
  DEFAULT_PREFERENCES,
  FONT_SCALE_OPTIONS,
  HEADING_FONT_OPTIONS,
  RADIUS_PRESET_OPTIONS,
  STORAGE_KEY,
};
