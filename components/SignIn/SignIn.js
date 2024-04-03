class SignIn extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `<div class="signIn">
    <h1>M-PIC</h1>
    <h2>Sign In</h2>
    <input/>
    <input/>
      <my-button>Submit</my-button>
    </div>`;
  }
}

customElements.define('sign-in', SignIn);







