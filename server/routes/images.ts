import https from 'https';
import { google } from "googleapis";
import { db } from "../db";
import type { Middleware } from "../router";
import type { Photo } from '@prisma/client';

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
export const savePhotoToDb = async (data: Photo) => {
  try {
    const newPhoto = await db.photo.create({
      data: {
        userId: data.userId,
        url: data.url || null,
        binaryString: data.binaryString || null,
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
      const data = JSON.parse(body) as Photo;

      if ((!data.binaryString && !data.url) || !data.userId || !data.source) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing required fields: binaryString OR url, userId, source");
        return;
      }


      // There are two types of saving methods:
      // - using an URL
      // - using a base 64 string
      let imageData, newPhoto;
      if (data.url) {
        imageData = await fetchPhotoData(data.url);
        newPhoto = await savePhotoToDb({
          ...data,
          binaryString: imageData.toString('base64')
        });
      } else {
        newPhoto = await savePhotoToDb(data);
      }

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newPhoto));
    } catch (error) {
      console.error('Failed to upload image:', error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  });
};


const applyFilters = (req: any, userId: number) => {
  const urlString = req.url ? `http://${req.headers.host}${req.url}` : '';
  const url = new URL(urlString);
  const search = url.searchParams.get('search') || '';
  const platform = url.searchParams.get('platform') || 'All';
  const aspectRatio = url.searchParams.get('aspect-ratio') || 'Any';
  const size = url.searchParams.get('size') || 'Any';
  const order = url.searchParams.get('order') || 'Date ascending';

  const filterConditions: any = {
    userId: userId,
  };

  if (search) {
    filterConditions.description = {
      contains: search,
    };
  }

  if (platform !== 'All') {
    const enumPlatform = platform.toUpperCase().replace(' ', '_');
    filterConditions.source = enumPlatform;
  }

  if (aspectRatio !== 'Any') {
    const [width, height] = aspectRatio.split('/').map(Number);
    // in case someone manually edits the link, let's not crash the server
    if (!isNaN(width) && !isNaN(height) && height !== 0) {
      const aspectRatioValue = width / height;
      const tolerance = 0.2; // will see later if it needs to be changed
      filterConditions.aspectRatio = {
        gte: aspectRatioValue - tolerance,
        lte: aspectRatioValue + tolerance,
      };
    }
  }

  // Long list of applying the filters one by one
  if (size !== 'Any') {
    switch (size) {
      case '<500':
        filterConditions.size = {
          lt: 500,
        };
        break;
      case '500-1000':
        filterConditions.size = {
          gte: 500,
          lte: 1000,
        };
        break;
      case '>1000':
        filterConditions.size = {
          gt: 1000,
        };
        break;
      default:
        break;
    }
  }

  let orderBy: any = {};
  if (order.includes('Date')) {
    orderBy = {
      createdAt: order.includes('ascending') ? 'asc' : 'desc',
    };
  } else if (order.includes('Likes')) {
    orderBy = {
      likes: order.includes('ascending') ? 'asc' : 'desc',
    };
  } else if (order.includes('Comments')) {
    orderBy = {
      commentCount: order.includes('ascending') ? 'asc' : 'desc',
    };
  }

  return { filterConditions, orderBy };
};



export const getPhotosMiddleware: Middleware = async (req, res) => {
  const urlParts = req.url?.split('/');
  const userId = urlParts ? parseInt(urlParts[urlParts.length - 1], 10) : NaN;

  if (isNaN(userId)) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid user ID");
    return;
  }

  const { filterConditions, orderBy } = applyFilters(req, userId);

  try {
    const photos = await db.photo.findMany({
      where: filterConditions,
      orderBy: orderBy,
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(photos));
  } catch (error) {
    console.error('Failed to retrieve photos:', error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
};





export const deletePhotosMiddleware: Middleware = async (req, res) => {
  const urlParts = req.url?.split('/');
  const imageId = urlParts ? parseInt(urlParts[urlParts.length - 1], 10) : NaN;

  if (isNaN(imageId)) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid image ID");
    return;
  }

  try {
    const photo = await db.photo.delete({
      where: {
        id: imageId,
      },
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(photo));
  } catch (error) {
    console.error('Failed to delete photo:', error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
};