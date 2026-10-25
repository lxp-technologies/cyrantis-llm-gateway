import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkBoundaries } from './check-boundaries.mjs';

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'cyrantis-boundaries-'));
  function write(path, text) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
  const manifest = (name, dependencies = {}, exports = {}) =>
    JSON.stringify({ name, private: true, type: 'module', dependencies, exports });
  write(
    'packages/core/package.json',
    manifest('@cyrantis/core', {}, { './contracts': './dist/contracts.js' }),
  );
  write('packages/core/src/contracts.ts', 'export const value = 1;');
  write(
    'apps/console/package.json',
    manifest('@cyrantis/console', { '@cyrantis/core': 'workspace:*' }),
  );
  write(
    'apps/console/src/App.tsx',
    "import { value } from '@cyrantis/core/contracts'; export const app = value;",
  );
  write(
    'apps/control-api/package.json',
    manifest('@cyrantis/control-api', { '@cyrantis/core': 'workspace:*' }),
  );
  try {
    run({ root, write, manifest });
  } finally {
    const target = resolve(root);
    assert.equal(dirname(target), resolve(tmpdir()));
    assert.ok(target.includes('cyrantis-boundaries-'));
    rmSync(target, { recursive: true, force: true });
  }
}

test('allows a browser-safe contracts dependency', () =>
  fixture(({ root }) => assert.deepEqual(checkBoundaries(root), [])));
test('rejects package cycles and app-to-frontend dependencies', () =>
  fixture(({ root, write, manifest }) => {
    write(
      'packages/core/package.json',
      manifest(
        '@cyrantis/core',
        { '@cyrantis/console': 'workspace:*' },
        { './contracts': './dist/contracts.js' },
      ),
    );
    assert.ok(checkBoundaries(root).some((message) => message.includes('Workspace cycle')));
    assert.ok(
      checkBoundaries(root).some((message) => message.includes('forbidden package dependency')),
    );
  }));
test('rejects server imports, private exports and cross-app relative imports', () =>
  fixture(({ root, write }) => {
    write('apps/control-api/src/app.ts', 'export const server = 1;');
    write(
      'apps/console/src/App.tsx',
      "import 'node:fs'; import '@cyrantis/core/persistence'; import '../../control-api/src/app.js';",
    );
    const errors = checkBoundaries(root);
    for (const message of [
      'server-only import',
      'unexported workspace import',
      'relative import crosses',
    ])
      assert.ok(errors.some((error) => error.includes(message)));
  }));
test('rejects transitive server leakage from core and source cycles', () =>
  fixture(({ root, write }) => {
    write('packages/core/src/contracts.ts', "export * from './leak.js';");
    write('packages/core/src/leak.ts', "import 'node:crypto'; export * from './contracts.js';");
    const errors = checkBoundaries(root);
    assert.ok(errors.some((message) => message.includes('server-only import')));
    assert.ok(errors.some((message) => message.includes('Source cycle')));
  }));
test('rejects non-literal dynamic import escapes', () =>
  fixture(({ root, write }) => {
    write('apps/console/src/App.tsx', "const target = 'node:fs'; import(target);");
    assert.ok(
      checkBoundaries(root).some((message) => message.includes('non-literal dynamic import')),
    );
  }));

test('rejects type-import and path-alias boundary escapes', () =>
  fixture(({ root, write }) => {
    write('apps/console/src/App.tsx', "export type Server = import('node:fs').Stats;");
    write(
      'apps/console/tsconfig.json',
      JSON.stringify({ compilerOptions: { paths: { server: ['../control-api/src/app.ts'] } } }),
    );
    const errors = checkBoundaries(root);
    assert.ok(errors.some((message) => message.includes('server-only import')));
    assert.ok(errors.some((message) => message.includes('path aliases require')));
  }));
