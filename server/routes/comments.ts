import { db } from "../db";
import type { Middleware } from "../router";

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