import path from 'path';
import { SITE_PATH } from './constants';
import { FileHandler } from './fileHandler';

export class Page {
  name: string;
  routePath: string;
  fsPath: string;

  constructor(_name: string, routePath: string) {
    this.name = _name;
    this.routePath = routePath;
    this.fsPath = path.join(SITE_PATH, 'pages', this.name);
  }

  // TODO: implement
  injectCss = (cssPath: string) => {};

  getHtmlContent = async () => {
    return await FileHandler.getFileContent(
      path.join(this.fsPath, `${this.name}.html`)
    );
  };
}
