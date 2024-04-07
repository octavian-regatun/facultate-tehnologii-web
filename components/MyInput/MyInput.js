class MyInput extends HTMLElement {
    constructor() {
        super();
        this.innerHTML =`
        <input
        class="myInput" 
        type="${this.getAttribute('type')}"
        placeholder="${this.getAttribute('placeholder') || ""}" />
        `;
    }
}

customElements.define('my-input', MyInput);