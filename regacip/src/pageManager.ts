import fs from 'fs/promises';
import path from 'path';
import { COMPILED_SITE_PATH, SITE_PATH } from './constants';
import type { Page } from './page';

export class PageManager {
  private pages: Page[] = [];

  public addPage = (page: Page) => {
    this.pages.push(page);
  };

  public compile = async () => {
    // TODO: use Promise.all
    for (const page of this.pages) {
      const htmlContent = await page.getHtmlContent();
      fs.writeFile(
        path.join(COMPILED_SITE_PATH, `${page.name}.html`),
        htmlContent
      );
    }
  };
}
