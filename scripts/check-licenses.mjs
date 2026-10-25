import { spawnSync } from 'node:child_process';

const pnpm = process.env.npm_execpath;
if (!pnpm) throw new Error('Run this check through pnpm check:licenses.');
const nodeScript = /\.[cm]?js$/u.test(pnpm);
const result = spawnSync(
  nodeScript ? process.execPath : pnpm,
  [...(nodeScript ? [pnpm] : []), 'licenses', 'list', '--json'],
  {
    encoding: 'utf8',
    windowsHide: true,
  },
);
if (result.status !== 0) {
  console.error(result.stderr || result.error || result.stdout);
  process.exit(1);
}
const allowed = new Set([
  'MIT',
  'ISC',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'MPL-2.0',
  'Python-2.0',
  'CC0-1.0',
  'CC-BY-4.0',
  'BlueOak-1.0.0',
  '(MIT OR CC0-1.0)',
  '(MIT AND Zlib)',
  'Zlib',
]);
const inventory = JSON.parse(result.stdout);
// Explicit dispositions for the current unmodified development-tool dependencies.
// These do not grant blanket approval to new packages using the same licenses.
const dispositions = new Map([
  ['@azu/style-format@1.0.1', 'WTFPL'],
  ['@csstools/color-helpers@6.1.2', 'MIT-0'],
  ['@csstools/css-syntax-patches-for-csstree@1.1.15', 'MIT-0'],
  ['binaryextensions@6.11.0', 'Artistic-2.0'],
  ['editions@6.22.0', 'Artistic-2.0'],
  ['istextorbinary@9.5.0', 'Artistic-2.0'],
  ['textextensions@6.11.0', 'Artistic-2.0'],
  ['version-range@4.15.0', 'Artistic-2.0'],
  ['spdx-exceptions@2.5.0', 'CC-BY-3.0'],
]);
const workspace = new Set([
  '@cyrantis/core',
  '@cyrantis/control-api',
  '@cyrantis/gateway-api',
  '@cyrantis/console',
]);
const failures = Object.entries(inventory).flatMap(([license, entries]) =>
  entries.filter(
    (entry) =>
      !allowed.has(license) &&
      !(license === 'UNLICENSED' && workspace.has(entry.name)) &&
      !entry.versions.every((version) => dispositions.get(entry.name + '@' + version) === license),
  ),
);
if (failures.length) {
  console.error(
    'Review dependency licenses before adding an explicit disposition:',
    failures.map((entry) => entry.name + ': ' + entry.license).join(', '),
  );
  process.exitCode = 1;
} else {
  console.info(
    'Dependency license inventory: PASS (' +
      Object.keys(inventory).length +
      ' license expressions). Workspace source licensing remains undecided.',
  );
}
