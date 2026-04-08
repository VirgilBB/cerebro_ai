#!/usr/bin/env node
/**
 * Copy cerebro-articles-preview-v1.html to the system clipboard for pasting into Sitejet.
 * Run after update-articles-page.js to refresh article sections, then paste in Sitejet.
 *
 * Usage:
 *   node copy-articles-for-paste.js           # full document
 *   node copy-articles-for-paste.js --body-only   # content only (no DOCTYPE/html/head/body wrapper)
 *
 * Requires: pbcopy (macOS), xclip (Linux), or clip (Windows) for clipboard.
 * If clipboard is not available, prints path to file and instructions.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const DIR = __dirname;
const HTML_FILE = path.join(DIR, 'cerebro-articles-preview-v1.html');

const bodyOnly = process.argv.includes('--body-only');

function main() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error(`Error: Not found: ${HTML_FILE}`);
    console.error('Run node update-articles-page.js first.');
    process.exit(1);
  }

  let content = fs.readFileSync(HTML_FILE, 'utf8');

  if (bodyOnly) {
    // Strip <!DOCTYPE> ... </head> and </body></html>, keep from <body> (or first tag) to last </script> before </body>
    const bodyStart = content.indexOf('<body');
    const bodyTagEnd = content.indexOf('>', bodyStart) + 1;
    const bodyEnd = content.lastIndexOf('</body>');
    if (bodyStart !== -1 && bodyEnd !== -1) {
      content = content.slice(bodyTagEnd, bodyEnd).trim();
    }
  }

  const platform = process.platform;
  let ok = false;

  try {
    if (platform === 'darwin') {
      const p = spawnSync('pbcopy', [], { input: content, stdio: ['pipe', 'inherit', 'inherit'] });
      ok = p.status === 0;
    } else if (platform === 'win32') {
      const p = spawnSync('clip', [], { input: content, stdio: ['pipe', 'inherit', 'inherit'] });
      ok = p.status === 0;
    } else {
      const p = spawnSync('xclip', ['-selection', 'clipboard'], { input: content, stdio: ['pipe', 'inherit', 'inherit'] });
      ok = p.status === 0;
    }
  } catch (_) {
    ok = false;
  }

  if (ok) {
    console.log(bodyOnly ? 'Body-only HTML copied to clipboard. Paste into Sitejet.' : 'Full HTML copied to clipboard. Paste into Sitejet.');
  } else {
    console.log('Clipboard not available (install pbcopy (macOS), xclip (Linux), or use clip (Windows)).');
    console.log(`Open this file and copy manually: ${HTML_FILE}`);
    console.log('Then in Sitejet: Custom HTML block → Select all → Paste → Save.');
  }
}

main();
