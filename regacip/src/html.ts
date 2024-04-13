import { JSDOM } from 'jsdom';
import { ComponentManager } from './componentManager';

export class Html {
  private dom: JSDOM;

  constructor(html: string) {
    this.dom = new JSDOM(html);
  }

  /**
   * Compiles and serializes DOM into HTML
   *
   * @returns Serializes DOM into HTML
   */
  public serialize = async () => {
    await this.compile();

    return this.dom.serialize();
  };

  /**
   * Apply all the compilation operations to DOM
   */
  private compile = async () => {
    await this.injectComponentsHtml();
  };

  /**
   * Replaces component tags found in the DOM with their own HTML
   */
  private injectComponentsHtml = async () => {
    const components = await this.getComponents();
    const document = this.dom.window.document;

    for (const component of components) {
      const componentHtml = await component.getHtmlContent();

      const targetElements = document.querySelectorAll(component.name);
      for (const targetElement of targetElements) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = componentHtml;
        while (tempDiv.firstChild) {
          targetElement?.parentNode?.insertBefore(
            tempDiv.firstChild,
            targetElement
          );
        }
        targetElement?.parentNode?.removeChild(targetElement);
      }
    }
  };

  /**
   * @returns A list of found components in DOM
   */
  private getComponents = async () => {
    const document = this.dom.window.document;

    return ComponentManager.components.filter(
      (component) => document.querySelectorAll(component.name).length > 0
    );
  };
}
