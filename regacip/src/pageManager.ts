import fs from 'fs/promises';
import path from 'path';
import { COMPILED_SITE_PATH } from './constants';
import type { Page } from './page';

export class PageManager {
  private pages: Page[] = [];

  /**
   * Register a page 
   */
  public registerPage = (page: Page) => {
    this.pages.push(page);
  };

  /**
   * Compile all pages
   */
  public compile = async () => {
    await Promise.all(this.pages.map((page) => page.compile()));
  };
}
