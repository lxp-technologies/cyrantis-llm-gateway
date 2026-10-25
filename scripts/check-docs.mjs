import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const briefs = new Set([
  'docs/prs/pr-00/pr-00-discovery-architecture-plan.md',
  'docs/prs/pr-00/pr-00-adr-update.md',
  'docs/prs/pr-00/pr-00-finalize.md',
  'docs/prs/pr-01/pr-01a-workspace-foundation.md',
]);
const required = [
  'AGENTS.md',
  'README.md',
  '.github/pull_request_template.md',
  'docs/architecture/ARCHITECTURE.md',
  'docs/architecture/decisions/ADR-001-control-gateway-separation.md',
  'docs/security/ACCESS-BOUNDARIES.md',
  'docs/security/THREAT-MODEL.md',
  'docs/planning/ROADMAP.md',
  'docs/planning/QUALITY-GATES.md',
  'docs/planning/DEVELOPER-BYOK.md',
  'docs/planning/PR00-REVIEW.md',
  ...briefs,
];
function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(path) : entry.name.endsWith('.md') ? [path] : [];
  });
}
const errors = required
  .filter((path) => !existsSync(join(root, path)))
  .map((path) => 'Missing required file: ' + path);
const files = [
  ...markdownFiles(join(root, 'docs')),
  ...['AGENTS.md', 'README.md', '.github/pull_request_template.md'].map((path) => join(root, path)),
];
let links = 0;
let authored = 0;
for (const file of files) {
  const name = relative(root, file).replaceAll('\\', '/');
  let content;
  try {
    content = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(file));
  } catch (error) {
    errors.push(name + ': ' + error.message);
    continue;
  }
  const lines = content.split(/\r?\n/u);
  if (!briefs.has(name)) {
    authored += 1;
    if (!/^#{1,2} /u.test(content)) errors.push(name + ': missing opening heading');
    if (!content.endsWith('\n')) errors.push(name + ': missing final newline');
    if (lines.filter((line) => line.startsWith('```')).length % 2)
      errors.push(name + ': unbalanced code fences');
    lines.forEach((line, index) => {
      if (line.trimEnd() !== line) errors.push(name + ':' + (index + 1) + ': trailing whitespace');
    });
  }
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/gu)) {
    const target = match[1];
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/u.test(target) || target.startsWith('#')) continue;
    links += 1;
    if (!existsSync(resolve(dirname(file), target.split('#')[0])))
      errors.push(name + ': broken local target ' + target);
  }
}
console.info(
  JSON.stringify(
    {
      markdown_files: files.length,
      authored_markdown_files: authored,
      local_link_targets: links,
      errors,
      scope: 'UTF-8, required files, headings, fences, whitespace, local link targets',
      not_checked: 'External URLs, Markdown rendering/anchors, runtime/security behavior',
    },
    null,
    2,
  ),
);
if (errors.length) process.exitCode = 1;
