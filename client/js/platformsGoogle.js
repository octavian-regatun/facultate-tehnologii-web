document.addEventListener("DOMContentLoaded", async () => {
  updateAccessToken();

  if (!(await checkValidGoogleToken())) {
    await authenticateWithGoogle();
  }
});

const refreshButtonOnClick = async () => {
  await refreshGooglePhotos();
  window.location.reload();
};

const updateAccessToken = async () => {
  const urlSP = new URLSearchParams(window.location.search);
  const accessTokenSP = urlSP.get("access_token");
  if (accessTokenSP) localStorage.setItem("accessToken", accessTokenSP);
};

const checkValidGoogleToken = async () => {
  const accessToken = localStorage.getItem("accessToken");

  const photos = await fetch(
    "https://photoslibrary.googleapis.com/v1/mediaItems",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error:", error);
    });

  return photos?.error?.code !== 401;
};

const getInstagramOAuthUrl = async () => {
  const response = await fetch("https://localhost:8081/auth/google");
  const data = await response.json();
  return data.authUrl;
};

const authenticateWithGoogle = async () => {
  const googleOAuthUrl = await authenticateWithInstagram();
  window.location.href = googleOAuthUrl;
};

const refreshGooglePhotos = async () => {
  const jwt = localStorage.getItem("token");
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(
    `https://localhost:8081/photos/google/refresh?access_token=${accessToken}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const photos = await response.json();

  console.log(photos);
};
