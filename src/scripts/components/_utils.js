export function canAdoptStyleSheets() {
  return "adoptedStyleSheets" in document && "replaceSync" in CSSStyleSheet.prototype;
}

export function registerStyles(componentName, cssText) {
  if (document.head.querySelector(`style[data-component="${componentName}"]`)) return;

  if (canAdoptStyleSheets()) {
    try {
      const sheet = new CSSStyleSheet();

      sheet.replaceSync(cssText);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

      return;
    } catch {
      // Fallback for browsers where replaceSync rejects specific syntax (for example @property).
    }
  }

  const style = document.createElement("style");
  style.dataset.component = componentName;
  style.textContent = cssText;
  document.head.append(style);
}

export function registerComponent(name, elementClass) {
  !customElements.get(name) && customElements.define(name, elementClass);
}
