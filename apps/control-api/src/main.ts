import { applicationId, createApplication } from './app.js';

const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT must be an integer from 0 to 65535.');
}
const app = await createApplication();
app.enableShutdownHooks();
await app.listen(port, '127.0.0.1');
console.info(applicationId + ' listening at ' + (await app.getUrl()));
