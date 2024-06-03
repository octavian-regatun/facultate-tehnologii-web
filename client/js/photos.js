document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("uid");

    if (!token || !userId) {
        console.error("User not authenticated");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/photos/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const photos = await response.json();
            displayPhotos(photos);
            displayModalPhotos(photos);

            // Dispatch custom event after photos are displayed
            document.dispatchEvent(new Event('photosLoaded'));
        } else {
            const error = await response.text();
            console.error("Failed to fetch photos:", error);
        }
    } catch (error) {
        console.error("Error fetching photos:", error);
    }
});

function displayPhotos(photos) {
    const containerGrid = document.querySelector(".container-grid");
    containerGrid.innerHTML = ""; // I don't think there will be anything here, but just to be sure

    photos.forEach(photo => {
        const card = document.createElement("div");
        card.classList.add("card");

        const cardImage = document.createElement("img");
        cardImage.classList.add("card-image");
        cardImage.src = `data:image/png;base64,${photo.binaryString}`;

        const cardContent = document.createElement("div");
        cardContent.classList.add("card-content");

        const cardDescription = document.createElement("p");
        cardDescription.classList.add("card-content-description");
        cardDescription.textContent = photo.description;

        cardContent.appendChild(cardDescription);
        card.appendChild(cardImage);
        card.appendChild(cardContent);
        containerGrid.appendChild(card);
    });
}

function displayModalPhotos(photos) {
    const modalContent = document.querySelector(".modal");
    modalContent.innerHTML = ""; // Same as above

    const previousButton = document.createElement("button");
    previousButton.classList.add("modal-previous-button");
    const previousButtonIcon = document.createElement("img");
    previousButtonIcon.src = "../svgs/left-arrow.svg";
    previousButton.appendChild(previousButtonIcon);
    modalContent.appendChild(previousButton);

    photos.slice(0, 3).forEach(photo => {
        const card = document.createElement("div");
        card.classList.add("card");

        const closeButton = document.createElement("button");
        closeButton.classList.add("modal-close");
        closeButton.textContent = "X";
        closeButton.addEventListener("click", () => {
            document.querySelector(".modal").close();
        });

        const cardImage = document.createElement("img");
        cardImage.classList.add("card-image");
        cardImage.src = `data:image/png;base64,${photo.binaryString}`;

        const cardContent = document.createElement("div");
        cardContent.classList.add("card-content");

        const cardDescription = document.createElement("p");
        cardDescription.classList.add("card-content-description");
        cardDescription.textContent = photo.description;

        const cardActions = document.createElement("div");
        cardActions.classList.add("card-content-actions");

        const likeSection = document.createElement("div");
        likeSection.classList.add("card-content-like");
        const likeIcon = document.createElement("img");
        likeIcon.src = "../svgs/heart.svg";
        likeIcon.alt = "like";
        const likeCount = document.createElement("span");
        likeCount.textContent = photo.likes;
        likeSection.appendChild(likeIcon);
        likeSection.appendChild(likeCount);

        const editButton = document.createElement("button");
        editButton.classList.add("card-content-edit-button");
        const editIcon = document.createElement("img");
        editIcon.src = "../svgs/edit-photo.svg";
        editButton.appendChild(editIcon);

        cardActions.appendChild(likeSection);
        cardActions.appendChild(editButton);

        const commentsSection = document.createElement("div");
        commentsSection.classList.add("card-content-comments");
        const commentsTitle = document.createElement("p");
        commentsTitle.textContent = "Comments";
        commentsSection.appendChild(commentsTitle);

        if (photo.comments) {
            photo.comments.forEach(comment => {
                const commentDiv = document.createElement("div");
                commentDiv.classList.add("card-content-comment");
                const commentIcon = document.createElement("img");
                commentIcon.src = "../svgs/user-circle.svg";
                const commentText = document.createElement("p");
                commentText.textContent = comment;
                commentDiv.appendChild(commentIcon);
                commentDiv.appendChild(commentText);
                commentsSection.appendChild(commentDiv);
            });
        }

        cardContent.appendChild(cardDescription);
        cardContent.appendChild(cardActions);
        cardContent.appendChild(commentsSection);
        card.appendChild(closeButton);
        card.appendChild(cardImage);
        card.appendChild(cardContent);
        modalContent.appendChild(card);
    });

    const nextButton = document.createElement("button");
    nextButton.classList.add("modal-next-button");
    const nextButtonIcon = document.createElement("img");
    nextButtonIcon.src = "../svgs/right-arrow.svg";
    nextButton.appendChild(nextButtonIcon);
    modalContent.appendChild(nextButton);
}
