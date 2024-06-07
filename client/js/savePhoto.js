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
        console.log("Photo saved successfully");
        // addNewPhotoToGrid(newPhoto);
        // addNewPhotoToModal(newPhoto);
    } else {
        console.error("Failed to save photo:", await response.text());
    }
};

export default savePhoto;