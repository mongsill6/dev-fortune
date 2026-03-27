#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');
const appEntry = path.join(__dirname, 'App.jsx');
const outFile = path.join(__dirname, '.bundle.mjs');

// Bundle JSX with esbuild - externalize runtime deps and project source modules
const esbuildBin = path.join(projectRoot, 'node_modules', '.bin', 'esbuild');
execSync(
  [
    esbuildBin, appEntry,
    '--bundle', '--format=esm', '--platform=node',
    `--outfile=${outFile}`,
    '--jsx=automatic',
    '--external:ink', '--external:ink-select-input', '--external:ink-text-input',
    '--external:ink-spinner', '--external:react', '--external:yoga-wasm-web', '--external:ws',
    '--external:../loader.js', '--external:../categories.js', '--external:../i18n.js',
    '--external:../config.js', '--external:../formatter.js',
  ].join(' '),
  { stdio: 'pipe' }
);

// Run the bundled app
const { render } = await import('ink');
const React = await import('react');
const { default: App } = await import(outFile);

render(React.createElement(App));
