// Interaction with BE logic

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email-log-in").value;
      const password = document.getElementById("log-in-pass-input").value;

      try {
        const response = await fetch(`http://localhost:8081/auth/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          localStorage.setItem("uid", data.uid);
          localStorage.setItem("admin", data.admin);
          window.location.href = "../pages/platforms.html";
        } else {
          const error = await response.text();
          console.error("Login failed:", error);
          handleError(error);
        }
      } catch (error) {
        console.error("Error during login:", error);
        handleError(error, 1);
      }
    });
  }

  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      const email = document.getElementById("email-sign-up").value;
      const password = document.getElementById("sign-up-pass-input").value;

      console.log("Signup attempt:", { firstName, lastName, email, password });

      try {
        const response = await fetch(`http://localhost:8081/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firstName, lastName, email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          localStorage.setItem("uid", data.uid);
          localStorage.setItem("admin", data.admin);
          window.location.href = "../pages/platforms.html";
        } else {
          const error = await response.text();
          console.error("Signup failed:", error);
          handleError(error);
        }
      } catch (error) {
        console.error("Error during signup:", error);
        handleError(error, 1);
      }
    });
  }


  const forgotPwdForm = document.getElementById("forgot-pwd-form");
  if (forgotPwdForm) {
    forgotPwdForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email-forgot-pwd").value;

      try {
        const response = await fetch(`http://localhost:8081/auth/forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const data = await response.json();
          document.getElementById('email-sent-confirmation').style.display = 'block';
        } else {
          const error = await response.text();
          console.error("Forgot pwd submit failed:", error);
          handleError(error);
        }
      } catch (error) {
        console.error("Error during forgot pwd:", error);
        handleError(error, 1);
      }
    });
  }

  const resetPwdForm = document.getElementById("reset-pwd-form");
  if (resetPwdForm) {
    resetPwdForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const pwd = document.getElementById("password-reset-pwd").value;
      const pwd2 = document.getElementById("password-reset-pwd-2").value;

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const email = urlParams.get('email');
      try {
        const response = await fetch(`http://localhost:8081/auth/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pwd, pwd2, token, email }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          localStorage.setItem("uid", data.uid);
          localStorage.setItem("admin", data.admin);
          window.location.href = "../pages/platforms.html";
        } else {
          const error = await response.text();
          console.error("Reset pwd submit failed:", error);
          handleError(error);
        }
      } catch (error) {
        console.error("Error during reset pwd:", error);
        handleError(error, 1);
      }
    });
  }
});

const handleError = (error, serverError) => {
  const container = document.querySelector('body');

  const existingErrorDiv = document.querySelector('.error-message');
  if (existingErrorDiv) {
    existingErrorDiv.remove();
  }
  const errorDiv = document.createElement('div');
  errorDiv.classList.add('error-message');

  if (serverError !== undefined) {
    errorDiv.textContent = "Something went wrong, try again";
  } else {
    errorDiv.textContent = error;
  }

  container.appendChild(errorDiv);
};