import { google } from "googleapis";
import type { Middleware } from "../router";
import { Res } from "../utilities/response";
import { Req } from "../utilities/request";
import { db } from "../db";

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:8081/auth/google/callback"
);

export const googleOAuth: Middleware = async (req, res) => {
  const response = new Res(res);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/photoslibrary"],
  });

  response.json({ authUrl });
};

export const googleOAuthCallback: Middleware = async (req, res) => {
  const response = new Res(res);
  const request = new Req(req);

  const { code } = request.query;
  const { tokens } = await oAuth2Client.getToken(code);

  oAuth2Client.setCredentials(tokens);

  const url = new URL(
    "http://localhost:5500/client/pages/platforms-google.html"
  );
  url.searchParams.append("access_token", tokens?.access_token || "");
  url.searchParams.append("refresh_token", tokens?.refresh_token || "");

  response.redirect(url.toString());
};

export const getGooglePhotosMiddleware: Middleware = async (req, res) => {
  const request = new Req(req);
  const response = new Res(res);

  const { access_token } = request.query;

  fetch("https://photoslibrary.googleapis.com/v1/mediaItems", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      response.json(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

type MediaMetadata = {
  creationTime: string;
  height: string;
  width: string;
};

type MediaItems = {
  baseUrl: string;
  filename: string;
  id: string;
  mediaMetadata: MediaMetadata;
  mimeType: string;
  productUrl: string;
};

type GetGooglePhotos = {
  mediaItems: MediaItems[];
  nextPageToken: string;
};

export const refreshGooglePhotosMiddleware: Middleware = async (req, res) => {
  const request = new Req(req);
  const response = new Res(res);

  const { access_token } = request.query;

  await deleteAllGooglePhotos();
  const googlePhotos = (await getGooglePhotos(access_token)) as GetGooglePhotos;

  const createPhotosPromises = googlePhotos.mediaItems.map((mediaItem) =>
    db.photo.create({
      data: {
        source: "GOOGLE_PHOTOS",
        binaryString: mediaItem.baseUrl,
        description: "Image imported from Google Photos",
        likes: 0,
        commentCount: 0,
        aspectRatio:
          parseFloat(mediaItem.mediaMetadata.width) /
          parseFloat(mediaItem.mediaMetadata.height),
        size: parseFloat(mediaItem.mediaMetadata.width),
        userId: request.userId!,
      },
    })
  );
  console.log({ createPhotosPromises });
  await Promise.all(createPhotosPromises);

  response.json(googlePhotos.mediaItems);
};

const getGooglePhotos = async (access_token: string) => {
  const response = await fetch(
    "https://photoslibrary.googleapis.com/v1/mediaItems",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  const data = await response.json();

  return data;
};

const deleteAllGooglePhotos = async () => {
  await db.photo.deleteMany({ where: { source: "GOOGLE_PHOTOS" } });
};
