import type { ServerResponse } from 'http';
import { FileHandler } from './fileHandler';
import path from 'path';
import { SITE_PATH } from './constants';
import type { Page } from './page';

export class PageRouter {
  res: ServerResponse;
  prefix: string = '';
  pages: Page[] = [];

  constructor(res: ServerResponse) {
    this.res = res;
  }

  addPage = (page: Page) => {
    this.pages.push(page);
  };

  getPagePath = (page: Page) => {
    return path.join(SITE_PATH, 'pages', `${page.name}.html`);
  };

  handle = async () => {
    for (const page of this.pages) {
      this.res.statusCode = 200;
      this.res.setHeader('Content-Type', 'text/html');
      this.res.end(await page.getHtmlContent());
    }
  };
}
