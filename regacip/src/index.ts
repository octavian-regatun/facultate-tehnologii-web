import { ComponentManager } from './componentManager';
import { PageManager } from './pageManager';

await ComponentManager.registerComponents();
await PageManager.registerPages();
await PageManager.compile();
