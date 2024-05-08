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
document.addEventListener('DOMContentLoaded', function() {
    const signUpButtons = document.querySelectorAll('.form-btn');

    signUpButtons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = './platforms.html';
        });
    });
});
