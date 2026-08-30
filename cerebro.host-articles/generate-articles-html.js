/**
 * Generate Articles HTML from JSON/CSV Data
 * 
 * Usage:
 * 1. Extract articles from LinkedIn using extract-linkedin-articles.js
 * 2. Save the JSON output to a file (e.g., articles-data.json)
 * 3. Run: node generate-articles-html.js articles-data.json
 * 4. Copy the output HTML and paste into cerebro-articles-preview-v1.html
 */

const fs = require('fs');
const path = require('path');

// Category detection logic
function detectCategory(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('orbital assets')) {
        return 'orbital';
    } else if (titleLower.includes('transmission available') || titleLower.includes('in motion')) {
        return 'motion';
    } else if (titleLower.includes('digital assets daily')) {
        return 'orbital'; // Changed: Digital Assets Daily → Orbital Assets
    }
    
    // Default to orbital if unclear
    return 'orbital';
}

// Category badge text
function getCategoryBadge(category) {
    switch(category) {
        case 'orbital': return 'Orbital Assets';
        case 'motion': return 'Orbital Assets in Motion';
        case 'daily': return 'Orbital Assets'; // Changed from 'Digital Assets Daily'
        default: return 'Orbital Assets';
    }
}

// Category icon URL
function getCategoryIcon(category) {
    // All use Orbital Assets icon for now
    return 'https://cdn1.site-media.eu/images/0/22072652/OrbitalAssets-ZwxWFgFABVDvQSjCcAFFVw.png';
}

// Parse date string to format: "Dec 17, 2025"
function formatDate(dateStr) {
    if (!dateStr || dateStr === 'Unknown date') {
        return 'Unknown date';
    }
    
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        // Try extracting from title if date string is invalid
        const monthMatch = dateStr.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
        const dayMatch = dateStr.match(/\d+/);
        const yearMatch = dateStr.match(/2025|2024/);
        
        if (monthMatch && dayMatch && yearMatch) {
            return `${monthMatch[0]} ${dayMatch[0]}, ${yearMatch[0]}`;
        }
        
        return dateStr; // Return as-is if can't parse
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Group articles by month
function groupByMonth(articles) {
    const grouped = {};
    
    articles.forEach(article => {
        const date = new Date(article.date);
        if (isNaN(date.getTime())) {
            // Try to extract month from title
            const monthMatch = article.title.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i);
            if (monthMatch) {
                const monthName = monthMatch[0];
                const monthMap = {
                    'january': 'January', 'february': 'February', 'march': 'March',
                    'april': 'April', 'may': 'May', 'june': 'June',
                    'july': 'July', 'august': 'August', 'september': 'September',
                    'october': 'October', 'november': 'November', 'december': 'December'
                };
                const month = monthMap[monthName.toLowerCase()];
                if (!grouped[month]) grouped[month] = [];
                grouped[month].push(article);
            } else {
                if (!grouped['Unknown']) grouped['Unknown'] = [];
                grouped['Unknown'].push(article);
            }
        } else {
            const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            if (!grouped[monthYear]) grouped[monthYear] = [];
            grouped[monthYear].push(article);
        }
    });
    
    // Sort months by date (most recent first), so e.g. January 2026 appears above December 2025
    const monthKeys = Object.keys(grouped);
    const monthToDate = (str) => {
        const d = new Date(str + ' 1');
        return isNaN(d.getTime()) ? 0 : d.getTime();
    };
    monthKeys.sort((a, b) => monthToDate(b) - monthToDate(a));

    const sorted = {};
    monthKeys.forEach(month => {
        sorted[month] = grouped[month];
    });
    return sorted;
}

// Generate HTML for a single article card
function generateArticleCard(article, isFeatured = false) {
    const category = detectCategory(article.title);
    const cardClass = isFeatured ? 'featured-card article-card' : 'article-card';
    
    return `
                <div class="${cardClass}" data-category="${category}">
<a href="${article.url}" target="_blank" rel="noopener noreferrer" class="category-icon-wrapper">
                        <img src="${getCategoryIcon(category)}" alt="${getCategoryBadge(category)}" class="category-icon">
                    </a>
<a href="${article.url}" class="article-link" target="_blank" rel="noopener noreferrer">Read</a>
<span class="article-date">${formatDate(article.date)}</span>
<h3 class="article-title">${article.title}</h3>
                </div>`;
}

// Generate HTML for a month section
function generateMonthSection(month, articles) {
    const sortedArticles = articles.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Most recent first
    });
    
    const cardsHTML = sortedArticles.map(article => generateArticleCard(article)).join('\n');
    
    return `
        <!-- ${month} -->
        <section class="month-section">
            <h2 class="month-header">
                ${month}
                <span class="month-count">(${articles.length} articles)</span>
            </h2>
            <div class="articles-grid">
                ${cardsHTML}
            </div>
        </section>`;
}

/** Build the full articles HTML string (for use by update-articles-page.js). */
function buildArticlesHTML(articles) {
    const grouped = groupByMonth(articles);
    const allArticles = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
    const featured = allArticles.slice(0, 3);
    const outLines = [];
    outLines.push('<!-- Featured Section -->');
    outLines.push('<section class="featured-section">');
    outLines.push('    <h2 class="featured-title">Latest Articles</h2>');
    outLines.push('    <div class="featured-grid">');
    featured.forEach(article => { outLines.push(generateArticleCard(article, true)); });
    outLines.push('    </div>');
    outLines.push('</section>\n');
    Object.keys(grouped).forEach(month => { outLines.push(generateMonthSection(month, grouped[month])); });
    return outLines.join('\n');
}

// Main function
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node generate-articles-html.js <articles-data.json>');
        console.log('\nExample:');
        console.log('  1. Extract articles from LinkedIn using extract-linkedin-articles.js');
        console.log('  2. Save JSON output to articles-data.json');
        console.log('  3. Run: node generate-articles-html.js articles-data.json');
        console.log('  4. Copy the generated HTML and paste into your articles page');
        process.exit(1);
    }
    
    const inputFile = args[0];
    
    if (!fs.existsSync(inputFile)) {
        console.error(`Error: File not found: ${inputFile}`);
        process.exit(1);
    }
    
    let articles;
    try {
        const fileContent = fs.readFileSync(inputFile, 'utf8');
        articles = JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error reading/parsing file: ${error.message}`);
        process.exit(1);
    }
    
    if (!Array.isArray(articles)) {
        console.error('Error: JSON file must contain an array of articles');
        process.exit(1);
    }
    
    console.log(`\n📊 Processing ${articles.length} articles...\n`);
    
    // Group by month
    const grouped = groupByMonth(articles);
    
    // Generate featured articles (3 most recent)
    const allArticles = articles.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    
    const featured = allArticles.slice(0, 3);
    console.log('✨ Featured articles (3 most recent):');
    featured.forEach((article, i) => {
        console.log(`   ${i + 1}. ${article.title} (${formatDate(article.date)})`);
    });
    
    // Generate HTML
    const html = buildArticlesHTML(articles);
    const outIdx = args.findIndex(a => a === '--out' || a === '-o');
    const outFile = outIdx >= 0 && args[outIdx + 1] ? args[outIdx + 1] : null;

    if (outFile) {
        fs.writeFileSync(outFile, html, 'utf8');
        console.log(`\n✅ Wrote HTML (${articles.length} articles) to ${outFile}`);
        console.log('   Open that file, copy all, then paste into cerebro-articles-preview-v1.html from "<!-- Featured Section -->" to the last </section> of the month sections.');
        console.log('   Or run: node update-articles-page.js  to patch the preview file automatically.\n');
    } else {
        console.log('\n📝 Generated HTML:\n');
        console.log('='.repeat(80));
        console.log(html);
        console.log('\n' + '='.repeat(80));
        console.log(`\n✅ Generated HTML for ${articles.length} articles across ${Object.keys(grouped).length} months`);
        console.log('\n📋 Next steps:');
        console.log('  1. Copy the HTML above (or run with --out generated-sections.html to save to file)');
        console.log('  2. Open cerebro-articles-preview-v1.html and replace from "<!-- Featured Section -->" to the last </section>');
        console.log('  3. Or run: node update-articles-page.js  to patch the page and article count automatically');
        console.log('  4. Test the page in a browser\n');
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { generateArticleCard, generateMonthSection, detectCategory, formatDate, buildArticlesHTML };
