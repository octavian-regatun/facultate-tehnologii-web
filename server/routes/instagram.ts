import type { Middleware } from "../router";
import { Req } from "../utilities/request";
import { Res } from "../utilities/response";

export const instagramOAuthCallback: Middleware = async (req, res) => {
  console.log("instagramOAuthCallback");

  const response = new Res(res);
  const request = new Req(req);

  const code = request.query.code;

  const instagramResponse = await fetch(
    "https://api.instagram.com/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID as string,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET as string,
        grant_type: "authorization_code",
        redirect_uri: "https://localhost:8081/auth/instagram/callback",
        code: code,
      }),
    }
  );

  const instagramData = (await instagramResponse.json()) as any;

  if (instagramResponse.ok) {
    const accessToken = instagramData.access_token;
    response.redirect(
      `https://localhost:5500/client/pages/platforms-instagram.html?access_token=${accessToken}`
    );
  } else {
    response.redirect(
      `https://localhost:5500/client/pages/platforms-instagram.html?error=${instagramData.error_message}`
    );
  }
};

export const refreshGooglePhotosMiddleware: Middleware = async (req, res) => {
  
};
