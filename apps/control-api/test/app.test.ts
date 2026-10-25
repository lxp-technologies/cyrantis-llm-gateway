import type { INestApplication } from '@nestjs/common';
import { afterEach, describe, expect, it } from 'vitest';
import { createApplication } from '../src/app.js';

describe('control-api inert HTTP boundary', () => {
  let app: INestApplication | undefined;
  afterEach(async () => {
    await app?.close();
  });

  it('boots without infrastructure and denies all undeclared routes', async () => {
    app = await createApplication();
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    for (const path of ['/', '/api/v1/tenants', '/api/v1/chat', '/health/ready']) {
      const response = await fetch(url + path);
      expect(response.status).toBe(404);
      expect(response.headers.get('x-powered-by')).toBeNull();
      expect(response.headers.get('access-control-allow-origin')).toBeNull();
      const body: unknown = await response.json();
      expect(body).toMatchObject({ statusCode: 404 });
      expect(JSON.stringify(body)).not.toContain('stack');
    }
    const write = await fetch(url + '/api/v1/tenants', { method: 'POST' });
    expect(write.status).toBe(404);
  });

  it('closes its HTTP listener cleanly', async () => {
    app = await createApplication();
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    await app.close();
    app = undefined;
    await expect(fetch(url)).rejects.toThrow();
  });
});
