import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(import.meta.dirname, '..');
const children = [];
async function start(name) {
  const child = spawn(process.execPath, [resolve(root, 'apps', name, 'dist/main.js')], {
    cwd: root,
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  children.push(child);
  let output = '';
  child.stdout.setEncoding('utf8').on('data', (data) => {
    output += data;
  });
  child.stderr.setEncoding('utf8').on('data', (data) => {
    output += data;
  });
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(name + ' exited: ' + output);
    const match = output.match(/listening at (http:\/\/[^\s]+)/u);
    if (match) return { child, url: match[1] };
    await delay(50);
  }
  throw new Error(name + ' did not start: ' + output);
}
async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, 'exit');
  child.kill('SIGTERM');
  await Promise.race([
    exited,
    delay(5000, undefined, { ref: false }).then(() => {
      throw new Error('API did not stop');
    }),
  ]);
}
try {
  const control = await start('control-api');
  const gateway = await start('gateway-api');
  assert.notEqual(control.url, gateway.url);
  for (const app of [control, gateway])
    assert.equal((await fetch(app.url + '/api/v1/unknown')).status, 404);
  await stop(control.child);
  assert.equal(gateway.child.exitCode, null);
  assert.equal((await fetch(gateway.url + '/')).status, 404);
  console.info('Built API startup and independent process lifetime: PASS');
} finally {
  for (const child of children) {
    try {
      await stop(child);
    } catch {
      child.kill('SIGKILL');
    }
  }
}
