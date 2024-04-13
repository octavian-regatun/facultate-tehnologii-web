import { JSDOM } from 'jsdom';
import path from 'path';
import { ComponentManager } from './componentManager';
import { COMPILED_SITE_PATH, SITE_PATH } from './constants';
import { FileManager } from './fileManager';
import fs from 'fs/promises';

export class Page {
  public name: string;
  public dirPath: string;

  constructor(name: string) {
    this.name = name;
    this.dirPath = path.join(SITE_PATH, 'pages', this.name);
  }

  public compile = async () => {
    let htmlContent = await this.getHtmlContent();
    htmlContent = await this.injectComponentsHtml(htmlContent);

    await fs.writeFile(
      path.join(COMPILED_SITE_PATH, `${this.name}.html`),
      htmlContent
    );
  };

  private injectComponentsHtml = async (htmlContent: string) => {
    const components = await this.getComponents();

    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    for (const component of components) {
      const componentHtml = await component.getHtmlContent();

      const targetElements = document.querySelectorAll(component.name);
      targetElements.forEach((targetElement) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = componentHtml;
        while (tempDiv.firstChild) {
          targetElement?.parentNode?.insertBefore(
            tempDiv.firstChild,
            targetElement
          );
        }
        targetElement?.parentNode?.removeChild(targetElement);
      });
    }

    const htmlWithComponents = dom.serialize();

    return htmlWithComponents;
  };

  private getComponents = async () => {
    const html = await this.getHtmlContent();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const components = ComponentManager.components;

    return components.filter(
      (component) => document.querySelectorAll(component.name).length > 0
    );
  };

  private getHtmlContent = async () => {
    const htmlFilePath = path.join(this.dirPath, `${this.name}.html`);
    const htmlContent = await FileManager.getFileContent(htmlFilePath);

    return htmlContent;
  };
}
