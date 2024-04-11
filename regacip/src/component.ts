import path from 'path';
import { FileHandler } from './fileHandler';
import { SITE_PATH } from './constants';

export class Component {
  name: string;
  path: string;

  constructor(name: string) {
    this.name = name;
    this.path = this.getComponentPath();
  }

  getComponentPath = () => {
    return path.join(SITE_PATH, this.name);
  };

  getCssContent = async () => {
    const cssPath = path.join(this.path, `${this.name}.css`);
    const content = await FileHandler.getFileContent(cssPath);

    return content;
  };
}
