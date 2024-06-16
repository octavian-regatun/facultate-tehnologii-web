import { db } from "../db";
import type { Middleware } from "../router";

interface UserStats {
    createdAt: Date;
    admin: boolean;
    totalPhotos: number;
    totalComments: number;
    totalPhotosGoogle: number;
    totalPhotosInstagram: number;
    totalLikes: number;
    totalCommentCount: number;
}

const getUserStats = async (uid: number): Promise<UserStats> => {
    const user = await db.user.findUnique({
        where: { id: uid },
        select: {
            createdAt: true,
            admin: true,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const photos = await db.photo.findMany({
        where: { userId: uid },
        select: {
            id: true,
            source: true,
            likes: true,
            commentCount: true,
        },
    });

    const photoIds = photos.map(photo => photo.id);

    const comments = await db.comment.findMany({
        where: {
            photoId: { in: photoIds },
        },
    });

    const totalPhotos = photos.length;
    const totalComments = comments.length;

    const totalPhotosGoogle = photos.filter(photo => photo.source === 'GOOGLE_PHOTOS').length;
    const totalPhotosInstagram = photos.filter(photo => photo.source === 'INSTAGRAM').length;

    const totalLikes = photos.reduce((acc, photo) => acc + (photo.likes || 0), 0);
    const totalCommentCount = photos.reduce((acc, photo) => acc + (photo.commentCount || 0), 0);

    return {
        createdAt: user.createdAt,
        admin: user.admin,
        totalPhotos,
        totalComments,
        totalPhotosGoogle,
        totalPhotosInstagram,
        totalLikes,
        totalCommentCount,
    };
};



export const getStatsMiddleware: Middleware = async (req, res) => {
    const urlParts = req.url?.split('/');
    const uid = urlParts ? parseInt(urlParts[urlParts.length - 1], 10) : NaN;
    const url = new URL(req.url!, `http://${req.headers.host}`); // ! = it won't be undefined

    if (isNaN(uid)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid user ID");
        return;
    }

    try {
        const stats = await getUserStats(uid);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(stats));
    } catch (error) {
        console.error('Failed to retrieve stats:', error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
    }
};