import path from 'path';
import fs from 'fs/promises';
import { SITE_PATH } from './constants';
export class FileManager {
    static componentDir = path.join(SITE_PATH, 'components');
    static pagesDir = path.join(SITE_PATH, 'pages');
    static getFileContent = async (path) => {
        try {
            return await fs.readFile(path, 'utf8');
        }
        catch (err) {
            console.error(`Error reading file from path ${path}`, err);
            throw err;
        }
    };
    static getFilesRecursivelyByFileName = async (dirPath, filter) => {
        let files = [];
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    files = files.concat(await this.getFilesRecursivelyByFileName(fullPath, filter));
                }
                else if (entry.isFile() && entry.name.endsWith(filter)) {
                    files.push(fullPath);
                }
            }
        }
        catch (err) {
            console.error(`Error reading directory ${dirPath}`, err);
            throw err;
        }
        return files;
    };
}
//# sourceMappingURL=fileManager.js.map