import "@babel/polyfill";

import { popover } from './popover.scss';

export default class Popover {
  /**
     * Create a point.
     * @param {string} targetSite - Specify the domain to which the links should point to be given the behavior.
     * @param {string} attachTo - CSS selector on which the event handler should be attached to improve performance.
     */
  constructor(targetSite, attachTo = 'body') {
    this.links = [];
    this.template = `<div class="popover"><div class="backdrop"/><iframe class="embedded" allowfullscreen referrerpolicy="origin-when-cross-origin"/></div>`;
    this.selector = `a[href *= "${ targetSite }"]:not([data-noembed])`;
    this.attachTo = attachTo;
    this.attachAt = attachTo === 'body' ? document.body : document.querySelector(attachTo);
    this.initialize();
    this.supportsPassive = false;
  }

  testPassive = () => {
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: () => {
          this.supportsPassive = true;
        }
      });
      window.addEventListener("testPassive", null, opts);
      window.removeEventListener("testPassive", null, opts);
    } catch (e) { }
  }

  scanPage = () => {
    this.links = document.querySelectorAll(this.selector);
    this.links.forEach(i => i.classList.add('popover-enabled'));
  }

  iframeloaded = () => {
    try {
      (this.iframe.contentWindow || this.iframe.contentDocument)
    } catch (err) {
      console.log('err', err)
    }
  }

  addPopover = () => {
    document.body.append(document.createRange().createContextualFragment(this.template));
    document.querySelector('.popover .backdrop').addEventListener('click', this.togglePopup);
    this.iframe = document.querySelector('.popover iframe.embedded');
    this.iframe.addEventListener('load', this.iframeloaded);

  }

  addPageLevelHoverListener = () => {
    this.attachAt && this.attachAt.addEventListener('mouseover', this.perfAwareHoverHandler, this.supportsPassive ? { passive: true } : false);
  }

  addPageLevelClickListenerForMatchedLinks = () => {
    this.attachAt && this.attachAt.addEventListener('click', this.clickHandler, this.supportsPassive ? { passive: false } : true);
  }

  // the matchesSelector is prefixed in most (if not all) browsers
  matches = (elem, selector) => {
    let a = elem;
    while (a) {
      a = a.parentNode;
      if (a.matches && a.matches(selector)) return true;
    }
    return false;
  }

  cacheURLResponse = (url, text) => {
    const key = btoa(url);
    const content = document.createRange().createContextualFragment(text);
    localStorage.setItem(`popover_${ key }`, text);
  }

  fromCache = (url) => localStorage.getItem(`popover_${ btoa(url) }`)

  fetchPage = async (url) => {
    const cache = this.fromCache(url);
    if (!cache) {
      const response = await fetch(`http://localhost:3001?page=${ url }`);
      const json = await response.json();
      const pageContent = json.body;
      if (json.embeddable) {
        // Preloading the page into the Iframe will catch the page, so that it loads faster.
        this.iframe.src = url;
      } else {
        // The page cannot be embedded in an iframe. So cache the HTML and serve static.
        this.cacheURLResponse(url, pageContent);
      }

      return pageContent;
    } else {
      return cache;
    }

  }

  isMatched = (target, relatedTarget) => {
    let match;
    let related = relatedTarget;

    if (!target.matches(this.selector)) {
      return;
    }
    // search for a parent node matching the delegation selector
    while (target && target != document && !(match = this.matches(target, this.attachTo))) {
      target = target.parentNode;
    }

    // exit if no matching node has been found
    if (!match) { return; }

    // loop through the parent of the related target to make sure that it's not a child of the target
    while (related && related != target && related != document) {
      related = related.parentNode;
    }

    // exit if this is the case
    if (related == target) { return; }

    return true;
  }

  perfAwareHoverHandler = ({ target, relatedTarget }) => {
    if (this.isMatched(target, relatedTarget))
      target && target.href && this.fetchPage(target.href);
  }

  loadIframe = (content = '') => {
    document.querySelector('.popover iframe').setAttribute('srcdoc', content);
    this.togglePopup();
  }

  togglePopup = () => {
    document.querySelector('.popover').classList.toggle('shown');
  }

  clickHandler = async (event) => {
    const { target, relatedTarget } = event;
    if (this.isMatched(target, relatedTarget)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const url = event.target.href;
      const content = await this.fetchPage(url);
      this.loadIframe(content);

      return false;
    }
  }

  initialize() {
    this.testPassive();
    this.scanPage();
    this.addPopover();
    this.addPageLevelHoverListener();
    this.addPageLevelClickListenerForMatchedLinks();
  }
}
