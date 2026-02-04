#!/usr/bin/env node
/**
 * Scans all review HTML files, extracts metadata, and rebuilds:
 * - regions/en/reviews/index.html (reviewsData array)
 * - sitemap.xml (review URL entries)
 *
 * Run: node scripts/update-reviews.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const REVIEWS_DIR = path.join(REPO_ROOT, 'regions', 'en', 'reviews');
const INDEX_FILE = path.join(REVIEWS_DIR, 'index.html');
const SITEMAP_FILE = path.join(REPO_ROOT, 'sitemap.xml');
const SITE_URL = 'https://smartbuyreviews.co.uk';

function getReviewFiles() {
  return fs.readdirSync(REVIEWS_DIR)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .map(f => path.join(REVIEWS_DIR, f));
}

function extractMeta(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  // Title: from <title> tag, strip " Review - Smart Buy Reviews UK 2026"
  let title = '';
  const titleMatch = html.match(/<title>([^<]+)<\/title>/is);
  if (titleMatch) {
    title = titleMatch[1]
      .replace(/\s+/g, ' ')
      .replace(/\s*Review\s*-\s*Smart Buy Reviews UK 2026\s*$/i, '')
      .trim();
  }
  if (!title) return null; // skip files without a proper title

  // Category: first badge span content
  let category = 'General';
  const catMatch = html.match(/class="badge[^"]*"[^>]*>\s*([^<]+?)\s*<\/span>/i);
  if (catMatch) {
    category = catMatch[1].trim();
  }

  // Image: first img with S3 bucket URL
  let image = '';
  const imgMatch = html.match(/src="(https:\/\/smartbuyreviews-instructions-2026\.s3[^"]+)"/i);
  if (imgMatch) {
    image = imgMatch[1];
  }

  // Excerpt: from meta description, truncated to 120 chars
  let excerpt = '';
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (descMatch) {
    excerpt = descMatch[1].replace(/\s+/g, ' ').trim();
    // Strip common prefix patterns
    excerpt = excerpt.replace(/^Honest review of .+?\.\s*/i, '');
    if (!excerpt) excerpt = descMatch[1].replace(/\s+/g, ' ').trim();
    if (excerpt.length > 120) excerpt = excerpt.substring(0, 117) + '...';
  }

  // Date: git commit date for this file
  let date = new Date().toISOString().split('T')[0];
  try {
    const gitDate = execSync(
      `git log -1 --format=%aI -- "${filePath}"`,
      { cwd: REPO_ROOT, encoding: 'utf8' }
    ).trim();
    if (gitDate) {
      date = gitDate.split('T')[0];
    }
  } catch (e) {
    // fallback to today's date
  }

  const url = '/regions/en/reviews/' + fileName;

  return { title, url, category, excerpt, image, date };
}

function updateIndex(reviews) {
  let content = fs.readFileSync(INDEX_FILE, 'utf8');

  const marker = /const reviewsData = \[[\s\S]*?\];\s*\/\/ END REVIEWS DATA/;
  if (!marker.test(content)) {
    console.error('ERROR: Could not find reviewsData marker in index.html');
    process.exit(1);
  }

  const formatted = reviews.map(r => `      {
        title: ${JSON.stringify(r.title)},
        url: ${JSON.stringify(r.url)},
        category: ${JSON.stringify(r.category)},
        excerpt: ${JSON.stringify(r.excerpt)},
        image: ${JSON.stringify(r.image)},
        date: ${JSON.stringify(r.date)}
      }`).join(',\n');

  const newBlock = `const reviewsData = [\n${formatted}\n    ]; // END REVIEWS DATA`;
  const updated = content.replace(marker, newBlock);

  if (updated !== content) {
    fs.writeFileSync(INDEX_FILE, updated, 'utf8');
    console.log(`Updated index.html with ${reviews.length} reviews`);
    return true;
  }
  console.log('index.html already up to date');
  return false;
}

function updateSitemap(reviews) {
  let content = fs.readFileSync(SITEMAP_FILE, 'utf8');

  const startMarker = '<!-- Reviews - AUTO-GENERATED SECTION START -->';
  const endMarker = '<!-- Reviews - AUTO-GENERATED SECTION END -->';

  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.error('ERROR: Could not find sitemap markers');
    process.exit(1);
  }

  const entries = reviews.map(r => `  <url>
    <loc>${SITE_URL}${r.url}</loc>
    <lastmod>${r.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

  const before = content.substring(0, startIdx + startMarker.length);
  const after = content.substring(endIdx);
  const updated = before + '\n' + entries + '\n  ' + after;

  // Also update reviews index lastmod
  const today = new Date().toISOString().split('T')[0];
  const finalContent = updated.replace(
    /(<loc>https:\/\/smartbuyreviews\.co\.uk\/regions\/en\/reviews\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
    `$1${today}$2`
  );

  if (finalContent !== content) {
    fs.writeFileSync(SITEMAP_FILE, finalContent, 'utf8');
    console.log(`Updated sitemap.xml with ${reviews.length} review URLs`);
    return true;
  }
  console.log('sitemap.xml already up to date');
  return false;
}

// Main
const files = getReviewFiles();
console.log(`Found ${files.length} review files`);

const reviews = files
  .map(extractMeta)
  .filter(r => r !== null)
  .sort((a, b) => b.date.localeCompare(a.date)); // newest first

console.log(`Extracted metadata for ${reviews.length} reviews`);

const indexChanged = updateIndex(reviews);
const sitemapChanged = updateSitemap(reviews);

if (indexChanged || sitemapChanged) {
  console.log('Files updated successfully');
} else {
  console.log('No changes needed');
}
