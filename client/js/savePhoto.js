const addNewPhotoToGrid = (photo) => {
    const containerGrid = document.querySelector(".container-grid");
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
}


const addNewPhotoToModal = (photo) => {
    const modalContent = document.querySelector(".modal");
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

    const commentDiv = document.createElement("div");
    const commentText = document.createElement("p");
    commentText.textContent = "There are no comments";
    commentDiv.appendChild(commentText);
    commentsSection.appendChild(commentDiv);

    const editSection = document.createElement("div");
    editSection.classList.add("card-content-edit");

    const createSlider = (labelText, min, max, def) => {
        const sliderContainer = document.createElement("div");
        sliderContainer.classList.add("card-content-edit-slider");

        const label = document.createElement("label");
        label.textContent = labelText;

        const input = document.createElement("input");
        input.type = "range";
        input.min = min;
        input.max = max;
        input.value = def;

        sliderContainer.appendChild(label);
        sliderContainer.appendChild(input);

        return sliderContainer;
    };

    const opacitySlider = createSlider("Opacity", 0, 100, 100);
    const hueSlider = createSlider("Hue", 0, 360, 0);
    const saturationSlider = createSlider("Saturation", 0, 100, 100);
    const lightnessSlider = createSlider("Lightness", 0, 100, 100);

    editSection.appendChild(opacitySlider);
    editSection.appendChild(hueSlider);
    editSection.appendChild(saturationSlider);
    editSection.appendChild(lightnessSlider);

    const filterButtonsContainer = document.createElement("div");
    filterButtonsContainer.classList.add("filter-btn-container");

    const resetButton = document.createElement("button");
    resetButton.classList.add("card-content-edit-reset-button");
    resetButton.textContent = "Reset";

    const saveButton = document.createElement("button");
    saveButton.classList.add("card-content-edit-save-button");
    saveButton.textContent = "Save";

    filterButtonsContainer.appendChild(resetButton);
    filterButtonsContainer.appendChild(saveButton);
    editSection.appendChild(filterButtonsContainer);

    cardContent.appendChild(cardDescription);
    cardContent.appendChild(cardActions);
    cardContent.appendChild(commentsSection);
    cardContent.appendChild(editSection);

    card.appendChild(closeButton);
    card.appendChild(cardImage);
    card.appendChild(cardContent);
    modalContent.appendChild(card);
}

// utility function used in savePhoto
const getFilteredImageAsBase64 = (image, filters) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;

    context.filter = filters;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Get base64 string from the modified photo
    return canvas.toDataURL('image/png');
};

const savePhoto = async (imageElement, filters) => {
    const base64Image = getFilteredImageAsBase64(imageElement, filters);

    const response = await fetch("http://localhost:8081/photos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            userId: parseInt(localStorage.getItem("uid"), 10),
            binaryString: base64Image.split(',')[1],
            source: "NOT_POSTED",
            description: "Image saved on M-PIC",
            likes: 0,
            commentCount: 0,
            aspectRatio: imageElement.width / imageElement.height,
            size: parseInt(`${imageElement.width}x${imageElement.height}`)
        }),
    });

    if (response.ok) {
        const newPhoto = await response.json();
        addNewPhotoToGrid(newPhoto);
        addNewPhotoToModal(newPhoto);
        document.dispatchEvent(new Event('photosLoaded'));
    } else {
        console.error("Failed to save photo:", await response.text());
    }
};

export default savePhoto;