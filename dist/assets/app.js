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
    --selector-swatch-size: 1.85rem;

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

    label {
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

      &:hover {
        background: var(--surface-hover);
        transform: translateY(-1px);
      }

      &:has(input:checked) {
        background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
        box-shadow:
          inset 0 0 0 1px color-mix(in srgb, var(--accent) 36%, transparent),
          0 0 0 1px var(--ink-strong);
      }
    }

    input {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: 0;
      opacity: 0;
      pointer-events: none;
    }

    [data-swatch] {
      position: relative;
      inline-size: var(--selector-swatch-size);
      block-size: var(--selector-swatch-size);
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

    [data-label] {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }
}
`,p=`pixu:accent-color`,m=document.documentElement,h=[{value:`blue`,label:`Blue`,color:`#0072b2`},{value:`green`,label:`Green`,color:`#007a5a`},{value:`orange`,label:`Orange`,color:`#b94700`},{value:`purple`,label:`Purple`,color:`#6d55b8`},{value:`rose`,label:`Rose`,color:`#9b3d73`}],g=0;function _(){try{let e=window.localStorage.getItem(p);return h.some(t=>t.value===e)?e:`blue`}catch{return`blue`}}function v(e){try{window.localStorage.setItem(p,e)}catch{}}(class e extends HTMLElement{static{n(`accent-color-selector`,f),r(`accent-color-selector`,e)}connectedCallback(){if(this.dataset.ready===`true`)return;this.dataset.ready=`true`,this.setAttribute(`role`,`radiogroup`),this.setAttribute(`aria-label`,`Accent color`);let e=`accent-color-${g}`;g+=1;for(let t of h){let n=document.createElement(`label`);n.dataset.option=t.value,n.style.setProperty(`--swatch-color`,t.color),n.setAttribute(`aria-label`,t.label),n.innerHTML=`<input type="radio" name="${e}" value="${t.value}" ${_()===t.value?`checked`:``} /><span data-swatch aria-hidden="true"></span><span data-label>${t.label}</span>`,this.append(n)}this.addEventListener(`change`,this),m.dataset.accent=this.value}disconnectedCallback(){this.removeEventListener(`change`,this)}get value(){return this.querySelector(`input:checked`)?.value||`blue`}handleEvent(e){let t=e.target.closest(`input[type='radio']`);e.type!==`change`||!t||!this.contains(t)||(v(t.value),m.dataset.accent=t.value)}});var y=`@layer components {
  display-preferences-popover {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-block-size: var(--header-control-size);

    & [data-shell] {
      position: relative;
      display: inline-flex;
    }

    & [data-toggle] {
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

      &:hover {
        border-color: color-mix(in srgb, var(--accent) 36%, var(--line));
        background: color-mix(in srgb, var(--accent) 10%, var(--surface-2));
        transform: translateY(-1px);
      }

      &:focus-visible {
        outline: var(--focus-outline);
        outline-offset: var(--focus-offset);
      }
    }

    & svg {
      inline-size: 1rem;
      block-size: 1rem;
      transition: transform var(--duration-2) var(--ease-standard);
    }

    &[data-open="true"] {
      & [data-toggle] {
        border-color: color-mix(in srgb, var(--accent) 44%, var(--line));
        background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
        color: var(--accent);
      }

      & svg {
        transform: rotate(180deg);
      }
    }

    & [data-panel] {
      position: fixed;
      inset: var(--popover-top, calc(100% + var(--space-2))) var(--popover-right, 1rem) auto auto;
      z-index: 24;
      display: none;
      gap: 1.0625rem;
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

      &[data-open="true"],
      &:popover-open {
        display: grid;
        opacity: 1;
        transform: translateY(0);
      }

      &[hidden] {
        display: none;
        opacity: 0;
        transform: translateY(-0.35rem);
      }

      &::backdrop {
        background: rgb(8 10 15 / 0.4);
      }
    }

    & [data-panel-header] {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.4375rem;
      padding-inline-end: calc(var(--header-control-size) + 0.5rem);
    }

    & [data-panel-close] {
      display: none;
      position: absolute;
      inset-block-start: 0;
      inset-inline-end: 0;
    }

    & [data-panel-eyebrow] {
      color: var(--accent-2);
      font-size: 0.76rem;
      font-weight: 850;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    & :where(h2, h3, legend, p) {
      margin: 0;
    }

    & h2 {
      font-size: clamp(1.1rem, 1rem + 0.4vw, 1.35rem);
    }

    & h3 {
      font-size: 1.35rem;
      line-height: 1.2;
    }

    & :where([data-panel-lede], [data-group-title] p, [data-checkbox-hint], [data-choice-hint]) {
      color: var(--ink-muted);
      font-size: 0.92rem;
      line-height: 1.5;
    }

    & :where([data-group], [data-group="fieldset"]) {
      display: grid;
      gap: 1.0625rem;
      padding: 0.95rem;
      border: 1px solid var(--line);
      border-radius: var(--radius-2);
      background: color-mix(in srgb, var(--surface-2) 88%, transparent);
    }

    & [data-group-title] {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      & h3 {
        color: var(--ink-strong);
      }
    }

    & [data-group="fieldset"] {
      min-width: 0;
      margin: 0;
      padding-top: 0.8rem;

      & legend {
        padding: 0 0.25rem;
        color: var(--ink-strong);
      }
    }

    & [data-checklist] {
      display: flex;
      flex-direction: column;
      gap: 0.8125rem;
    }

    & [data-choice-grid] {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.9375rem;
    }

    & [data-choice] {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.8125rem;
      align-items: flex-start;
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

      &:hover {
        border-color: color-mix(in srgb, var(--accent) 26%, var(--line));
        transform: translateY(-1px);
      }

      &[data-selected="true"],
      &:has(input:checked) {
        border-color: color-mix(in srgb, var(--accent) 44%, var(--line));
        background: color-mix(in srgb, var(--accent) 12%, var(--surface-3));
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent);
      }

      & input[type="radio"] {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        border: 0;
      }
    }

    & [data-choice-preview] {
      display: flex;
      flex-flow: row nowrap;
      place-content: start;
      place-items: start;
      gap: 0.5625rem;
      inline-size: 100%;

      & span {
        flex: 1 1 45%;
        display: block;
        min-block-size: 3rem;
        border: 1px solid var(--line);
        background: color-mix(in srgb, var(--surface-3) 74%, var(--accent) 18%);
        box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-2) 85%, transparent);

        &:last-child {
          min-block-size: 1.6rem;
          align-self: end;
        }
      }

      &[data-radius-preview="square"] span {
        border-radius: 0;
      }

      &[data-radius-preview="rounded"] span {
        border-radius: 4px;
      }

      &[data-radius-preview="squircle"] span {
        border-radius: 1rem;
      }
    }

    & [data-choice-copy] {
      display: grid;
      gap: 0.25rem;
    }

    & :where([data-choice-label], [data-checkbox-label]) {
      font-weight: 700;
    }

    & [data-checkbox] {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: start;
      gap: 0.9375rem;
      padding: 0.25rem 0;

      & input {
        inline-size: 1.05rem;
        block-size: 1.05rem;
        margin-block-start: 0.2rem;
      }
    }

    & [data-checkbox-copy] {
      display: grid;
      gap: 0.15rem;
      cursor: pointer;
    }

    & [data-grid] {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.0625rem;
    }

    & accent-color-selector {
      --selector-item-size: 3rem;
      --selector-swatch-size: 2.25rem;

      position: relative;
      z-index: 1;
      display: flex;
      flex-flow: row nowrap;
      gap: 0.75rem;
      align-items: center;
      justify-content: space-between;
      justify-self: stretch;
      inline-size: 100%;
      max-inline-size: 100%;
      min-block-size: 0;
      block-size: auto;
      padding: 0.625rem 0.75rem;

      & label {
        flex: 1 1 0;
      }
    }

    & [data-field] {
      display: grid;
      gap: 0.4375rem;

      & label {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--ink-strong);
      }

      & select {
        min-block-size: 2.9rem;
        padding-inline: 0.75rem;
        border: 1px solid var(--line);
        border-radius: var(--radius-2);
        background: color-mix(in srgb, var(--surface-3) 76%, transparent);
        color: var(--ink-strong);
        font: inherit;
      }
    }
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

  :root[data-reduce-transparency="true"] {
    :where([data-header], [data-portrait] figcaption, display-preferences-popover [data-panel]) {
      backdrop-filter: none;
      background: color-mix(in srgb, var(--surface-2) 98%, transparent);
    }
  }

  :root[data-reduce-motion="true"] {
    & display-preferences-popover {
      & :where([data-toggle], [data-toggle] svg, [data-panel], [data-choice]) {
        transform: none;
        transition: none;
      }
    }
  }

  @media (max-width: 42rem) {
    display-preferences-popover {
      & [data-panel] {
        inset: 0;
        inline-size: 100vw;
        max-inline-size: none;
        block-size: 100svh;
        max-block-size: none;
        padding: max(1rem, env(safe-area-inset-top)) 1rem max(1rem, env(safe-area-inset-bottom));
        border-radius: 0;
        transform: none;

        &::backdrop {
          background: rgb(8 10 15 / 0.72);
        }
      }

      & [data-panel-close] {
        display: inline-flex;
      }

      & :where([data-choice-grid], [data-grid]) {
        grid-template-columns: 1fr;
      }
    }
  }
}
`,b=`pixu:display-preferences`,x=[`75%`,`80%`,`90%`,`100%`,`110%`,`120%`,`125%`],S=[{description:`Zero radius across cards and controls.`,id:`square`,label:`Square`},{description:`The default rounded interface.`,id:`rounded`,label:`Rounded`},{description:`A softer silhouette with larger curves.`,id:`squircle`,label:`Squircle`}],C=[{attribute:`data-reduce-motion`,description:`Tone down movement-heavy interactions, reveals, fades, and transitions.`,label:`Reduce motion`,name:`reduceMotion`},{attribute:`data-reduce-transparency`,description:`Swap glass effects for solid surfaces.`,label:`Reduce transparency`,name:`reduceTransparency`},{attribute:`data-increase-contrast`,description:`Boost surface and text separation.`,label:`Increase contrast`,name:`increaseContrast`}],w=[{id:`avenir-humanist`,label:`Avenir Humanist`,stack:`"Avenir Next", Inter, "Segoe UI Variable Text", "Helvetica Neue", sans-serif`},{id:`editorial-serif`,label:`Editorial Serif`,stack:`"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif`},{id:`system-sans`,label:`System Sans`,stack:`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`},{id:`book-serif`,label:`Book Serif`,stack:`Baskerville, "Times New Roman", Georgia, serif`}],T=[{id:`inter-sans`,label:`Inter Sans`,stack:`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`},{id:`humanist-sans`,label:`Humanist Sans`,stack:`"Avenir Next", Inter, "Segoe UI Variable Text", "Helvetica Neue", sans-serif`},{id:`book-serif`,label:`Book Serif`,stack:`Georgia, Cambria, "Times New Roman", serif`},{id:`editorial-serif`,label:`Editorial Serif`,stack:`"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif`}],E=[{id:`plex-mono`,label:`Plex Mono`,stack:`"IBM Plex Mono", "SFMono-Regular", "Cascadia Code", Consolas, monospace`},{id:`system-mono`,label:`System Mono`,stack:`ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`},{id:`classic-mono`,label:`Classic Mono`,stack:`"Courier New", Courier, monospace`}],D={bodyFont:T,codeFont:E,headingFont:w},O=Object.freeze({bodyFont:`inter-sans`,codeFont:`plex-mono`,fontScale:`100%`,headingFont:`avenir-humanist`,increaseContrast:!1,radiusPreset:`rounded`,reduceMotion:!1,reduceTransparency:!1}),k=typeof HTMLElement<`u`&&`showPopover`in HTMLElement.prototype,A=0;function j(){try{return window.localStorage}catch{return null}}function M(e,t){let n=D[e]||[];return n.find(e=>e.id===t)||n[0]}function ee(e){return S.find(t=>t.id===e)||S.find(e=>e.id===O.radiusPreset)}function N(e={}){let t=e&&typeof e==`object`?e:{};return{bodyFont:M(`bodyFont`,t.bodyFont).id,codeFont:M(`codeFont`,t.codeFont).id,fontScale:x.includes(t.fontScale)?t.fontScale:O.fontScale,headingFont:M(`headingFont`,t.headingFont).id,increaseContrast:t.increaseContrast===!0,radiusPreset:ee(t.radiusPreset).id,reduceMotion:t.reduceMotion===!0||t.reduceAnimations===!0,reduceTransparency:t.reduceTransparency===!0}}function P(){let e=j()?.getItem(b);if(!e)return{...O};try{return N(JSON.parse(e))}catch{return{...O}}}function F(e){let t=N(e);return j()?.setItem(b,JSON.stringify(t)),t}function te(e,t,n){if(n){e.setAttribute(t,`true`);return}e.removeAttribute(t)}function I(e){let t=N(e);if(typeof document>`u`)return t;let n=document.documentElement;return n?(C.forEach(e=>{te(n,e.attribute,t[e.name])}),n.removeAttribute(`data-reduce-animations`),t.fontScale===O.fontScale?n.style.removeProperty(`font-size`):n.style.fontSize=t.fontScale,n.style.setProperty(`--font-display`,M(`headingFont`,t.headingFont).stack),n.style.setProperty(`--font-body`,M(`bodyFont`,t.bodyFont).stack),n.style.setProperty(`--font-mono`,M(`codeFont`,t.codeFont).stack),n.setAttribute(`data-radius-preset`,t.radiusPreset),t):t}function L(e,t){return e.map(e=>{let n=e.id===t?` selected`:``;return`<option value="${e.id}"${n}>${e.label}</option>`}).join(``)}function ne(e){return x.map(t=>`<option value="${t}"${t===e?` selected`:``}>${t}</option>`).join(``)}function re(e,t){return S.map(n=>{let r=n.id===t?` checked`:``,i=`${e}-radius-${n.id}`;return`
      <label data-choice for="${i}">
        <input id="${i}" type="radio" name="radiusPreset" value="${n.id}"${r} />
        <span data-choice-preview data-radius-preview="${n.id}" aria-hidden="true">
          <span></span>
          <span></span>
        </span>
        <span data-choice-copy>
          <span data-choice-label>${n.label}</span>
          <span data-choice-hint>${n.description}</span>
        </span>
      </label>
    `}).join(``)}function ie(e,t){return C.map(n=>{let r=t[n.name]?` checked`:``,i=`${e}-${n.name}`;return`
      <div data-checkbox>
        <input id="${i}" type="checkbox" name="${n.name}"${r} />
        <label data-checkbox-copy for="${i}">
          <span data-checkbox-label>${n.label}</span>
          <span data-checkbox-hint>${n.description}</span>
        </label>
      </div>
    `}).join(``)}function ae(e,t){return`
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
      aria-labelledby="${e}-corners-title"
    >
      <div data-group-title>
        <h3 id="${e}-corners-title">Corner style</h3>
        <p>Choose how rounded cards and controls should feel.</p>
      </div>
      <div data-choice-grid>
        ${re(e,t.radiusPreset)}
      </div>
    </section>

    <div data-group>
      <div data-group-title>
        <h3>Accessibility</h3>
        <p>Reduce friction when you want a calmer, sharper interface.</p>
      </div>
      <div data-checklist>
        ${ie(e,t)}
      </div>
    </div>

    <div data-group>
      <div data-group-title>
        <h3>Typography</h3>
        <p>Adjust scale and font stacks across headings, body copy, and code.</p>
      </div>
      <div data-grid>
        <div data-field>
          <label for="${e}-font-scale">Font scale</label>
          <select id="${e}-font-scale" name="fontScale">
            ${ne(t.fontScale)}
          </select>
        </div>
        <div data-field>
          <label for="${e}-heading-font">Heading font</label>
          <select id="${e}-heading-font" name="headingFont">
            ${L(w,t.headingFont)}
          </select>
        </div>
        <div data-field>
          <label for="${e}-body-font">Body font</label>
          <select id="${e}-body-font" name="bodyFont">
            ${L(T,t.bodyFont)}
          </select>
        </div>
        <div data-field>
          <label for="${e}-code-font">Code font</label>
          <select id="${e}-code-font" name="codeFont">
            ${L(E,t.codeFont)}
          </select>
        </div>
      </div>
    </div>
  `}(class e extends HTMLElement{static{n(`display-preferences-popover`,y),I(P()),r(`display-preferences-popover`,e)}connectedCallback(){if(this.dataset.ready===`true`){this.preferences=I(P()),this.syncFormControls();return}this.dataset.ready=`true`,this._panelId=`display-preferences-${A}`,this._titleId=`${this._panelId}-title`,A+=1,this.preferences=I(P()),this.render(),this._toggle=this.querySelector(`[data-toggle]`),this._panel=this.querySelector(`[data-panel]`),this._closeButton=this.querySelector(`[data-panel-close]`),this._controls=[...this.querySelectorAll(`input, select`)],this._handleToggleClick=()=>{if(this._panel){if(k){this.positionPanel(),this.isOpen()?this._panel.hidePopover():this._panel.showPopover();return}this.syncOpenState(!this.isOpen())}},this._handleCloseClick=()=>{if(!(!this._panel||!this.isOpen())){if(k){this._panel.hidePopover();return}this.syncOpenState(!1),this._toggle?.focus()}},this._handleDocumentKeydown=e=>{k||e.key!==`Escape`||!this.isOpen()||(this.syncOpenState(!1),this._toggle?.focus())},this._handleDocumentPointerDown=e=>{k||!this.isOpen()||this.contains(e.target)||this.syncOpenState(!1)},this._handlePanelToggle=e=>{let t=e.newState===`open`;if(this.syncOpenState(t),t){this.positionPanel();return}this._toggle?.focus()},this._handleViewportChange=()=>{this.isOpen()&&this.positionPanel()},this._handlePreferenceChange=e=>{let t=e.target.closest(`input, select`);!t||!this.contains(t)||(this.preferences=F(this.readFormPreferences()),this.preferences=I(this.preferences),this.syncChoiceState())},this._toggle?.addEventListener(`click`,this._handleToggleClick),this._closeButton?.addEventListener(`click`,this._handleCloseClick),this._panel?.addEventListener(`toggle`,this._handlePanelToggle),this.addEventListener(`change`,this._handlePreferenceChange),document.addEventListener(`keydown`,this._handleDocumentKeydown),document.addEventListener(`pointerdown`,this._handleDocumentPointerDown),document.addEventListener(`click`,this._handleDocumentPointerDown),window.addEventListener(`resize`,this._handleViewportChange,{passive:!0}),this.syncFormControls(),this.syncOpenState(!1)}disconnectedCallback(){this._toggle?.removeEventListener(`click`,this._handleToggleClick),this._closeButton?.removeEventListener(`click`,this._handleCloseClick),this._panel?.removeEventListener(`toggle`,this._handlePanelToggle),this.removeEventListener(`change`,this._handlePreferenceChange),document.removeEventListener(`keydown`,this._handleDocumentKeydown),document.removeEventListener(`pointerdown`,this._handleDocumentPointerDown),document.removeEventListener(`click`,this._handleDocumentPointerDown),window.removeEventListener(`resize`,this._handleViewportChange)}render(){let e=k?``:` aria-hidden="true" hidden`;this.innerHTML=`
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
          ${e}
        >
          <div data-panel-header>
            <p data-panel-eyebrow data-panel-kicker>Display</p>
            <h2 id="${this._titleId}">Display preferences</h2>
            <p data-panel-lede>Tune typography, motion, contrast, and radius without leaving the page.</p>
            <button type="button" data-panel-close aria-label="Close display preferences">X</button>
          </div>
          ${ae(this._panelId,this.preferences)}
        </section>
      </div>
    `}readFormPreferences(){return N({bodyFont:this.querySelector(`select[name="bodyFont"]`)?.value,codeFont:this.querySelector(`select[name="codeFont"]`)?.value,fontScale:this.querySelector(`select[name="fontScale"]`)?.value,headingFont:this.querySelector(`select[name="headingFont"]`)?.value,increaseContrast:this.querySelector(`input[name="increaseContrast"]`)?.checked,radiusPreset:this.querySelector(`input[name="radiusPreset"]:checked`)?.value,reduceMotion:this.querySelector(`input[name="reduceMotion"]`)?.checked,reduceTransparency:this.querySelector(`input[name="reduceTransparency"]`)?.checked})}syncFormControls(){if(!(!this.dataset.ready||!this.isConnected)){this.preferences=N(this.preferences||P());for(let e of this._controls||[]){if(e instanceof HTMLInputElement){e.type===`checkbox`&&(e.checked=this.preferences[e.name]===!0),e.type===`radio`&&(e.checked=this.preferences[e.name]===e.value);continue}e.value=this.preferences[e.name]||e.value}this.syncChoiceState()}}syncChoiceState(){this.querySelectorAll(`[data-choice]`).forEach(e=>{e.dataset.selected=String(!!e.querySelector(`input[type="radio"]:checked`))})}isOpen(){return this.dataset.open===`true`}positionPanel(){if(!this._toggle||!this._panel)return;let e=this._toggle.getBoundingClientRect();this._panel.style.setProperty(`--popover-top`,`${Math.round(e.bottom+8)}px`),this._panel.style.setProperty(`--popover-right`,`${Math.max(16,Math.round(window.innerWidth-e.right))}px`)}syncOpenState(e){if(this.dataset.open=String(e),this._toggle?.setAttribute(`aria-expanded`,String(e)),this._panel){if(this._panel.dataset.open=String(e),k){!e&&this._panel.matches(`:popover-open`)&&this._panel.hidePopover(),this._panel.removeAttribute(`aria-hidden`),this._panel.hidden=!1;return}this._panel.setAttribute(`aria-hidden`,String(!e)),this._panel.hidden=!e}}});var oe=`@layer components {
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
`;(class e extends HTMLElement{static{n(`skip-link`,oe),r(`skip-link`,e)}connectedCallback(){this.dataset.ready!==`true`&&(this.dataset.ready=`true`,this.setAttribute(`role`,`link`),this.setAttribute(`tabindex`,`0`),this.textContent.trim()||(this.textContent=`Skip to content`),this._handleSkip=e=>{if(e.type!==`click`&&!(e.type===`keydown`&&e.key===`Enter`))return;let t=document.getElementById((this.getAttribute(`href`)||`#main`).slice(1));t&&(e.preventDefault(),t.tabIndex=-1,t.focus(),t.addEventListener(`blur`,()=>t.removeAttribute(`tabindex`),{once:!0}))},this.addEventListener(`click`,this._handleSkip),this.addEventListener(`keydown`,this._handleSkip))}disconnectedCallback(){this.removeEventListener(`click`,this._handleSkip),this.removeEventListener(`keydown`,this._handleSkip)}});var se=`@property --scroll-progress-value {
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

    &::before {
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
}
`;function R(e){return Math.min(Math.max(e,0),1)}(class e extends HTMLElement{static{n(`scroll-progress`,se),r(`scroll-progress`,e)}connectedCallback(){this.dataset.ready!==`true`&&(this.dataset.ready=`true`,this.setAttribute(`aria-hidden`,`true`),this._currentProgress=0,this._targetProgress=0,this._frame=0,this._commitProgress=e=>{let t=R(e);this.style.setProperty(`--scroll-progress-value`,t.toFixed(4))},this._readTargetProgress=()=>{let e=document.documentElement.scrollHeight-window.innerHeight;return e>0?R(window.scrollY/e):0},this._shouldReduceMotion=()=>document.documentElement.hasAttribute(`data-reduce-motion`)||window.matchMedia?.(`(prefers-reduced-motion: reduce)`)?.matches===!0,this._stepProgress=()=>{let e=this._targetProgress-this._currentProgress;if(Math.abs(e)<=.001||this._shouldReduceMotion()){this._currentProgress=this._targetProgress,this._commitProgress(this._currentProgress),this._frame=0;return}this._currentProgress+=e*.18,this._commitProgress(this._currentProgress),this._frame=window.requestAnimationFrame(this._stepProgress)},this._updateProgress=()=>{if(this._targetProgress=this._readTargetProgress(),this._shouldReduceMotion()){this._currentProgress=this._targetProgress,this._commitProgress(this._currentProgress),this._frame&&=(window.cancelAnimationFrame(this._frame),0);return}this._frame||=window.requestAnimationFrame(this._stepProgress)},window.addEventListener(`scroll`,this._updateProgress,{passive:!0}),window.addEventListener(`resize`,this._updateProgress,{passive:!0}),this._updateProgress())}disconnectedCallback(){window.removeEventListener(`scroll`,this._updateProgress),window.removeEventListener(`resize`,this._updateProgress),this._frame&&=(window.cancelAnimationFrame(this._frame),0)}});var z=`@layer components {
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
`;(class e extends HTMLElement{static{n(`pointer-glow`,z),r(`pointer-glow`,e)}connectedCallback(){this.dataset.ready!==`true`&&(this.dataset.ready=`true`,this.setAttribute(`aria-hidden`,`true`),!window.matchMedia(`(pointer: coarse)`).matches&&(this._handleMove=e=>{this.style.setProperty(`--x`,`${e.clientX}px`),this.style.setProperty(`--y`,`${e.clientY}px`)},window.addEventListener(`pointermove`,this._handleMove,{passive:!0})))}disconnectedCallback(){window.removeEventListener(`pointermove`,this._handleMove)}});function B(){}function V(e={}){let t=e.window,n=e.document||t?.document||globalThis.document,r=e.header||n?.querySelector(`[data-header]`)||null,i=e.nav||n?.querySelector(`[data-nav]`)||null,a=e.navLinks||Array.from(n?.querySelectorAll(`[data-nav-link]`)||[]),o=e.sections||Array.from(n?.querySelectorAll(`[data-content] > section[id]`)||[]),s=e.mobileQuery||(typeof t?.matchMedia==`function`?t.matchMedia(`(max-width: 992px)`):{matches:!1}),c=e.closeNavigation||B;if(!t||!i||!a.length||!o.length)return{destroy:B};let l=typeof t.requestAnimationFrame==`function`?t.requestAnimationFrame.bind(t):e=>t.setTimeout(e,16),u=typeof t.cancelAnimationFrame==`function`?t.cancelAnimationFrame.bind(t):t.clearTimeout.bind(t),d=``,f,p=0,m=``,h=0,g=0;function _(){return Math.ceil((r?.getBoundingClientRect().height||0)+24)}function v(e){!e||e===d||(d=e,a.forEach(t=>{let n=t.getAttribute(`href`)===`#${e}`;t.toggleAttribute(`aria-current`,n),t.dataset.active=String(n)}))}function y(){return _()+16}function b(){let e=y(),r=t.innerHeight||n?.documentElement?.clientHeight||0,i=o.map(t=>{let n=t.getBoundingClientRect(),i=Math.max(n.top,0),a=Math.min(n.bottom,r),o=Math.max(0,a-i);return{anchorDistance:Math.abs(n.top-e),containsAnchor:n.top<=e&&n.bottom>e,id:t.id,rect:n,visibleRatio:n.height>0?o/n.height:0}}).filter(({rect:e})=>e.height>0),a=(e,t)=>t.visibleRatio-e.visibleRatio||e.anchorDistance-t.anchorDistance,s=i.filter(({containsAnchor:e})=>e).sort(a);return s[0]?s[0].id:i.filter(({rect:e})=>e.bottom>0&&e.top<r).sort(a)[0]?.id||o[0]?.id||``}function x(){m=``,h&&=(u(h),0)}function S(e){let t=n.getElementById(e);if(!t)return!0;let r=t.getBoundingClientRect(),i=y();return r.top<=i+2&&r.bottom>i}function C(){if(p=0,m){if(!S(m)){v(m);return}x()}v(b())}function w(){p||=l(()=>{C()})}function T(e){x(),m=e,v(e);let t=180,n=()=>{if(!m){h=0;return}if(w(),--t,t<=0){x(),w();return}h=l(n)};h=l(n)}function E(){f?.disconnect(),f=new t.IntersectionObserver(()=>{w()},{rootMargin:`-${_()}px 0px -30% 0px`,threshold:[0,.15,.3,.6,1]}),o.forEach(e=>{f.observe(e)}),w()}function D(){g||=l(()=>{g=0,E()})}function O(){x(),v(b())}function k(){D(),w()}function A(e){let r=e.target.closest(`a[href^="#"]`);if(!r)return;let i=n.getElementById(r.getAttribute(`href`).slice(1));if(!i)return;e.preventDefault();let a=Math.max(i.getBoundingClientRect().top+t.scrollY-_(),0),o=typeof t.matchMedia==`function`&&t.matchMedia(`(prefers-reduced-motion: reduce)`).matches;T(i.id),t.history?.pushState?.(null,``,`#${i.id}`),t.scrollTo({top:a,behavior:o?`auto`:`smooth`}),w(),s.matches&&c()}return i.addEventListener(`click`,A),typeof t.IntersectionObserver==`function`?(E(),t.addEventListener(`resize`,k,{passive:!0})):(t.addEventListener(`scroll`,O,{passive:!0}),t.addEventListener(`resize`,O,{passive:!0}),O()),{destroy(){i.removeEventListener(`click`,A),t.removeEventListener(`scroll`,O),t.removeEventListener(`resize`,O),t.removeEventListener(`resize`,k),f?.disconnect(),p&&=(u(p),0),g&&=(u(g),0),x()}}}var H=typeof HTMLElement<`u`&&`showPopover`in HTMLElement.prototype;function ce(){let e=Array.from(document.querySelectorAll(`[data-item-detail-trigger]`)),t=Array.from(document.querySelectorAll(`[data-item-detail]`));if(!(!e.length&&!t.length)){if(!H){document.documentElement.dataset.popoverFallback=`inline`,document.documentElement.dataset.itemDetailsReady=`true`;return}t.forEach(e=>{e.setAttribute(`popover`,`auto`)}),e.forEach(e=>{let t=e.getAttribute(`popovertarget`),n=t?document.getElementById(t):null,r=e.closest(`[data-timeline-item-summary], [data-summary]`);if(!n)return;let i=!1,a=e=>{if(!(!n.hasAttribute(`popover`)||typeof n.showPopover!=`function`)){if(e.preventDefault(),i=!0,n.matches(`:popover-open`)){n.hidePopover();return}n.showPopover()}};e.addEventListener(`click`,a),r?.addEventListener(`click`,t=>{t.target?.closest?.(`[data-item-detail-trigger]`)!==e&&a(t)}),n.querySelectorAll(`[data-popover-close]`).forEach(e=>{e.addEventListener(`click`,e=>{typeof n.hidePopover!=`function`||!n.matches(`:popover-open`)||(e.preventDefault(),n.hidePopover())})}),n.addEventListener(`toggle`,t=>{let r=t.newState===`open`;n.dataset.open=String(r),e.setAttribute(`aria-expanded`,String(r)),!r&&i&&(e.focus(),i=!1)})}),document.documentElement.dataset.itemDetailsReady=`true`}}var U=document.documentElement,le=document.querySelector(`[data-header]`),W=document.querySelector(`[data-footer]`),G=document.querySelector(`[data-nav]`),K=document.querySelector(`[data-nav-toggle]`),q=document.querySelector(`[data-live-region]`),J=window.matchMedia(`(max-width: 992px)`),Y=``,X;function ue(e){q&&(q.textContent=``,window.requestAnimationFrame(()=>{q.textContent=e}))}function Z(e,t={}){if(!(!G||!K)){if(!J.matches){U.dataset.navState=`open`,K.setAttribute(`aria-expanded`,`false`),G.inert=!1;return}U.dataset.navState=e?`open`:`closed`,K.setAttribute(`aria-expanded`,String(e)),G.inert=!e,t.focusToggle&&K.focus(),t.announce&&ue(e?`Navigation opened`:`Navigation closed`)}}function Q(){let e=J.matches?`mobile`:`desktop`;U.dataset.navMode=e,e!==Y&&Z(e===`desktop`),Y=e}function de(){let e=Array.from(document.querySelectorAll(`[data-reveal]`));if(!e.length)return;U.dataset.revealReady=`true`;let t=typeof CSS<`u`&&typeof CSS.supports==`function`&&CSS.supports(`animation-timeline: view(block)`),n=new Set(e),r=0,i;function a(e){e.dataset.visible!==`true`&&(e.dataset.visible=`true`,n.delete(e),i?.unobserve(e))}function o(e){let t=e.getBoundingClientRect(),n=window.innerHeight||document.documentElement.clientHeight||0;return t.top<=n*.9&&t.bottom>=n*.08}function s(){window.removeEventListener(`scroll`,l),window.removeEventListener(`resize`,l),i?.disconnect()}function c(){r=0,n.forEach(e=>{o(e)&&a(e)}),n.size||s()}function l(){r||=window.requestAnimationFrame(c)}if(e.forEach((e,t)=>{e.style.setProperty(`--reveal-order`,String(t%6))}),t){e.forEach(a);return}if(!(`IntersectionObserver`in window)){e.forEach(a);return}i=new IntersectionObserver(e=>{e.forEach(e=>{!e.isIntersecting&&!o(e.target)||a(e.target)}),n.size||s()},{rootMargin:`0px 0px -12% 0px`,threshold:[0,.12]}),e.forEach(e=>{if(o(e)){a(e);return}i.observe(e)}),window.addEventListener(`scroll`,l,{passive:!0}),window.addEventListener(`resize`,l,{passive:!0}),l()}function fe(){document.querySelectorAll(`a[target="_blank"]`).forEach(e=>{let t=new Set(String(e.getAttribute(`rel`)||``).split(/\s+/).filter(Boolean));t.add(`noopener`),t.add(`noreferrer`),e.setAttribute(`rel`,Array.from(t).join(` `))})}function $(){let e=W?Math.ceil(W.getBoundingClientRect().height):0;U.style.setProperty(`--footer-height`,`${Math.max(e,0)}px`)}function pe(){$(),!(!W||typeof window.ResizeObserver!=`function`)&&(X=new window.ResizeObserver(()=>{$()}),X.observe(W))}K?.addEventListener(`click`,()=>{Z(U.dataset.navState!==`open`,{announce:!0})}),document.addEventListener(`keydown`,e=>{e.key!==`Escape`||!J.matches||U.dataset.navState!==`open`||(e.preventDefault(),Z(!1,{focusToggle:!0,announce:!0}))}),window.addEventListener(`resize`,()=>{Q()},{passive:!0}),typeof J.addEventListener==`function`?J.addEventListener(`change`,Q):typeof J.addListener==`function`&&J.addListener(Q),Q(),fe(),pe(),de(),V({closeNavigation:()=>{Z(!1)},header:le,mobileQuery:J,nav:G,window}),ce(),window.addEventListener(`beforeunload`,()=>{X?.disconnect()});