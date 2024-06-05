import http from "http";
import { Router } from "./router";
import { isAuthenticated, signInMiddleware, signUpMiddleware } from "./routes/auth";
import { uploadImageMiddleware, getPhotosMiddleware } from "./routes/images";
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
  // router.get("/images/youtube", isAuthenticated, fn);

  router.post("/photos", isAuthenticated, uploadImageMiddleware);

  if (req.url?.startsWith("/photos/") && req.method === "GET") {
    getPhotosMiddleware(req, res, () => { });
  }
});

server.listen(8081).on("listening", () => {
  console.log("Server listening on port 8081");
});
