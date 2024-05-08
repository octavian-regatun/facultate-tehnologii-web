import http from "http";
import { Router } from "./router";

const server = http.createServer((req, res) => {
  const router = new Router(req, res);

  router.get("/", (req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello, World!");
  });
  
});

server.listen(8081);
