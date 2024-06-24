// https://api.imgur.com/oauth2/authorize?response_type=token&client_id=877e292f535ec23
document.addEventListener("DOMContentLoaded", async () => {
  updateAccessToken();
});

const refreshButtonOnClick = async () => {};

const updateAccessToken = async () => {
  const urlSP = new URLSearchParams(window.location.href.split("#")[1]);
  const accessTokenSP = urlSP.get("access_token");
  if (accessTokenSP) localStorage.setItem("accessTokenImgur", accessTokenSP);
};
