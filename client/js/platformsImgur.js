document.addEventListener("DOMContentLoaded", async () => {
    updateAccessToken();
  
    if (!(await checkValidImgurToken())) {
      await authenticateWithImgur();
    }
  });
  
  const refreshButtonOnClick = async () => {
    await refreshImgurPhotos();
    window.location.reload();
  };
  
  const updateAccessToken = () => {
    const urlFragment = window.location.hash;
    const accessToken = new URLSearchParams(urlFragment.substring(1)).get("access_token");
    if (accessToken) {
      localStorage.setItem("imgurAccessToken", accessToken);
      window.location.hash = '';
    }
  };
  
  const checkValidImgurToken = async () => {
    const accessToken = localStorage.getItem("imgurAccessToken");
  
    if (!accessToken) {
      return false;
    }
    const photos = await fetch("https://api.imgur.com/3/account/me/images", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error:", error);
      });
  
    return photos?.data !== undefined;
  };
  
  const getImgurOAuthUrl = async () => {
    const response = await fetch("https://localhost:8081/auth/imgur");
    const data = await response.json();
    return data.authUrl;
  };
  
  const authenticateWithImgur = async () => {
    const imgurOAuthUrl = await getImgurOAuthUrl();
    window.location.href = imgurOAuthUrl;
  };
  
  const refreshImgurPhotos = async () => {
    const jwt = localStorage.getItem("token");
    const accessToken = localStorage.getItem("imgurAccessToken");
  
    const response = await fetch(
      `https://localhost:8081/photos/imgur/refresh?access_token=${accessToken}`,
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
  