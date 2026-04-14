/**
 * Generates unprefixed.css from index.css by stripping the `k-` prefix from all class names.
 * Responsive prefixes like `k-sm:` become `sm:`, `k-md:` become `md:`, etc.
 * Negative margin `k--` becomes `-` (e.g. k--mt-4 -> -mt-4).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'dist', 'index.css');
const dest = path.join(root, 'dist', 'unprefixed.css');

const css = fs.readFileSync(src, 'utf8');

const unprefixed = css
  // Header comment
  .replace('KreatiLayout', 'KreatiLayout (unprefixed)')
  // Responsive: .k-sm\: -> .sm\:  |  .k-md\: -> .md\:  etc.
  .replace(/\.k-(sm|md|lg|xl)\\:/g, '.$1\\:')
  // Negative margin: .k-- -> .-
  .replace(/\.k--/g, '.-')
  // All remaining: .k- -> .
  .replace(/\.k-/g, '.');

fs.writeFileSync(dest, unprefixed, 'utf8');
console.log('Generated dist/unprefixed.css');
