document.addEventListener('DOMContentLoaded', async () => {
    const logoutButton = document.querySelector('.log-out-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('uid');
            localStorage.removeItem('token');
            window.location.href = '../index.html';
        });
    }
});

