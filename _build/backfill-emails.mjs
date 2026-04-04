#!/usr/bin/env node
/**
 * Backfill business_email on unclaimed_listings by scraping websites.
 *
 * Fetches listings that have a website but no business_email,
 * visits each site, extracts email addresses from the HTML,
 * and updates the listing with the best match.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node _build/backfill-emails.mjs
 *
 * Options:
 *   --limit N       Process at most N listings (default: all)
 *   --dry-run       Print found emails without updating the database
 *   --concurrency N Number of parallel fetches (default: 10)
 */

const SUPABASE_URL = 'https://anltnskudvrymdqoubez.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required.');
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const concIdx = args.indexOf('--concurrency');
const CONCURRENCY = concIdx !== -1 ? parseInt(args[concIdx + 1], 10) : 10;

const PAGE_SIZE = 1000;
const FETCH_TIMEOUT = 8000; // 8s per website

// Emails to skip — these are generic platform/builder addresses, not the business
const SKIP_DOMAINS = new Set([
  'sentry.io', 'wixpress.com', 'sentry.wixpress.com', 'squarespace.com',
  'squarespace-mail.com', 'godaddy.com', 'secureserver.net',
  'wordpress.org', 'wordpress.com', 'example.com', 'email.com',
  'yourdomain.com', 'domain.com', 'test.com', 'sentry-next.wixpress.com',
  'googleusercontent.com', 'gstatic.com', 'w3.org', 'schema.org',
  'facebook.com', 'twitter.com', 'instagram.com', 'googleapis.com',
  'tiktok.com', 'youtube.com', 'google.com', 'apple.com',
  'vagaro.com', 'booking.com', 'yelp.com', 'nextdoor.com',
]);

const SKIP_PREFIXES = [
  'noreply@', 'no-reply@', 'donotreply@', 'do-not-reply@',
  'mailer-daemon@', 'postmaster@', 'webmaster@', 'hostmaster@',
  'abuse@', 'support@wix', 'support@squarespace', 'privacy@',
];

// ─── Fetch listings needing emails ─────────────────────────────────────

async function fetchListings() {
  const all = [];
  let offset = 0;

  while (all.length < LIMIT) {
    const batchSize = Math.min(PAGE_SIZE, LIMIT - all.length);
    const url = `${SUPABASE_URL}/rest/v1/unclaimed_listings` +
      `?is_hidden=eq.false` +
      `&website=not.is.null&website=neq.` +
      `&or=(business_email.is.null,business_email.eq.)` +
      `&select=id,business_name,website` +
      `&limit=${batchSize}&offset=${offset}`;

    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase fetch failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    if (data.length === 0) break;
    all.push(...data);
    if (data.length < batchSize) break;
    offset += batchSize;
  }

  return all;
}

// ─── Extract emails from HTML ──────────────────────────────────────────

function extractEmails(html) {
  const emails = new Set();

  // 1. mailto: links (highest confidence)
  const mailtoRegex = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
  let match;
  while ((match = mailtoRegex.exec(html)) !== null) {
    emails.add(match[1].toLowerCase());
  }

  // 2. Email-like patterns in text (broader)
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  while ((match = emailRegex.exec(html)) !== null) {
    const email = match[0].toLowerCase();
    // Skip image file extensions that look like emails
    if (/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(email)) continue;
    emails.add(email);
  }

  // Filter out junk
  return [...emails].filter(email => {
    const domain = email.split('@')[1];
    if (SKIP_DOMAINS.has(domain)) return false;
    if (SKIP_PREFIXES.some(p => email.startsWith(p))) return false;
    // Skip very long emails (likely encoded garbage)
    if (email.length > 60) return false;
    return true;
  });
}

// Rank emails — prefer business-sounding addresses
function pickBestEmail(emails, website) {
  if (emails.length === 0) return null;
  if (emails.length === 1) return emails[0];

  // Try to find one matching the website domain
  let siteDomain = null;
  try {
    siteDomain = new URL(website).hostname.replace(/^www\./, '');
  } catch { /* ignore */ }

  // Score each email
  const scored = emails.map(email => {
    let score = 0;
    const domain = email.split('@')[1];

    // Matches the business website domain — strong signal
    if (siteDomain && domain === siteDomain) score += 10;

    // Common business prefixes
    if (/^(info|contact|hello|appointments|booking|office|admin|front)@/.test(email)) score += 5;

    // Looks like a personal name (first.last@ or firstlast@) — decent signal
    if (/^[a-z]+[.\-][a-z]+@/.test(email)) score += 3;

    // Generic prefixes get lower priority
    if (/^(support|help|sales|marketing)@/.test(email)) score += 1;

    return { email, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].email;
}

// ─── Fetch a website with timeout ──────────────────────────────────────

async function fetchWebsite(url) {
  // Normalize URL
  if (!url.startsWith('http')) url = 'https://' + url;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Scrubby/1.0; +https://scrubby.app)',
        Accept: 'text/html',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return null;

    // Read limited amount of HTML (first 500KB)
    const reader = res.body.getReader();
    const chunks = [];
    let totalBytes = 0;
    const maxBytes = 500 * 1024;

    while (totalBytes < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalBytes += value.length;
    }
    reader.cancel();

    const decoder = new TextDecoder();
    return chunks.map(c => decoder.decode(c, { stream: true })).join('') + decoder.decode();
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// ─── Update listing in Supabase ────────────────────────────────────────

async function updateEmail(listingId, email) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/unclaimed_listings?id=eq.${listingId}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ business_email: email }),
    }
  );
  return res.ok;
}

// ─── Process listings in parallel batches ──────────────────────────────

async function processListing(listing) {
  const html = await fetchWebsite(listing.website);
  if (!html) return { id: listing.id, name: listing.business_name, status: 'fetch_failed' };

  const emails = extractEmails(html);
  if (emails.length === 0) return { id: listing.id, name: listing.business_name, status: 'no_email' };

  const bestEmail = pickBestEmail(emails, listing.website);

  if (DRY_RUN) {
    return { id: listing.id, name: listing.business_name, status: 'found', email: bestEmail, all: emails };
  }

  const ok = await updateEmail(listing.id, bestEmail);
  return {
    id: listing.id,
    name: listing.business_name,
    status: ok ? 'updated' : 'update_failed',
    email: bestEmail,
  };
}

async function processBatch(listings) {
  return Promise.all(listings.map(processListing));
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('Scrubby Email Backfill');
  console.log('=====================');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Limit: ${LIMIT === Infinity ? 'all' : LIMIT}\n`);

  console.log('Fetching listings with websites but no email...');
  const listings = await fetchListings();
  console.log(`Found ${listings.length} listings to process.\n`);

  if (listings.length === 0) {
    console.log('Nothing to do!');
    return;
  }

  const stats = { total: listings.length, found: 0, fetch_failed: 0, no_email: 0, updated: 0, update_failed: 0 };
  let processed = 0;

  // Process in batches
  for (let i = 0; i < listings.length; i += CONCURRENCY) {
    const batch = listings.slice(i, i + CONCURRENCY);
    const results = await processBatch(batch);

    for (const r of results) {
      processed++;
      stats[r.status] = (stats[r.status] || 0) + 1;

      if (r.status === 'found' || r.status === 'updated') {
        stats.found++;
        console.log(`  [${processed}/${listings.length}] ✓ ${r.name} → ${r.email}`);
      } else if (r.status === 'fetch_failed') {
        // Silent — too noisy otherwise
      } else if (r.status === 'no_email') {
        // Silent
      }
    }

    // Progress update every 5 batches
    if ((i / CONCURRENCY) % 5 === 4) {
      console.log(`  ... processed ${processed}/${listings.length} (${stats.found} emails found)`);
    }
  }

  console.log('\n=====================');
  console.log('Results:');
  console.log(`  Total processed:  ${stats.total}`);
  console.log(`  Emails found:     ${stats.found}`);
  console.log(`  Fetch failed:     ${stats.fetch_failed}`);
  console.log(`  No email on page: ${stats.no_email}`);
  if (!DRY_RUN) {
    console.log(`  Updated in DB:    ${stats.updated}`);
    console.log(`  Update failed:    ${stats.update_failed}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
