const deleteAccount = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const id = parseInt(urlParams.get('id'), 10);
    try {
        const response = await fetch(`https://localhost:8081/account`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token, id }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.removeItem("token");
            localStorage.removeItem("uid");
            localStorage.removeItem("admin");
            document.querySelector('.done').innerHTML = 'Your account has been deleted';
        } else {
            const error = await response.text();
            console.error("Delete account failed:", error);
            document.querySelector('.done').innerHTML = error;
        }
    } catch (error) {
        console.error("Error during delete account:", error);
        document.querySelector('.done').innerHTML = 'Something went wrong. Try again';
    }
}

document.addEventListener("DOMContentLoaded", deleteAccount);