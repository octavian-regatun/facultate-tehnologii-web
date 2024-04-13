import { FileManager } from './fileManager';
import { Page } from './page';
import fs from 'fs/promises';

export class PageManager {
  /**
   * Stores all the registered pages
   */
  private static pages: Page[] = [];

  /**
   * Register a page
   */
  public static registerPages = async () => {
    const pageNames = await fs.readdir(FileManager.pagesDir);

    PageManager.pages = await Promise.all(
      pageNames.map((name) => Page.create(name))
    );
  };

  /**
   * Compile all registered pages
   */
  public static compile = async () => {
    await Promise.all(PageManager.pages.map((page) => page.compile()));
  };
}
