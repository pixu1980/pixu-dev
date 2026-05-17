(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`@layer components {
  color-scheme-selector {
    --selector-item-size: calc(var(--header-control-size) - (var(--space-1) * 2) - 2px);

    box-sizing: border-box;
    display: inline-flex;
    flex-wrap: nowrap;
    gap: var(--space-1);
    align-items: center;
    block-size: var(--header-control-size);
    min-block-size: var(--header-control-size);
    padding: var(--space-1);
    border: 1px solid var(--line);
    border-radius: var(--radius-2);
    background: color-mix(in srgb, var(--surface-2) 92%, transparent);

    &:focus-within {
      outline: var(--focus-outline);
      outline-offset: var(--focus-offset);
    }

    & label {
      position: relative;
      display: grid;
      place-items: center;
      inline-size: var(--selector-item-size);
      block-size: var(--selector-item-size);
      border-radius: var(--radius-1);
      color: var(--ink-muted);
      cursor: pointer;
      transition:
        background-color var(--duration-2) var(--ease-standard),
        color var(--duration-2) var(--ease-standard),
        transform var(--duration-2) var(--ease-standard);
    }

    & label:hover {
      color: var(--ink-strong);
      background: var(--surface-hover);
      transform: translateY(-1px);
    }

    & input {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: 0;
      opacity: 0;
      pointer-events: none;
    }

    & label:has(input:checked) {
      color: var(--accent-ink);
      background: var(--accent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-ink) 18%, transparent);
    }

    & [data-icon] {
      display: grid;
      place-items: center;
      inline-size: 1.1rem;
      block-size: 1.1rem;
    }

    & svg {
      inline-size: 100%;
      block-size: 100%;
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.8;
    }

    & [data-label] {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }
}
`;function t(){return`adoptedStyleSheets`in document&&`replaceSync`in CSSStyleSheet.prototype}function n(e,n){if(document.head.querySelector(`style[data-component="${e}"]`))return;if(t())try{let e=new CSSStyleSheet;e.replaceSync(n),document.adoptedStyleSheets=[...document.adoptedStyleSheets,e];return}catch{}let r=document.createElement(`style`);r.dataset.component=e,r.textContent=n,document.head.append(r)}function r(e,t){!customElements.get(e)&&customElements.define(e,t)}var i=`pixu:color-scheme`,a=document.documentElement,o=window.matchMedia(`(prefers-color-scheme: dark)`),s=[{value:`light`,label:`Light`,icon:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"></path></svg>`},{value:`dark`,label:`Dark`,icon:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.5 14.4A8.2 8.2 0 0 1 9.6 3.5a8.6 8.6 0 1 0 10.9 10.9Z"></path></svg>`},{value:`system`,label:`System`,icon:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8M12 16v4"></path></svg>`}],c=0;function l(){try{let e=window.localStorage.getItem(i);return s.some(t=>t.value===e)?e:`system`}catch{return`system`}}function u(e){return e===`system`?o.matches?`dark`:`light`:e}function d(e){let t=u(e);a.dataset.colorScheme=e,a.dataset.resolvedScheme=t,a.style.colorScheme=t}(class t extends HTMLElement{static{n(`color-scheme-selector`,e),r(`color-scheme-selector`,t)}connectedCallback(){if(this.dataset.ready===`true`)return;this.dataset.ready=`true`,this.setAttribute(`role`,`radiogroup`),this.setAttribute(`aria-label`,`Color scheme`),this._handleSystemChange=()=>{this.value===`system`&&d(`system`)};let e=`color-scheme-${c}`;c+=1;for(let t of s){let n=document.createElement(`label`);n.dataset.option=t.value,n.setAttribute(`aria-label`,t.label),n.innerHTML=`<input type="radio" name="${e}" value="${t.value}" ${l()===t.value?`checked`:``} /><span data-icon aria-hidden="true">${t.icon}</span><span data-label>${t.label}</span>`,this.append(n)}this.addEventListener(`change`,this),typeof o.addEventListener==`function`?o.addEventListener(`change`,this._handleSystemChange):typeof o.addListener==`function`&&o.addListener(this._handleSystemChange),d(this.value)}disconnectedCallback(){this.removeEventListener(`change`,this),typeof o.removeEventListener==`function`?o.removeEventListener(`change`,this._handleSystemChange):typeof o.removeListener==`function`&&o.removeListener(this._handleSystemChange)}get value(){return this.querySelector(`input:checked`)?.value||`system`}handleEvent(e){let t=e.target.closest(`input[type='radio']`);if(!(e.type!==`change`||!t||!this.contains(t))){try{t.value===`system`?window.localStorage.removeItem(i):window.localStorage.setItem(i,t.value)}catch{}d(t.value)}}});var f=`@layer components {
  accent-color-selector {
    --selector-item-size: calc(var(--header-control-size) - (var(--space-1) * 2) - 2px);

    box-sizing: border-box;
    display: inline-flex;
    flex-wrap: nowrap;
    gap: var(--space-1);
    align-items: center;
    block-size: var(--header-control-size);
    min-block-size: var(--header-control-size);
    padding: var(--space-1);
    border: 1px solid var(--line);
    border-radius: var(--radius-2);
    background: color-mix(in srgb, var(--surface-2) 92%, transparent);

    &:focus-within {
      outline: var(--focus-outline);
      outline-offset: var(--focus-offset);
    }

    & label {
      position: relative;
      display: grid;
      place-items: center;
      inline-size: var(--selector-item-size);
      block-size: var(--selector-item-size);
      border-radius: var(--radius-1);
      color: var(--ink-muted);
      cursor: pointer;
      transition:
        background-color var(--duration-2) var(--ease-standard),
        transform var(--duration-2) var(--ease-standard);
    }

    & label:hover {
      background: var(--surface-hover);
      transform: translateY(-1px);
    }

    & input {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: 0;
      opacity: 0;
      pointer-events: none;
    }

    & label:has(input:checked) {
      background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--accent) 36%, transparent),
        0 0 0 1px var(--ink-strong);
    }

    & [data-swatch] {
      position: relative;
      inline-size: 1.85rem;
      block-size: 1.85rem;
      overflow: hidden;
      border: 2px solid color-mix(in srgb, var(--ink-strong) 72%, transparent);
      border-radius: var(--radius-round);
      background: var(--swatch-color);
      box-shadow:
        inset 0 0 0 1px rgb(0 0 0 / 0.22),
        0 0 0 1px rgb(0 0 0 / 0.28),
        0 8px 16px rgb(0 0 0 / 0.18);
      filter: saturate(1.2);
    }

    & [data-label] {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }
}
`,p=`pixu:accent-color`,m=document.documentElement,h=[{value:`blue`,label:`Blue`,color:`#0072b2`},{value:`green`,label:`Green`,color:`#007a5a`},{value:`orange`,label:`Orange`,color:`#b94700`},{value:`purple`,label:`Purple`,color:`#6d55b8`},{value:`rose`,label:`Rose`,color:`#9b3d73`}],g=0;function ee(){try{let e=window.localStorage.getItem(p);return h.some(t=>t.value===e)?e:`blue`}catch{return`blue`}}function te(e){try{window.localStorage.setItem(p,e)}catch{}}(class e extends HTMLElement{static{n(`accent-color-selector`,f),r(`accent-color-selector`,e)}connectedCallback(){if(this.dataset.ready===`true`)return;this.dataset.ready=`true`,this.setAttribute(`role`,`radiogroup`),this.setAttribute(`aria-label`,`Accent color`);let e=`accent-color-${g}`;g+=1;for(let t of h){let n=document.createElement(`label`);n.dataset.option=t.value,n.style.setProperty(`--swatch-color`,t.color),n.setAttribute(`aria-label`,t.label),n.innerHTML=`<input type="radio" name="${e}" value="${t.value}" ${ee()===t.value?`checked`:``} /><span data-swatch aria-hidden="true"></span><span data-label>${t.label}</span>`,this.append(n)}this.addEventListener(`change`,this),m.dataset.accent=this.value}disconnectedCallback(){this.removeEventListener(`change`,this)}get value(){return this.querySelector(`input:checked`)?.value||`blue`}handleEvent(e){let t=e.target.closest(`input[type='radio']`);e.type!==`change`||!t||!this.contains(t)||(te(t.value),m.dataset.accent=t.value)}});var _=`@layer components {
  display-preferences-popover {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-block-size: var(--header-control-size);
  }

  display-preferences-popover .preferences-shell {
    position: relative;
    display: inline-flex;
  }

  display-preferences-popover [data-toggle] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--header-control-size);
    block-size: var(--header-control-size);
    min-block-size: var(--header-control-size);
    padding: 0;
    border: 1px solid var(--line);
    border-radius: var(--radius-2);
    background: color-mix(in srgb, var(--surface-2) 92%, transparent);
    color: var(--ink-strong);
    cursor: pointer;
    transition:
      border-color var(--duration-2) var(--ease-standard),
      background-color var(--duration-2) var(--ease-standard),
      color var(--duration-2) var(--ease-standard),
      transform var(--duration-2) var(--ease-standard);
  }

  display-preferences-popover [data-toggle]:hover {
    border-color: color-mix(in srgb, var(--accent) 36%, var(--line));
    background: color-mix(in srgb, var(--accent) 10%, var(--surface-2));
    transform: translateY(-1px);
  }

  display-preferences-popover [data-toggle]:focus-visible {
    outline: var(--focus-outline);
    outline-offset: var(--focus-offset);
  }

  display-preferences-popover[data-open="true"] [data-toggle] {
    border-color: color-mix(in srgb, var(--accent) 44%, var(--line));
    background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
    color: var(--accent);
  }

  display-preferences-popover svg {
    inline-size: 1rem;
    block-size: 1rem;
    transition: transform var(--duration-2) var(--ease-standard);
  }

  display-preferences-popover[data-open="true"] svg {
    transform: rotate(180deg);
  }

  display-preferences-popover [data-panel] {
    position: absolute;
    top: calc(100% + var(--space-2));
    right: 0;
    z-index: 24;
    display: none;
    gap: 0.85rem;
    inline-size: min(30rem, calc(100vw - (var(--gutter) * 2)));
    max-block-size: min(78vh, 44rem);
    margin: 0;
    padding: 1rem;
    overflow: auto;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-3);
    background: color-mix(in srgb, var(--surface-2) 94%, transparent);
    box-shadow: var(--shadow);
    backdrop-filter: blur(18px);
    opacity: 0;
    transform: translateY(-0.35rem);
    transition:
      opacity var(--duration-2) var(--ease-standard),
      transform var(--duration-2) var(--ease-standard);
  }

  display-preferences-popover [data-panel][hidden] {
    display: none !important;
  }

  display-preferences-popover [data-panel][data-open="true"] {
    display: grid;
    opacity: 1;
    transform: translateY(0);
  }

  display-preferences-popover [data-panel-header] {
    display: grid;
    gap: 0.35rem;
  }

  display-preferences-popover .preferences-panel__eyebrow {
    color: var(--accent-2);
    font-size: 0.76rem;
    font-weight: 850;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  display-preferences-popover :where(h2, h3, legend, p) {
    margin: 0;
  }

  display-preferences-popover h2 {
    font-size: clamp(1.1rem, 1rem + 0.4vw, 1.35rem);
  }

  display-preferences-popover .preferences-panel__lede,
  display-preferences-popover .preferences-group__title p,
  display-preferences-popover .preferences-checkbox__hint,
  display-preferences-popover .preferences-choice__hint {
    color: var(--ink-muted);
    font-size: 0.92rem;
    line-height: 1.5;
  }

  display-preferences-popover .preferences-group,
  display-preferences-popover .preferences-group--fieldset {
    display: grid;
    gap: 0.85rem;
    padding: 0.95rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-2);
    background: color-mix(in srgb, var(--surface-2) 88%, transparent);
  }

  display-preferences-popover .preferences-group__title {
    display: grid;
    gap: 0.2rem;
  }

  display-preferences-popover .preferences-group__title h3,
  display-preferences-popover .preferences-group--fieldset legend {
    font-size: 1rem;
    color: var(--ink-strong);
  }

  display-preferences-popover .preferences-group--fieldset {
    min-width: 0;
    margin: 0;
    padding-top: 0.8rem;
  }

  display-preferences-popover .preferences-group--fieldset legend {
    padding: 0 0.25rem;
  }

  display-preferences-popover .preferences-checklist {
    display: grid;
    gap: 0.65rem;
  }

  display-preferences-popover .preferences-choice-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }

  display-preferences-popover .preferences-choice {
    position: relative;
    display: grid;
    gap: 0.65rem;
    align-content: start;
    padding: 0.8rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-2);
    background: color-mix(in srgb, var(--surface-3) 72%, transparent);
    color: var(--ink-strong);
    cursor: pointer;
    transition:
      border-color var(--duration-2) var(--ease-standard),
      background-color var(--duration-2) var(--ease-standard),
      box-shadow var(--duration-2) var(--ease-standard),
      transform var(--duration-2) var(--ease-standard);
  }

  display-preferences-popover .preferences-choice:hover {
    border-color: color-mix(in srgb, var(--accent) 26%, var(--line));
    transform: translateY(-1px);
  }

  display-preferences-popover .preferences-choice[data-selected="true"],
  display-preferences-popover .preferences-choice:has(input:checked) {
    border-color: color-mix(in srgb, var(--accent) 44%, var(--line));
    background: color-mix(in srgb, var(--accent) 12%, var(--surface-3));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent);
  }

  display-preferences-popover .preferences-choice input[type="radio"] {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  display-preferences-popover .preferences-choice__preview {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;
  }

  display-preferences-popover .preferences-choice__preview span {
    display: block;
    min-block-size: 2.4rem;
    border: 1px solid var(--line);
    background: color-mix(in srgb, var(--surface-3) 74%, var(--accent) 18%);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-2) 85%, transparent);
  }

  display-preferences-popover .preferences-choice__preview span:last-child {
    min-block-size: 1.6rem;
    align-self: end;
  }

  display-preferences-popover [data-radius-preview="square"] span {
    border-radius: 0;
  }

  display-preferences-popover [data-radius-preview="rounded"] span {
    border-radius: 4px;
  }

  display-preferences-popover [data-radius-preview="squircle"] span {
    border-radius: 1rem;
  }

  display-preferences-popover .preferences-choice__copy {
    display: grid;
    gap: 0.2rem;
  }

  display-preferences-popover .preferences-choice__label,
  display-preferences-popover .preferences-checkbox__label {
    font-weight: 700;
  }

  display-preferences-popover .preferences-checkbox {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: start;
    gap: 0.75rem;
    padding: 0.25rem 0;
  }

  display-preferences-popover .preferences-checkbox input {
    inline-size: 1.05rem;
    block-size: 1.05rem;
    margin-block-start: 0.2rem;
  }

  display-preferences-popover .preferences-checkbox__copy {
    display: grid;
    gap: 0.12rem;
    cursor: pointer;
  }

  display-preferences-popover .preferences-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
  }

  display-preferences-popover .preferences-field {
    display: grid;
    gap: 0.35rem;
  }

  display-preferences-popover .preferences-field label {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--ink-strong);
  }

  display-preferences-popover .preferences-field select {
    min-block-size: 2.9rem;
    padding-inline: 0.75rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-2);
    background: color-mix(in srgb, var(--surface-3) 76%, transparent);
    color: var(--ink-strong);
    font: inherit;
  }

  display-preferences-popover accent-color-selector {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: var(--space-1);
    align-items: center;
    justify-self: start;
    position: relative;
    z-index: 1;
  }

  :root[data-radius-preset="square"] {
    --radius: 0;
    --radius-1: 0;
    --radius-2: 0;
    --radius-3: 0;
  }

  :root[data-radius-preset="rounded"] {
    --radius: 8px;
    --radius-1: 4px;
    --radius-2: 8px;
    --radius-3: 12px;
  }

  :root[data-radius-preset="squircle"] {
    --radius: 14px;
    --radius-1: 10px;
    --radius-2: 14px;
    --radius-3: 20px;
  }

  :root[data-increase-contrast="true"] {
    --ink-muted: #e7dfcd;
    --ink-soft: #cfc6b0;
    --line: rgb(247 243 231 / 0.28);
    --line-strong: rgb(247 243 231 / 0.46);
    --surface-hover: rgb(255 255 255 / 0.12);
  }

  :root[data-reduce-transparency="true"]
    :where([data-header], [data-portrait] figcaption, display-preferences-popover [data-panel]) {
    backdrop-filter: none !important;
    background: color-mix(in srgb, var(--surface-2) 98%, transparent);
  }

  :root[data-reduce-motion="true"]
    display-preferences-popover
    :where(
      .preferences-toggle,
      .preferences-toggle svg,
      .preferences-panel,
      .preferences-choice:hover
    ) {
    transform: none !important;
    transition: none !important;
  }

  @media (max-width: 42rem) {
    display-preferences-popover [data-panel] {
      right: auto;
      left: min(0px, calc((100vw - 100%) * -1));
      inline-size: min(26rem, calc(100vw - var(--gutter)));
    }

    display-preferences-popover .preferences-choice-grid,
    display-preferences-popover .preferences-grid {
      grid-template-columns: 1fr;
    }
  }
}
`,v=`pixu:display-preferences`,y=[`75%`,`80%`,`90%`,`100%`,`110%`,`120%`,`125%`],b=[{description:`Zero radius across cards and controls.`,id:`square`,label:`Square`},{description:`The default rounded interface.`,id:`rounded`,label:`Rounded`},{description:`A softer silhouette with larger curves.`,id:`squircle`,label:`Squircle`}],x=[{attribute:`data-reduce-motion`,description:`Tone down movement-heavy interactions.`,label:`Reduce motion`,name:`reduceMotion`},{attribute:`data-reduce-animations`,description:`Minimize reveals, fades, and transitions.`,label:`Reduce animations`,name:`reduceAnimations`},{attribute:`data-reduce-transparency`,description:`Swap glass effects for solid surfaces.`,label:`Reduce transparency`,name:`reduceTransparency`},{attribute:`data-increase-contrast`,description:`Boost surface and text separation.`,label:`Increase contrast`,name:`increaseContrast`}],S=[{id:`avenir-humanist`,label:`Avenir Humanist`,stack:`"Avenir Next", Inter, "Segoe UI Variable Text", "Helvetica Neue", sans-serif`},{id:`editorial-serif`,label:`Editorial Serif`,stack:`"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif`},{id:`system-sans`,label:`System Sans`,stack:`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`},{id:`book-serif`,label:`Book Serif`,stack:`Baskerville, "Times New Roman", Georgia, serif`}],C=[{id:`inter-sans`,label:`Inter Sans`,stack:`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`},{id:`humanist-sans`,label:`Humanist Sans`,stack:`"Avenir Next", Inter, "Segoe UI Variable Text", "Helvetica Neue", sans-serif`},{id:`book-serif`,label:`Book Serif`,stack:`Georgia, Cambria, "Times New Roman", serif`},{id:`editorial-serif`,label:`Editorial Serif`,stack:`"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif`}],w=[{id:`plex-mono`,label:`Plex Mono`,stack:`"IBM Plex Mono", "SFMono-Regular", "Cascadia Code", Consolas, monospace`},{id:`system-mono`,label:`System Mono`,stack:`ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`},{id:`classic-mono`,label:`Classic Mono`,stack:`"Courier New", Courier, monospace`}],T={bodyFont:C,codeFont:w,headingFont:S},E=Object.freeze({bodyFont:`inter-sans`,codeFont:`plex-mono`,fontScale:`100%`,headingFont:`avenir-humanist`,increaseContrast:!1,radiusPreset:`rounded`,reduceAnimations:!1,reduceMotion:!1,reduceTransparency:!1}),D=0;function O(){try{return window.localStorage}catch{return null}}function k(e,t){let n=T[e]||[];return n.find(e=>e.id===t)||n[0]}function A(e){return b.find(t=>t.id===e)||b.find(e=>e.id===E.radiusPreset)}function j(e={}){let t=e&&typeof e==`object`?e:{};return{bodyFont:k(`bodyFont`,t.bodyFont).id,codeFont:k(`codeFont`,t.codeFont).id,fontScale:y.includes(t.fontScale)?t.fontScale:E.fontScale,headingFont:k(`headingFont`,t.headingFont).id,increaseContrast:t.increaseContrast===!0,radiusPreset:A(t.radiusPreset).id,reduceAnimations:t.reduceAnimations===!0,reduceMotion:t.reduceMotion===!0,reduceTransparency:t.reduceTransparency===!0}}function M(){let e=O()?.getItem(v);if(!e)return{...E};try{return j(JSON.parse(e))}catch{return{...E}}}function N(e){let t=j(e);return O()?.setItem(v,JSON.stringify(t)),t}function P(e,t,n){if(n){e.setAttribute(t,`true`);return}e.removeAttribute(t)}function F(e){let t=j(e);if(typeof document>`u`)return t;let n=document.documentElement;return n?(x.forEach(e=>{P(n,e.attribute,t[e.name])}),t.fontScale===E.fontScale?n.style.removeProperty(`font-size`):n.style.fontSize=t.fontScale,n.style.setProperty(`--font-display`,k(`headingFont`,t.headingFont).stack),n.style.setProperty(`--font-body`,k(`bodyFont`,t.bodyFont).stack),n.style.setProperty(`--font-mono`,k(`codeFont`,t.codeFont).stack),n.setAttribute(`data-radius-preset`,t.radiusPreset),t):t}function I(e,t){return e.map(e=>{let n=e.id===t?` selected`:``;return`<option value="${e.id}"${n}>${e.label}</option>`}).join(``)}function ne(e){return y.map(t=>`<option value="${t}"${t===e?` selected`:``}>${t}</option>`).join(``)}function re(e,t){return b.map(n=>{let r=n.id===t?` checked`:``,i=`${e}-radius-${n.id}`;return`
      <label class="preferences-choice" for="${i}">
        <input id="${i}" type="radio" name="radiusPreset" value="${n.id}"${r} />
        <span class="preferences-choice__preview" data-radius-preview="${n.id}" aria-hidden="true">
          <span></span>
          <span></span>
        </span>
        <span class="preferences-choice__copy">
          <span class="preferences-choice__label">${n.label}</span>
          <span class="preferences-choice__hint">${n.description}</span>
        </span>
      </label>
    `}).join(``)}function ie(e,t){return x.map(n=>{let r=t[n.name]?` checked`:``,i=`${e}-${n.name}`;return`
      <div class="preferences-checkbox">
        <input id="${i}" type="checkbox" name="${n.name}"${r} />
        <label class="preferences-checkbox__copy" for="${i}">
          <span class="preferences-checkbox__label">${n.label}</span>
          <span class="preferences-checkbox__hint">${n.description}</span>
        </label>
      </div>
    `}).join(``)}(class e extends HTMLElement{static{n(`display-preferences-popover`,_),F(M()),r(`display-preferences-popover`,e)}connectedCallback(){if(this.dataset.ready===`true`){this.preferences=F(M()),this.syncFormControls();return}this.dataset.ready=`true`,this._panelId=`display-preferences-${D}`,this._titleId=`${this._panelId}-title`,D+=1,this.preferences=F(M()),this.render(),this._toggle=this.querySelector(`[data-toggle]`),this._panel=this.querySelector(`[data-panel]`),this._controls=[...this.querySelectorAll(`input, select`)],this._handleToggleClick=()=>{this.syncOpenState(!this.isOpen())},this._handleDocumentKeydown=e=>{e.key!==`Escape`||!this.isOpen()||(this.syncOpenState(!1),this._toggle?.focus())},this._handleDocumentPointerDown=e=>{!this.isOpen()||this.contains(e.target)||this.syncOpenState(!1)},this._handlePreferenceChange=e=>{let t=e.target.closest(`input, select`);!t||!this.contains(t)||(this.preferences=N(this.readFormPreferences()),this.preferences=F(this.preferences),this.syncChoiceState())},this._toggle?.addEventListener(`click`,this._handleToggleClick),this.addEventListener(`change`,this._handlePreferenceChange),document.addEventListener(`keydown`,this._handleDocumentKeydown),document.addEventListener(`pointerdown`,this._handleDocumentPointerDown),document.addEventListener(`click`,this._handleDocumentPointerDown),this.syncFormControls(),this.syncOpenState(!1)}disconnectedCallback(){this._toggle?.removeEventListener(`click`,this._handleToggleClick),this.removeEventListener(`change`,this._handlePreferenceChange),document.removeEventListener(`keydown`,this._handleDocumentKeydown),document.removeEventListener(`pointerdown`,this._handleDocumentPointerDown),document.removeEventListener(`click`,this._handleDocumentPointerDown)}render(){this.innerHTML=`
      <div class="preferences-shell">
        <button
          type="button"
          class="preferences-toggle"
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
          class="preferences-panel"
          data-panel
          role="dialog"
          aria-labelledby="${this._titleId}"
          aria-hidden="true"
          hidden
        >
          <div class="preferences-panel__header" data-panel-header>
            <p class="preferences-panel__eyebrow" data-panel-kicker>Display</p>
            <h2 id="${this._titleId}">Display preferences</h2>
            <p class="preferences-panel__lede">Tune typography, motion, contrast, and radius without leaving the page.</p>
          </div>

          <div class="preferences-group">
            <div class="preferences-group__title">
              <h3>Accent color</h3>
              <p>Choose the palette used for links, actions, focus, and highlights.</p>
            </div>
            <accent-color-selector></accent-color-selector>
          </div>

          <section
            class="preferences-group preferences-group--fieldset"
            role="group"
            aria-labelledby="${this._panelId}-corners-title"
          >
            <div class="preferences-group__title">
              <h3 id="${this._panelId}-corners-title">Corner style</h3>
              <p>Choose how rounded cards and controls should feel.</p>
            </div>
            <div class="preferences-choice-grid">
              ${re(this._panelId,this.preferences.radiusPreset)}
            </div>
          </section>

          <div class="preferences-group">
            <div class="preferences-group__title">
              <h3>Accessibility</h3>
              <p>Reduce friction when you want a calmer, sharper interface.</p>
            </div>
            <div class="preferences-checklist">
              ${ie(this._panelId,this.preferences)}
            </div>
          </div>

          <div class="preferences-group">
            <div class="preferences-group__title">
              <h3>Typography</h3>
              <p>Adjust scale and font stacks across headings, body copy, and code.</p>
            </div>
            <div class="preferences-grid">
              <div class="preferences-field">
                <label for="${this._panelId}-font-scale">Font scale</label>
                <select id="${this._panelId}-font-scale" name="fontScale">
                  ${ne(this.preferences.fontScale)}
                </select>
              </div>
              <div class="preferences-field">
                <label for="${this._panelId}-heading-font">Heading font</label>
                <select id="${this._panelId}-heading-font" name="headingFont">
                  ${I(S,this.preferences.headingFont)}
                </select>
              </div>
              <div class="preferences-field">
                <label for="${this._panelId}-body-font">Body font</label>
                <select id="${this._panelId}-body-font" name="bodyFont">
                  ${I(C,this.preferences.bodyFont)}
                </select>
              </div>
              <div class="preferences-field">
                <label for="${this._panelId}-code-font">Code font</label>
                <select id="${this._panelId}-code-font" name="codeFont">
                  ${I(w,this.preferences.codeFont)}
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    `}readFormPreferences(){return j({bodyFont:this.querySelector(`select[name="bodyFont"]`)?.value,codeFont:this.querySelector(`select[name="codeFont"]`)?.value,fontScale:this.querySelector(`select[name="fontScale"]`)?.value,headingFont:this.querySelector(`select[name="headingFont"]`)?.value,increaseContrast:this.querySelector(`input[name="increaseContrast"]`)?.checked,radiusPreset:this.querySelector(`input[name="radiusPreset"]:checked`)?.value,reduceAnimations:this.querySelector(`input[name="reduceAnimations"]`)?.checked,reduceMotion:this.querySelector(`input[name="reduceMotion"]`)?.checked,reduceTransparency:this.querySelector(`input[name="reduceTransparency"]`)?.checked})}syncFormControls(){if(!(!this.dataset.ready||!this.isConnected)){this.preferences=j(this.preferences||M());for(let e of this._controls||[]){if(e instanceof HTMLInputElement){e.type===`checkbox`&&(e.checked=this.preferences[e.name]===!0),e.type===`radio`&&(e.checked=this.preferences[e.name]===e.value);continue}e.value=this.preferences[e.name]||e.value}this.syncChoiceState()}}syncChoiceState(){this.querySelectorAll(`.preferences-choice`).forEach(e=>{e.dataset.selected=String(!!e.querySelector(`input[type="radio"]:checked`))})}isOpen(){return this.dataset.open===`true`}syncOpenState(e){this.dataset.open=String(e),this._toggle?.setAttribute(`aria-expanded`,String(e)),this._panel&&(this._panel.dataset.open=String(e),this._panel.setAttribute(`aria-hidden`,String(!e)),this._panel.hidden=!e)}});var ae=`@layer components {
  @layer skip-link {
    skip-link {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      display: inline-block;
      padding: var(--space-2);
      border-radius: var(--radius);
      background: var(--accent);
      color: var(--accent-ink);
      text-decoration: none;
      font-weight: 600;
      z-index: 10000;
      transform: translateY(calc(-100% - 0.5rem));
      transition: transform var(--duration-2) var(--ease-standard);

      &:focus {
        transform: translateY(0);
        outline: var(--focus-outline);
        outline-offset: var(--focus-offset);
      }
    }
  }
}
`;(class e extends HTMLElement{static{n(`skip-link`,ae),r(`skip-link`,e)}connectedCallback(){this.dataset.ready!==`true`&&(this.dataset.ready=`true`,this.setAttribute(`role`,`link`),this.setAttribute(`tabindex`,`0`),this.textContent.trim()||(this.textContent=`Skip to content`),this._handleSkip=e=>{if(e.type!==`click`&&!(e.type===`keydown`&&e.key===`Enter`))return;let t=document.getElementById((this.getAttribute(`href`)||`#main`).slice(1));t&&(e.preventDefault(),t.tabIndex=-1,t.focus(),t.addEventListener(`blur`,()=>t.removeAttribute(`tabindex`),{once:!0}))},this.addEventListener(`click`,this._handleSkip),this.addEventListener(`keydown`,this._handleSkip))}disconnectedCallback(){this.removeEventListener(`click`,this._handleSkip),this.removeEventListener(`keydown`,this._handleSkip)}});var oe=`@property --scroll-progress-value {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}

@layer components {
  scroll-progress {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    width: 100vw;
    height: 4px;
    background: color-mix(in srgb, var(--accent) 22%, transparent);
    pointer-events: none;
    z-index: 9999;
  }

  scroll-progress::before {
    content: "";
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    background: var(--accent);
    transform-origin: left center;
    transform: scaleX(var(--scroll-progress-value));
    will-change: transform;
  }
}
`;function L(e){return Math.min(Math.max(e,0),1)}(class e extends HTMLElement{static{n(`scroll-progress`,oe),r(`scroll-progress`,e)}connectedCallback(){this.dataset.ready!==`true`&&(this.dataset.ready=`true`,this.setAttribute(`aria-hidden`,`true`),this._currentProgress=0,this._targetProgress=0,this._frame=0,this._commitProgress=e=>{let t=L(e);this.style.setProperty(`--scroll-progress-value`,t.toFixed(4))},this._readTargetProgress=()=>{let e=document.documentElement.scrollHeight-window.innerHeight;return e>0?L(window.scrollY/e):0},this._shouldReduceMotion=()=>document.documentElement.hasAttribute(`data-reduce-motion`)||window.matchMedia?.(`(prefers-reduced-motion: reduce)`)?.matches===!0,this._stepProgress=()=>{let e=this._targetProgress-this._currentProgress;if(Math.abs(e)<=.001||this._shouldReduceMotion()){this._currentProgress=this._targetProgress,this._commitProgress(this._currentProgress),this._frame=0;return}this._currentProgress+=e*.18,this._commitProgress(this._currentProgress),this._frame=window.requestAnimationFrame(this._stepProgress)},this._updateProgress=()=>{if(this._targetProgress=this._readTargetProgress(),this._shouldReduceMotion()){this._currentProgress=this._targetProgress,this._commitProgress(this._currentProgress),this._frame&&=(window.cancelAnimationFrame(this._frame),0);return}this._frame||=window.requestAnimationFrame(this._stepProgress)},window.addEventListener(`scroll`,this._updateProgress,{passive:!0}),window.addEventListener(`resize`,this._updateProgress,{passive:!0}),this._updateProgress())}disconnectedCallback(){window.removeEventListener(`scroll`,this._updateProgress),window.removeEventListener(`resize`,this._updateProgress),this._frame&&=(window.cancelAnimationFrame(this._frame),0)}});var R=`@layer components {
  pointer-glow {
    position: fixed;
    top: calc(var(--y, 50vh) - 10rem);
    left: calc(var(--x, 50vw) - 10rem);
    width: 20rem;
    height: 20rem;
    pointer-events: none;
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    filter: blur(4rem);
    will-change: top, left;
    opacity: 0.35;
    z-index: 1;
  }
}
`;(class e extends HTMLElement{static{n(`pointer-glow`,R),r(`pointer-glow`,e)}connectedCallback(){this.dataset.ready!==`true`&&(this.dataset.ready=`true`,this.setAttribute(`aria-hidden`,`true`),!window.matchMedia(`(pointer: coarse)`).matches&&(this._handleMove=e=>{this.style.setProperty(`--x`,`${e.clientX}px`),this.style.setProperty(`--y`,`${e.clientY}px`)},window.addEventListener(`pointermove`,this._handleMove,{passive:!0})))}disconnectedCallback(){window.removeEventListener(`pointermove`,this._handleMove)}});var z=document.documentElement,B=document.querySelector(`[data-header]`),V=document.querySelector(`[data-nav]`),H=document.querySelector(`[data-nav-toggle]`),U=Array.from(document.querySelectorAll(`[data-nav-link]`)),W=Array.from(document.querySelectorAll(`main > section[id]`)),G=document.querySelector(`[data-live-region]`),K=window.matchMedia(`(max-width: 992px)`),q=``,J=``;function se(e){G&&(G.textContent=``,window.requestAnimationFrame(()=>{G.textContent=e}))}function Y(){return Math.ceil((B?.getBoundingClientRect().height||0)+24)}function X(e,t={}){if(!(!V||!H)){if(!K.matches){z.dataset.navState=`open`,H.setAttribute(`aria-expanded`,`false`),V.inert=!1;return}z.dataset.navState=e?`open`:`closed`,H.setAttribute(`aria-expanded`,String(e)),V.inert=!e,t.focusToggle&&H.focus(),t.announce&&se(e?`Navigation opened`:`Navigation closed`)}}function Z(){let e=K.matches?`mobile`:`desktop`;z.dataset.navMode=e,e!==J&&X(e===`desktop`),J=e}function Q(){let e=Y()+16,t=window.scrollY+e,n=W.map(e=>({id:e.id,top:e.offsetTop,bottom:e.offsetTop+e.offsetHeight})).filter(e=>e.top<=t&&e.bottom>t).sort((e,t)=>t.top-e.top);return n[0]?n[0].id:W.map(e=>({id:e.id,top:e.offsetTop})).filter(e=>e.top<=t).sort((e,t)=>t.top-e.top)[0]?.id||W[0]?.id||``}function $(){let e=Q();!e||e===q||(q=e,U.forEach(t=>{let n=t.getAttribute(`href`)===`#${e}`;t.toggleAttribute(`aria-current`,n),t.dataset.active=String(n)}))}function ce(e){let t=e.target.closest(`a[href^="#"]`);if(!t)return;let n=document.getElementById(t.getAttribute(`href`).slice(1));if(!n)return;e.preventDefault();let r=Math.max(n.offsetTop-Y(),0);window.history.pushState(null,``,`#${n.id}`),window.scrollTo({top:r,behavior:`smooth`}),K.matches&&X(!1)}function le(){let e=Array.from(document.querySelectorAll(`[data-reveal]`));if(!e.length)return;z.dataset.revealReady=`true`;let t=typeof CSS<`u`&&typeof CSS.supports==`function`&&CSS.supports(`animation-timeline: view(block)`),n=new Set(e),r=0,i;function a(e){e.dataset.visible!==`true`&&(e.dataset.visible=`true`,n.delete(e),i?.unobserve(e))}function o(e){let t=e.getBoundingClientRect(),n=window.innerHeight||document.documentElement.clientHeight||0;return t.top<=n*.9&&t.bottom>=n*.08}function s(){window.removeEventListener(`scroll`,l),window.removeEventListener(`resize`,l),i?.disconnect()}function c(){r=0,n.forEach(e=>{o(e)&&a(e)}),n.size||s()}function l(){r||=window.requestAnimationFrame(c)}if(e.forEach((e,t)=>{e.style.setProperty(`--reveal-order`,String(t%6))}),t){e.forEach(a);return}if(!(`IntersectionObserver`in window)){e.forEach(a);return}i=new IntersectionObserver(e=>{e.forEach(e=>{!e.isIntersecting&&!o(e.target)||a(e.target)}),n.size||s()},{rootMargin:`0px 0px -12% 0px`,threshold:[0,.12]}),e.forEach(e=>{if(o(e)){a(e);return}i.observe(e)}),window.addEventListener(`scroll`,l,{passive:!0}),window.addEventListener(`resize`,l,{passive:!0}),l()}function ue(){document.querySelectorAll(`a[target="_blank"]`).forEach(e=>{let t=new Set(String(e.getAttribute(`rel`)||``).split(/\s+/).filter(Boolean));t.add(`noopener`),t.add(`noreferrer`),e.setAttribute(`rel`,Array.from(t).join(` `))})}H?.addEventListener(`click`,()=>{X(z.dataset.navState!==`open`,{announce:!0})}),V?.addEventListener(`click`,ce),document.addEventListener(`keydown`,e=>{e.key!==`Escape`||!K.matches||z.dataset.navState!==`open`||(e.preventDefault(),X(!1,{focusToggle:!0,announce:!0}))}),window.addEventListener(`scroll`,()=>{$()},{passive:!0}),window.addEventListener(`resize`,()=>{Z(),$()},{passive:!0}),typeof K.addEventListener==`function`?K.addEventListener(`change`,Z):typeof K.addListener==`function`&&K.addListener(Z),Z(),ue(),le(),$();