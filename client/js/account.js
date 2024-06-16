const fetchUserStats = async () => {
    const userId = localStorage.getItem("uid");
    if (!userId) {
        console.error("User ID not found in localStorage.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/stats/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const stats = await response.json();
            document.getElementById("date-created").textContent = new Date(stats.createdAt).toLocaleDateString();
            document.getElementById("admin-status").textContent = stats.admin ? "Yes" : "No";
            document.getElementById("photos-google").textContent = stats.totalPhotosGoogle;
            document.getElementById("photos-instagram").textContent = stats.totalPhotosInstagram;
            document.getElementById("photos-mpic").textContent = stats.totalPhotos - stats.totalPhotosGoogle - stats.totalPhotosInstagram;
            document.getElementById("total-likes").textContent = stats.totalLikes;
            document.getElementById("total-comments").textContent = stats.totalComments;
        } else {
            const error = await response.text();
            console.error("Failed to fetch user stats:", error);
        }
    } catch (error) {
        console.error("Error fetching user stats:", error);
    }
};

document.addEventListener("DOMContentLoaded", fetchUserStats);


const deleteAccount = async () => {
    try {
        const id = parseInt(localStorage.getItem("uid"), 10);
        const response = await fetch(`http://localhost:8081/delete-account`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            const data = await response.json();
            showConfirmation();
        } else {
            const error = await response.text();
            console.error("Account delete submit failed:", error);
            showError(error);
        }
    } catch (error) {
        console.error("Error during account delete:", error);
        showError(error, 1);
    }
}

document.querySelector('#delete-acc').addEventListener('click', deleteAccount);

const showError = (error, serverError) => {
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

    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
};

const showConfirmation = () => {
    const container = document.querySelector('body');

    const existingErrorDiv = document.querySelector('.error-message');
    if (existingErrorDiv) {
        existingErrorDiv.remove();
    }

    const confirmationDiv = document.createElement('div');
    confirmationDiv.id = 'email-sent-confirmation';
    confirmationDiv.textContent = 'Email sent successfully. You can close this page'

    container.appendChild(confirmationDiv);

    setTimeout(() => {
        if (confirmationDiv && confirmationDiv.parentNode) {
            confirmationDiv.parentNode.removeChild(confirmationDiv);
        }
    }, 5000);
};
