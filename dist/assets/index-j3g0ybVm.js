(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`@layer components {
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
      background: color-mix(in srgb, var(--accent) 14%, transparent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 32%, transparent);
    }

    & [data-swatch] {
      position: relative;
      inline-size: 1.85rem;
      block-size: 1.85rem;
      overflow: hidden;
      border: 2px solid color-mix(in srgb, var(--ink-strong) 72%, transparent);
      border-radius: var(--radius-round);
      background: linear-gradient(
        135deg,
        var(--swatch-a) 0 44%,
        rgb(255 255 255 / 0.86) 44% 56%,
        var(--swatch-b) 56% 100%
      );
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
`;function t(){return`adoptedStyleSheets`in document&&`replaceSync`in CSSStyleSheet.prototype}function n(e,n){if(t()){let e=new CSSStyleSheet;e.replaceSync(n),document.adoptedStyleSheets=[...document.adoptedStyleSheets,e];return}if(document.head.querySelector(`style[data-component="${e}"]`))return;let r=document.createElement(`style`);r.dataset.component=e,r.textContent=n,document.head.append(r)}function r(e,t){!customElements.get(e)&&customElements.define(e,t)}var i=`pixu:accent-pair`,a=document.documentElement,o=[{value:`sea-glass`,label:`Sea glass`,primary:`#7dd8ff`,secondary:`#b99cff`},{value:`sage-blush`,label:`Sage blush`,primary:`#8ee6b6`,secondary:`#ff9fbc`},{value:`peach-fuzz`,label:`Peach fuzz`,primary:`#ffb18e`,secondary:`#8ebcff`},{value:`lavender-mint`,label:`Lavender mint`,primary:`#cab2ff`,secondary:`#8df1dc`},{value:`butter-plum`,label:`Butter plum`,primary:`#ffd477`,secondary:`#c7a4ff`}],s=0;function c(){try{let e=window.localStorage.getItem(i);return o.some(t=>t.value===e)?e:`sea-glass`}catch{return`sea-glass`}}function l(e){try{window.localStorage.setItem(i,e)}catch{}}(class t extends HTMLElement{static{n(`accent-color-selector`,e),r(`accent-color-selector`,t)}connectedCallback(){if(this.dataset.ready===`true`)return;this.dataset.ready=`true`,this.setAttribute(`role`,`radiogroup`),this.setAttribute(`aria-label`,`Accent color pair`);let e=`accent-color-${s}`;s+=1;for(let t of o){let n=document.createElement(`label`);n.dataset.option=t.value,n.style.setProperty(`--swatch-a`,t.primary),n.style.setProperty(`--swatch-b`,t.secondary),n.setAttribute(`aria-label`,t.label),n.innerHTML=`<input type="radio" name="${e}" value="${t.value}" ${c()===t.value?`checked`:``} /><span data-swatch aria-hidden="true"></span><span data-label>${t.label}</span>`,this.append(n)}this.addEventListener(`change`,this),a.dataset.accent=this.value}disconnectedCallback(){this.removeEventListener(`change`,this)}get value(){return this.querySelector(`input:checked`)?.value||`sea-glass`}handleEvent(e){let t=e.target.closest(`input[type='radio']`);e.type!==`change`||!t||!this.contains(t)||(l(t.value),a.dataset.accent=t.value)}});var u=`@layer components {
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
`,d=`pixu:color-scheme`,f=document.documentElement,p=window.matchMedia(`(prefers-color-scheme: dark)`),m=[{value:`light`,label:`Light`,icon:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"></path></svg>`},{value:`dark`,label:`Dark`,icon:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.5 14.4A8.2 8.2 0 0 1 9.6 3.5a8.6 8.6 0 1 0 10.9 10.9Z"></path></svg>`},{value:`system`,label:`System`,icon:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8M12 16v4"></path></svg>`}],h=0;function g(){try{let e=window.localStorage.getItem(d);return m.some(t=>t.value===e)?e:`system`}catch{return`system`}}function _(e){return e===`system`?p.matches?`dark`:`light`:e}function v(e){let t=_(e);f.dataset.colorScheme=e,f.dataset.resolvedScheme=t,f.style.colorScheme=t}(class e extends HTMLElement{static{n(`color-scheme-selector`,u),r(`color-scheme-selector`,e)}connectedCallback(){if(this.dataset.ready===`true`)return;this.dataset.ready=`true`,this.setAttribute(`role`,`radiogroup`),this.setAttribute(`aria-label`,`Color scheme`),this._handleSystemChange=()=>{this.value===`system`&&v(`system`)};let e=`color-scheme-${h}`;h+=1;for(let t of m){let n=document.createElement(`label`);n.dataset.option=t.value,n.setAttribute(`aria-label`,t.label),n.innerHTML=`<input type="radio" name="${e}" value="${t.value}" ${g()===t.value?`checked`:``} /><span data-icon aria-hidden="true">${t.icon}</span><span data-label>${t.label}</span>`,this.append(n)}this.addEventListener(`change`,this),typeof p.addEventListener==`function`?p.addEventListener(`change`,this._handleSystemChange):typeof p.addListener==`function`&&p.addListener(this._handleSystemChange),v(this.value)}disconnectedCallback(){this.removeEventListener(`change`,this),typeof p.removeEventListener==`function`?p.removeEventListener(`change`,this._handleSystemChange):typeof p.removeListener==`function`&&p.removeListener(this._handleSystemChange)}get value(){return this.querySelector(`input:checked`)?.value||`system`}handleEvent(e){let t=e.target.closest(`input[type='radio']`);if(!(e.type!==`change`||!t||!this.contains(t))){try{t.value===`system`?window.localStorage.removeItem(d):window.localStorage.setItem(d,t.value)}catch{}v(t.value)}}});var y=`@layer components {
  @layer skip-link {
    skip-link {
      position: absolute;
      top: 0;
      left: 0;
      display: inline-block;
      padding: var(--space-2);
      background: var(--accent);
      color: var(--accent-ink);
      text-decoration: none;
      font-weight: 600;
      z-index: 10000;
      transform: translateY(-100%);
      transition: transform var(--duration-2) var(--ease-standard);

      &:focus {
        transform: translateY(0);
        outline: var(--focus-outline);
        outline-offset: var(--focus-offset);
      }
    }
  }
}
`;(class e extends HTMLElement{static{n(`skip-link`,y),r(`skip-link`,e)}connectedCallback(){this.dataset.ready!==`true`&&(this.dataset.ready=`true`,this.setAttribute(`role`,`link`),this.setAttribute(`tabindex`,`0`),this.textContent.trim()||(this.textContent=`Skip to content`),this._handleSkip=e=>{if(e.type!==`click`&&!(e.type===`keydown`&&e.key===`Enter`))return;let t=document.getElementById((this.getAttribute(`href`)||`#main`).slice(1));t&&(e.preventDefault(),t.tabIndex=-1,t.focus(),t.addEventListener(`blur`,()=>t.removeAttribute(`tabindex`),{once:!0}))},this.addEventListener(`click`,this._handleSkip),this.addEventListener(`keydown`,this._handleSkip))}disconnectedCallback(){this.removeEventListener(`click`,this._handleSkip),this.removeEventListener(`keydown`,this._handleSkip)}});var b=`@layer components {
  scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 2px;
    background: linear-gradient(to right, var(--accent), var(--accent-2));
    transform-origin: left;
    transform: scaleX(calc(var(--progress, 0) / 100));
    transition: transform 50ms linear;
    z-index: 9999;
  }
}
`;(class e extends HTMLElement{static{n(`scroll-progress`,b),r(`scroll-progress`,e)}connectedCallback(){this.dataset.ready!==`true`&&(this.dataset.ready=`true`,this.setAttribute(`aria-hidden`,`true`),this._updateProgress=()=>{let e=document.documentElement.scrollHeight-window.innerHeight,t=e>0?window.scrollY/e:0;this.style.setProperty(`--progress`,`${Math.min(Math.max(t,0),1)*100}%`)},window.addEventListener(`scroll`,this._updateProgress,{passive:!0}),this._updateProgress())}disconnectedCallback(){window.removeEventListener(`scroll`,this._updateProgress)}});var x=`@layer components {
  pointer-glow {
    position: fixed;
    top: calc(var(--y, 50vh) - 10rem);
    left: calc(var(--x, 50vw) - 10rem);
    width: 20rem;
    height: 20rem;
    pointer-events: none;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--accent) 32%, transparent 100%),
      color-mix(in srgb, var(--accent-2) 62%, transparent 100%),
      transparent 70%
    );
    filter: blur(4rem);
    will-change: top, left;
    opacity: 0.5;
    z-index: 1;
  }
}
`;(class e extends HTMLElement{static{n(`pointer-glow`,x),r(`pointer-glow`,e)}connectedCallback(){this.dataset.ready!==`true`&&(this.dataset.ready=`true`,this.setAttribute(`aria-hidden`,`true`),!window.matchMedia(`(pointer: coarse)`).matches&&(this._handleMove=e=>{this.style.setProperty(`--x`,`${e.clientX}px`),this.style.setProperty(`--y`,`${e.clientY}px`)},window.addEventListener(`pointermove`,this._handleMove,{passive:!0})))}disconnectedCallback(){window.removeEventListener(`pointermove`,this._handleMove)}});var S=document.documentElement,C=document.querySelector(`[data-site-header]`),w=document.querySelector(`[data-nav]`),T=document.querySelector(`[data-nav-toggle]`),E=Array.from(document.querySelectorAll(`[data-nav-link]`)),D=Array.from(document.querySelectorAll(`main > section[id]`)),O=document.querySelector(`[data-live-region]`),k=window.matchMedia(`(max-width: 760px)`),A=``,j=``;function M(e){O&&(O.textContent=``,window.requestAnimationFrame(()=>{O.textContent=e}))}function N(){return Math.ceil((C?.getBoundingClientRect().height||0)+24)}function P(e,t={}){if(!(!w||!T)){if(!k.matches){S.dataset.navState=`open`,T.setAttribute(`aria-expanded`,`false`),w.inert=!1;return}S.dataset.navState=e?`open`:`closed`,T.setAttribute(`aria-expanded`,String(e)),w.inert=!e,t.focusToggle&&T.focus(),t.announce&&M(e?`Navigation opened`:`Navigation closed`)}}function F(){let e=k.matches?`mobile`:`desktop`;S.dataset.navMode=e,e!==j&&P(e===`desktop`),j=e}function I(){let e=N()+16,t=window.scrollY+e,n=D.map(e=>({id:e.id,top:e.offsetTop,bottom:e.offsetTop+e.offsetHeight})).filter(e=>e.top<=t&&e.bottom>t).sort((e,t)=>t.top-e.top);return n[0]?n[0].id:D.map(e=>({id:e.id,top:e.offsetTop})).filter(e=>e.top<=t).sort((e,t)=>t.top-e.top)[0]?.id||D[0]?.id||``}function L(){let e=I();!e||e===A||(A=e,E.forEach(t=>{let n=t.getAttribute(`href`)===`#${e}`;t.toggleAttribute(`aria-current`,n),t.dataset.active=String(n)}))}function R(e){let t=e.target.closest(`a[href^="#"]`);if(!t)return;let n=document.getElementById(t.getAttribute(`href`).slice(1));if(!n)return;e.preventDefault();let r=Math.max(n.offsetTop-N(),0);window.history.pushState(null,``,`#${n.id}`),window.scrollTo({top:r,behavior:`smooth`}),k.matches&&P(!1)}function z(){let e=Array.from(document.querySelectorAll(`[data-reveal]`));if(!e.length)return;S.dataset.revealReady=`true`;let t=typeof CSS<`u`&&typeof CSS.supports==`function`&&CSS.supports(`animation-timeline: view(block)`),n=new Set(e),r=0,i;function a(e){e.dataset.visible!==`true`&&(e.dataset.visible=`true`,n.delete(e),i?.unobserve(e))}function o(e){let t=e.getBoundingClientRect(),n=window.innerHeight||document.documentElement.clientHeight||0;return t.top<=n*.9&&t.bottom>=n*.08}function s(){window.removeEventListener(`scroll`,l),window.removeEventListener(`resize`,l),i?.disconnect()}function c(){r=0,n.forEach(e=>{o(e)&&a(e)}),n.size||s()}function l(){r||=window.requestAnimationFrame(c)}if(e.forEach((e,t)=>{e.style.setProperty(`--reveal-order`,String(t%6))}),t){e.forEach(a);return}if(!(`IntersectionObserver`in window)){e.forEach(a);return}i=new IntersectionObserver(e=>{e.forEach(e=>{!e.isIntersecting&&!o(e.target)||a(e.target)}),n.size||s()},{rootMargin:`0px 0px -12% 0px`,threshold:[0,.12]}),e.forEach(e=>{if(o(e)){a(e);return}i.observe(e)}),window.addEventListener(`scroll`,l,{passive:!0}),window.addEventListener(`resize`,l,{passive:!0}),l()}function B(){document.querySelectorAll(`a[target="_blank"]`).forEach(e=>{let t=new Set(String(e.getAttribute(`rel`)||``).split(/\s+/).filter(Boolean));t.add(`noopener`),t.add(`noreferrer`),e.setAttribute(`rel`,Array.from(t).join(` `))})}T?.addEventListener(`click`,()=>{P(S.dataset.navState!==`open`,{announce:!0})}),w?.addEventListener(`click`,R),document.addEventListener(`keydown`,e=>{e.key!==`Escape`||!k.matches||S.dataset.navState!==`open`||(e.preventDefault(),P(!1,{focusToggle:!0,announce:!0}))}),window.addEventListener(`scroll`,()=>{L()},{passive:!0}),window.addEventListener(`resize`,()=>{F(),L()},{passive:!0}),typeof k.addEventListener==`function`?k.addEventListener(`change`,F):typeof k.addListener==`function`&&k.addListener(F),F(),B(),z(),L();