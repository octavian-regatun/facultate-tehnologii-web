import path from 'path';
import { FileManager } from './fileManager';
import { SITE_PATH } from './constants';

export class Component {
  name: string;
  dirPath: string;

  constructor(name: string) {
    this.name = name;
    this.dirPath = path.join(SITE_PATH, this.name);
  }

  getCssContent = async () => {
    const cssPath = path.join(this.dirPath, `${this.name}.css`);
    const cssContent = await FileManager.getFileContent(cssPath);

    return cssContent;
  };

  getHtmlContent = async () => {
    const htmlPath = path.join(this.dirPath, `${this.name}.css`);
    const htmlContent = await FileManager.getFileContent(htmlPath);

    return htmlContent;
  };
}
