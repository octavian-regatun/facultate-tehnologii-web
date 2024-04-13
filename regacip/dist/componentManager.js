import fs from 'fs/promises';
import { Component } from './component';
import { FileManager } from './fileManager';
// TODO: add method to check validity of component
export class ComponentManager {
    static components = [];
    static registerComponents = async () => {
        const componentNames = await fs.readdir(FileManager.componentDir);
        ComponentManager.components = componentNames.map((name) => new Component(name));
    };
}
//# sourceMappingURL=componentManager.js.map