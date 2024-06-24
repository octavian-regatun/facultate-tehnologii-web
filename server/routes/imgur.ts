// https://api.imgur.com/oauth2/authorize?client_id=877e292f535ec23&response_type=token
import { db } from "../db";
import type { Middleware } from "../router";
import { Req } from "../utilities/request";
import { Res } from "../utilities/response";


// OAuth logic
export const imgurOAuth: Middleware = async (req, res) => {
    const response = new Res(res);
    const clientID = process.env.IMGUR_CLIENT_ID;

    const authUrl = `https://api.imgur.com/oauth2/authorize?client_id=${clientID}&response_type=token`;
    response.json({ authUrl });
};

export const imgurOAuthCallback: Middleware = async (req, res) => {
    const response = new Res(res);
    const request = new Req(req);
    const { accessToken } = request.query;

    if (accessToken) {
        response.redirect(
            `http://192.168.0.107:5500/client/pages/platforms-imgur.html#access_token=${accessToken}`
        );
    } else {
        response.redirect(
            `http://192.168.0.107:5500/client/pages/platforms-imgur.html?error=Authorization%20failed`
        );
    }
};

type GetImgurPhotos = {
    id: string;
    description: string;
    type: string;
    link: string;
    datetime: number;
    width: number;
    height: number;
    size: number;
};

// Refresh button (deletes all images and fetched them again)
// Gallery ID & no. of likes are not received
export const refreshImgurPhotosMiddleware: Middleware = async (req, res) => {
    const request = new Req(req);
    const response = new Res(res);
    const userId = (req as any).userId;
    const { access_token } = request.query;

    await deleteAllImgurPhotos(userId);

    const imgurPhotos = (await getImgurPhotos(
        access_token as string
    )) as GetImgurPhotos[];

    const createPhotosPromises = imgurPhotos.map(async (imgurPhoto) =>
        db.photo.create({
            data: {
                source: "IMGUR",
                url: imgurPhoto.link,
                imgurID: imgurPhoto.id,
                binaryString: await convertImageToBase64(imgurPhoto.link),
                description: imgurPhoto.description || "Image fetched from Imgur",
                likes: 0,
                commentCount: 0,
                aspectRatio: imgurPhoto.width / imgurPhoto.height,
                size: imgurPhoto.size,
                userId: request.userId!,
            },
        })
    );

    await Promise.all(createPhotosPromises);

    response.json(imgurPhotos);
};

const getImgurPhotos = async (accessToken: string) => {
    let images = [] as any[];
    let nextPageUrl: string | null = `https://api.imgur.com/3/account/me/images`;

    while (nextPageUrl) {
        try {
            const response = await fetch(nextPageUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = (await response.json()) as {
                data: GetImgurPhotos[];
                success: boolean;
                status: number;
            };

            if (response.ok && data.success) {
                images = images.concat(data.data);
                nextPageUrl = null; // n-avem pagini deci nu trb
            } else {
                console.error("Error fetching user images:", data.status);
                break;
            }
        } catch (error) {
            console.error("Error:", error);
            break;
        }
    }

    return images;
};

const deleteAllImgurPhotos = async (userId: number) => {
    await db.photo.deleteMany({
        where: { source: "IMGUR", userId: userId },
    });
};

const convertImageToBase64 = async (imageUrl: string) => {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64String = Buffer.from(buffer).toString("base64");
    return base64String;
};
