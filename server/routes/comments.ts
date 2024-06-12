import { db } from "../db";
import type { Middleware } from "../router";
import type { Comment } from "@prisma/client";

export const getCommentsMiddleware: Middleware = async (req, res) => {
  const urlParts = req.url?.split('/');
  const photoId = urlParts ? parseInt(urlParts[urlParts.length - 1], 10) : NaN;

  if (isNaN(photoId)) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid photo ID");
    return;
  }

  try {
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
      const data = JSON.parse(body) as Comment;

      if (!data.photoId || !data.author || !data.content) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing required fields: photoId, author, content");
        return;
      }

      const newComment = await saveCommentToDB(data);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newComment));
    } catch (error) {
      console.error('Failed to upload image:', error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  });
};

export const saveCommentToDB = async (data: Comment) => {
  try {
    const newComment = await db.comment.create({
      data: {
        photoId: data.photoId,
        author: data.author,
        content: data.content,
        timestamp: data.timestamp || null,
      },
    });

    return newComment;
  } catch (error) {
    console.error('Failed to save comment to the database:', (error as Error).message);
    throw error;
  }
};