document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("uid");

    if (!token || !userId) {
        window.location.href = "./connect.html";
    }
});
