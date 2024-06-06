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
            await displayModalPhotos(photos, token);

            // Dispatch custom event after photos are displayed
            document.dispatchEvent(new Event('photosLoaded'));
        } else {
            const error = await response.text();
            console.error("Failed to fetch photos:", error);
            displayNoPhotosMessage("Oops..Looks like you don't have any photos. Try fetching some first!");
        }
    } catch (error) {
        console.error("Error fetching photos:", error);
        displayNoPhotosMessage("Oops..there were some problems in getting your photos. Try again using a page refresh!");
    }
});

function displayNoPhotosMessage(msg) {
    const container = document.querySelector('.container');
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = msg;
    const img = document.createElement('img');
    img.src = '../svgs/no-imgs.svg';

    div.appendChild(p);
    div.appendChild(img);
    container.appendChild(div);
}

function displayPhotos(photos) {
    const containerGrid = document.querySelector(".container-grid");
    containerGrid.innerHTML = ""; // I don't think there will be anything here, but just to be sure

    if (photos.length === 0) {
        displayNoPhotosMessage("Oops..Looks like you don't have any photos. Try fetching some first!");
        return;
    }

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

async function displayModalPhotos(photos, token) {
    const modalContent = document.querySelector(".modal");
    modalContent.innerHTML = ""; // Clear existing content

    const previousButton = document.createElement("button");
    previousButton.classList.add("modal-previous-button");
    const previousButtonIcon = document.createElement("img");
    previousButtonIcon.src = "../svgs/left-arrow.svg";
    previousButton.appendChild(previousButtonIcon);
    modalContent.appendChild(previousButton);

    // Fetch comments for all photos
    const commentsPromises = photos.map(photo => getCommentsFromDB(photo.id, token));
    const allComments = await Promise.all(commentsPromises);

    photos.forEach((photo, index) => {
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

        const comments = allComments[index];
        if (comments && comments.length) {
            comments.forEach(comment => {
                const commentDiv = document.createElement("div");
                commentDiv.classList.add("card-content-comment");
                const commentIcon = document.createElement("p");
                commentIcon.textContent = comment.author;
                const commentText = document.createElement("p");
                commentText.textContent = comment.content;
                commentDiv.appendChild(commentIcon);
                commentDiv.appendChild(commentText);
                commentsSection.appendChild(commentDiv);
            });
        } else {
            const commentDiv = document.createElement("div");
            const commentText = document.createElement("p");
            commentText.textContent = "There are no comments";
            commentDiv.appendChild(commentText);
            commentsSection.appendChild(commentDiv);
        }

        const editSection = document.createElement("div");
        editSection.classList.add("card-content-edit");

        const createSlider = (labelText) => {
            const sliderContainer = document.createElement("div");
            sliderContainer.classList.add("card-content-edit-slider");

            const label = document.createElement("label");
            label.textContent = labelText;

            const input = document.createElement("input");
            input.type = "range";
            input.min = "0";
            input.max = "100";
            input.value = "50";

            sliderContainer.appendChild(label);
            sliderContainer.appendChild(input);

            return sliderContainer;
        };

        const opacitySlider = createSlider("Opacity");
        const hueSlider = createSlider("Hue");
        const saturationSlider = createSlider("Saturation");
        const lightnessSlider = createSlider("Lightness");

        editSection.appendChild(opacitySlider);
        editSection.appendChild(hueSlider);
        editSection.appendChild(saturationSlider);
        editSection.appendChild(lightnessSlider);

        const saveButton = document.createElement("button");
        saveButton.classList.add("card-content-edit-save-button");
        saveButton.textContent = "Save";

        editSection.appendChild(saveButton);

        cardContent.appendChild(cardDescription);
        cardContent.appendChild(cardActions);
        cardContent.appendChild(commentsSection);
        cardContent.appendChild(editSection);

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

const getCommentsFromDB = async (id, token) => {
    try {
        const response = await fetch(`http://localhost:8081/comments/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const comments = await response.json();
            return comments;
        } else {
            const error = await response.text();
            console.error("Failed to fetch comments:", error);
            return [];
        }
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
};