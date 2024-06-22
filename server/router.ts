import http from "http";

export type Req = http.IncomingMessage;
export type Res = http.ServerResponse;
export type Next = () => void;
export type Middleware = (req: Req, res: Res, next: Next) => void;

export class Router {
  req: Req;
  res: Res;

  constructor(req: Req, res: Res) {
    this.req = req;
    this.res = res;
  }

  get(path: string, ...middlewares: Middleware[]) {
    if (this.req.url === path && this.req.method === "GET") {
      const execute = (index: number) => {
        if (index < middlewares.length) {
          middlewares[index](this.req, this.res, () => execute(index + 1));
        }
      };

      execute(0);
    }
  }

  post(path: string, ...middlewares: Middleware[]) {
    if (this.req.url === path && this.req.method === "POST") {
      const execute = (index: number) => {
        if (index < middlewares.length) {
          middlewares[index](this.req, this.res, () => execute(index + 1));
        }
      };

      execute(0);
    }
  }

  delete(path: string, ...middlewares: Middleware[]) {
    if (this.req.url === path && this.req.method === "DELETE") {
      const execute = (index: number) => {
        if (index < middlewares.length) {
          middlewares[index](this.req, this.res, () => execute(index + 1));
        }
      };

      execute(0);
    }
  }

  // Prefix p = route has parameters
  pget(path: string, ...middlewares: Middleware[]) {
    if (this.req.url?.startsWith(path) && this.req.method === "GET") {
      const execute = (index: number) => {
        if (index < middlewares.length) {
          middlewares[index](this.req, this.res, () => execute(index + 1));
        }
      };

      execute(0);
    }
  }

  pdelete(path: string, ...middlewares: Middleware[]) {
    if (this.req.url?.startsWith(path) && this.req.method === "DELETE") {
      const execute = (index: number) => {
        if (index < middlewares.length) {
          middlewares[index](this.req, this.res, () => execute(index + 1));
        }
      };

      execute(0);
    }
  }
}
