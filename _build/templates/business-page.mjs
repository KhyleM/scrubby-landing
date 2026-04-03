// Individual business detail page template

import { SERVICE_TYPES, SITE_URL, WEB_APP_URL, BOOKING_API_URL, SUPABASE_ANON_KEY } from '../config.mjs';
import {
  renderHead, renderNavbar, renderFooter, jsonLdLocalBusiness, parseAddress,
  renderStars, renderPriceLevel, getPhotos, getFirstPhoto, escapeHtml,
} from './partials.mjs';

/**
 * Render an individual business detail page.
 */
function renderSubServiceOptions(service) {
  if (!service.subServices || service.subServices.length === 0) return '';
  const options = service.subServices.filter(s => s !== 'Other').map(s =>
    `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`
  ).join('\n                                    ');
  return `<select name="service_type" id="serviceTypeSelect">
                                    <option value="">What do you need? (optional)</option>
                                    ${options}
                                    <option value="other">Other</option>
                                </select>
                                <input type="text" name="service_type_other" id="serviceTypeOther" placeholder="What service do you need?" style="display:none;">`;
}

export function renderBusinessPage({ listing, serviceSlug, cityName, stateAbbrev, citySlug }) {
  const service = SERVICE_TYPES[serviceSlug];
  const slug = listing._slug;
  const canonicalUrl = `${SITE_URL}/${serviceSlug}/${citySlug}/${slug}/`;
  const cityUrl = `/${serviceSlug}/${citySlug}/`;
  const pageTitle = `${listing.business_name} - ${service.singular} in ${cityName}, ${stateAbbrev} | Scrubby`;
  const pageDesc = buildDescription(listing, service, cityName, stateAbbrev);
  const firstPhoto = getFirstPhoto(listing);
  const jsonLd = jsonLdLocalBusiness(listing, canonicalUrl, serviceSlug);
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

                    <p class="detail-description">${escapeHtml(pageDesc)}</p>

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

                    <section class="detail-cta" id="book">
                        <h2>Book at ${escapeHtml(listing.business_name)}</h2>
                        <form id="bookingForm" class="booking-form">
                            <input type="hidden" name="listing_id" value="${listing.id}">
                            <div style="position:absolute;left:-9999px;"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
                            <div class="form-row">
                                <input name="name" placeholder="Your name" required>
                                <input name="email" type="email" placeholder="Email" required>
                            </div>
                            <div class="form-row">
                                <input name="phone" type="tel" placeholder="Phone (so we can confirm your booking)">
                                ${renderSubServiceOptions(service)}
                            </div>
                            <div class="form-row">
                                <input name="pet_name" placeholder="Pet's name">
                                <select name="pet_type">
                                    <option value="">Pet type</option>
                                    <option value="dog">Dog</option>
                                    <option value="cat">Cat</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <input name="breed" placeholder="Breed (e.g. Golden Retriever)">
                            </div>
                            <label class="form-label">When would you like to go?</label>
                            <div class="form-row">
                                <input name="preferred_date" type="date">
                                <select name="preferred_time_window">
                                    <option value="">Time of day</option>
                                    <option value="morning">Morning (8am - 12pm)</option>
                                    <option value="afternoon">Afternoon (12pm - 4pm)</option>
                                    <option value="evening">Evening (4pm - 7pm)</option>
                                </select>
                            </div>
                            <a href="javascript:void(0)" class="add-note-toggle" id="addNoteToggle">Add a note</a>
                            <textarea name="notes" id="notesField" placeholder="Vaccination records, special needs, or anything else we should know" rows="2" hidden></textarea>
                            <button type="submit" class="btn-primary-large booking-submit">Request to Book</button>
                            <p class="cta-sub">You'll receive confirmation within 24 hours</p>
                        </form>
                        <div id="bookingSuccess" class="booking-success" hidden>
                            <div class="success-icon">&#10003;</div>
                            <h3>You're all set!</h3>
                            <p>We're confirming your appointment at ${escapeHtml(listing.business_name)} and will email you the details shortly.</p>
                            <div class="app-store-cta">
                                <p>Track your appointment, manage your pet's profile, and book again — all in the Scrubby app.</p>
                                <a href="https://apps.apple.com/app/id6753985366" class="app-store-badge" target="_blank" rel="noopener">
                                    <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" alt="Download on the App Store" height="44">
                                </a>
                            </div>
                        </div>
                        <div id="bookingError" class="booking-error" hidden></div>
                    </section>
                </div>

                <aside class="detail-sidebar">
                    ${renderMap(listing)}
                    <a href="${cityUrl}" class="back-link">More ${service.label.toLowerCase()} in ${escapeHtml(cityName)}</a>
                </aside>
            </div>

            ${renderClaimBanner(listing)}

            <section class="related-articles">
                <h2>Pet Care Tips from the Scrubby Blog</h2>
                <div class="related-articles-list">
                    ${serviceSlug === 'groomers' ? `<a href="/blog/how-often-groom-your-dog/">How Often Should You Really Groom Your Dog? A Breed-by-Breed Guide</a>` : ''}
                    <a href="/blog/first-time-dog-owner-checklist/">First-Time Dog Owner? Here's Your Complete Care Checklist</a>
                    <a href="/blog/why-scrubby-is-free/">Why Scrubby Will Always Be Free for Pet Parents</a>
                </div>
            </section>
        </div>
    </main>

${renderFooter(SERVICE_TYPES)}
    <script>
    (function() {
      var claimBtn = document.getElementById('claimToggleBtn');
      var claimForm = document.getElementById('claimForm');
      var claimBanner = document.getElementById('claimBanner');
      var claimSuccess = document.getElementById('claimSuccess');
      var claimError = document.getElementById('claimError');
      var claimEndpoint = '${BOOKING_API_URL}/functions/v1/seo-claim-request';

      // Auto-open claim form when linked from outreach (?claim=auto)
      if (claimBtn && new URLSearchParams(window.location.search).get('claim') === 'auto') {
        claimBtn.click();
      }

      if (claimBtn && claimForm) {
        claimBtn.addEventListener('click', function() {
          claimBtn.hidden = true;
          claimForm.hidden = false;
          claimForm.querySelector('input[name="owner_name"]').focus();
        });

        claimForm.addEventListener('submit', function(e) {
          e.preventDefault();
          claimError.hidden = true;
          var submitBtn = claimForm.querySelector('.claim-submit');
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';

          var fd = new FormData(claimForm);
          var payload = {
            google_place_id: fd.get('google_place_id'),
            listing_id: fd.get('listing_id'),
            owner_name: fd.get('owner_name'),
            owner_email: fd.get('owner_email'),
            owner_phone: fd.get('owner_phone') || undefined,
            owner_role: fd.get('owner_role') || undefined
          };

          fetch(claimEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ${SUPABASE_ANON_KEY}' },
            body: JSON.stringify(payload)
          })
          .then(function(res) { return res.json().then(function(d) { return { ok: res.ok, data: d }; }); })
          .then(function(result) {
            if (result.ok) {
              claimForm.hidden = true;
              claimBanner.querySelector('.claim-banner-content').hidden = true;
              claimSuccess.hidden = false;
            } else {
              claimError.textContent = result.data.error || 'Something went wrong. Please try again.';
              claimError.hidden = false;
              submitBtn.disabled = false;
              submitBtn.textContent = 'Send Claim Request';
            }
          })
          .catch(function() {
            claimError.textContent = 'Unable to connect. Please check your internet and try again.';
            claimError.hidden = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Claim Request';
          });
        });
      }
    })();

    (function() {
      var form = document.getElementById('bookingForm');
      if (!form) return;
      var btn = form.querySelector('.booking-submit');
      var successEl = document.getElementById('bookingSuccess');
      var errorEl = document.getElementById('bookingError');
      var endpoint = '${BOOKING_API_URL}/functions/v1/seo-booking-submit';

      var formLoadTime = Date.now();

      // Set min date to today
      var dateInput = form.querySelector('input[type="date"]');
      if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

      // Toggle notes field
      var noteToggle = document.getElementById('addNoteToggle');
      var notesField = document.getElementById('notesField');
      if (noteToggle && notesField) {
        noteToggle.addEventListener('click', function() {
          notesField.hidden = false;
          noteToggle.hidden = true;
          notesField.focus();
        });
      }

      // Show/hide "Other" text input for service type
      var serviceSelect = document.getElementById('serviceTypeSelect');
      var serviceOther = document.getElementById('serviceTypeOther');
      if (serviceSelect && serviceOther) {
        serviceSelect.addEventListener('change', function() {
          if (serviceSelect.value === 'other') {
            serviceOther.style.display = '';
            serviceOther.focus();
          } else {
            serviceOther.style.display = 'none';
            serviceOther.value = '';
          }
        });
      }

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        errorEl.hidden = true;

        // Reject submissions faster than 3 seconds (likely bot)
        if (Date.now() - formLoadTime < 3000) {
          form.hidden = true;
          successEl.hidden = false;
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Submitting...';

        var fd = new FormData(form);
        var serviceType = fd.get('service_type');
        if (serviceType === 'other') serviceType = fd.get('service_type_other') || '${service.singular.toLowerCase()}';
        if (!serviceType) serviceType = '${service.singular.toLowerCase()}';
        var payload = {
          listing_id: fd.get('listing_id'),
          name: fd.get('name'),
          email: fd.get('email'),
          phone: fd.get('phone') || undefined,
          pet_name: fd.get('pet_name') || undefined,
          pet_type: fd.get('pet_type') || undefined,
          breed: fd.get('breed') || undefined,
          service_type: serviceType,
          preferred_date: fd.get('preferred_date') || undefined,
          preferred_time_window: fd.get('preferred_time_window') || undefined,
          notes: fd.get('notes') || undefined,
          website: fd.get('website') || undefined
        };

        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ${SUPABASE_ANON_KEY}' },
          body: JSON.stringify(payload)
        })
        .then(function(res) { return res.json().then(function(d) { return { ok: res.ok, data: d }; }); })
        .then(function(result) {
          if (result.ok) {
            form.hidden = true;
            successEl.hidden = false;
            if (typeof gtag === 'function') { gtag('event', 'conversion', { send_to: 'AW-18054455651/submit_lead_form' }); }
          } else {
            errorEl.textContent = result.data.error || 'Something went wrong. Please try again.';
            errorEl.hidden = false;
            btn.disabled = false;
            btn.textContent = 'Book Now';
          }
        })
        .catch(function() {
          errorEl.textContent = 'Unable to connect. Please check your internet and try again.';
          errorEl.hidden = false;
          btn.disabled = false;
          btn.textContent = 'Book Now';
        });
      });
    })();
    </script>`;
}

function buildDescription(listing, service, cityName, stateAbbrev) {
  const addr = parseAddress(listing.address);
  const street = addr ? addr.streetAddress : '';

  let desc = `${listing.business_name} is a ${service.singular.toLowerCase()} located at ${street} in ${cityName}, ${stateAbbrev}.`;

  if (listing.rating > 0 && listing.review_count > 0) {
    desc += ` Rated ${listing.rating} stars based on ${listing.review_count} reviews.`;
  }

  const hours = listing.business_hours?.weekdayDescriptions || listing.current_opening_hours?.weekdayDescriptions;
  const hoursSummary = summarizeHours(hours);
  if (hoursSummary) {
    desc += ` Open ${hoursSummary}.`;
  }

  return desc;
}

function summarizeHours(weekdayDescriptions) {
  if (!Array.isArray(weekdayDescriptions) || weekdayDescriptions.length === 0) return null;

  const openDays = [];
  let commonTime = null;
  let allSameTime = true;

  for (const desc of weekdayDescriptions) {
    const colonIdx = desc.indexOf(':');
    if (colonIdx === -1) continue;
    const day = desc.substring(0, colonIdx).trim();
    const time = desc.substring(colonIdx + 1).trim();

    if (/closed/i.test(time)) continue;

    openDays.push(day);

    if (commonTime === null) {
      commonTime = time;
    } else if (time !== commonTime) {
      allSameTime = false;
    }
  }

  if (openDays.length === 0) return null;

  if (openDays.length === 7) {
    return allSameTime && commonTime ? `7 days a week, ${commonTime}` : '7 days a week';
  }

  // Check for consecutive day ranges
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const indices = openDays.map(d => dayOrder.indexOf(d)).filter(i => i !== -1).sort((a, b) => a - b);

  if (indices.length >= 2) {
    const isConsecutive = indices.every((val, i) => i === 0 || val === indices[i - 1] + 1);
    if (isConsecutive) {
      const range = `${dayOrder[indices[0]]} through ${dayOrder[indices[indices.length - 1]]}`;
      return allSameTime && commonTime ? `${range}, ${commonTime}` : range;
    }
  }

  return `${openDays.length} days a week`;
}

function renderClaimBanner(listing) {
  if (listing.claimed_provider_id) return '';
  return `
            <div class="claim-banner" id="claimBanner">
                <div class="claim-banner-content">
                    <h3>Are you the owner of ${escapeHtml(listing.business_name)}?</h3>
                    <p>Claim your free listing to update your info, respond to bookings, and reach more pet owners.</p>
                    <button type="button" class="btn-primary claim-btn" id="claimToggleBtn">Claim This Business</button>
                </div>
                <form id="claimForm" class="claim-form" hidden>
                    <input type="hidden" name="google_place_id" value="${escapeHtml(listing.google_place_id)}">
                    <input type="hidden" name="listing_id" value="${listing.id}">
                    <div class="form-row">
                        <input name="owner_name" placeholder="Your name" required>
                        <input name="owner_email" type="email" placeholder="Email" required>
                    </div>
                    <div class="form-row">
                        <input name="owner_phone" type="tel" placeholder="Phone (optional)">
                        <input name="owner_role" placeholder="Role (e.g. Owner, Manager)">
                    </div>
                    <button type="submit" class="btn-primary-large claim-submit">Send Claim Request</button>
                    <p class="claim-sub">We'll verify your ownership and email you next steps within 24 hours.</p>
                </form>
                <div id="claimSuccess" class="claim-success" hidden>
                    <div class="success-icon">&#10003;</div>
                    <h3>Claim Request Sent!</h3>
                    <p>We'll verify your ownership of ${escapeHtml(listing.business_name)} and email you next steps within 24 hours.</p>
                </div>
                <div id="claimError" class="claim-error" hidden></div>
            </div>`;
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
