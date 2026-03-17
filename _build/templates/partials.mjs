// Shared HTML partials for SEO pages

import { SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL, WEB_APP_URL, SCHEMA_ADDITIONAL_TYPE } from '../config.mjs';

/**
 * Build photo proxy URL from a Google Places photo reference.
 */
export function photoUrl(ref, { maxWidth = 600, maxHeight = 400 } = {}) {
  if (!ref) return null;
  // Already a full URL (legacy)
  if (ref.startsWith('http')) return ref;
  return `${SUPABASE_URL}/functions/v1/places-photo?ref=${encodeURIComponent(ref)}&maxWidth=${maxWidth}&maxHeight=${maxHeight}&apikey=${SUPABASE_ANON_KEY}`;
}

/**
 * Render full <head> section.
 */
export function renderHead({ title, description, canonicalUrl, ogImage, jsonLd }) {
  const ogImg = ogImage || `${SITE_URL}/images/scrubby_logo_full.png`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${ogImg}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/seo-pages.css">
    ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>`;
}

/**
 * Render navbar (matches index.html exactly).
 */
export function renderNavbar() {
  return `<body>
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
                    <a href="${WEB_APP_URL}" class="btn-outline">Log In</a>
                    <a href="${WEB_APP_URL}/signup" class="btn-primary" data-smart-link>Get Started</a>
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
            <a href="${WEB_APP_URL}" class="btn-outline">Log In</a>
            <a href="${WEB_APP_URL}/signup" class="btn-primary" data-smart-link>Get Started</a>
        </div>
    </div>`;
}

/**
 * Render footer with Browse column for service categories.
 */
export function renderFooter(serviceTypes) {
  const browseLinks = Object.values(serviceTypes)
    .map(s => `                        <a href="/${s.slug}/">${s.label}</a>`)
    .join('\n');

  return `    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3 class="footer-logo">Scrubby</h3>
                    <p>Every groomer near you. Book in minutes.</p>
                    <div class="social-links">
                        <a href="https://instagram.com/usescrubby" aria-label="Instagram">📷</a>
                        <a href="https://facebook.com/usescrubby" aria-label="Facebook">📘</a>
                        <a href="https://tiktok.com/@usescrubby" aria-label="TikTok">🎵</a>
                        <a href="https://twitter.com/usescrubby" aria-label="Twitter">🐦</a>
                    </div>
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
                        <h4>Browse</h4>
${browseLinks}
                    </div>
                    <div class="footer-column">
                        <h4>Support</h4>
                        <a href="mailto:support@scrubby.app">Contact</a>
                        <a href="${WEB_APP_URL}">Log In</a>
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

/**
 * Parse a formatted address string into structured components.
 * Handles: "1561 Powell St, San Francisco, CA 94133, USA"
 *          "123 Main St Suite 4, Memphis, TN 38104, USA"
 */
export function parseAddress(address) {
  if (!address) return null;
  const parts = address.split(',').map(s => s.trim());
  if (parts.length < 3) return null;

  // Find the part with state abbreviation + zip
  for (let i = 2; i < parts.length; i++) {
    const match = parts[i].match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
    if (match) {
      return {
        streetAddress: parts.slice(0, i - 1).join(', '),
        addressLocality: parts[i - 1],
        addressRegion: match[1],
        postalCode: match[2],
        addressCountry: 'US',
      };
    }
  }

  // Fallback: try without zip
  for (let i = 2; i < parts.length; i++) {
    const match = parts[i].match(/^([A-Z]{2})$/);
    if (match) {
      return {
        streetAddress: parts.slice(0, i - 1).join(', '),
        addressLocality: parts[i - 1],
        addressRegion: match[1],
        addressCountry: 'US',
      };
    }
  }

  return null;
}

/**
 * Parse weekdayDescriptions into OpeningHoursSpecification objects.
 * Input format: ["Monday: 9:00 AM – 5:00 PM", "Tuesday: Closed", ...]
 */
export function parseOpeningHours(weekdayDescriptions) {
  if (!Array.isArray(weekdayDescriptions) || weekdayDescriptions.length === 0) return [];

  const specs = [];
  for (const desc of weekdayDescriptions) {
    const colonIdx = desc.indexOf(':');
    if (colonIdx === -1) continue;

    const dayName = desc.substring(0, colonIdx).trim();
    const timeStr = desc.substring(colonIdx + 1).trim();

    if (/closed/i.test(timeStr)) continue;
    if (/open\s*24\s*hours/i.test(timeStr)) {
      specs.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: dayName, opens: '00:00', closes: '23:59' });
      continue;
    }

    // Match time ranges like "9:00 AM – 5:00 PM" or "9:00 AM - 5:00 PM"
    const rangeMatch = timeStr.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[–\-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    if (rangeMatch) {
      const opens = to24h(rangeMatch[1].trim());
      const closes = to24h(rangeMatch[2].trim());
      if (opens && closes) {
        specs.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: dayName, opens, closes });
      }
    }
  }
  return specs;
}

/**
 * Convert 12-hour time to 24-hour format. "9:00 AM" → "09:00", "5:00 PM" → "17:00"
 */
function to24h(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const min = match[2];
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return `${String(hour).padStart(2, '0')}:${min}`;
}

/**
 * Render JSON-LD LocalBusiness structured data for a single listing.
 */
export function jsonLdLocalBusiness(listing, canonicalUrl, serviceSlug) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.business_name,
    url: canonicalUrl,
  };

  // Structured address
  const addr = parseAddress(listing.address);
  if (addr) {
    ld.address = { '@type': 'PostalAddress', ...addr };
  }

  if (listing.phone) ld.telephone = listing.phone;
  if (listing.website) ld.sameAs = listing.website;

  // Only include aggregateRating if meaningful
  if (listing.rating > 0 && listing.review_count > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: listing.rating,
      reviewCount: listing.review_count,
    };
  }

  if (listing.latitude && listing.longitude) {
    ld.geo = {
      '@type': 'GeoCoordinates',
      latitude: listing.latitude,
      longitude: listing.longitude,
    };
  }

  const firstPhoto = getFirstPhoto(listing);
  if (firstPhoto) ld.image = firstPhoto;

  // Opening hours
  const hours = listing.business_hours?.weekdayDescriptions || listing.current_opening_hours?.weekdayDescriptions;
  const hoursSpec = parseOpeningHours(hours);
  if (hoursSpec.length > 0) ld.openingHoursSpecification = hoursSpec;

  // Service-specific additionalType
  const additionalType = serviceSlug && SCHEMA_ADDITIONAL_TYPE[serviceSlug];
  if (additionalType) ld.additionalType = additionalType;

  return ld;
}

/**
 * Render JSON-LD ItemList structured data for a city page.
 */
export function jsonLdItemList(listings, pageUrl, listName) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    url: pageUrl,
    numberOfItems: listings.length,
    itemListElement: listings.slice(0, 50).map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: l.business_name,
      url: l._pageUrl,
    })),
  };
  if (listName) ld.name = listName;
  return ld;
}

/**
 * Render star rating as CSS-only stars.
 */
export function renderStars(rating) {
  if (rating == null) return '';
  const full = Math.floor(rating);
  const half = rating - full >= 0.3 && rating - full < 0.8 ? 1 : 0;
  const fullStar = rating - full >= 0.8 ? full + 1 : full;
  const actualFull = half ? full : fullStar;
  const empty = 5 - actualFull - half;
  return `<span class="stars" aria-label="${rating} out of 5 stars">`
    + '<span class="star filled">&#9733;</span>'.repeat(actualFull)
    + (half ? '<span class="star half">&#9733;</span>' : '')
    + '<span class="star empty">&#9734;</span>'.repeat(Math.max(0, empty))
    + '</span>';
}

/**
 * Render price level as dollar signs.
 */
export function renderPriceLevel(level) {
  if (!level) return '';
  return `<span class="price-level">${'$'.repeat(level)}</span>`;
}

/**
 * Get the first photo URL from a listing.
 */
export function getFirstPhoto(listing) {
  if (!listing.photos || !Array.isArray(listing.photos) || listing.photos.length === 0) return null;
  const ref = typeof listing.photos[0] === 'string' ? listing.photos[0] : listing.photos[0]?.name || listing.photos[0]?.ref;
  return ref ? photoUrl(ref) : null;
}

/**
 * Get up to N photo URLs from a listing.
 */
export function getPhotos(listing, max = 5) {
  if (!listing.photos || !Array.isArray(listing.photos)) return [];
  return listing.photos.slice(0, max).map(p => {
    const ref = typeof p === 'string' ? p : p?.name || p?.ref;
    return ref ? photoUrl(ref, { maxWidth: 800, maxHeight: 600 }) : null;
  }).filter(Boolean);
}

/**
 * Escape HTML entities.
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
