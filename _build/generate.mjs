#!/usr/bin/env node
// SEO page generator for Scrubby landing site
// Zero dependencies — uses Node.js 20+ native fetch and fs

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SUPABASE_URL, SERVICE_TYPES, TYPE_TO_SERVICE,
  SECONDARY_TYPE_PRIORITY, SKIP_PRIMARY_TYPES,
  STATE_ABBREVS, PAGE_SIZE, SITE_URL,
} from './config.mjs';
import { renderCityPage } from './templates/city-page.mjs';
import { renderBusinessPage } from './templates/business-page.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  process.exit(1);
}

// ─── Fetch all listings from Supabase ──────────────────────────────────

async function fetchAllListings() {
  const all = [];
  let offset = 0;

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/unclaimed_listings` +
      `?is_hidden=eq.false` +
      `&latitude=not.is.null` +
      `&or=(business_status.is.null,business_status.neq.CLOSED_PERMANENTLY)` +
      `&select=id,google_place_id,business_name,address,phone,website,rating,review_count,primary_type,types,photos,business_hours,current_opening_hours,price_level,description,extracted_data,external_ratings,payment_options,latitude,longitude,claimed_provider_id` +
      `&order=rating.desc.nullslast,review_count.desc.nullslast` +
      `&limit=${PAGE_SIZE}&offset=${offset}`;

    console.log(`  Fetching listings offset=${offset}...`);
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase fetch failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    if (data.length === 0) break;

    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  console.log(`  Fetched ${all.length} total listings.`);
  return all;
}

// ─── Address parsing ───────────────────────────────────────────────────

function parseCity(address) {
  if (!address) return null;
  // Only process US addresses
  if (!/(USA|United States)\s*$/.test(address) && !/\b[A-Z]{2}\s+\d{5}\b/.test(address)) return null;
  // Typical format: "123 Main St, Memphis, TN 38104, USA"
  const parts = address.split(',').map(s => s.trim());
  if (parts.length < 3) return null;

  // Find the part with state abbreviation + zip
  for (let i = 1; i < parts.length; i++) {
    const match = parts[i].match(/^([A-Z]{2})\s+\d{5}/);
    if (match && STATE_ABBREVS.has(match[1])) {
      const city = parts[i - 1];
      if (city && city.length > 1) {
        return { city, state: match[1] };
      }
    }
  }

  return null;
}

// ─── Slug generation ───────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')  // remove special chars
    .replace(/\s+/g, '-')          // spaces to hyphens
    .replace(/-+/g, '-')           // collapse hyphens
    .replace(/^-|-$/g, '');        // trim hyphens
}

function dedupeSlug(slug, usedSlugs) {
  if (!usedSlugs.has(slug)) {
    usedSlugs.add(slug);
    return slug;
  }
  let i = 2;
  while (usedSlugs.has(`${slug}-${i}`)) i++;
  const deduped = `${slug}-${i}`;
  usedSlugs.add(deduped);
  return deduped;
}

// ─── Classify listing into service type ────────────────────────────────

// ─── Classify listing into service type ────────────────────────────────
//
// Tiered classification strategy:
//   1. Direct match on primary_type (specific Google Places types)
//   2. Skip known non-service types (cemeteries, parks, zoos, etc.)
//   3. Check secondary `types` array using priority-ordered mapping
//   4. Infer from business name using keyword patterns
//   5. If nothing matches, skip the listing

function classifyListing(listing) {
  // Tier 1: Direct match on primary_type (highest confidence)
  if (listing.primary_type && TYPE_TO_SERVICE[listing.primary_type]) {
    return TYPE_TO_SERVICE[listing.primary_type];
  }

  // Tier 2: Skip known non-service primary types
  if (listing.primary_type && SKIP_PRIMARY_TYPES.has(listing.primary_type)) {
    return null;
  }

  // Tier 3: Check `types` array against priority-ordered secondary type mapping
  if (Array.isArray(listing.types)) {
    for (const rule of SECONDARY_TYPE_PRIORITY) {
      if (listing.types.includes(rule.type)) {
        return rule.service;
      }
    }
  }

  // Tier 4: Infer from business name — handles generic types like pet_care, service, store
  const name = (listing.business_name || '').toLowerCase();
  const desc = (listing.description || '').toLowerCase();
  const text = `${name} ${desc}`;

  if (/\bgroom|\bsalon|\bspa\b|\bparlou?r|\bbath|\bfur\s*cut|\bpet\s*styl|\bcuts\b/.test(text)) return 'groomers';
  if (/\bvet|\banimal\s*hosp|\banimal\s*clinic|\bveterinar|\banimal\s*care\s*center|\bpet\s*hosp/.test(text)) return 'vets';
  if (/\bboard|\bkennel|\bdaycare|\bday\s*care|\bpet\s*hotel|\bdog\s*hotel|\bpet\s*resort|\bdog\s*resort|\bpet\s*lodge|\bcottage|\bretreat|\bcastle|\bsleep\s*over/.test(text)) return 'boarding';
  if (/\btrain|\bobedien|\bk-?9\b|\bcanine\b|\bdog\s*(academy|school|class|universit)|\bpuppy\s*(prep|academy|school|class)/.test(text)) return 'training';
  if (/\bsit(?:t(?:er|ing))|\bpet\s*sit|\bhouse\s*sit|\bin-?home\s*pet/.test(text)) return 'sitters';
  if (/\bwalk|\bexcursion|\bhik/.test(text)) return 'walkers';

  // For pet_care primary type with no name match, default to groomers (most common)
  if (listing.primary_type === 'pet_care') return 'groomers';

  return null;
}

// ─── Sort listings: photos first, then by rating/reviews ───────────────

function sortListings(listings) {
  return listings.sort((a, b) => {
    const aHasPhoto = a.photos && a.photos.length > 0 ? 1 : 0;
    const bHasPhoto = b.photos && b.photos.length > 0 ? 1 : 0;
    if (bHasPhoto !== aHasPhoto) return bHasPhoto - aHasPhoto;
    const ratingDiff = (b.rating || 0) - (a.rating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return (b.review_count || 0) - (a.review_count || 0);
  });
}

// ─── Write file helper ─────────────────────────────────────────────────

function writeFile(relPath, content) {
  const fullPath = join(ROOT, relPath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, 'utf8');
}

// ─── Sitemap generation ────────────────────────────────────────────────

function generateSitemap(generatedPages) {
  // Read existing sitemap to preserve hand-maintained entries
  const sitemapPath = join(ROOT, 'sitemap.xml');
  const existingUrls = new Map();

  if (existsSync(sitemapPath)) {
    const content = readFileSync(sitemapPath, 'utf8');
    const urlRegex = /<url>\s*<loc>(.*?)<\/loc>[\s\S]*?<\/url>/g;
    let match;
    while ((match = urlRegex.exec(content)) !== null) {
      const loc = match[1];
      // Keep non-generated URLs (those not under service type paths)
      const isGenerated = Object.keys(SERVICE_TYPES).some(s => loc.includes(`/${s}/`));
      if (!isGenerated) {
        existingUrls.set(loc, match[0]);
      }
    }
  }

  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Existing (non-generated) URLs first
  for (const entry of existingUrls.values()) {
    xml += `  ${entry}\n`;
  }

  // Generated pages
  for (const page of generatedPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`  Updated sitemap.xml with ${existingUrls.size} existing + ${generatedPages.length} generated URLs.`);
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('Scrubby SEO Page Generator');
  console.log('=========================\n');

  // 1. Fetch listings
  console.log('1. Fetching listings from Supabase...');
  const allListings = await fetchAllListings();

  // 2. Classify and group
  console.log('\n2. Classifying and grouping listings...');
  // Map: serviceSlug → citySlug → { cityName, stateAbbrev, listings[] }
  const groups = {};
  let classified = 0;
  let skipped = 0;

  for (const listing of allListings) {
    const serviceSlug = classifyListing(listing);
    if (!serviceSlug) { skipped++; continue; }

    const parsed = parseCity(listing.address);
    if (!parsed) { skipped++; continue; }

    const citySlug = toSlug(parsed.city);
    if (!citySlug) { skipped++; continue; }

    if (!groups[serviceSlug]) groups[serviceSlug] = {};
    if (!groups[serviceSlug][citySlug]) {
      groups[serviceSlug][citySlug] = {
        cityName: parsed.city,
        stateAbbrev: parsed.state,
        listings: [],
      };
    }
    groups[serviceSlug][citySlug].listings.push(listing);
    classified++;
  }

  console.log(`  Classified: ${classified}, Skipped: ${skipped}`);

  // 3. Generate pages
  console.log('\n3. Generating pages...');
  const generatedPages = [];
  let cityPageCount = 0;
  let businessPageCount = 0;

  // Clean previous generated directories
  for (const slug of Object.keys(SERVICE_TYPES)) {
    const dir = join(ROOT, slug);
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true });
    }
  }

  for (const [serviceSlug, cities] of Object.entries(groups)) {
    const allCitiesForService = Object.entries(cities).map(([slug, data]) => ({
      slug,
      name: `${data.cityName}, ${data.stateAbbrev}`,
    }));
    allCitiesForService.sort((a, b) => a.name.localeCompare(b.name));

    // Generate service index page (redirect to most popular city or list all cities)
    const serviceIndexHtml = renderServiceIndex(serviceSlug, allCitiesForService);
    writeFile(`${serviceSlug}/index.html`, serviceIndexHtml);
    generatedPages.push({
      url: `${SITE_URL}/${serviceSlug}/`,
      priority: '0.8',
    });

    for (const [citySlug, data] of Object.entries(cities)) {
      const usedSlugs = new Set();

      // Sort listings
      const sorted = sortListings(data.listings);

      // Assign slugs
      for (const l of sorted) {
        l._slug = dedupeSlug(toSlug(l.business_name), usedSlugs);
      }

      // City page
      const cityHtml = renderCityPage({
        serviceSlug,
        cityName: data.cityName,
        stateAbbrev: data.stateAbbrev,
        citySlug,
        listings: sorted,
        otherCities: allCitiesForService,
      });
      writeFile(`${serviceSlug}/${citySlug}/index.html`, cityHtml);
      generatedPages.push({
        url: `${SITE_URL}/${serviceSlug}/${citySlug}/`,
        priority: '0.7',
      });
      cityPageCount++;

      // Individual business pages
      for (const listing of sorted) {
        const bizHtml = renderBusinessPage({
          listing,
          serviceSlug,
          cityName: data.cityName,
          stateAbbrev: data.stateAbbrev,
          citySlug,
        });
        writeFile(`${serviceSlug}/${citySlug}/${listing._slug}/index.html`, bizHtml);
        generatedPages.push({
          url: `${SITE_URL}/${serviceSlug}/${citySlug}/${listing._slug}/`,
          priority: '0.5',
        });
        businessPageCount++;
      }
    }
  }

  console.log(`  Generated ${cityPageCount} city pages, ${businessPageCount} business pages.`);

  // 4. Update sitemap
  console.log('\n4. Updating sitemap.xml...');
  generateSitemap(generatedPages);

  console.log(`\nDone! Total pages generated: ${cityPageCount + businessPageCount + Object.keys(groups).length}`);
}

// ─── Service index page (lists all cities for a service type) ──────────

function renderServiceIndex(serviceSlug, cities) {
  const service = SERVICE_TYPES[serviceSlug];
  const title = `${service.label} Near You | Scrubby`;
  const desc = `Find ${service.label.toLowerCase()} in your city. Browse ratings, hours, and photos. Book free on Scrubby.`;

  // Inline a minimal head + body since we don't need the full template imports here
  // But we can reuse partials
  const cityLinks = cities.map(c =>
    `                    <a href="/${serviceSlug}/${c.slug}/" class="city-link">${c.name}</a>`
  ).join('\n');

  // Use dynamic import workaround — actually just import at top level
  // We already have the templates imported, let's use partials directly
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${SITE_URL}/${serviceSlug}/">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${SITE_URL}/${serviceSlug}/">
    <meta property="og:type" content="website">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/seo-pages.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="nav-content">
                <div class="logo">
                    <a href="/"><img src="/images/scrubby_logo_full.png" alt="Scrubby" class="logo-img" loading="eager"></a>
                </div>
                <div class="nav-links">
                    <a href="/#how-it-works">How It Works</a>
                    <a href="/#why-scrubby">Why Scrubby</a>
                    <a href="/blog">Blog</a>
                    <a href="https://web.scrubby.app" class="btn-outline">Log In</a>
                    <a href="https://web.scrubby.app/signup" class="btn-primary" data-smart-link>Get Started</a>
                </div>
                <div class="mobile-menu-btn" id="mobileMenuBtn">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    </nav>
    <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-links">
            <a href="/#how-it-works">How It Works</a>
            <a href="/#why-scrubby">Why Scrubby</a>
            <a href="/blog">Blog</a>
        </div>
        <div class="mobile-menu-buttons">
            <a href="https://web.scrubby.app" class="btn-outline">Log In</a>
            <a href="https://web.scrubby.app/signup" class="btn-primary" data-smart-link>Get Started</a>
        </div>
    </div>

    <main class="seo-page">
        <div class="container">
            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <a href="/">Home</a>
                <span class="sep">/</span>
                <span>${service.label}</span>
            </nav>

            <header class="city-hero">
                <h1>${service.label} Near You</h1>
                <p class="city-count">Browse ${service.label.toLowerCase()} by city</p>
            </header>

            <div class="city-index-grid">
${cityLinks}
            </div>

            <section class="cta-banner">
                <h2>Book an Appointment — Free, No Phone Calls</h2>
                <p>Pick a time and request your appointment in minutes. 100% free for pet parents.</p>
                <a href="https://web.scrubby.app/signup" class="btn-primary-large" data-smart-link>Get Started Free</a>
            </section>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3 class="footer-logo">Scrubby</h3>
                    <p>Every groomer near you. Book in minutes.</p>
                </div>
                <div class="footer-links">
                    <div class="footer-column">
                        <h4>Company</h4>
                        <a href="https://globalnexus.llc">About Us</a>
                        <a href="/blog">Blog</a>
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms">Terms of Service</a>
                    </div>
                    <div class="footer-column">
                        <h4>Support</h4>
                        <a href="mailto:support@scrubby.app">Contact</a>
                        <a href="https://web.scrubby.app">Log In</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Global Nexus Enterprises LLC. All rights reserved.</p>
            </div>
        </div>
    </footer>
    <script src="/script.js"></script>
</body>
</html>`;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
