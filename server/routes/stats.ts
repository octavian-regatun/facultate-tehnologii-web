import { db } from "../db";
import type { Middleware } from "../router";

interface UserStats {
    createdAt: Date;
    admin: boolean;
    totalPhotos: number;
    totalComments: number;
    totalPhotosGoogle: number;
    totalPhotosInstagram: number;
    totalPhotosImgur: number;
    totalLikes: number;
    totalCommentCount: number;
}


export const isAdmin: Middleware = async (req, res, next) => {
    const userId = (req as any).userId;

    if (!userId) {
        res.writeHead(401, { "Content-Type": "text/plain" });
        res.end("userId not found");
        return;
    }

    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { admin: true },
        });

        if (!user || !user.admin) {
            res.writeHead(403, { "Content-Type": "text/plain" });
            res.end("Forbidden");
            return;
        }

        next();
    } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
    }
};

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
    const totalPhotosImgur = photos.filter(photo => photo.source === 'IMGUR').length;

    const totalLikes = photos.reduce((acc, photo) => acc + (photo.likes || 0), 0);
    const totalCommentCount = photos.reduce((acc, photo) => acc + (photo.commentCount || 0), 0);

    return {
        createdAt: user.createdAt,
        admin: user.admin,
        totalPhotos,
        totalComments,
        totalPhotosGoogle,
        totalPhotosInstagram,
        totalPhotosImgur,
        totalLikes,
        totalCommentCount,
    };
};



export const getStatsMiddleware: Middleware = async (req, res) => {
    const urlParts = req.url?.split('/');
    const uid = urlParts ? parseInt(urlParts[urlParts.length - 1], 10) : NaN;
    const url = new URL(req.url!, `https://${req.headers.host}`); // ! = it won't be undefined

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

export const getAllStatsMiddleware: Middleware = async (req, res) => {
    try {
        const totalUsers = await db.user.count();
        const totalPhotos = await db.photo.count();
        const totalComments = await db.comment.count();

        const totalPhotosGoogle = await db.photo.count({
            where: { source: 'GOOGLE_PHOTOS' },
        });

        const totalPhotosInstagram = await db.photo.count({
            where: { source: 'INSTAGRAM' },
        });

        const totalPhotosImgur = await db.photo.count({
            where: { source: 'IMGUR' },
        });

        // aggregate used to not iterate through all the users
        const totalLikes = await db.photo.aggregate({
            _sum: { likes: true },
        });

        const stats = {
            totalUsers,
            totalPhotos,
            totalComments,
            totalPhotosGoogle,
            totalPhotosInstagram,
            totalPhotosImgur,
            totalLikes: totalLikes._sum.likes || 0,
        };

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(stats));
    } catch (error) {
        console.error('Failed to retrieve stats:', error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
    }
};