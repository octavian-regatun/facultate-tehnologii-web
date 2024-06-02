import https from 'https';
import { google } from "googleapis";
import { db } from "../db";
import type { Middleware } from "../router";

type photoData = {
  userId: number;
  binaryString: string;
  source: SourceType;
  description?: string;
  likes?: number;
  commentCount?: number;
  createdAt: Date;
  aspectRatio?: number;
  size?: number;
};

enum SourceType {
  GOOGLE_PHOTOS = "GOOGLE_PHOTOS",
  INSTAGRAM = "INSTAGRAM",
  NOT_POSTED = "NOT_POSTED"
}


export const getYoutubeThumbnail = async (videoId: string) => {
  try {
    // Get the YouTube service
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.GOOGLE_API_KEY,
    });

    // Retrieve the video data
    const response = await youtube.videos.list({
      part: ["snippet"],
      id: [videoId],
    });

    // Check if the video exists and has a snippet
    const items = response.data.items;
    if (!items || items.length === 0) {
      throw new Error("Video not found");
    }

    // Access the high-quality thumbnail URL
    const thumbnailUrl = items[0]?.snippet?.thumbnails?.high?.url;

    return thumbnailUrl;
  } catch (error) {
    console.error("Failed to fetch video thumbnail:", (error as Error).message);
    throw error;
  }
};

// Transform the photo to a binary
const fetchPhotoData = async (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks: Uint8Array[] = [];
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });

      response.on('error', (err) => {
        reject(err);
      });
    });
  });
};

// Function to save photo data to the database
export const savePhotoToDb = async (data: photoData) => {
  try {
    const newPhoto = await db.photo.create({
      data: {
        userId: data.userId,
        binaryString: data.binaryString,
        source: data.source,
        description: data.description || null,
        likes: data.likes || null,
        commentCount: data.commentCount || null,
        createdAt: data.createdAt,
        aspectRatio: data.aspectRatio || null,
        size: data.size || null,
      },
    });

    return newPhoto;
  } catch (error) {
    console.error('Failed to save photo to the database:', (error as Error).message);
    throw error;
  }
};

// Middleware to handle image upload
export const uploadImageMiddleware: Middleware = async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const data = JSON.parse(body) as photoData;

      if (!data.binaryString || !data.userId || !data.source) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing required fields: binaryString, userId, source");
        return;
      }

      const imageData = await fetchPhotoData(data.binaryString);

      // Save to DB - change the binaryString to the newly obtained string ^^
      const newPhoto = await savePhotoToDb({
        ...data,
        binaryString: imageData.toString('base64')
      });

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newPhoto));
    } catch (error) {
      console.error('Failed to upload image:', error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  });
};




export const getPhotosMiddleware: Middleware = async (req, res) => {
  const urlParts = req.url?.split('/');
  const userId = urlParts ? parseInt(urlParts[urlParts.length - 1], 10) : NaN;

  if (isNaN(userId)) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid user ID");
    return;
  }

  try {
    const photos = await db.photo.findMany({
      where: {
        userId: userId,
      },
    });

    if (photos.length === 0) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("No photos found for this user");
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(photos));
  } catch (error) {
    console.error('Failed to retrieve photos:', error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
};