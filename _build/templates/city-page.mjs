// City index page template

import { SERVICE_TYPES, SITE_URL, WEB_APP_URL } from '../config.mjs';
import {
  renderHead, renderNavbar, renderFooter, jsonLdItemList,
  renderStars, renderPriceLevel, getFirstPhoto, escapeHtml,
} from './partials.mjs';

/**
 * Render a city index page.
 * @param {object} params
 * @param {string} params.serviceSlug - e.g. 'groomers'
 * @param {string} params.cityName - e.g. 'Memphis'
 * @param {string} params.stateAbbrev - e.g. 'TN'
 * @param {string} params.citySlug - e.g. 'memphis'
 * @param {object[]} params.listings - sorted array of listings
 * @param {string[]} params.otherCities - other city slugs with display names for cross-linking
 */
export function renderCityPage({ serviceSlug, cityName, stateAbbrev, citySlug, listings, otherCities }) {
  const service = SERVICE_TYPES[serviceSlug];
  const pageTitle = `${service.label} in ${cityName}, ${stateAbbrev} | Scrubby`;
  const pageDesc = `Find the best ${service.label.toLowerCase()} in ${cityName}, ${stateAbbrev}. Browse ${listings.length} businesses with ratings, hours, and photos. Book an appointment free on Scrubby.`;
  const canonicalUrl = `${SITE_URL}/${serviceSlug}/${citySlug}/`;

  // Assign page URLs to listings for JSON-LD
  for (const l of listings) {
    l._pageUrl = `${SITE_URL}/${serviceSlug}/${citySlug}/${l._slug}/`;
  }

  const jsonLd = jsonLdItemList(listings, canonicalUrl);

  const cards = listings.map(l => renderCard(l, serviceSlug, citySlug)).join('\n');

  const crossLinks = otherCities
    .filter(c => c.slug !== citySlug)
    .slice(0, 12)
    .map(c => `<a href="/${serviceSlug}/${c.slug}/">${service.label} in ${c.name}</a>`)
    .join('\n                    ');

  return `${renderHead({ title: pageTitle, description: pageDesc, canonicalUrl, jsonLd })}
${renderNavbar()}

    <main class="seo-page">
        <div class="container">
            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <a href="/">Home</a>
                <span class="sep">/</span>
                <a href="/${serviceSlug}/">${service.label}</a>
                <span class="sep">/</span>
                <span>${escapeHtml(cityName)}, ${stateAbbrev}</span>
            </nav>

            <header class="city-hero">
                <h1>${escapeHtml(service.label)} in ${escapeHtml(cityName)}, ${stateAbbrev}</h1>
                <p class="city-count">${listings.length} ${listings.length === 1 ? 'business' : 'businesses'} found</p>
            </header>

            <div class="business-grid">
${cards}
            </div>

            ${crossLinks ? `<section class="cross-links">
                <h2>Browse ${service.label} in Other Cities</h2>
                <div class="cross-link-list">
                    ${crossLinks}
                </div>
            </section>` : ''}

            <section class="cta-banner">
                <h2>Book an Appointment — Free, No Phone Calls</h2>
                <p>Pick a time and request your appointment in minutes. 100% free for pet parents.</p>
                <a href="${WEB_APP_URL}/signup" class="btn-primary-large" data-smart-link>Get Started Free</a>
            </section>
        </div>
    </main>

${renderFooter(SERVICE_TYPES)}`;
}

function renderCard(listing, serviceSlug, citySlug) {
  const photo = getFirstPhoto(listing);
  const href = `/${serviceSlug}/${citySlug}/${listing._slug}/`;
  const photoHtml = photo
    ? `<img src="${photo}" alt="${escapeHtml(listing.business_name)}" loading="lazy" class="card-photo">`
    : `<div class="card-photo-placeholder"></div>`;

  const services = listing.extracted_data?.extracted_services;
  const tagsHtml = Array.isArray(services) && services.length > 0
    ? `<div class="card-tags">${services.slice(0, 3).map(s => `<span class="tag">${escapeHtml(s)}</span>`).join('')}</div>`
    : '';

  return `                <a href="${href}" class="business-card">
                    <div class="card-image">${photoHtml}</div>
                    <div class="card-body">
                        <h3 class="card-name">${escapeHtml(listing.business_name)}</h3>
                        <div class="card-meta">
                            ${renderStars(listing.rating)}
                            ${listing.review_count ? `<span class="review-count">(${listing.review_count})</span>` : ''}
                            ${renderPriceLevel(listing.price_level)}
                        </div>
                        ${listing.address ? `<p class="card-address">${escapeHtml(listing.address)}</p>` : ''}
                        ${tagsHtml}
                    </div>
                </a>`;
}
