const showAllUserStats = (stats) => {

    const adminContainer = document.createElement('div');
    adminContainer.classList.add('admin-container');

    const chartContainer = document.createElement('div');
    chartContainer.classList.add('chart-container');

    adminContainer.appendChild(chartContainer);
    
    const mainContainer = document.querySelector('main.container');
    const accountStats = mainContainer.querySelector('.account-stats');

    mainContainer.insertBefore(adminContainer, accountStats);

    const data = [
        { label: 'Total Users', value: stats.totalUsers },
        { label: 'Total Photos', value: stats.totalPhotos },
        { label: 'Total Comments', value: stats.totalComments },
        { label: 'Photos Google', value: stats.totalPhotosGoogle },
        { label: 'Photos Instagram', value: stats.totalPhotosInstagram },
        { label: 'Total Likes', value: stats.totalLikes }
    ];

    const maxValue = Math.max(...data.map(item => item.value));

    data.forEach(item => {
        const column = document.createElement('div');
        column.classList.add('column');

        const columnBar = document.createElement('div');
        columnBar.classList.add('column-bar');

        const columnLabel = document.createElement('div');
        columnLabel.classList.add('column-label');
        columnLabel.textContent = item.label;

        const columnValue = document.createElement('div');
        columnValue.classList.add('column-value');
        columnValue.textContent = '0';

        columnBar.appendChild(columnValue);
        column.appendChild(columnBar);
        column.appendChild(columnLabel);
        chartContainer.appendChild(column);

        // Animate bar and values
        setTimeout(() => {
            const startValue = 0;
            const endValue = item.value;
            const duration = 2000; // here's the duration
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const currentHeight = progress * (endValue / maxValue) * 100;
                const currentValue = Math.floor(progress * endValue);

                columnBar.style.height = `${currentHeight}%`;
                columnValue.textContent = currentValue;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    columnValue.textContent = endValue;
                }
            };

            requestAnimationFrame(animate);
        }, 100);
    });
};

const fetchUserStats = async () => {
    const userId = localStorage.getItem("uid");
    if (!userId) {
        console.error("User ID not found in localStorage.");
        return;
    }

    try {
        const response = await fetch(`https://localhost:8081/stats/${userId}`, {
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

const fetchAllUserStats = async () => {
    try {
        const response = await fetch(`https://localhost:8081/stats`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const stats = await response.json();
            showAllUserStats(stats);
        } else {
            const error = await response.text();
            console.error("Failed to fetch user stats:", error);
        }
    } catch (error) {
        console.error("Error fetching user stats:", error);
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const admin = localStorage.getItem("admin");

    if (admin === "true") {
        fetchAllUserStats();
    }

    fetchUserStats();
});


const deleteAccount = async () => {
    try {
        const id = parseInt(localStorage.getItem("uid"), 10);
        const response = await fetch(`https://localhost:8081/delete-account`, {
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
