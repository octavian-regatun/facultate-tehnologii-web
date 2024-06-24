import { db } from "../db";
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

type GetInstagramPhotos = {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
  timestamp: string;
};

export const refreshInstagramPhotosMiddleware: Middleware = async (
  req,
  res
) => {
  const request = new Req(req);
  const response = new Res(res);

  const instagramPhotos = (await getInstagramPhotos(
    request.query.access_token as string
  )) as GetInstagramPhotos[];

  // const createPhotosPromises = instagramPhotos.map(async (instagramPhoto) =>
  //   db.photo.create({
  //     data: {
  //       source: "INSTAGRAM",
  //       binaryString: await convertImageToBase64(instagramPhoto.media_url),
  //       description: instagramPhoto.caption,
  //       likes: 0,
  //       commentCount: 0,
  //       aspectRatio:
  //         parseFloat(instagramPhoto.mediaMetadata.width) /
  //         parseFloat(instagramPhoto.mediaMetadata.height),
  //       size: parseFloat(instagramPhoto.mediaMetadata.width),
  //       userId: request.userId!,
  //     },
  //   })
  // );

  // await Promise.all(createPhotosPromises);

  response.json(
    await getInstagramPhotoDetails(
      request.query.access_token as string,
      instagramPhotos[0].id
    )
  );
};

const getInstagramPhotos = async (accessToken: string) => {
  let media = [] as any[];
  let nextPageUrl:
    | string
    | null = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${accessToken}`;

  while (nextPageUrl) {
    try {
      const response = await fetch(nextPageUrl);
      const data = (await response.json()) as {
        data: GetInstagramPhotos[];
        paging: { next: string };
        error: { message: string };
      };

      if (response.ok) {
        media = media.concat(data.data);
        nextPageUrl = data.paging ? data.paging.next : null;
      } else {
        console.error("Error fetching user media:", data.error.message);
        break;
      }
    } catch (error) {
      console.error("Error:", error);
      break;
    }
  }

  return media;
};

async function getInstagramPhotoDetails(accessToken: string, mediaId: string) {
  const mediaDetailUrl = `https://graph.instagram.com/${mediaId}/comments?fields=id,media_type,media_url,username,timestamp,caption,like_count,comments_count&access_token=${accessToken}`;

  try {
    const response = await fetch(mediaDetailUrl);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      console.error("Error fetching media details:", data.error.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

const deleteAllGooglePhotos = async (userId: number) => {
  await db.photo.deleteMany({
    where: { source: "GOOGLE_PHOTOS", userId: userId },
  });
};

const convertImageToBase64 = async (imageUrl: string) => {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const base64String = Buffer.from(buffer).toString("base64");
  return base64String;
};
