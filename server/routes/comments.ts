import { db } from "../db";
import type { Middleware } from "../router";
import type { Comment } from "@prisma/client";

// Submissions by an user - returns [] ??
const fetchGallerySubmissions = async (username: string, clientId: string): Promise<any[]> => {
  const response = await fetch(`https://api.imgur.com/3/account/${username}/submissions`, {
    headers: {
      Authorization: `Client-ID ${clientId}`
    }
  });

  console.log('Response from Imgur:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to fetch gallery submissions from Imgur:', errorText);
    throw new Error(`Failed to fetch gallery submissions from Imgur: ${response.status} ${response.statusText}`);
  }

  const data: any = await response.json();
  console.log('Gallery submissions data:', data);

  return data.data;
};

const getGalleryHashByPhotoId = async (photoId: string, username: string, clientId: string): Promise<string | null> => {
  try {
    const submissions = await fetchGallerySubmissions(username, clientId);
    console.log('Submissions:', submissions);

    const submission = submissions.find(sub => sub.link === `https://i.imgur.com/${photoId}.jpg`);
    return submission ? submission.id : null;
  } catch (error) {
    console.error('Failed to get gallery hash:', error);
    return null;
  }
};

// Fetch comments from a post (use gallery ID)
const fetchCommentsFromImgur = async (galleryHash: string, clientId: string | undefined): Promise<ImgurComment[]> => {
  try {
    const response = await fetch(`https://api.imgur.com/3/gallery/bUPEXVg/comments/best`, {
      headers: {
        Authorization: `Client-ID ${clientId}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch comments from Imgur');
    }

    const data: any = await response.json();

    return data.data.map((comment: any) => ({
      author: comment.author,
      comment: comment.comment,
      datetime: comment.datetime * 1000,
    }));
  } catch (error) {
    console.error('Failed to fetch comments from Imgur:', error);
    throw error;
  }
};


interface ImgurComment {
  author: string;
  comment: string;
  datetime: number;
}

const updateComments = async (photoId: number, username: string | null, clientId: string | undefined) => {
  // const galleryHash = await getGalleryHashByPhotoId(photoId, username, clientId);
  // if (!galleryHash) {
  //   console.error('Gallery hash not found');
  //   return;
  // }
  const galleryHash = 'a'; // placeholder

  try {
    const comments: ImgurComment[] = await fetchCommentsFromImgur(galleryHash, clientId);

    await db.comment.deleteMany({
      where: { photoId: photoId },
    });

    const newComments = comments.map(comment => ({
      photoId: photoId,
      author: comment.author,
      content: comment.comment,
      timestamp: new Date(comment.datetime),
    }));

    await db.comment.createMany({ data: newComments });

    console.log('Comments updated successfully');
  } catch (error) {
    console.error('Failed to update comments:', error);
  }
};



export const getCommentsMiddleware: Middleware = async (req, res) => {
  const urlParts = req.url?.split('/');
  const photoId = urlParts ? parseInt(urlParts[urlParts.length - 1], 10) : NaN;
  const url = new URL(req.url!, `https://${req.headers.host}`); // ! = it won't be undefined
  const refresh = url.searchParams.get('refresh') === 'true';
  const accessToken = url.searchParams.get('accessToken');
  const clientID = process.env.IMGUR_CLIENT_ID;
  const username = 'Ciprian19';

  if (isNaN(photoId)) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid photo ID");
    return;
  }

  try {
    if (refresh) {
      await updateComments(photoId, username, clientID);
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