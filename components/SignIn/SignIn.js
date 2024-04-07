class SignIn extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `<div class="signIn">
    <h2>Sign In</h2>
    <p>Enter your email below to login to your account.</p>
    <my-input placeholder="Email"></my-input>
    <my-input placeholder="Password"></my-input>
    <my-button>Submit</my-button>
    </div>`;
  }
}

customElements.define('sign-in', SignIn);
