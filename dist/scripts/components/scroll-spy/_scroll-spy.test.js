// @ts-check
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { test } from "node:test";

function createScrollSpyDom() {
  const dom = new JSDOM(
    `<!doctype html>
      <html>
        <body>
          <header data-header></header>
          <nav data-nav>
            <a href="#top" data-nav-link>Home</a>
            <a href="#portfolio" data-nav-link>Portfolio</a>
          </nav>
          <main>
            <section data-content>
              <section id="top"></section>
              <section id="portfolio"></section>
            </section>
          </main>
        </body>
      </html>`,
    { url: "https://pixu.dev/" },
  );

  const { window } = dom;
  const header = window.document.querySelector("[data-header]");
  const top = window.document.getElementById("top");
  const portfolio = window.document.getElementById("portfolio");

  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 900,
    writable: true,
  });

  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: 0,
    writable: true,
  });

  header.getBoundingClientRect = () => ({
    height: 64,
    top: 0,
    bottom: 64,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON() {},
  });

  top.getBoundingClientRect = () => ({
    top: 0,
    bottom: 720,
    height: 720,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON() {},
  });
  portfolio.getBoundingClientRect = () => ({
    top: 860,
    bottom: 1760,
    height: 900,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON() {},
  });

  const frameCallbacks = new Map();
  let nextFrameId = 1;
  window.requestAnimationFrame = (callback) => {
    const frameId = nextFrameId;
    nextFrameId += 1;
    frameCallbacks.set(frameId, callback);
    return frameId;
  };
  window.cancelAnimationFrame = (frameId) => {
    frameCallbacks.delete(frameId);
  };

  return { dom, frameCallbacks, window };
}

function createMatchMedia(_window, reduceMotion = false) {
  return (query) => ({
    addEventListener() {},
    matches: reduceMotion && query === "(prefers-reduced-motion: reduce)",
    media: query,
    removeEventListener() {},
  });
}

test("scroll spy marks clicked nav target active before observer callback runs", async () => {
  const { window } = createScrollSpyDom();
  const scrollCalls = [];

  window.matchMedia = createMatchMedia(window, false);
  window.scrollTo = (options) => {
    scrollCalls.push(options);
  };
  window.IntersectionObserver = class MockIntersectionObserver {
    disconnect() {}
    observe() {}
  };

  const { initScrollSpy } = await import(`./_scroll-spy.js?click=${Date.now()}`);
  const api = initScrollSpy({
    header: window.document.querySelector("[data-header]"),
    mobileQuery: window.matchMedia("(max-width: 992px)"),
    nav: window.document.querySelector("[data-nav]"),
    navLinks: Array.from(window.document.querySelectorAll("[data-nav-link]")),
    sections: Array.from(window.document.querySelectorAll("[data-content] > section[id]")),
    window,
  });

  const homeLink = window.document.querySelector('[data-nav-link][href="#top"]');
  const portfolioLink = window.document.querySelector('[data-nav-link][href="#portfolio"]');

  portfolioLink.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));

  assert.equal(portfolioLink.getAttribute("aria-current"), "");
  assert.equal(portfolioLink.dataset.active, "true");
  assert.equal(homeLink.hasAttribute("aria-current"), false);
  assert.equal(scrollCalls.length, 1);
  assert.equal(scrollCalls[0].behavior, "smooth");

  api.destroy();
});

test("scroll spy fallback updates active nav on scroll without IntersectionObserver", async () => {
  const { window } = createScrollSpyDom();

  window.matchMedia = createMatchMedia(window, false);
  window.scrollTo = () => {};

  const top = window.document.getElementById("top");
  const portfolio = window.document.getElementById("portfolio");

  const topLink = window.document.querySelector('[data-nav-link][href="#top"]');
  const portfolioLink = window.document.querySelector('[data-nav-link][href="#portfolio"]');

  const { initScrollSpy } = await import(`./_scroll-spy.js?fallback=${Date.now()}`);
  const api = initScrollSpy({
    header: window.document.querySelector("[data-header]"),
    mobileQuery: window.matchMedia("(max-width: 992px)"),
    nav: window.document.querySelector("[data-nav]"),
    navLinks: Array.from(window.document.querySelectorAll("[data-nav-link]")),
    sections: Array.from(window.document.querySelectorAll("[data-content] > section[id]")),
    window,
  });

  assert.equal(topLink.getAttribute("aria-current"), "");
  assert.equal(portfolioLink.hasAttribute("aria-current"), false);

  top.getBoundingClientRect = () => ({
    top: -720,
    bottom: -40,
    height: 680,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON() {},
  });
  portfolio.getBoundingClientRect = () => ({
    top: 40,
    bottom: 940,
    height: 900,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON() {},
  });

  window.dispatchEvent(new window.Event("scroll"));

  assert.equal(portfolioLink.getAttribute("aria-current"), "");
  assert.equal(topLink.hasAttribute("aria-current"), false);

  api.destroy();
});
