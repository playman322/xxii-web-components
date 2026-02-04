import { deserializeAttribute, serializeAttribute } from './utils/property-types.js';
import { isNil } from './utils/helpers.js';

class BaseComponent extends HTMLElement {
  static styleSheet = null;
  static get observedAttributes() {
    return this.properties ? Object.keys(this.properties) : [];
  }

  #pendingUpdate = false;
  #connected = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#initProperties();
  }

  connectedCallback() {
    this.#initTemplate();
    this.#initStyles();
    this.#connected = true;
    this.render();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#pendingUpdate = false;
  }

  render() {}

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    const propConfig = this.constructor.properties[name];
    const type = propConfig.type;
    this[name] = deserializeAttribute(newValue, type);
  }

  #initProperties() {
    const properties = this.constructor.properties || {};
    for (const [propName, propConfig] of Object.entries(properties)) {
      this.#reactive(propName, propConfig);
    }
  }

  #initTemplate() {
    if (!this.constructor.template) return;

    const template = document.createElement('template');
    template.innerHTML = this.constructor.template;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  #initStyles() {
    if (!this.constructor.styles) return;

    if (!this.constructor.styleSheet) {
      this.constructor.styleSheet = new CSSStyleSheet();
      this.constructor.styleSheet.replaceSync(this.constructor.styles);
    }
    this.shadowRoot.adoptedStyleSheets = [this.constructor.styleSheet];
  }

  #reactive(propName, propConfig) {
    const type = propConfig.type;
    const defaultValue = propConfig.default ?? null;
    const raw = this.getAttribute(propName);
    
    let value = isNil(raw) ? defaultValue : deserializeAttribute(raw, type);

    Object.defineProperty(this, propName, {
      get() { return value; },
      set(newValue) {
        if (value === newValue) return;
        value = newValue;
        this.setAttribute(propName, serializeAttribute(value, type));
        this.#requestUpdate();
      },
      enumerable: true,
      configurable: true,
    });
  }

  #requestUpdate() {
    if (this.#pendingUpdate || !this.#connected) return;

    this.#pendingUpdate = true;

    queueMicrotask(() => {
      if (!this.#connected) {
        this.#pendingUpdate = false;
        return;
      }

      this.render();
      this.#pendingUpdate = false;
    });
  }
}

export default BaseComponent;
