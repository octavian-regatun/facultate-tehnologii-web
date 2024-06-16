import { db } from "../db";
import type { Middleware } from "../router";
import type { Comment } from "@prisma/client";

const getPhotoUrlById = async (photoId: number): Promise<string | null> => {
  try {
    const photo = await db.photo.findUnique({
      where: { id: photoId },
      select: { url: true } // equivalent to SELECT url from Photos where ...
    });

    return photo?.url || null;
  } catch (error) {
    console.error('Failed to get photo URL:', error);
    throw error;
  }
};

const updateComments = async (photoId: number) => {
  const photoUrl = await getPhotoUrlById(photoId);
  if (photoUrl) {
    // TODO: delete everything from photo's comments? and append the new comms
    return;
  } else {
    console.error('Photo URL not found');
  }
};

export const getCommentsMiddleware: Middleware = async (req, res) => {
  const urlParts = req.url?.split('/');
  const photoId = urlParts ? parseInt(urlParts[urlParts.length - 1], 10) : NaN;
  const url = new URL(req.url!, `http://${req.headers.host}`); // ! = it won't be undefined
  const refresh = url.searchParams.get('refresh') === 'true';

  if (isNaN(photoId)) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid photo ID");
    return;
  }

  try {
    if (refresh) {
      await updateComments(photoId);
    }

    const comments = await db.comment.findMany({
      where: {
        photoId: photoId,
      },
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(comments));
  } catch (error) {
    console.error('Failed to retrieve comments:', error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
};


export const uploadCommentMiddleware: Middleware = async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const comments = JSON.parse(body) as Comment[];

      if (!Array.isArray(comments)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid input: expected an array of comments");
        return;
      }

      for (const comment of comments) {
        if (!comment.photoId || !comment.author || !comment.content) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Missing required fields in one of the comments: photoId, author, content");
          return;
        }
      }

      const savedComments = await Promise.all(comments.map(saveCommentToDB));

      // comment count
      // can't be done in saveCommentToDB because concurrent threads
      const photoIds = [...new Set(comments.map(comment => comment.photoId))];
      for (const photoId of photoIds) {
        const count = await db.comment.count({
          where: { photoId },
        });
        await db.photo.update({
          where: { id: photoId },
          data: { commentCount: count },
        });
      }

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(savedComments));
    } catch (error) {
      console.error('Failed to upload comments:', error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  });
};


export const saveCommentToDB = async (data: Comment) => {
  try {
    // Step 1: get the userID (needed for cascade delete methods)
    const photo = await db.photo.findUnique({
      where: { id: data.photoId },
      select: { userId: true, commentCount: true },
    });

    if (!photo) {
      throw new Error('Photo not found');
    }

    // Step 2: Save the comment
    const newComment = await db.comment.create({
      data: {
        photoId: data.photoId,
        author: data.author,
        content: data.content,
        timestamp: data.timestamp || null,
        userId: photo.userId,
      },
    });

    return newComment;
  } catch (error) {
    console.error('Failed to save comment to the database:', (error as Error).message);
    throw error;
  }
};