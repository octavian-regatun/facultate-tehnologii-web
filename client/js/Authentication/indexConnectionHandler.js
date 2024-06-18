// Special page - index.html

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('uid');
    const authLink = document.getElementById('auth-link');

    if (token && userId) {
        const homeLink = document.createElement('a');
        homeLink.href = './pages/platforms.html';

        const homeImg = document.createElement('img');
        homeImg.src = './svgs/home.svg';
        homeImg.alt = 'Home';

        homeLink.appendChild(homeImg);

        const logOutBtn = document.createElement('button');
        logOutBtn.classList.add('btn', 'log-out-btn');
        logOutBtn.id = 'log-out-btn';
        logOutBtn.textContent = 'Log out';

        authLink.replaceWith(homeLink, logOutBtn);

        document.getElementById('log-out-btn').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('uid');
            localStorage.removeItem('admin');
            location.reload();
        });
    }
});
