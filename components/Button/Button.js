class Button extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `<button class="button">${this.innerHTML}</button>`;
  }
}

customElements.define('my-button', Button);
