import { google } from "googleapis";

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
    console.error("Failed to fetch video thumbnail:", error.message);
    throw error;
  }
};
