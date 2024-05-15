import http from "http";
import { Router } from "./router";
import { signInMiddleware, signUpMiddleware } from "./routes/auth";
import { getYoutubeThumbnail } from './routes/images';

//console.log(await getYoutubeThumbnail("REt5yDh8eGg"));

const server = http.createServer((req, res) => {
  const router = new Router(req, res);


  router.post("/auth/signup", signUpMiddleware);
  router.post("/auth/signin", signInMiddleware);
  // router.get("/images/youtube", isAuthenticated, fn);
});

server.listen(8081).on("listening", () => {
  console.log("Server listening on port 8081");
});
