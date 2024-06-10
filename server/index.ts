import http from "http";
import { Router } from "./router";
import { isAuthenticated, signInMiddleware, signUpMiddleware } from "./routes/Auth/auth";
import { emailOAuth2Middleware } from "./routes/Auth/emailOAuth2";
import { forgotPasswordMiddleware, resetPasswordMiddleware } from "./routes/Auth/forgotPwd";
import { uploadImageMiddleware, getPhotosMiddleware, deletePhotosMiddleware } from "./routes/images";
import { getCommentsMiddleware } from "./routes/comments";
import { getYoutubeThumbnail } from './routes/images';

//console.log(await getYoutubeThumbnail("REt5yDh8eGg"));

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const router = new Router(req, res);

  router.post("/auth/signup", signUpMiddleware);
  router.post("/auth/signin", signInMiddleware);
  router.post("/auth/forgot-password", forgotPasswordMiddleware);
  router.post("/auth/reset-password", resetPasswordMiddleware);
  // router.get("/images/youtube", isAuthenticated, fn);

  router.post("/photos", isAuthenticated, uploadImageMiddleware);

  if (req.url?.startsWith("/photos/") && req.method === "GET") {
    getPhotosMiddleware(req, res, () => { });
  }
  if (req.url?.startsWith("/photos/") && req.method === "DELETE") {
    deletePhotosMiddleware(req, res, () => { });
  }
  if (req.url?.startsWith("/comments/") && req.method === "GET") {
    getCommentsMiddleware(req, res, () => { });
  }

  // Used only by getToken.js
  if (req.url?.startsWith("/oauth2callback") && req.method === "GET") {
    emailOAuth2Middleware(req, res, () => { });
  }
});

server.listen(8081).on("listening", () => {
  console.log("Server listening on port 8081");
});
