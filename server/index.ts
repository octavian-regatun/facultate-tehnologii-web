import http from "http";
import { Router } from "./router";
import { signInMiddleware, signUpMiddleware } from "./routes/auth";

const server = http.createServer((req, res) => {
  const router = new Router(req, res);

  router.post("/auth/signup", signUpMiddleware);
  router.post("/auth/signin", signInMiddleware);
  // router.get("/images/youtube", isAuthenticated, fn);
});

server.listen(8081).on("listening", () => {
  console.log("Server listening on port 8081");
});
