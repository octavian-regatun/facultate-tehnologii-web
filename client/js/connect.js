function toggleContainers(event) {
    const animDuration = 500;
    const signUpContainer = document.getElementById('sign-up');
    const logInContainer = document.getElementById('log-in');
    const elements = document.querySelectorAll('.connect-container');
    const buttons = document.querySelectorAll('.change-form-btn'); // event.target will disable only one of the two buttons

    buttons.forEach(function (button) {
        button.disabled = true;
    });

    // const buttonRect = button.getBoundingClientRect();
    // signUpContainer.style.left = `${buttonRect.left}px`;
    // signUpContainer.style.top = `${buttonRect.top}px`;

    if (signUpContainer.classList.contains('contracted')) {
        signUpContainer.style.zIndex = '2';
        logInContainer.style.zIndex = '1';
        signUpContainer.classList.toggle('contracted');

        setTimeout(function () {
            logInContainer.classList.toggle('contracted');

            setTimeout(function () {
                buttons.forEach(function (button) {
                    button.disabled = false;
                });
                elements.forEach(function (element) {
                    element.classList.toggle('overflow');
                });
            }, animDuration);


        }, animDuration);
    } else {
        signUpContainer.style.zIndex = '1';
        logInContainer.style.zIndex = '2';
        logInContainer.classList.toggle('contracted');

        setTimeout(function () {
            signUpContainer.classList.toggle('contracted');

            setTimeout(function () {
                buttons.forEach(function (button) {
                    button.disabled = false;
                });
                elements.forEach(function (element) {
                    element.classList.toggle('overflow');
                });
            }, animDuration);


        }, animDuration);
    }
}


function toggleVisiblePassword(event) {
    var passwordField;
    if(event.target.id == 'log-in-pass-btn') {
        passwordField = document.getElementById('log-in-pass-input');
        icon = document.getElementById('log-in-svg-path');
    } else {
        passwordField = document.getElementById('sign-up-pass-input');
        icon = document.getElementById('sign-up-svg-path');
    }
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.style.display = 'block';
    } else {
        passwordField.type = 'password';
        icon.style.display = 'none';
    }
}


document.addEventListener('click', function (event) {
    if (event.target.classList.contains('change-form-btn')) {
        toggleContainers(event);
    }

    if (event.target.classList.contains('pass-icon')) {
        toggleVisiblePassword(event);
    }
});



// Temporary redirect
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("email-log-in").value;
        const password = document.getElementById("log-in-pass-input").value;
  
        console.log("Login attempt:", { email, password });
  
        try {
          const response = await fetch("http://localhost:8081/auth/signin", {
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
            window.location.href = "../pages/platforms.html";
          } else {
            const error = await response.text();
            console.error("Login failed:", error);
          }
        } catch (error) {
          console.error("Error during login:", error);
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
          const response = await fetch("http://localhost:8081/auth/signup", {
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
            window.location.href = "../pages/platforms.html";
          } else {
            const error = await response.text();
            console.error("Signup failed:", error);
          }
        } catch (error) {
          console.error("Error during signup:", error);
        }
      });
    }
  });
  