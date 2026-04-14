#!/usr/bin/env node

/**
 * @kreatiware/layout CLI
 *
 * Generates a CSS file with a custom class prefix.
 *
 * Usage:
 *   npx @kreatiware/layout --prefix="bw" --output="./src/styles/layout.css"
 *   npx @kreatiware/layout --prefix=""   --output="./layout.css"   # no prefix
 *   npx @kreatiware/layout --help
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
@kreatiware/layout — Custom prefix generator

Usage:
  npx @kreatiware/layout --prefix=<prefix> --output=<path>

Options:
  --prefix=<str>   Class prefix to use (default: "k"). Use "" for no prefix.
  --output=<path>  Output file path (default: "./kreati-layout.css")
  --help           Show this help message

Examples:
  npx @kreatiware/layout --prefix="bw" --output="./src/styles/layout.css"
  npx @kreatiware/layout --prefix="" --output="./layout.css"
  npx @kreatiware/layout --prefix="my"
`);
  process.exit(0);
}

const getArg = (name) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=').slice(1).join('=') : undefined;
};

const prefix = getArg('prefix');
const output = getArg('output') || './kreati-layout.css';

if (prefix === undefined) {
  console.error('Error: --prefix is required. Use --prefix="bw" or --prefix="" for no prefix.');
  console.error('Run with --help for usage info.');
  process.exit(1);
}

const srcPath = path.join(__dirname, '..', 'dist', 'index.css');

if (!fs.existsSync(srcPath)) {
  console.error('Error: dist/index.css not found. The package may not be built.');
  process.exit(1);
}

const css = fs.readFileSync(srcPath, 'utf8');

let result;
if (prefix === '') {
  // No prefix: strip k- entirely
  result = css
    .replace(/\.k-(sm|md|lg|xl)\\:/g, '.$1\\:')
    .replace(/\.k--/g, '.-')
    .replace(/\.k-/g, '.');
} else {
  // Custom prefix: replace k- with <prefix>-
  result = css
    .replace(/\.k-(sm|md|lg|xl)\\:/g, `.${prefix}-$1\\:`)
    .replace(/\.k--/g, `.${prefix}--`)
    .replace(/\.k-/g, `.${prefix}-`);
}

const outputPath = path.resolve(output);
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, result, 'utf8');
console.log(`Generated ${outputPath} with prefix "${prefix || '(none)'}"`);
