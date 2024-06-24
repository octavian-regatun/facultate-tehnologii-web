document.addEventListener("DOMContentLoaded", async () => {
  updateAccessToken();

  // if (!(await checkValidInstagramToken())) {
  //   await authenticateWithInstagram();
  // }
});

const refreshButtonOnClick = async () => {
  await refreshInstagramPhotos();
  window.location.reload();
};

const authenticateWithInstagram = async () => {
  const url =
    "https://api.instagram.com/oauth/authorize?client_id=1136683020921221&redirect_uri=https://localhost:8081/auth/instagram/callback&scope=user_profile,user_media&response_type=code";
  window.location.href = url;
};

const updateAccessToken = async () => {
  const urlSP = new URLSearchParams(window.location.search);
  const accessTokenSP = urlSP.get("access_token");
  if (accessTokenSP)
    localStorage.setItem("accessTokenInstagram", accessTokenSP);
};

const checkValidInstagramToken = async () => {
  const accessToken = localStorage.getItem("accessTokenInstagram");
  const url = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      return true;
    } else {
      console.error("Error fetching user ID:", data.error.message);
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};

const refreshInstagramPhotos = async () => {
  const jwt = localStorage.getItem("token");
  const accessToken = localStorage.getItem("accessTokenInstagram");

  const response = await fetch(
    `https://localhost:8081/photos/instagram/refresh?access_token=${accessToken}`,
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
