# How to Add New Articles to the Articles Page

This guide explains how to add newly published LinkedIn articles to the articles page.

---

## Efficient workflow (recommended)

**Split of tasks:**

- **Assistant (AI)** does step 1: adds new article to `articles-data.json` (top of array) and runs `cd cerebro.host-articles && node reindex-articles-json.js && node update-articles-page.js`. This updates the HTML file only; it does **not** copy to clipboard.
- **You** do step 2: run the copy command, then paste in Sitejet.

**Your step only** (from repo root):
```bash
cd cerebro.host-articles && node copy-articles-for-paste.js
```
Then in Sitejet: open the Custom HTML block for `/articles`, select all, paste (Cmd+V / Ctrl+V), save.

**If you are already inside `cerebro.host-articles/`**: `node copy-articles-for-paste.js`

See `SITEJET-PASTE-GUIDE.md` for paste instructions and terminal-update options (FTP/API).

---

## Quick Steps (manual paste)

1. **Extract new articles** from LinkedIn using the browser console script
2. **Update the JSON file** with new article data
3. **Generate new HTML** from the updated JSON
4. **Update the articles page** with the new HTML

---

## Detailed Instructions

### Step 1: Extract New Articles from LinkedIn

1. **Open the LinkedIn Newsletter Page**
   - Go to: https://www.linkedin.com/newsletters/orbital-assets-7347506734581600256/
   - Make sure you're logged into LinkedIn
   
   **Important**: Choose your approach:
   - **If adding only NEW articles** (recommended): New articles appear at the top, so **no scrolling needed**. The script will extract whatever articles are visible on the page.
   - **If replacing the ENTIRE article list**: Scroll down to load all articles first, then run the script to extract everything.

2. **Open Browser Developer Console**
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - **Safari**: Enable Developer menu first, then `Cmd+Option+C`
   - Go to the "Console" tab

3. **Run the Extraction Script**
   - Open the file: `extract-linkedin-articles.js`
   - Copy the **entire contents** of the file
   - Paste into the browser console
   - Press Enter
   - The script will extract all article links that are currently loaded on the page
   - **Note**: If you only see new articles at the top, that's fine - you'll manually add them to your existing list

4. **Copy the JSON Output**
   - In the console output, find the section labeled "--- JSON Format (for import) ---"
   - **If adding only new articles**: Copy just the new articles (the first few items in the array)
   - **If replacing everything**: Copy the entire JSON array (starts with `[` and ends with `]`)

### Step 2: Update articles-data.json

1. **Open the JSON file**
   - Open: `cerebro.host-articles/articles-data.json`

2. **Merge new articles with existing ones**
   - The new articles from LinkedIn will be at the **beginning** of the array (newest first)
   - You have two options:

   **Option A: Replace entire file** (if you extracted ALL articles by scrolling)
   - Replace the entire contents of `articles-data.json` with the new JSON from the console
   - This ensures you have the complete, up-to-date list
   - **Use this if**: You scrolled to load all articles and want a fresh start

   **Option B: Manually add new articles** (recommended - if you only extracted new articles at the top)
   - Open `articles-data.json`
   - Find the newest article (should be at index 1)
   - Add new articles **before** the existing ones (at the beginning of the array)
   - Make sure each article has:
     ```json
     {
       "index": 1,
       "title": "Article Title",
       "url": "https://www.linkedin.com/pulse/...",
       "date": "December 18, 2025"
     }
     ```
   - After adding new articles, update the `index` numbers for ALL articles (1, 2, 3, etc.)
   - **Use this if**: You only extracted the new articles visible at the top of the page

3. **Save the file**

### Step 3: Generate New HTML

1. **Open Terminal/Command Prompt**
   - Navigate to the `cerebro.host-articles` directory:
     ```bash
     cd cerebro.host-articles
     ```

2. **Run the HTML Generation Script**
   ```bash
   node generate-articles-html.js articles-data.json
   ```

3. **Copy the Generated HTML**
   - The script will output HTML in the console
   - Copy the entire HTML output (from `<!-- Featured Section -->` to the last `</section>`)

### Step 4: Update the Articles Page HTML

1. **Open the Articles Page File**
   - Open: `cerebro.host-articles/cerebro-articles-preview-v1.html`

2. **Find the Article Sections**
   - Look for `<!-- Featured Section -->` (around line 400-500)
   - Find where the month sections start (e.g., `<!-- December 2025 -->`)

3. **Replace the Article Content**
   - **Delete** everything from `<!-- Featured Section -->` to the last `</section>` before the closing `</div>` or `</body>`
   - **Paste** the new HTML generated in Step 3
   - **Note**: The script automatically creates new month sections for any new months. For example, if you add articles for February 2026, a new "February 2026" section will be automatically created.

4. **Update Article Count (if needed)**
   - Find the hero section (around line 750)
   - Look for text like "91 Articles" or similar
   - Update the number to match your new total

5. **Save the file**

### Step 5: Test the Updated Page

1. **Open the HTML file in a browser**
   - Double-click `cerebro-articles-preview-v1.html` to open it
   - Or use a local server if needed

2. **Verify**
   - Check that new articles appear at the top
   - Verify featured articles show the 3 most recent
   - Test search functionality
   - Check that all links work
   - Test on mobile view (resize browser window)

3. **Deploy to Sitejet** (if the page is live)
   - Copy the updated HTML
   - Paste into Sitejet's Custom HTML block for the `/articles` page

---

## Quick Reference: File Locations & Scripts

- **Extraction Script**: `extract-linkedin-articles.js` (run in browser console on LinkedIn newsletter page)
- **Article Data**: `articles-data.json`
- **Reindex**: `node reindex-articles-json.js` — renumbers `index` 1..N by array order (run after adding new entries at top)
- **HTML Generator**: `node generate-articles-html.js articles-data.json` — prints HTML; add `--out generated-sections.html` to write to a file
- **Update preview page**: `node update-articles-page.js` — patches `cerebro-articles-preview-v1.html` with new sections and article count
- **Articles Page**: `cerebro-articles-preview-v1.html`

---

## Troubleshooting

### Script Doesn't Find New Articles
- **If adding only new articles**: New articles are at the top, so they should be visible immediately - no scrolling needed
- **If replacing entire list**: Scroll down to load all articles, then run the script
- Try refreshing the LinkedIn page and running the script again
- Check that you're logged into LinkedIn

### JSON Format Errors
- Make sure the JSON is valid (use a JSON validator)
- Ensure all articles have `index`, `title`, `url`, and `date` fields
- Check for trailing commas or missing quotes

### HTML Generation Fails
- Make sure Node.js is installed: `node --version`
- Verify the JSON file path is correct
- Check that `articles-data.json` contains a valid JSON array

### Articles Don't Appear in Correct Order
- The script sorts by date (newest first)
- Check that dates are in a format like "December 18, 2025"
- Verify dates are correct in the JSON file

---

## Tips

- **Regular Updates**: Update articles weekly or monthly to keep content fresh
- **Backup First**: Always backup `articles-data.json` before making changes
- **Test Locally**: Always test the HTML file locally before deploying to Sitejet
- **Check Dates**: Verify that article dates are correct (the script tries to extract them automatically)
- **New Month Sections**: When adding articles for a new month, the HTML generation script automatically creates a new month section. No manual section creation is needed - just ensure dates are correct in the JSON file.

---

## Need Help?

If you encounter issues:
1. Check the console output from the extraction script for error messages
2. Verify your JSON file is valid JSON
3. Make sure Node.js is installed and working
4. Review the existing articles in `articles-data.json` to see the expected format

---

**Last Updated**: January 2026
