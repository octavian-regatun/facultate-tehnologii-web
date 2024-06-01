import https from 'https';
import { google } from "googleapis";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type photoData = {
  id: number;
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

export const savePhotoToDb = async (data: photoData) => {
  try {
    const convertedUrl = await fetchPhotoData(data.binaryString);
    const base64String = convertedUrl.toString('base64');

    const newPhoto = await prisma.photo.create({
      data: {
        userId: data.userId,
        binaryString: base64String,
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