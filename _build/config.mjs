// SEO page generator configuration

export const SUPABASE_URL = 'https://anltnskudvrymdqoubez.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubHRuc2t1ZHZyeW1kcW91YmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4Mjc3ODQsImV4cCI6MjA3MjQwMzc4NH0.CkEa3_GsHT0yoRdVBoiyNk0p6CMQXv1PhzLxL08GAso';
export const SITE_URL = 'https://scrubby.app';
export const WEB_APP_URL = 'https://web.scrubby.app';

// US prod project — source of truth for bookings
export const BOOKING_API_URL = 'https://anltnskudvrymdqoubez.supabase.co';

// Map URL segments to Google Places primaryType values
export const SERVICE_TYPES = {
  groomers: {
    slug: 'groomers',
    label: 'Pet Groomers',
    singular: 'Pet Groomer',
    primaryTypes: ['pet_groomer'],
    subServices: [
      'Full Groom (bath, haircut, nails)',
      'Bath & Brush',
      'Nail Trim',
      'Deshedding Treatment',
      'Teeth Cleaning',
      'Other',
    ],
  },
  vets: {
    slug: 'vets',
    label: 'Veterinarians',
    singular: 'Veterinarian',
    primaryTypes: ['veterinary_care', 'animal_hospital'],
    subServices: [
      'Wellness / Checkup',
      'Vaccinations',
      'Sick Visit',
      'Dental Cleaning',
      'Spay / Neuter',
      'Other',
    ],
  },
  boarding: {
    slug: 'boarding',
    label: 'Pet Boarding',
    singular: 'Pet Boarding',
    primaryTypes: ['pet_boarding', 'dog_day_care_center', 'kennel'],
    subServices: [
      'Overnight Boarding',
      'Daycare',
      'Extended Stay',
      'Other',
    ],
  },
  training: {
    slug: 'training',
    label: 'Dog Trainers',
    singular: 'Dog Trainer',
    primaryTypes: ['dog_trainer'],
    subServices: [
      'Basic Obedience',
      'Puppy Training',
      'Behavioral Issues',
      'Private Session',
      'Group Class',
      'Other',
    ],
  },
  walkers: {
    slug: 'walkers',
    label: 'Dog Walkers',
    singular: 'Dog Walker',
    primaryTypes: ['dog_walker'],
    subServices: [
      'Daily Walk',
      'Pack Walk',
      'Private Walk',
      'Puppy Visit',
      'Other',
    ],
  },
  sitters: {
    slug: 'sitters',
    label: 'Pet Sitters',
    singular: 'Pet Sitter',
    primaryTypes: ['pet_sitter'],
    subServices: [
      'In-Home Sitting',
      'Drop-In Visits',
      'Overnight Stay',
      'Other',
    ],
  },
};

// Reverse lookup: primaryType → service slug
export const TYPE_TO_SERVICE = {};
for (const [slug, config] of Object.entries(SERVICE_TYPES)) {
  for (const type of config.primaryTypes) {
    TYPE_TO_SERVICE[type] = slug;
  }
}

// Additional primary_type → service mappings for less-specific Google types.
// These are checked when the primary_type is unambiguously a pet service.
// Generic types like 'pet_care', 'service', 'store' are intentionally excluded
// here — they require name/secondary-type inference (handled in classifyListing).
Object.assign(TYPE_TO_SERVICE, {
  // Vet-adjacent types
  'animal_hospital':    'vets',      // already in SERVICE_TYPES but belt-and-suspenders
  'veterinary_pharmacy': 'vets',
  // Boarding-adjacent types
  'hotel':              'boarding',  // pet hotels
});

// Types in the `types` array (secondary types) that can classify a listing
// when primary_type is generic (pet_care, service, store, establishment, etc.).
// Checked in priority order — first match wins.
// Higher-specificity types come first to avoid mis-classification.
export const SECONDARY_TYPE_PRIORITY = [
  // Tier 1: Highly specific Google Places types (directly map)
  { type: 'pet_groomer',            service: 'groomers' },
  { type: 'dog_trainer',            service: 'training' },
  { type: 'dog_walker',             service: 'walkers' },
  { type: 'pet_sitter',             service: 'sitters' },
  { type: 'dog_day_care_center',    service: 'boarding' },
  { type: 'kennel',                 service: 'boarding' },
  { type: 'pet_boarding',           service: 'boarding' },
  { type: 'pet_boarding_service',   service: 'boarding' },
  { type: 'animal_hospital',        service: 'vets' },
  { type: 'veterinary_care',        service: 'vets' },
  { type: 'veterinary_pharmacy',    service: 'vets' },
  // Tier 2: Broader types that suggest a category but are less certain
  { type: 'spa',                    service: 'groomers' },
  { type: 'lodging',                service: 'boarding' },
];

// primary_type values that should always be skipped (not pet service providers)
export const SKIP_PRIMARY_TYPES = new Set([
  'cemetery',
  'dog_park',
  'zoo',
  'shopping_mall',
  'department_store',
  'food',
  'corporate_office',
]);

// Schema.org @type mapping for JSON-LD
// Uses official schema.org types where available; falls back to LocalBusiness.
export const SCHEMA_ADDITIONAL_TYPE = {
  groomers: 'LocalBusiness',
  vets: 'VeterinaryCare',
  boarding: 'LodgingBusiness',
  training: 'LocalBusiness',
  walkers: 'LocalBusiness',
  sitters: 'LocalBusiness',
};

// US state abbreviations for address parsing
export const STATE_ABBREVS = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]);

export const PAGE_SIZE = 1000;
