/**
 * Reindex articles-data.json: set index 1, 2, 3, ... by array order.
 * Run after adding new articles at the top so you don't have to renumber manually.
 *
 * Usage: node reindex-articles-json.js [articles-data.json]
 * Default file: articles-data.json in same directory
 */

const fs = require('fs');
const path = require('path');

function main() {
    const args = process.argv.slice(2);
    const inputFile = args[0] || path.join(__dirname, 'articles-data.json');

    if (!fs.existsSync(inputFile)) {
        console.error(`Error: File not found: ${inputFile}`);
        process.exit(1);
    }

    let articles;
    try {
        const content = fs.readFileSync(inputFile, 'utf8');
        articles = JSON.parse(content);
    } catch (e) {
        console.error(`Error reading/parsing JSON: ${e.message}`);
        process.exit(1);
    }

    if (!Array.isArray(articles)) {
        console.error('Error: JSON must be an array of articles');
        process.exit(1);
    }

    articles.forEach((article, i) => {
        article.index = i + 1;
    });

    fs.writeFileSync(inputFile, JSON.stringify(articles, null, 2) + '\n', 'utf8');
    console.log(`Reindexed ${articles.length} articles (1..${articles.length}) in ${inputFile}`);
}

main();
