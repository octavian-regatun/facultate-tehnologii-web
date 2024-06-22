export const addNewPhotoToGrid = (photo) => {
    const containerGrid = document.querySelector(".container-grid");
    const card = document.createElement("div");
    card.classList.add("card");

    const cardImage = document.createElement("img");
    cardImage.classList.add("card-image");
    cardImage.src = `data:image/png;base64,${photo.binaryString}`;
    cardImage.setAttribute("photo-id", photo.id);

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const cardDescription = document.createElement("p");
    cardDescription.classList.add("card-content-description");
    cardDescription.textContent = photo.description;

    const deleteDiv = document.createElement("div");
    deleteDiv.classList.add('delete-div');
    const deleteIcon = document.createElement("img");
    deleteIcon.classList.add('delete-img');
    deleteIcon.src = "../svgs/delete.svg";
    deleteIcon.alt = "Delete";

    deleteDiv.appendChild(deleteIcon);
    card.appendChild(deleteDiv);

    cardContent.appendChild(cardDescription);
    card.appendChild(cardImage);
    card.appendChild(cardContent);
    containerGrid.appendChild(card);
}


export const addNewPhotoToModal = (photo) => {
    const modalContent = document.querySelector(".modal");
    const card = document.createElement("div");
    card.classList.add("card");

    const publishBtn = document.createElement("button");
    publishBtn.classList.add("publish-btn", "publish-btn-general");
    publishBtn.textContent = "Publish";
    card.appendChild(publishBtn);

    const publishBtnGoogle = document.createElement("button");
    publishBtnGoogle.classList.add("publish-btn", "publish-btn-google", "publish-btn-platform");
    const publishBtnGoogleText = document.createElement("span");
    publishBtnGoogleText.textContent = "Google";
    publishBtnGoogle.appendChild(publishBtnGoogleText);
    card.appendChild(publishBtnGoogle);

    const publishBtnInstagram = document.createElement("button");
    publishBtnInstagram.classList.add("publish-btn", "publish-btn-instagram", "publish-btn-platform");
    const publishBtnInstagramText = document.createElement("span");
    publishBtnInstagramText.textContent = "Instragram";
    publishBtnInstagram.appendChild(publishBtnInstagramText);
    card.appendChild(publishBtnInstagram);

    const closeButton = document.createElement("button");
    closeButton.classList.add("modal-close");
    closeButton.textContent = "X";
    closeButton.addEventListener("click", () => {
        document.querySelector(".modal").close();
    });

    const imageContainer = document.createElement("div");
    imageContainer.classList.add("photo-editor");

    const cardImage = document.createElement("img");
    cardImage.classList.add("card-image");
    cardImage.src = `data:image/png;base64,${photo.binaryString}`;
    cardImage.setAttribute("photo-id", photo.id);

    const canvas = document.createElement("canvas");

    imageContainer.appendChild(cardImage);
    imageContainer.appendChild(canvas);

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

    const actionsBtnContainer = document.createElement("div");
    actionsBtnContainer.classList.add("card-actions-btn-container");

    const editButton = document.createElement("button");
    editButton.classList.add("card-content-edit-button");
    const editIcon = document.createElement("img");
    editIcon.src = "../svgs/edit-photo.svg";
    editButton.appendChild(editIcon);

    // Color selector
    const color = document.createElement("input");
    color.classList.add("color-selector");
    color.type = "color";
    color.style.display = 'none';

    // Redirect button
    const redirectButton = document.createElement("a");
    redirectButton.href = `http://127.0.0.1:5500/client/pages/photo.html?id=${photo.id}`;
    redirectButton.target = '_blank';
    redirectButton.classList.add("card-content-redirect-button");
    const redirectIcon = document.createElement("img");
    redirectIcon.src = "../svgs/redirect.svg";
    redirectButton.appendChild(redirectIcon);

    actionsBtnContainer.appendChild(redirectButton);
    actionsBtnContainer.appendChild(color);
    actionsBtnContainer.appendChild(editButton);

    cardActions.appendChild(likeSection);
    cardActions.appendChild(actionsBtnContainer);

    const commentsSection = document.createElement("div");
    commentsSection.classList.add("card-content-comments");
    const commentsTitle = document.createElement("p");
    commentsTitle.textContent = "Comments";
    commentsSection.appendChild(commentsTitle);

    const commentDiv = document.createElement("div");
    commentDiv.classList.add("no-comms-msg");
    const commentText = document.createElement("p");
    commentText.textContent = "There are no comments";
    commentDiv.appendChild(commentText);
    commentsSection.appendChild(commentDiv);

    const importExportContainer = document.createElement("div");
    importExportContainer.classList.add("filter-btn-container");

    const importButton = document.createElement("button");
    importButton.classList.add("import-button");
    importButton.textContent = "Import";

    const exportButton = document.createElement("button");
    exportButton.classList.add("export-button");
    exportButton.textContent = "Export";

    importExportContainer.appendChild(importButton);
    importExportContainer.appendChild(exportButton);
    commentsSection.appendChild(importExportContainer);

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
    card.appendChild(imageContainer);
    card.appendChild(cardContent);
    modalContent.appendChild(card);
}

// Utility function used in savePhoto
const getFilteredImageAsBase64 = (image, hasCanvas, filters) => {
    let canvas;
    if (hasCanvas) {
        canvas = image.nextElementSibling;
    }


    // new canvas for draw & filters
    const filteredCanvas = document.createElement('canvas');
    const context = filteredCanvas.getContext('2d');
    filteredCanvas.width = image.width;
    filteredCanvas.height = image.height;

    if (filters) {
        context.filter = filters;
    }

    // Clip path - no easy way to apply it, compute it manually
    const clipPath = getComputedStyle(image).clipPath;
    if (clipPath && clipPath.startsWith('polygon')) {
        // Parse with a random regex
        const polygonPoints = clipPath.match(/polygon\(([^)]+)\)/)[1].trim().split(',').map(point => {
            const [x, y] = point.trim().split(' ');
            return { x: parseFloat(x) / 100, y: parseFloat(y) / 100 };
        });

        // Compute each point individually
        context.beginPath();
        polygonPoints.forEach((point, index) => {
            const x = point.x * filteredCanvas.width;
            const y = point.y * filteredCanvas.height;
            if (index === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        });
        context.closePath();
        context.clip();
    }

    context.drawImage(image, 0, 0, filteredCanvas.width, filteredCanvas.height);

    if (hasCanvas) {
        context.drawImage(canvas, 0, 0, filteredCanvas.width, filteredCanvas.height);
    }

    // base64
    return filteredCanvas.toDataURL('image/png');
};

const savePhoto = async (imageElement, collage = false, width = null, height = null, hasCanvas = true, filters = null) => {
    let base64Image;

    if (collage) {
        base64Image = imageElement;
    } else {
        base64Image = getFilteredImageAsBase64(imageElement, hasCanvas, filters);
    }

    const exifData = await new Promise((resolve, reject) => {
        EXIF.getData(imageElement, function () {
            const allMetaData = EXIF.getAllTags(this);
            resolve(allMetaData);
        });
    });

    const aspectRatio = collage ? width / height : imageElement.width / imageElement.height;
    const size = collage ? `${width}x${height}` : `${imageElement.width}x${imageElement.height}`;

    const response = await fetch(`http://localhost:8081/photos`, {
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
            aspectRatio: aspectRatio,
            size: parseInt(size),
            exif: JSON.stringify(exifData) || null
        }),
    });

    if (response.ok) {
        // Could be done the other way around - check if the page is one that interests us but..
        const currentUrl = new URL(window.location.href);
        if (!currentUrl.pathname.includes("platforms.html") &&
            !currentUrl.pathname.includes("account.html") &&
            !currentUrl.pathname.includes("terms.html") &&
            !currentUrl.pathname.includes("photo.html")) {
            const newPhoto = await response.json();
            addNewPhotoToGrid(newPhoto);
            addNewPhotoToModal(newPhoto);
            document.dispatchEvent(new Event('photosLoaded'));
        }
    } else {
        console.error("Failed to save photo:", await response.text());
    }
};

export default savePhoto;


//
//
//
// Upload photo button
//
//
//

// In the .html file we use a btn, not an input type="file". Create it, but do not append to DOM
const uploadBtn = document.querySelector('.upload-btn');
const inputFile = document.createElement('input');
inputFile.type = 'file';
inputFile.accept = 'image/*';

uploadBtn.addEventListener('click', () => {
    inputFile.click();
});

inputFile.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const image = await loadImage(file);
    savePhoto(image, undefined, undefined, undefined, false);
});

// Transform the file to an URL to be able to convert to base64
const loadImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = e.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};