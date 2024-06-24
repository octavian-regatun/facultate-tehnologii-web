const imgur = async (img) => {
    await uploadImage(img.src.split(",")[1]);
};

const uploadImage = async (base64Image) => {
    const accessToken = localStorage.getItem("imgurAccessToken");

    const response = await fetch("https://api.imgur.com/3/upload", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            image: base64Image,
            type: "base64",
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to upload image to Imgur");
    }

    return await response.json();
};

export default imgur;
