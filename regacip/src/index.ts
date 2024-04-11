import http from 'http';
import { PORT } from './constants';
import { PageRouter } from './pageRouter';
import { Page } from './page';

const server = http.createServer(async (req, res) => {
  const pageRouter = new PageRouter(res);

  pageRouter.addPage(new Page('index', '/'));

  await pageRouter.handle();
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
