import path from 'path';
import { FileManager } from './fileManager';
import { SITE_PATH } from './constants';
export class Component {
    name;
    dirPath;
    constructor(name) {
        this.name = name;
        this.dirPath = path.join(SITE_PATH, 'components', this.name);
    }
    getHtmlContent = async () => {
        const htmlPath = path.join(this.dirPath, `${this.name}.html`);
        const htmlContent = (await FileManager.getFileContent(htmlPath)).trim();
        return htmlContent;
    };
}
//# sourceMappingURL=component.js.map