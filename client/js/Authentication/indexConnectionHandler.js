// Special page - index.html

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('uid');
    const authLink = document.getElementById('auth-link');

    if (token && userId) {
        authLink.outerHTML = '<button class="btn log-out-btn" id="log-out-btn">Log out</button>';

        document.getElementById('log-out-btn').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('uid');
            localStorage.removeItem('admin');
            location.reload();
        });
    }
});