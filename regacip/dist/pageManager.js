export class PageManager {
    pages = [];
    /**
     * Register a page
     */
    registerPage = (page) => {
        this.pages.push(page);
    };
    /**
     * Compile all pages
     */
    compile = async () => {
        await Promise.all(this.pages.map((page) => page.compile()));
    };
}
//# sourceMappingURL=pageManager.js.map