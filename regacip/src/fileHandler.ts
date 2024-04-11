import fs from 'fs/promises';

export class FileHandler {
  static getFileContent = async (path: string) => {
    try {
      const data = await fs.readFile(path, 'utf8');
      return data;
    } catch (err) {
      console.error(`Error reading file from path ${path}`, err);
      throw err;
    }
  };
}
