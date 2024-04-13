import { ComponentManager } from './componentManager';
import { Page } from './page';
import { PageManager } from './pageManager';
await ComponentManager.registerComponents();
const pageManager = new PageManager();
pageManager.registerPage(new Page('index'));
await pageManager.compile();
//# sourceMappingURL=index.js.map