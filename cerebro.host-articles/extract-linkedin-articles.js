/**
 * LinkedIn Newsletter Article Extractor
 * 
 * Instructions:
 * 1. Open your LinkedIn newsletter page: https://www.linkedin.com/newsletters/orbital-assets-7347506734581600256/
 * 2. Scroll down to load all articles (or click "Load more" if available)
 * 3. Open browser Developer Console (F12 or Right-click → Inspect → Console)
 * 4. Paste this entire script and press Enter
 * 5. The script will extract all article links and display them
 * 6. Copy the output and save to a file
 */

(function() {
    console.log('=== LinkedIn Article Extractor ===\n');
    console.log('Starting extraction...\n');
    
    // Find all article links in the newsletter page
    const articles = [];
    
    // Method 1: Look for article links in the editions section
    const articleLinks = document.querySelectorAll('a[href*="/pulse/"], a[href*="/posts/"], a[href*="/articles/"]');
    
    // Helper function to clean title text
    function cleanTitle(title) {
        if (!title) return 'Untitled';
        
        // Remove "Open article:" prefix
        title = title.replace(/^Open article:\s*/i, '');
        
        // Remove "by Virgil Bellini" and everything after it
        title = title.replace(/\s+by\s+Virgil\s+Bellini.*$/i, '');
        
        // Remove "• X min read" suffix
        title = title.replace(/\s*•\s*\d+\s*min\s*read.*$/i, '');
        
        // Remove "Virgil Bellini" if it appears anywhere
        title = title.replace(/\s*Virgil\s+Bellini\s*/gi, '');
        
        // Clean up extra whitespace
        title = title.replace(/\s+/g, ' ').trim();
        
        return title || 'Untitled';
    }
    
    // Helper function to extract title from URL
    function extractTitleFromURL(url) {
        try {
            const urlParts = url.split('/');
            const slug = urlParts[urlParts.length - 1];
            // Remove the hash/ID at the end (e.g., "-v74nc")
            const titleSlug = slug.replace(/-[a-z0-9]+$/, '');
            // Remove author name (e.g., "-virgil-bellini")
            let title = titleSlug.replace(/-virgil-bellini$/, '');
            // Convert to title case: "orbital-assets-december-17th" -> "Orbital Assets - December 17th"
            title = title.split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
                .replace(/\s+([A-Z][a-z]+)\s+(\d+)(st|nd|rd|th)/g, ' - $1 $2$3') // Fix date formatting
                .replace(/\s+([A-Z][a-z]+)\s+(\d+)(st|nd|rd|th)/g, ' - $1 $2$3'); // Handle ranges
            return title;
        } catch (e) {
            return 'Untitled';
        }
    }
    
    // Helper function to extract date from title
    function extractDateFromTitle(title) {
        if (!title) return null;
        
        // Month names mapping
        const months = {
            'january': 'January', 'february': 'February', 'march': 'March', 'april': 'April',
            'may': 'May', 'june': 'June', 'july': 'July', 'august': 'August',
            'september': 'September', 'october': 'October', 'november': 'November', 'december': 'December'
        };
        
        // Try to match patterns like "December 17th", "November 28th", etc.
        const patterns = [
            // "December 17th" or "December 17" - need to infer year (assume 2025 for recent, 2024 for older)
            /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
            // "July 25, 2025" - full date
            /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i
        ];
        
        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match) {
                const monthName = match[1].toLowerCase();
                const month = months[monthName];
                const day = match[2];
                const year = match[3] || (monthName >= 'september' ? '2024' : '2025'); // Infer year
                
                if (month && day) {
                    return `${month} ${day}${year ? `, ${year}` : ''}`;
                }
            }
        }
        
        return null;
    }
    
    // Helper function to clean date text
    function cleanDate(dateText) {
        if (!dateText || dateText === 'Unknown date') return 'Unknown date';
        
        // Remove video player text
        if (dateText.includes('PlayMedia') || dateText.includes('PlayPlay') || dateText.includes('fullscreen')) {
            return 'Unknown date';
        }
        
        // Try to extract actual date patterns
        const datePatterns = [
            /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i,
            /\d{1,2}\/\d{1,2}\/\d{4}/,
            /\d{4}-\d{2}-\d{2}/
        ];
        
        for (const pattern of datePatterns) {
            const match = dateText.match(pattern);
            if (match) {
                return match[0];
            }
        }
        
        return 'Unknown date';
    }
    
    articleLinks.forEach((link, index) => {
        const href = link.href;
        // Try multiple methods to get title
        let title = link.textContent.trim() || 
                   link.querySelector('h3, h4, .article-title, [class*="title"]')?.textContent?.trim() || 
                   link.getAttribute('aria-label') ||
                   extractTitleFromURL(href);
        
        // Clean up title
        title = cleanTitle(title);
        
        // Try to find date nearby
        const parent = link.closest('li, div, article, section');
        let date = 'Unknown date';
        
        // Try multiple date selectors
        const dateElement = parent?.querySelector('time, [datetime], [class*="date"], [class*="published"], [class*="time"]');
        if (dateElement) {
            const dateText = dateElement.textContent.trim() || 
                           dateElement.getAttribute('datetime')?.split('T')[0] || 
                           dateElement.getAttribute('title') ||
                           '';
            date = cleanDate(dateText);
        }
        
        // Try to find date in sibling elements
        if (date === 'Unknown date' && parent) {
            const siblings = Array.from(parent.parentElement?.children || []);
            const linkIndex = siblings.indexOf(parent);
            // Check previous and next siblings for date
            for (let i = Math.max(0, linkIndex - 2); i <= Math.min(siblings.length - 1, linkIndex + 2); i++) {
                const sibling = siblings[i];
                const dateText = sibling.textContent.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i);
                if (dateText) {
                    date = cleanDate(dateText[0]);
                    break;
                }
            }
        }
        
        // If date is still unknown, try to extract from title
        if (date === 'Unknown date') {
            const titleDate = extractDateFromTitle(title);
            if (titleDate) {
                date = titleDate;
            }
        }
        
        // Avoid duplicates
        if (!articles.find(a => a.url === href)) {
            articles.push({
                index: articles.length + 1,
                title: title,
                url: href,
                date: date
            });
        }
    });
    
    // Method 2: Alternative selector for newsletter format
    if (articles.length === 0) {
        const editionItems = document.querySelectorAll('[class*="edition"], [class*="article"], li[class*="newsletter"]');
        
            editionItems.forEach((item) => {
            const link = item.querySelector('a[href*="linkedin.com"]');
            if (link && (link.href.includes('/pulse/') || link.href.includes('/posts/') || link.href.includes('/articles/'))) {
                let title = link.textContent.trim() || 
                           item.querySelector('h3, h4, [class*="title"]')?.textContent?.trim() || 
                           extractTitleFromURL(link.href);
                title = cleanTitle(title);
                
                let date = 'Unknown date';
                const dateElement = item.querySelector('time, [datetime], [class*="date"], [class*="published"]');
                if (dateElement) {
                    const dateText = dateElement.textContent.trim() || 
                                   dateElement.getAttribute('datetime')?.split('T')[0] || 
                                   '';
                    date = cleanDate(dateText);
                }
                
                // If date is still unknown, try to extract from title
                if (date === 'Unknown date') {
                    const titleDate = extractDateFromTitle(title);
                    if (titleDate) {
                        date = titleDate;
                    }
                }
                
                if (!articles.find(a => a.url === link.href)) {
                    articles.push({
                        index: articles.length + 1,
                        title: title,
                        url: link.href,
                        date: date
                    });
                }
            }
        });
    }
    
    // Method 3: Look for all links and filter for article-like URLs
    if (articles.length === 0) {
        const allLinks = document.querySelectorAll('a[href*="linkedin.com"]');
        
        allLinks.forEach((link) => {
            const href = link.href;
            // Check if it's an article URL pattern
            if (href.includes('/pulse/') || href.includes('/posts/') || href.includes('/articles/') || 
                (href.includes('/newsletters/') && href !== 'https://www.linkedin.com/newsletters/orbital-assets-7347506734581600256/')) {
                
                // Try to find title
                let title = link.textContent.trim() || 
                           link.querySelector('h3, h4, h5, .title, [class*="title"]')?.textContent?.trim() || 
                           extractTitleFromURL(href);
                title = cleanTitle(title);
                
                // Try to find date in parent elements
                const parent = link.closest('li, div, article, section');
                let date = 'Unknown date';
                const dateElement = parent?.querySelector('time, [datetime], [class*="date"], [class*="published"]');
                if (dateElement) {
                    const dateText = dateElement.textContent.trim() || 
                                  dateElement.getAttribute('datetime')?.split('T')[0] || 
                                  '';
                    date = cleanDate(dateText);
                }
                
                // If date is still unknown, try to extract from title
                if (date === 'Unknown date') {
                    const titleDate = extractDateFromTitle(title);
                    if (titleDate) {
                        date = titleDate;
                    }
                }
                
                // Avoid duplicates and newsletter main page
                if (!articles.find(a => a.url === href) && !href.endsWith('/')) {
                    articles.push({
                        index: articles.length + 1,
                        title: title,
                        url: href,
                        date: date
                    });
                }
            }
        });
    }
    
    // Sort articles by date (newest first) if dates are available
    articles.sort((a, b) => {
        if (a.date === 'Unknown date' && b.date === 'Unknown date') return 0;
        if (a.date === 'Unknown date') return 1;
        if (b.date === 'Unknown date') return -1;
        return new Date(b.date) - new Date(a.date);
    });
    
    // Update indices after sorting
    articles.forEach((article, index) => {
        article.index = index + 1;
    });
    
    // Display results
    if (articles.length > 0) {
        console.log(`✅ Found ${articles.length} articles!\n`);
        
        // CSV Format (most useful) - show this FIRST
        const output = articles.map(a => `${a.title}|${a.url}|${a.date}`).join('\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('--- CSV Format (Title|URL|Date) - COPY THIS ---\n');
        console.log('Title|URL|Date');
        console.log(output);
        console.log('\n═══════════════════════════════════════════════════════');
        
        // Show first 5 articles as preview
        console.log('--- Preview (first 5 articles) ---\n');
        articles.slice(0, 5).forEach(article => {
            console.log(`${article.index}. ${article.title}`);
            console.log(`   📅 Date: ${article.date}`);
            console.log(`   🔗 URL: ${article.url}\n`);
        });
        if (articles.length > 5) {
            console.log(`... and ${articles.length - 5} more articles\n`);
        }
        
        console.log('═══════════════════════════════════════════════════════');
        // JSON Format (for programmatic use)
        console.log('--- JSON Format (for import) ---\n');
        console.log(JSON.stringify(articles, null, 2));
        
        console.log('\n═══════════════════════════════════════════════════════');
        // Markdown Format
        console.log('--- Markdown Format ---\n');
        articles.slice(0, 10).forEach(article => {
            console.log(`- **[${article.title}](${article.url})** - ${article.date}`);
        });
        if (articles.length > 10) {
            console.log(`\n... and ${articles.length - 10} more (see CSV/JSON for full list)`);
        }
        
        // Try to copy CSV to clipboard (completely async, won't block)
        const csvOutput = 'Title|URL|Date\n' + output;
        // Use requestIdleCallback or setTimeout to make it truly non-blocking
        if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(csvOutput).then(() => {
                        console.log('\n✅ CSV data copied to clipboard!');
                    }).catch(() => {
                        // Silently fail - user can manually copy
                    });
                }
            }, { timeout: 2000 });
        } else {
            setTimeout(() => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(csvOutput).then(() => {
                        console.log('\n✅ CSV data copied to clipboard!');
                    }).catch(() => {
                        // Silently fail
                    });
                }
            }, 500);
        }
        
        console.log('\n💡 Tip: Copy the CSV output above to use in spreadsheet or import');
        console.log('\n✅ Extraction complete!');
    } else {
        console.log('❌ No articles found. Try these steps:');
        console.log('1. Make sure you\'re on the newsletter page');
        console.log('2. Scroll down to load all articles');
        console.log('3. Wait for page to fully load');
        console.log('4. Check if articles are in a different format');
        console.log('\n💡 Alternative: Manually collect URLs by:');
        console.log('   - Click each article title');
        console.log('   - Copy the URL from browser address bar');
        console.log('   - Note the title and date');
        console.log('\n🔍 Debug: Check page structure');
        console.log('   Run: document.querySelectorAll("a").length');
        console.log('   This shows total links on page');
    }
    
    return articles;
})();
