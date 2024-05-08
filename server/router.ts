import http from "http";

type Req = http.IncomingMessage;
type Res = http.ServerResponse;

export class Router {
  req: Req;
  res: Res;

  constructor(req: Req, res: Res) {
    this.req = req;
    this.res = res;
  }

  get(path: string, handler: (req: Req, res: Res) => void) {
    if (this.req.url === path && this.req.method === "GET") {
      handler(this.req, this.res);
    }
  }

  post(path: string, handler: (req: Req, res: Res) => void) {
    if (this.req.url === path && this.req.method === "POST") {
      handler(this.req, this.res);
    }
  }

  put(path: string, handler: (req: Req, res: Res) => void) {
    if (this.req.url === path && this.req.method === "PUT") {
      handler(this.req, this.res);
    }
  }

  delete(path: string, handler: (req: Req, res: Res) => void) {
    if (this.req.url === path && this.req.method === "DELETE") {
      handler(this.req, this.res);
    }
  }

  patch(path: string, handler: (req: Req, res: Res) => void) {
    if (this.req.url === path && this.req.method === "PATCH") {
      handler(this.req, this.res);
    }
  }
}
