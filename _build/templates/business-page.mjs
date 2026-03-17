// Individual business detail page template

import { SERVICE_TYPES, SITE_URL, WEB_APP_URL } from '../config.mjs';
import {
  renderHead, renderNavbar, renderFooter, jsonLdLocalBusiness,
  renderStars, renderPriceLevel, getPhotos, getFirstPhoto, escapeHtml,
} from './partials.mjs';

/**
 * Render an individual business detail page.
 */
export function renderBusinessPage({ listing, serviceSlug, cityName, stateAbbrev, citySlug }) {
  const service = SERVICE_TYPES[serviceSlug];
  const slug = listing._slug;
  const canonicalUrl = `${SITE_URL}/${serviceSlug}/${citySlug}/${slug}/`;
  const cityUrl = `/${serviceSlug}/${citySlug}/`;
  const pageTitle = `${listing.business_name} - ${service.singular} in ${cityName}, ${stateAbbrev} | Scrubby`;
  const pageDesc = buildDescription(listing, service, cityName, stateAbbrev);
  const firstPhoto = getFirstPhoto(listing);
  const jsonLd = jsonLdLocalBusiness(listing, canonicalUrl);
  const photos = getPhotos(listing, 5);

  const extracted = listing.extracted_data || {};
  const hours = listing.business_hours?.weekdayDescriptions || listing.current_opening_hours?.weekdayDescriptions;
  const paymentOpts = listing.payment_options;
  const externalRatings = listing.external_ratings || {};

  return `${renderHead({ title: pageTitle, description: pageDesc, canonicalUrl, ogImage: firstPhoto, jsonLd })}
${renderNavbar()}

    <main class="seo-page business-detail">
        <div class="container">
            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <a href="/">Home</a>
                <span class="sep">/</span>
                <a href="/${serviceSlug}/">${service.label}</a>
                <span class="sep">/</span>
                <a href="${cityUrl}">${escapeHtml(cityName)}</a>
                <span class="sep">/</span>
                <span>${escapeHtml(listing.business_name)}</span>
            </nav>

            ${renderPhotoGallery(photos, listing.business_name)}

            <div class="detail-layout">
                <div class="detail-main">
                    <h1>${escapeHtml(listing.business_name)}</h1>
                    <div class="detail-meta">
                        ${renderStars(listing.rating)}
                        ${listing.review_count ? `<span class="review-count">${listing.review_count} reviews</span>` : ''}
                        ${renderExternalRatings(externalRatings)}
                        ${renderPriceLevel(listing.price_level)}
                    </div>

                    ${listing.description ? `<p class="detail-description">${escapeHtml(listing.description)}</p>` : ''}

                    <div class="detail-info">
                        ${listing.address ? `<div class="info-row">
                            <span class="info-label">Address</span>
                            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}" target="_blank" rel="noopener">${escapeHtml(listing.address)}</a>
                        </div>` : ''}
                        ${listing.phone ? `<div class="info-row">
                            <span class="info-label">Phone</span>
                            <a href="tel:${listing.phone}">${escapeHtml(listing.phone)}</a>
                        </div>` : ''}
                        ${listing.website ? `<div class="info-row">
                            <span class="info-label">Website</span>
                            <a href="${listing.website}" target="_blank" rel="noopener nofollow">${escapeHtml(new URL(listing.website).hostname)}</a>
                        </div>` : ''}
                    </div>

                    ${renderHoursTable(hours)}
                    ${renderServiceTags(extracted.extracted_services)}
                    ${renderPetSpecialties(extracted.pet_specialties)}
                    ${renderReviewInsights(extracted)}
                    ${renderPaymentOptions(paymentOpts)}

                    <section class="detail-cta">
                        <a href="${WEB_APP_URL}/discover?placeId=${listing.google_place_id}" class="btn-primary-large" data-smart-link>Book an Appointment</a>
                        <p class="cta-sub">100% free for pet parents. No fees, no commission.</p>
                    </section>
                </div>

                <aside class="detail-sidebar">
                    ${renderMap(listing)}
                    <a href="${cityUrl}" class="back-link">More ${service.label.toLowerCase()} in ${escapeHtml(cityName)}</a>
                </aside>
            </div>
        </div>
    </main>

${renderFooter(SERVICE_TYPES)}`;
}

function buildDescription(listing, service, cityName, stateAbbrev) {
  let desc = `${listing.business_name} is a ${service.singular.toLowerCase()} in ${cityName}, ${stateAbbrev}.`;
  if (listing.rating) desc += ` Rated ${listing.rating}/5`;
  if (listing.review_count) desc += ` from ${listing.review_count} reviews.`;
  else if (listing.rating) desc += '.';
  desc += ' Book an appointment free on Scrubby.';
  return desc;
}

function renderPhotoGallery(photos, name) {
  if (photos.length === 0) return '';
  const imgs = photos.map((url, i) =>
    `<img src="${url}" alt="${escapeHtml(name)}${i > 0 ? ` photo ${i + 1}` : ''}" loading="${i === 0 ? 'eager' : 'lazy'}" class="gallery-img">`
  ).join('\n                    ');
  return `            <div class="photo-gallery photo-count-${Math.min(photos.length, 5)}">
                    ${imgs}
            </div>`;
}

function renderExternalRatings(ratings) {
  if (!ratings || Object.keys(ratings).length === 0) return '';
  const parts = [];
  if (ratings.yelp_rating) parts.push(`Yelp ${ratings.yelp_rating}`);
  if (ratings.facebook_rating) parts.push(`Facebook ${ratings.facebook_rating}`);
  if (parts.length === 0) return '';
  return `<span class="external-ratings">${parts.join(' · ')}</span>`;
}

function renderHoursTable(hours) {
  if (!Array.isArray(hours) || hours.length === 0) return '';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const rows = hours.map(h => {
    const isToday = h.toLowerCase().startsWith(today.toLowerCase());
    return `<tr${isToday ? ' class="today"' : ''}><td>${escapeHtml(h)}</td></tr>`;
  }).join('\n                        ');
  return `
                    <section class="detail-section">
                        <h2>Hours</h2>
                        <table class="hours-table">
                        ${rows}
                        </table>
                    </section>`;
}

function renderServiceTags(services) {
  if (!Array.isArray(services) || services.length === 0) return '';
  const tags = services.map(s => `<span class="tag">${escapeHtml(s)}</span>`).join('');
  return `
                    <section class="detail-section">
                        <h2>Services</h2>
                        <div class="tag-list">${tags}</div>
                    </section>`;
}

function renderPetSpecialties(specialties) {
  if (!Array.isArray(specialties) || specialties.length === 0) return '';
  const tags = specialties.map(s => `<span class="tag specialty">${escapeHtml(s)}</span>`).join('');
  return `
                    <section class="detail-section">
                        <h2>Pet Specialties</h2>
                        <div class="tag-list">${tags}</div>
                    </section>`;
}

function renderReviewInsights(extracted) {
  const sections = [];
  if (extracted.atmosphere) {
    sections.push(`<div class="insight"><strong>Atmosphere:</strong> ${escapeHtml(extracted.atmosphere)}</div>`);
  }
  if (extracted.price_sentiment) {
    sections.push(`<div class="insight"><strong>Pricing:</strong> ${escapeHtml(extracted.price_sentiment)}</div>`);
  }
  if (extracted.wait_time_hints) {
    sections.push(`<div class="insight"><strong>Wait Times:</strong> ${escapeHtml(extracted.wait_time_hints)}</div>`);
  }
  if (extracted.staff_mentions && Array.isArray(extracted.staff_mentions) && extracted.staff_mentions.length > 0) {
    sections.push(`<div class="insight"><strong>Staff:</strong> ${escapeHtml(extracted.staff_mentions.join(', '))}</div>`);
  }
  if (extracted.breed_mentions && Array.isArray(extracted.breed_mentions) && extracted.breed_mentions.length > 0) {
    sections.push(`<div class="insight"><strong>Breeds Mentioned:</strong> ${escapeHtml(extracted.breed_mentions.join(', '))}</div>`);
  }
  if (sections.length === 0) return '';
  return `
                    <section class="detail-section">
                        <h2>Review Insights</h2>
                        <div class="insights">${sections.join('\n                        ')}</div>
                    </section>`;
}

function renderPaymentOptions(opts) {
  if (!opts || typeof opts !== 'object') return '';
  const methods = [];
  if (opts.acceptsCreditCards) methods.push('Credit Cards');
  if (opts.acceptsDebitCards) methods.push('Debit Cards');
  if (opts.acceptsNfc) methods.push('Contactless / NFC');
  if (opts.acceptsCashOnly) methods.push('Cash Only');
  if (methods.length === 0) return '';
  const tags = methods.map(m => `<span class="tag">${m}</span>`).join('');
  return `
                    <section class="detail-section">
                        <h2>Payment Options</h2>
                        <div class="tag-list">${tags}</div>
                    </section>`;
}

function renderMap(listing) {
  if (!listing.latitude || !listing.longitude) return '';
  const lat = listing.latitude;
  const lon = listing.longitude;
  return `<div class="map-container">
                        <iframe
                            src="https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.005},${lat - 0.005},${lon + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lon}"
                            width="100%" height="300" frameborder="0"
                            loading="lazy" title="Map showing ${escapeHtml(listing.business_name)}"
                            style="border:0; border-radius: var(--radius-sm);">
                        </iframe>
                    </div>`;
}
