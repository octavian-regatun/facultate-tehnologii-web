import fs from "fs";
import https from "https";
import { Router } from "./router";
import {
  isAuthenticated,
  signInMiddleware,
  signUpMiddleware,
} from "./routes/Auth/auth";
import { emailOAuth2Middleware } from "./routes/Auth/emailOAuth2";
import {
  forgotPasswordMiddleware,
  resetPasswordMiddleware,
} from "./routes/Auth/forgotPwd";
import {
  getCommentsMiddleware,
  uploadCommentMiddleware,
} from "./routes/comments";
import {
  deleteAccountMiddleware,
  deleteConfirmationMiddleware,
} from "./routes/deleteAccount";
import {
  googleOAuth,
  googleOAuthCallback,
  refreshGooglePhotosMiddleware,
} from "./routes/google";
import {
  deletePhotosMiddleware,
  getPhotoMiddleware,
  getPhotosMiddleware,
  uploadImageMiddleware,
} from "./routes/images";
import {
  getAllStatsMiddleware,
  getStatsMiddleware,
  isAdmin,
} from "./routes/stats";

const options = {
  key: fs.readFileSync("../https/decrypted-localhost.key", "utf8"),
  cert: fs.readFileSync("../https/localhost.pem", "utf8"),
};

const server = https.createServer(options, (req, res) => {
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

  if (req.url?.startsWith("/photos/google/refresh")) {
    router.pget(
      "/photos/google/refresh",
      isAuthenticated,
      refreshGooglePhotosMiddleware
    );
    return;
  }

  router.post("/photos", isAuthenticated, uploadImageMiddleware);
  router.post("/comments", isAuthenticated, uploadCommentMiddleware);

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
