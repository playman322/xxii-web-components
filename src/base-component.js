class BaseComponent extends HTMLElement {
  static styleSheet = null;

  #pendingUpdate = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.#initTemplate();
    this.#initStyles();
    this.render();
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

  render() {
    throw new Error(`render() must be implemented in ${this.constructor.name}`);
  }

  requestUpdate() {
    if (this.#pendingUpdate) return;

    this.#pendingUpdate = true;
    
    queueMicrotask(() => {
      this.render();
      this.#pendingUpdate = false;
    });
  }

  reactive(propName, defaultValue) {
    let value = this[propName] ?? defaultValue;

    Object.defineProperty(this, propName, {
      get() { return value; },
      set(newValue) {
        if (value === newValue) return;
        value = newValue;
        this.requestUpdate();
      },
      enumerable: true,
      configurable: true,
    });

    return value;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[name] = newValue;
  }
}

export default BaseComponent;
