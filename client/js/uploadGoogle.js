const google = async (img) => {
  const blob = base64ToBlob(img.src);
  const uploadToken = await getUploadToken(blob);
  const mediaItem = await createMediaItem(uploadToken);
};

const getUploadToken = async (base64Image) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(
    "https://photoslibrary.googleapis.com/v1/uploads",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
        "X-Goog-Upload-File-Name": "octavian.png",
        "X-Goog-Upload-Protocol": "raw",
      },
      body: base64Image,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  return await response.text();
};

async function createMediaItem(uploadToken) {
  const accessToken = localStorage.getItem("accessToken");

  const createMediaItemResponse = await fetch(
    "https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newMediaItems: [
          {
            simpleMediaItem: {
              uploadToken: uploadToken,
            },
          },
        ],
      }),
    }
  );

  const mediaItemData = await createMediaItemResponse.json();
  return mediaItemData;
}

const base64ToBlob = (base64) => {
  const base64Data = base64.split(",")[1];

  // Decode the base64 string into binary data
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: "image/png" });
};

export default google;
