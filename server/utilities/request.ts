import http from "http";

export class Req {
  private req: http.IncomingMessage;
  public userId: number | null = null;
  public body: unknown | null = null;
  public query: Record<string, string> = {};

  public constructor(req: http.IncomingMessage) {
    this.req = req;
    this.userId = (req as any).userId || null;

    this.initializeBody();
    this.initializeQuery();
  }

  private initializeBody() {
    let stringifiedBody = "";
    this.req.on("data", (chunk: string) => {
      stringifiedBody += chunk;
    });

    this.req.on("end", async () => {
      try {
        this.body = JSON.parse(stringifiedBody);
      } catch (error) {
        this.body = null;
      }
    });
  }

  private initializeQuery() {
    const url = new URL(this.req.url || "", `http://${this.req.headers.host}`);
    this.query = Object.fromEntries(url.searchParams.entries());
  }
}
