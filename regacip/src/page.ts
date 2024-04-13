import path from 'path';
import fs from 'fs/promises';
import { COMPILED_SITE_PATH, SITE_PATH } from './constants';
import { Html } from './html';

export class Page {
  public name!: string;
  private dirPath!: string;
  private html!: Html;

  public static create = async (name: string) => {
    const page = new Page();

    page.name = name;
    page.dirPath = path.join(SITE_PATH, 'pages', page.name);
    page.html = new Html(
      await fs.readFile(path.join(page.dirPath, `${page.name}.html`), 'utf-8')
    );

    return page;
  };

  public compile = async () => {
    await fs.writeFile(
      path.join(COMPILED_SITE_PATH, `${this.name}.html`),
      await this.html.serialize()
    );
  };
}
