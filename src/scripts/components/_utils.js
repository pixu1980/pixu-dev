export function canAdoptStyleSheets() {
  return "adoptedStyleSheets" in document && "replaceSync" in CSSStyleSheet.prototype;
}

export function registerStyles(componentName, cssText) {
  if (canAdoptStyleSheets()) {
    const sheet = new CSSStyleSheet();

    sheet.replaceSync(cssText);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

    return;
  }

  if (document.head.querySelector(`style[data-component="${componentName}"]`)) return;

  const style = document.createElement("style");
  style.dataset.component = componentName;
  style.textContent = cssText;
  document.head.append(style);
}

export function registerComponent(name, elementClass) {
  !customElements.get(name) && customElements.define(name, elementClass);
}
