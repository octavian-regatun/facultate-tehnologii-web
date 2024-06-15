import savePhoto from "./savePhoto.js";

const createCollage = () => {
    const body = document.querySelector('body');
    const cards = document.querySelectorAll('.card-checkmark');

    const container = document.createElement("div");
    container.classList.add("collage-container");

    cards.forEach((card, index) => {
        const img = card.closest('.card').querySelector('.card-image').cloneNode(true);
        img.classList.add('collage-photo');
        container.appendChild(img);
        img.addEventListener('click', () => {
            img.style.objectFit = img.style.objectFit === 'contain' ? 'cover' : 'contain';
        });
    });

    // Options div
    const optionsDiv = document.createElement("div");
    optionsDiv.classList.add("collage-extra-container", "collage-options-container");

    const columnsDiv = document.createElement("div");
    columnsDiv.classList.add("select-container");

    const labelColumns = document.createElement("label");
    labelColumns.setAttribute("for", "columns");
    labelColumns.textContent = "Columns:";
    const selectColumns = document.createElement("select");
    selectColumns.id = "columns";
    for(let i = 1; i <= Math.min(6, cards.length); i++) {
        const option = document.createElement("option");
        option.setAttribute("value", i);
        option.textContent = i;
        selectColumns.appendChild(option);
    }

    // Default columns: no. of selected cards
    selectColumns.value = cards.length;
    container.style.gridTemplateColumns = `repeat(${cards.length}, 1fr)`;

    columnsDiv.appendChild(labelColumns);
    columnsDiv.appendChild(selectColumns);

    const aspectDiv = document.createElement("div");
    aspectDiv.classList.add("select-container");

    const labelAspect = document.createElement("label");
    labelAspect.setAttribute("for", "aspect");
    labelAspect.textContent = "Aspect Ratio:";
    const selectAspect = document.createElement("select");
    selectAspect.id = "aspect";

    const values = ['16/9', '4/3', '1/1', '3/4', '9/16'];
    values.forEach(value => {
        const option = document.createElement("option");
        option.setAttribute("value", value);
        option.textContent = value;
        selectAspect.appendChild(option);
    });
    selectAspect.value = '16/9';

    aspectDiv.appendChild(labelAspect);
    aspectDiv.appendChild(selectAspect);

    optionsDiv.appendChild(columnsDiv);
    optionsDiv.appendChild(aspectDiv);

    // select - event listeners
    selectColumns.addEventListener('change', () => {
        const columns = selectColumns.value;
        container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        resetGridColumns(container);
        adjustGridLayout(container, cards.length);
    });

    selectAspect.addEventListener('change', () => {
        const aspectRatio = selectAspect.value;
        container.style.aspectRatio = aspectRatio;
    });

    // Confirmation div
    const confirmationDiv = document.createElement("div");
    confirmationDiv.classList.add("collage-extra-container", "collage-confirm-container");

    const saveButton = document.createElement("button");
    saveButton.classList.add("btn");
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", () => {
        saveCollage(container);
        document.body.removeChild(optionsDiv);
        document.body.removeChild(confirmationDiv);
        document.body.removeChild(container);
        removeBackgroundBlur();
    });

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("btn");
    cancelButton.textContent = "Cancel";

    cancelButton.addEventListener("click", () => {
        document.body.removeChild(optionsDiv);
        document.body.removeChild(confirmationDiv);
        document.body.removeChild(container);
        removeBackgroundBlur();
    });

    confirmationDiv.appendChild(saveButton);
    confirmationDiv.appendChild(cancelButton);

    body.appendChild(optionsDiv);
    body.appendChild(container);
    body.appendChild(confirmationDiv);

    adjustGridLayout(container, cards.length);
};

const resetGridColumns = (container) => {
    const images = container.getElementsByClassName('collage-photo');
    Array.from(images).forEach(img => {
        img.style.gridColumn = '';
    });
};

const adjustGridLayout = (container, numPhotos) => {
    const columns = parseInt(getComputedStyle(container).gridTemplateColumns.split(' ').length, 10);

    if (numPhotos % columns !== 0) {
        const remaining = numPhotos % columns;
        const lastRowStartIndex = numPhotos - remaining;

        for (let i = lastRowStartIndex; i < numPhotos; i++) {
            const img = container.children[i];
            img.style.gridColumn = `span ${Math.ceil(columns / remaining)}`;
        }
    }
};

const removeBackgroundBlur = () => {
    const navbar = document.querySelector('.navbar');
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');
    navbar.classList.remove("blur-background");
    sidebar.classList.remove("blur-background");
    container.classList.remove("blur-background");
};



// Total hours wasted here: anywhere between 4 and 8
const saveCollage = async (container) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const containerRect = container.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;

    const images = container.querySelectorAll('img');

    images.forEach((img) => {
        const imgRect = img.getBoundingClientRect();
        const x = imgRect.left - containerRect.left;
        const y = imgRect.top - containerRect.top;
        const width = imgRect.width;
        const height = imgRect.height;

        // Displayed dimensions - naturalWidth/naturalHeight
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        const objectFit = getComputedStyle(img).objectFit;

        if (objectFit === 'cover') {
            // Get the scale of the rendered image by the grid
            const scale = Math.max(width / naturalWidth, height / naturalHeight);
            const scaledWidth = naturalWidth * scale;
            const scaledHeight = naturalHeight * scale;

            // center the image like cover does
            const offsetX = (scaledWidth - width) / 2;
            const offsetY = (scaledHeight - height) / 2;

            context.drawImage(img, offsetX / scale, offsetY / scale, naturalWidth - 2 * (offsetX / scale), naturalHeight - 2 * (offsetY / scale), x, y, width, height);
        } else if (objectFit === 'contain') {
            const scale = Math.min(width / naturalWidth, height / naturalHeight);
            const scaledWidth = naturalWidth * scale;
            const scaledHeight = naturalHeight * scale;
            const offsetX = (width - scaledWidth) / 2;
            const offsetY = (height - scaledHeight) / 2;

            context.drawImage(img, 0, 0, naturalWidth, naturalHeight, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
        } else { // 'fill'
            console.log(`img doesn't have cover nor contain??`);
            context.drawImage(img, x, y, width, height);
        }

    });

    const dataURL = canvas.toDataURL('image/png');
    savePhoto(dataURL, true, canvas.width, canvas.height);
};



export default createCollage;