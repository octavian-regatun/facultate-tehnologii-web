document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("uid");

  if (!token || !userId) {
    console.error("User not authenticated");
    return;
  }

  const currentUrl = new URL(window.location.href);
  const searchParams = currentUrl.searchParams;

  // Using default values for the query
  let search = searchParams.get("search") || "";
  let platform = "All";
  let aspectRatio = "Any";
  let size = "Any";
  let order = "Date ascending";

  // platform to fetch from
  if (currentUrl.href.includes("platforms-google")) {
    platform = "GOOGLE PHOTOS";
  } else if (currentUrl.href.includes("instagram")) {
    platform = "INSTAGRAM";
  } else {
    // if on search, use the query
    platform = searchParams.get("platform") || platform;
    aspectRatio = searchParams.get("aspect-ratio") || aspectRatio;
    size = searchParams.get("size") || size;
    order = searchParams.get("order") || order;
  }

  // create the req
  const url = new URL(
    `http://localhost:8081/photos/${userId}`,
    window.location.origin
  );
  url.searchParams.append("search", search);
  url.searchParams.append("platform", platform);
  url.searchParams.append("aspect-ratio", aspectRatio);
  url.searchParams.append("size", size);
  url.searchParams.append("order", order);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const photos = await response.json();
      displayPhotos(photos);
      await displayModalPhotos(photos);

      document.dispatchEvent(new Event("photosLoaded"));
    } else {
      const error = await response.text();
      console.error("Failed to fetch photos:", error);
      displayNoPhotosMessage(
        "Oops..Looks like you don't have any photos. Try fetching some first!"
      );
    }
  } catch (error) {
    console.error("Error fetching photos:", error);
    displayNoPhotosMessage(
      "Oops..there were some problems in getting your photos. Try again using a page refresh!"
    );
  }
});

const displayNoPhotosMessage = (msg) => {
  const container = document.querySelector(".container-grid");
  const div = document.createElement("div");
  div.classList.add("no-images");
  const p = document.createElement("p");
  p.textContent = msg;
  const img = document.createElement("img");
  img.src = "../svgs/no-imgs.svg";

  div.appendChild(p);
  div.appendChild(img);
  container.appendChild(div);
};

function displayPhotos(photos) {
  const containerGrid = document.querySelector(".container-grid");
  containerGrid.innerHTML = ""; // I don't think there will be anything here, but just to be sure
  // LE: There is: loading photo

  if (photos.length === 0) {
    displayNoPhotosMessage(
      "Oops..Looks like you don't have any photos. Try fetching some first!"
    );
    return;
  }

  photos.forEach((photo) => {
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
    deleteDiv.classList.add("delete-div");
    const deleteIcon = document.createElement("img");
    deleteIcon.classList.add("delete-img");
    deleteIcon.src = "../svgs/delete.svg";
    deleteIcon.alt = "Delete";

    deleteDiv.appendChild(deleteIcon);
    card.appendChild(deleteDiv);

    cardContent.appendChild(cardDescription);
    card.appendChild(cardImage);
    card.appendChild(cardContent);
    containerGrid.appendChild(card);
  });
}

async function displayModalPhotos(photos) {
  const modalContent = document.querySelector(".modal");
  modalContent.innerHTML = ""; // Clear existing content

  // Previous button < (the next button is at the end of this function)
  const previousButton = document.createElement("button");
  previousButton.classList.add("modal-previous-button");
  const previousButtonIcon = document.createElement("img");
  previousButtonIcon.src = "../svgs/left-arrow.svg";
  previousButton.appendChild(previousButtonIcon);
  modalContent.appendChild(previousButton);

  // Fetch comments for all photos
  const commentsPromises = photos.map((photo) => getCommentsFromDB(photo.id));
  const allComments = await Promise.all(commentsPromises);

  // Each individual card
  photos.forEach((photo, index) => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Publish button on top
    const publishBtn = document.createElement("button");
    publishBtn.classList.add("publish-btn", "publish-btn-general");
    publishBtn.textContent = "Publish";
    card.appendChild(publishBtn);

    const publishBtnGoogle = document.createElement("button");
    publishBtnGoogle.classList.add(
      "publish-btn",
      "publish-btn-google",
      "publish-btn-platform"
    );
    const publishBtnGoogleText = document.createElement("span");
    publishBtnGoogleText.textContent = "Google";
    publishBtnGoogle.appendChild(publishBtnGoogleText);
    card.appendChild(publishBtnGoogle);

    const publishBtnInstagram = document.createElement("button");
    publishBtnInstagram.classList.add(
      "publish-btn",
      "publish-btn-instagram",
      "publish-btn-platform"
    );
    const publishBtnInstagramText = document.createElement("span");
    publishBtnInstagramText.textContent = "Instragram";
    publishBtnInstagram.appendChild(publishBtnInstagramText);
    card.appendChild(publishBtnInstagram);

    // Close button
    const closeButton = document.createElement("button");
    closeButton.classList.add("modal-close");
    closeButton.textContent = "X";
    closeButton.addEventListener("click", () => {
      document.querySelector(".modal").close();
    });

    // Image itself
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("photo-editor");

    const cardImage = document.createElement("img");
    cardImage.classList.add("card-image");
    cardImage.src = `data:image/png;base64,${photo.binaryString}`;
    cardImage.setAttribute("photo-id", photo.id);

    // Canvas on top of the img (needed for edit)
    const canvas = document.createElement("canvas");

    imageContainer.appendChild(cardImage);
    imageContainer.appendChild(canvas);

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    // Description
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
    likeCount.textContent = photo.likes || 0;
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
    color.style.display = "none";

    // Redirect button
    const redirectButton = document.createElement("a");
    redirectButton.href = `/client/pages/photo.html?id=${photo.id}`;
    redirectButton.target = "_blank";
    redirectButton.classList.add("card-content-redirect-button");
    const redirectIcon = document.createElement("img");
    redirectIcon.src = "../svgs/redirect.svg";
    redirectButton.appendChild(redirectIcon);

    // Refresh button appears only for posts uploaded on Instagram
    if (photo.source == "INSTAGRAM") {
      const refreshButton = document.createElement("button");
      refreshButton.classList.add("card-content-refresh-button");
      refreshButton.setAttribute("photo-id", photo.id);
      const refreshIcon = document.createElement("img");
      refreshIcon.src = "../svgs/refresh.svg";
      refreshButton.appendChild(refreshIcon);

      actionsBtnContainer.appendChild(refreshButton);
    }

    actionsBtnContainer.appendChild(color);
    actionsBtnContainer.appendChild(redirectButton);
    actionsBtnContainer.appendChild(editButton);

    cardActions.appendChild(likeSection);
    cardActions.appendChild(actionsBtnContainer);

    // Comments
    const commentsSection = document.createElement("div");
    commentsSection.classList.add("card-content-comments");
    const commentsTitle = document.createElement("p");
    commentsTitle.textContent = "Comments";
    commentsSection.appendChild(commentsTitle);

    const comments = allComments[index];
    if (comments && comments.length) {
      comments.forEach((comment) => {
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
      commentDiv.classList.add("no-comms-msg");
      const commentText = document.createElement("p");
      commentText.textContent = "There are no comments";
      commentDiv.appendChild(commentText);
      commentsSection.appendChild(commentDiv);
    }

    // Import / export buttons
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

    // Edit photo section
    const editSection = document.createElement("div");
    editSection.classList.add("card-content-edit");

    // Filters (sliders)
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
  });

  // Next button >
  const nextButton = document.createElement("button");
  nextButton.classList.add("modal-next-button");
  const nextButtonIcon = document.createElement("img");
  nextButtonIcon.src = "../svgs/right-arrow.svg";
  nextButton.appendChild(nextButtonIcon);
  modalContent.appendChild(nextButton);
}

const getCommentsFromDB = async (id, refresh = 0) => {
  const token = localStorage.getItem("token");
  const url = new URL(`http://localhost:8081/comments/${id}`);

  if (refresh === 1) {
    url.searchParams.append("refresh", "true");
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
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
