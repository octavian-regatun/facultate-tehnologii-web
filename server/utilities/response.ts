import http from "http";
import type { HttpStatus } from "./httpStatus";

export class Res {
  private res: http.ServerResponse;
  private status: HttpStatus = 200;
  private headers: Record<string, string> = {};

  constructor(res: http.ServerResponse) {
    this.res = res;
  }

  public setStatus(status: HttpStatus): this {
    this.status = status;
    return this;
  }

  public setHeader(name: string, value: string): this {
    this.headers[name] = value;
    return this;
  }

  public json(data: unknown): void {
    this.headers["Content-Type"] = "application/json";
    this.res.writeHead(this.status, this.headers);
    try {
      const body = JSON.stringify(data);
      this.res.end(body);
    } catch (e) {
      console.error("Failed to stringify body!", e);
    }
  }

  public redirect(url: string): void {
    this.res.writeHead(302, { Location: url });
    this.res.end();
  }
}
