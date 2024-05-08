import http from "http";
import { Router, type Middleware } from "./router";
import {
  isAuthenticated,
  signInMiddleware,
  signUpMiddleware,
} from "./routes/auth";

const server = http.createServer((req, res) => {
  const router = new Router(req, res);

  router.post("/auth/signup", signUpMiddleware);
  router.post("/auth/signin", signInMiddleware);
  router.get("/images", isAuthenticated, (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ images: [] }));
  });
});

server.listen(8081).on("listening", () => {
  console.log("Server listening on port 8081");
});
