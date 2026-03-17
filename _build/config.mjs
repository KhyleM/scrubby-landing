// SEO page generator configuration

export const SUPABASE_URL = 'https://mzjwgvwirdrhvsaxavgf.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16andndndpcmRyaHZzYXhhdmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDE3MDQsImV4cCI6MjA3ODc3NzcwNH0.SB0CQpRriZ3lllqMIjSCdAkqxHHmuwyTVSEwfYAzo80';
export const SITE_URL = 'https://scrubby.app';
export const WEB_APP_URL = 'https://web.scrubby.app';

// Map URL segments to Google Places primaryType values
export const SERVICE_TYPES = {
  groomers: {
    slug: 'groomers',
    label: 'Pet Groomers',
    singular: 'Pet Groomer',
    primaryTypes: ['pet_groomer'],
  },
  vets: {
    slug: 'vets',
    label: 'Veterinarians',
    singular: 'Veterinarian',
    primaryTypes: ['veterinary_care', 'animal_hospital'],
  },
  boarding: {
    slug: 'boarding',
    label: 'Pet Boarding',
    singular: 'Pet Boarding',
    primaryTypes: ['pet_boarding', 'dog_day_care_center', 'kennel'],
  },
  training: {
    slug: 'training',
    label: 'Dog Trainers',
    singular: 'Dog Trainer',
    primaryTypes: ['dog_trainer'],
  },
  walkers: {
    slug: 'walkers',
    label: 'Dog Walkers',
    singular: 'Dog Walker',
    primaryTypes: ['dog_walker'],
  },
  sitters: {
    slug: 'sitters',
    label: 'Pet Sitters',
    singular: 'Pet Sitter',
    primaryTypes: ['pet_sitter'],
  },
};

// Reverse lookup: primaryType → service slug
export const TYPE_TO_SERVICE = {};
for (const [slug, config] of Object.entries(SERVICE_TYPES)) {
  for (const type of config.primaryTypes) {
    TYPE_TO_SERVICE[type] = slug;
  }
}

// Schema.org additionalType mapping for JSON-LD
export const SCHEMA_ADDITIONAL_TYPE = {
  groomers: 'https://schema.org/PetGroomer',
  vets: 'https://schema.org/VeterinaryCare',
  boarding: 'https://schema.org/LodgingBusiness',
  training: null, // falls back to LocalBusiness
  walkers: null,
  sitters: null,
};

// US state abbreviations for address parsing
export const STATE_ABBREVS = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]);

export const PAGE_SIZE = 1000;
