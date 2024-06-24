const deletePhoto = async (card) => {
    const id = card.querySelector('.card-image').getAttribute("photo-id");

    // card index - sa stiu a cata poza din dialog sterg
    const cards = Array.from(document.querySelectorAll('.container-grid .card'));
    const cardIndex = cards.indexOf(card);

    const response = await fetch(`https://localhost:8081/photos/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
        },
    });

    if (response.ok) {
        card.remove();
        const modalCards = document.querySelectorAll('.modal .card');
        modalCards[cardIndex].remove();

        document.dispatchEvent(new Event('photosLoaded'));
    } else {
        console.error("Failed to delete photo:", await response.text());
    }
};

const openDeleteConfirmation = (card) => {
    const confirmationDiv = document.createElement("div");
    confirmationDiv.classList.add("confirmation-dialog");

    const message = document.createElement("p");
    message.textContent = "Are you sure you want to delete this photo?";

    const navbar = document.querySelector('.navbar');
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');

    const yesButton = document.createElement("button");
    yesButton.classList.add("btn");
    yesButton.textContent = "Yes";
    yesButton.addEventListener("click", () => {
        deletePhoto(card);
        document.body.removeChild(confirmationDiv);
        const header = document.querySelector('.card-header');
        navbar.classList.remove("blur-background");
        sidebar.classList.remove("blur-background");
        container.classList.remove("blur-background");
        header.classList.remove("blur-background");
    });

    const noButton = document.createElement("button");
    noButton.textContent = "No";
    noButton.classList.add("btn");
    noButton.addEventListener("click", () => {
        document.body.removeChild(confirmationDiv);
        const header = document.querySelector('.card-header');
        navbar.classList.remove("blur-background");
        sidebar.classList.remove("blur-background");
        container.classList.remove("blur-background");
        header.classList.remove("blur-background");
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("confirmation-btn-container");

    confirmationDiv.appendChild(message);
    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);
    confirmationDiv.appendChild(buttonContainer);

    document.body.appendChild(confirmationDiv);
    const header = document.querySelector('.card-header');
    navbar.classList.add("blur-background");
    sidebar.classList.add("blur-background");
    container.classList.add("blur-background");
    header.classList.add("blur-background");
};