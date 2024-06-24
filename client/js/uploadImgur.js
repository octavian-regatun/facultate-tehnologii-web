const imgur = async (img) => {
  const data = await uploadImage(img.src.split(",")[1]);

  console.log(data);
};

const uploadImage = async (base64Image) => {
  const accessToken = localStorage.getItem("accessTokenImgur");

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

  return await response.json();
};

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

export default imgur;
