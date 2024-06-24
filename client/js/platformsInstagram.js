document.addEventListener("DOMContentLoaded", async () => {
  getInstagramOAuthUrl();
});

const getInstagramOAuthUrl = async () => {
  const INSTAGRAM_CLIENT_ID = "1136683020921221";
  const redirectUri =
    "https://localhost:5500/client/pages/platforms-instagram.html";
  const url = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${redirectUri}&scope=instagram_basic,instagram_manage_insights`;
  console.log(url);
  //   window.location.href = url;
};
