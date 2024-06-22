import http from "http";
import { Router } from "./router";
import {
  isAuthenticated,
  signInMiddleware,
  signUpMiddleware,
} from "./routes/Auth/auth";
import { emailOAuth2Middleware } from "./routes/Auth/emailOAuth2";
import { forgotPasswordMiddleware, resetPasswordMiddleware } from "./routes/Auth/forgotPwd";
import { uploadImageMiddleware, getPhotosMiddleware, deletePhotosMiddleware, getPhotoMiddleware } from "./routes/images";
import { getCommentsMiddleware, uploadCommentMiddleware } from "./routes/comments";
import { isAdmin, getStatsMiddleware, getAllStatsMiddleware } from "./routes/stats";
import { getYoutubeThumbnail } from './routes/images';
import { deleteConfirmationMiddleware, deleteAccountMiddleware } from "./routes/deleteAccount";
import { getPhotos, googleOAuth, googleOAuthCallback } from "./routes/google";

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method?.toLowerCase() === "options") {
    res.writeHead(204);
    res.end();
    return;
  }

  const router = new Router(req, res);

  router.post("/auth/signup", signUpMiddleware);
  router.post("/auth/signin", signInMiddleware);
  router.post("/auth/forgot-password", forgotPasswordMiddleware);
  router.post("/auth/reset-password", resetPasswordMiddleware);

  router.post("/delete-account", isAuthenticated, deleteConfirmationMiddleware);
  router.delete("/account", isAuthenticated, deleteAccountMiddleware);

  router.post("/photos", isAuthenticated, uploadImageMiddleware);
  router.post("/comments", isAuthenticated, uploadCommentMiddleware);

  router.pget("/photos/google", getPhotos); // isAuthenticated?

  router.pget("/photos/", isAuthenticated, getPhotosMiddleware);
  router.pdelete("/photos/", isAuthenticated, deletePhotosMiddleware);
  router.pget("/photo/", isAuthenticated, getPhotoMiddleware);
  router.pget("/comments/", isAuthenticated, getCommentsMiddleware);
  router.pget("/stats/", isAuthenticated, getStatsMiddleware);
  router.get("/stats", isAuthenticated, isAdmin, getAllStatsMiddleware);

  // Used only by getToken.js
  router.pget("/oauth2callback/", emailOAuth2Middleware);

  router.get("/auth/google", googleOAuth); // isAuthenticated?
  router.pget("/auth/google/callback", googleOAuthCallback); // isAuthenticated?
});

server.listen(8081).on("listening", () => {
  console.log("Server listening on port 8081");
});
