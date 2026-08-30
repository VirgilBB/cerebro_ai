/**
 * Update cerebro-articles-preview-v1.html with latest articles from articles-data.json.
 * Replaces the article sections (Featured + month sections) and updates the hero article count.
 *
 * Usage: node update-articles-page.js
 * (Run from cerebro.host-articles or project root; uses articles-data.json and cerebro-articles-preview-v1.html in same dir as this script)
 */

const fs = require('fs');
const path = require('path');
const { buildArticlesHTML } = require('./generate-articles-html.js');

const DIR = __dirname;
const JSON_FILE = path.join(DIR, 'articles-data.json');
const HTML_FILE = path.join(DIR, 'cerebro-articles-preview-v1.html');

const START_MARKER = '<!-- Featured Section -->';
const END_TAG = '</section>';
const BEFORE_SCRIPT = '</script>';

function main() {
    if (!fs.existsSync(JSON_FILE)) {
        console.error(`Error: Not found: ${JSON_FILE}`);
        process.exit(1);
    }
    if (!fs.existsSync(HTML_FILE)) {
        console.error(`Error: Not found: ${HTML_FILE}`);
        process.exit(1);
    }

    let articles;
    try {
        articles = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
    } catch (e) {
        console.error(`Error reading JSON: ${e.message}`);
        process.exit(1);
    }

    if (!Array.isArray(articles) || articles.length === 0) {
        console.error('Error: articles-data.json must be a non-empty array');
        process.exit(1);
    }

    const newHTML = buildArticlesHTML(articles);
    let content = fs.readFileSync(HTML_FILE, 'utf8');

    const startIdx = content.indexOf(START_MARKER);
    if (startIdx === -1) {
        console.error('Error: Could not find "<!-- Featured Section -->" in HTML file');
        process.exit(1);
    }

    const scriptIdx = content.indexOf(BEFORE_SCRIPT, startIdx);
    if (scriptIdx === -1) {
        console.error('Error: Could not find "</script>" after article sections');
        process.exit(1);
    }
    const lastSectionIdx = content.lastIndexOf(END_TAG, scriptIdx);
    if (lastSectionIdx === -1) {
        console.error('Error: Could not find closing </section> for article block');
        process.exit(1);
    }
    const endIdx = lastSectionIdx + END_TAG.length;

    content = content.slice(0, startIdx) + newHTML + content.slice(endIdx);

    // Update hero article count (e.g. "91 Articles" -> "93 Articles")
    content = content.replace(/(\d+)\s*Articles/, `${articles.length} Articles`);

    fs.writeFileSync(HTML_FILE, content, 'utf8');
    console.log(`Updated ${HTML_FILE}: ${articles.length} articles, count badge set to "${articles.length} Articles".`);
}

main();
