document.addEventListener("DOMContentLoaded", async () => {
  const urlSP = new URLSearchParams(window.location.search);

  const accessTokenSP = urlSP.get("access_token");

  if (accessTokenSP) localStorage.setItem("accessToken", accessTokenSP);

  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) return;

  localStorage.setItem("accessToken", accessTokenSP);

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

  console.log({photos});
});
