import { JSDOM } from 'jsdom';
import path from 'path';
import { ComponentManager } from './componentManager';
import { SITE_PATH } from './constants';
import { FileManager } from './fileManager';

export class Page {
  public name: string;
  public dirPath: string;

  constructor(name: string) {
    this.name = name;
    this.dirPath = path.join(SITE_PATH, 'pages', this.name);
  }

  private injectComponentsCss = async () => {
    const cssFiles = await FileManager.getFilesRecursivelyByFileName(
      this.dirPath,
      'css'
    );

    const htmlFilePath = path.join(this.dirPath, `${this.name}.html`);
    const dom = await JSDOM.fromFile(htmlFilePath);
    const document = dom.window.document;

    for (const cssFile of cssFiles) {
      const cssContent = await FileManager.getFileContent(cssFile);
      const styleElement = document.createElement('style');
      styleElement.textContent = cssContent;
      document.head.append(styleElement);
    }

    const htmlWithCss = dom.serialize();

    return htmlWithCss;
  };

  private injectComponentsJs = async (html: string) => {
    const jsFiles = await FileManager.getFilesRecursivelyByFileName(
      this.dirPath,
      'js'
    );

    const dom = new JSDOM(html);
    const document = dom.window.document;

    for (const jsFile of jsFiles) {
      const scriptElement = document.createElement('script');
      scriptElement.src = path.relative(this.dirPath, jsFile);
      document.body.append(scriptElement);
    }

    const htmlWithJs = dom.serialize();

    return htmlWithJs;
  };

  private injectComponentsHtml = async (html: string) => {
    //     substitute tags with components names with actual components html
    const components = await this.getComponents();
    const componentHtmls = await Promise.all(
      components.map(async (component) => {
        const componentHtml = await component.getHtmlContent();
        return componentHtml;
      })
    );

    const dom = new JSDOM(html);
    const document = dom.window.document;

    components.forEach((component, index) => {
      const componentHtml = componentHtmls[index];
      const componentElements = document.querySelectorAll(component.name);

      componentElements.forEach((element) => {
        element.replaceWith(componentHtml);
      });
    });

    const htmlWithComponents = dom.serialize();

    return htmlWithComponents;
  };

  public getHtmlContent = async () => {
    let html = await this.injectComponentsCss();
    html = await this.injectComponentsJs(html);
    html = await this.injectComponentsHtml(html);
    
    return html;
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
}
