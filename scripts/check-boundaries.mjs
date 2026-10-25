import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const policy = {
  '@cyrantis/control-api': ['@cyrantis/core'],
  '@cyrantis/gateway-api': ['@cyrantis/core'],
  '@cyrantis/console': ['@cyrantis/core'],
  '@cyrantis/core': [],
};
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const packageName = (specifier) =>
  specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', '.turbo', 'coverage'].includes(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : sourceExtensions.has(extname(path)) ? [path] : [];
  });
}

function findCycles(graph, errors, label) {
  const active = new Set();
  const done = new Set();
  function visit(node, trail) {
    if (active.has(node)) {
      errors.push(label + ' cycle: ' + [...trail, node].join(' -> '));
      return;
    }
    if (done.has(node)) return;
    active.add(node);
    for (const target of graph.get(node) ?? []) visit(target, [...trail, node]);
    active.delete(node);
    done.add(node);
  }
  for (const node of graph.keys()) visit(node, []);
}

export function checkBoundaries(root) {
  root = resolve(root);
  const errors = [];
  const projects = ['apps', 'packages'].flatMap((parent) => {
    const directory = join(root, parent);
    if (!existsSync(directory)) return [];
    return readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const path = join(directory, entry.name);
        const manifest = json(join(path, 'package.json'));
        return { path, manifest, files: walk(path) };
      });
  });
  const byName = new Map(projects.map((project) => [project.manifest.name, project]));
  const configs = [
    join(root, 'tsconfig.base.json'),
    ...projects.flatMap((project) =>
      readdirSync(project.path)
        .filter((name) => /^tsconfig.*\.json$/u.test(name))
        .map((name) => join(project.path, name)),
    ),
  ];
  for (const config of configs) {
    if (existsSync(config) && Object.keys(json(config).compilerOptions?.paths ?? {}).length) {
      errors.push(
        relative(root, config) + ': TypeScript path aliases require an explicit boundary policy',
      );
    }
  }
  const byFile = new Map(
    projects.flatMap((project) => project.files.map((file) => [resolve(file), project])),
  );
  const packages = new Map();
  const sources = new Map();
  for (const project of projects) {
    const name = project.manifest.name;
    if (!Object.hasOwn(policy, name))
      errors.push('Define ownership before adding workspace package: ' + name);
    if (!project.manifest.private || project.manifest.type !== 'module')
      errors.push(name + ': expected private ESM package');
    const deps = {
      ...project.manifest.dependencies,
      ...project.manifest.devDependencies,
      ...project.manifest.peerDependencies,
      ...project.manifest.optionalDependencies,
    };
    packages.set(name, []);
    for (const dependency of Object.keys(deps)) {
      if (!byName.has(dependency)) continue;
      packages.get(name).push(dependency);
      if (!(policy[name] ?? []).includes(dependency))
        errors.push(name + ': forbidden package dependency ' + dependency);
      if (deps[dependency] !== 'workspace:*')
        errors.push(name + ': use workspace:* for ' + dependency);
    }
    for (const file of project.files) {
      const fileLabel = relative(root, file).replaceAll('\\', '/');
      sources.set(fileLabel, []);
      const code = ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      );
      const browser = name === '@cyrantis/console' && fileLabel.includes('/src/');
      const contracts = name === '@cyrantis/core';
      const checkSpecifier = (specifier) => {
        if (
          (browser || contracts) &&
          /^(?:node:|@nestjs(?:\/|$)|typeorm(?:\/|$)|pg$|ioredis$|fs$|path$|crypto$|module$|child_process$)/u.test(
            specifier,
          )
        ) {
          errors.push(fileLabel + ': server-only import ' + specifier);
        }
        if (specifier.startsWith('.')) {
          const base = resolve(dirname(file), specifier);
          const candidates = [base, base.replace(/\.js$/u, '.ts'), base.replace(/\.js$/u, '.tsx')];
          const target = candidates.find((candidate) => byFile.has(candidate));
          if (target) {
            const owner = byFile.get(target);
            if (owner !== project)
              errors.push(fileLabel + ': relative import crosses package boundary: ' + specifier);
            sources.get(fileLabel).push(relative(root, target).replaceAll('\\', '/'));
          } else if (!existsSync(base))
            errors.push(fileLabel + ': unresolved relative import ' + specifier);
          return;
        }
        if (specifier.startsWith('/') || specifier.startsWith('#')) {
          errors.push(fileLabel + ': use package exports or relative imports, not aliases');
          return;
        }
        const targetName = packageName(specifier);
        const target = byName.get(targetName);
        if (target) {
          if (target !== project && !(policy[name] ?? []).includes(targetName))
            errors.push(fileLabel + ': forbidden workspace import ' + targetName);
          const subpath = specifier === targetName ? '.' : '.' + specifier.slice(targetName.length);
          if (!Object.hasOwn(target.manifest.exports ?? {}, subpath))
            errors.push(fileLabel + ': unexported workspace import ' + specifier);
          if (targetName === '@cyrantis/core' && browser && subpath !== './contracts')
            errors.push(fileLabel + ': Console may import only core/contracts');
        } else if (specifier.startsWith('@cyrantis/')) {
          errors.push(fileLabel + ': unknown workspace import ' + specifier);
        } else if (contracts) {
          errors.push(
            fileLabel + ': core foundation must stay framework-independent: ' + specifier,
          );
        }
      };
      const visit = (node) => {
        if (
          ts.isImportTypeNode(node) &&
          ts.isLiteralTypeNode(node.argument) &&
          ts.isStringLiteral(node.argument.literal)
        ) {
          checkSpecifier(node.argument.literal.text);
        }
        if (
          (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier)
        ) {
          checkSpecifier(node.moduleSpecifier.text);
        }
        if (
          ts.isCallExpression(node) &&
          (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
            (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
        ) {
          const argument = node.arguments[0];
          if (argument && ts.isStringLiteral(argument)) checkSpecifier(argument.text);
          else errors.push(fileLabel + ': non-literal dynamic import is not allowed');
        }
        ts.forEachChild(node, visit);
      };
      visit(code);
    }
  }
  findCycles(packages, errors, 'Workspace');
  findCycles(sources, errors, 'Source');
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = checkBoundaries(resolve(import.meta.dirname, '..'));
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else console.info('Workspace imports, public exports and dependency cycles: PASS');
}
