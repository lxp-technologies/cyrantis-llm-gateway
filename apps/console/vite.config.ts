import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'browser-boundary',
      generateBundle(_options, bundle) {
        for (const output of Object.values(bundle)) {
          if (output.type !== 'chunk') continue;
          for (const id of Object.keys(output.modules)) {
            if (
              /(?:node:|[/\\\\](?:@nestjs|typeorm|pg|ioredis)[/\\\\]|__vite-browser-external)/u.test(
                id,
              )
            ) {
              this.error('Server-only module in Console bundle: ' + id);
            }
          }
        }
      },
    },
  ],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.tsx'],
    restoreMocks: true,
  },
});
