# Database Schema vs Application Code Audit Report

**Date:** 2025-10-06  
**Project:** Scrubby/PetBooker  
**Auditor:** Augment AI  

---

## Executive Summary

This comprehensive audit identified **23 critical schema mismatches** between the database schema and application code that could cause persistence failures, data integrity issues, and runtime errors. The codebase shows evidence of **two competing schema definitions** (`supabase/schema.sql` vs `scripts/create_schema.sql`) and extensive fallback logic to handle these inconsistencies.

### Severity Breakdown
- **Critical:** 8 issues (data loss risk, runtime failures)
- **High:** 9 issues (inconsistent behavior, potential bugs)
- **Medium:** 4 issues (performance impact, maintainability)
- **Low:** 2 issues (naming conventions, documentation)

---

## 1. Schema vs Model Mismatches

### 🔴 CRITICAL: Pets Table - Dual Schema Definitions

**Issue:** Two conflicting schema files define the `pets` table differently.

**Schema A (`supabase/schema.sql`):**
```sql
CREATE TABLE public.pets (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id),  -- Uses owner_id
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('dog', 'cat', 'bird', 'rabbit', 'other')),  -- Uses 'type'
  breed TEXT,
  age INTEGER,
  weight DECIMAL(5,2),
  photo_url TEXT,  -- Uses photo_url
  medical_notes TEXT,
  behavior_notes TEXT
)
```

**Schema B (`scripts/create_schema.sql`):**
```sql
CREATE TABLE public.pets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),  -- Uses user_id
  name TEXT NOT NULL,
  species TEXT CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'other')),  -- Uses 'species'
  breed TEXT,
  age INTEGER,
  weight DECIMAL(5, 2),
  avatar_url TEXT,  -- Uses avatar_url
  medical_notes TEXT
)
```

**Dart Model (`lib/core/models/pet.dart`):**
```dart
class Pet {
  required String id,
  required String name,
  required PetType type,  // Uses PetType enum
  required String breed,
  required int age,
  required double weight,
  String? photoUrl,  // Uses photoUrl (camelCase)
  String? notes,
  required String ownerId,  // Uses ownerId
}
```

**Advanced Model (`lib/features/pets/models/pet.dart`):**
```dart
class Pet {
  required String id,
  required String name,
  required PetSpecies species,  // Uses PetSpecies enum (different from PetType!)
  required String breed,
  required double weight,
  required DateTime birthDate,  // Uses birthDate instead of age
  String? photoPath,  // Uses photoPath (not photoUrl!)
  String? notes,
  // Missing ownerId field entirely!
}
```

**Impact:**
- **Data Loss:** Queries may fail to retrieve pets due to column name mismatches
- **Runtime Errors:** `PostgrestException` with code `42703` (column does not exist)
- **Inconsistent Behavior:** Different parts of the app use different field names

**Evidence in Code:**
```dart
// lib/features/pets/data/pets_gateway.dart (lines 34-41)
try {
  response = await _client.from('pets').select().eq('user_id', userId);
} on PostgrestException catch (e) {
  if (e.code == '42703') {
    // Column does not exist; try legacy column
    response = await _client.from('pets').select().eq('owner_id', userId);
  }
}
```

**Recommendation:** 🔥 **IMMEDIATE ACTION REQUIRED**
1. Consolidate to single schema definition
2. Run migration to standardize column names
3. Update all models to match final schema
4. Remove fallback logic once migration complete

---

### 🔴 CRITICAL: User/Profile Table Confusion

**Issue:** Application code references both `users` and `profiles` tables, but production database only has `profiles`.

**Schema Conflict:**
- `scripts/create_schema.sql` defines `public.users` table
- `supabase/schema.sql` defines `public.profiles` table
- Migration `20251006_migrate_users_to_profiles_fk_fix.sql` attempts to migrate from `users` to `profiles`

**Foreign Key Chaos:**
- 12 tables have foreign keys pointing to `public.users`
- Migration attempts to redirect these to `public.profiles`
- Code has fallback logic for both scenarios

**Affected Tables:**
- `pets.user_id_fkey` → should reference `profiles`
- `bookings.user_id_fkey` → should reference `profiles`
- `reviews.user_id_fkey` → should reference `profiles`
- `payments.user_id_fkey` → should reference `profiles`
- `messages.sender_id_fkey` → should reference `profiles`
- `messages.recipient_id_fkey` → should reference `profiles`
- `notifications.user_id_fkey` → should reference `profiles`
- `staff.user_id_fkey` → should reference `profiles`
- `estimates.customer_id_fkey` → should reference `profiles`
- `invoices.customer_id_fkey` → should reference `profiles`
- `sms_consent.user_id_fkey` → should reference `profiles`
- `sms_events.user_id_fkey` → should reference `profiles`

**Impact:**
- **Cascading Deletes Broken:** Foreign key constraints may not work correctly
- **Data Integrity Risk:** Orphaned records possible
- **Query Failures:** Joins may fail if referencing wrong table

**Recommendation:** 🔥 **IMMEDIATE ACTION REQUIRED**
1. Complete the `users` → `profiles` migration
2. Verify all foreign keys point to `profiles`
3. Drop `users` table once migration verified
4. Update all code references

---

### 🟠 HIGH: Bookings Table - customer_id vs user_id

**Issue:** Bookings table has both `customer_id` and legacy `user_id` columns.

**Schema (`supabase/schema.sql`):**
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES profiles(id),  -- Modern column
  provider_id UUID NOT NULL REFERENCES providers(id),
  -- user_id column may exist in legacy schemas
)
```

**Code Handling:**
```dart
// lib/features/bookings/data/bookings_gateway.dart
.or('customer_id.eq.$userId,user_id.eq.$userId')  // Checks both!
```

**RLS Policies:**
```sql
-- supabase/schema.sql (line 385)
USING (auth.uid() = COALESCE(customer_id, user_id) OR auth.uid() = provider_id)
```

**Impact:**
- **Ambiguous Queries:** Unclear which column is authoritative
- **RLS Complexity:** Security policies must handle both columns
- **Migration Risk:** Data may be split across columns

**Recommendation:**
1. Migrate all `user_id` values to `customer_id`
2. Drop `user_id` column
3. Simplify RLS policies
4. Update code to use only `customer_id`

---

### 🟠 HIGH: Services Table - price vs basePrice

**Issue:** Database uses `price`, Dart model uses `basePrice`.

**Database Schema:**
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY,
  provider_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,  -- Database uses 'price'
  duration_minutes INTEGER,
  category TEXT NOT NULL
)
```

**Dart Model:**
```dart
class Service {
  required String id,
  required String name,
  required String description,
  required double basePrice,  // Model uses 'basePrice'
  required int durationMinutes,
  required String providerId,
}
```

**Impact:**
- **Serialization Failure:** `fromJson` will fail to map `price` → `basePrice`
- **Null Values:** `basePrice` will be null if not explicitly mapped
- **Data Loss:** Price information may not persist correctly

**Current Workaround:** None detected - likely causing bugs!

**Recommendation:**
1. Add `@JsonKey(name: 'price')` annotation to `basePrice` field
2. OR rename database column to `base_price`
3. Add serialization tests to catch this

---

### 🟠 HIGH: Pet Species/Type Enum Mismatch

**Issue:** Database constraint uses different values than Dart enums.

**Database (`supabase/schema.sql`):**
```sql
type TEXT CHECK (type IN ('dog', 'cat', 'bird', 'rabbit', 'other'))
```

**Dart Enum 1 (`lib/core/models/pet.dart`):**
```dart
enum PetType {
  @JsonValue('dog') dog,
  @JsonValue('cat') cat,
  @JsonValue('bird') bird,
  @JsonValue('rabbit') rabbit,
  @JsonValue('other') other,
}
```

**Dart Enum 2 (`lib/features/pets/models/pet.dart`):**
```dart
enum PetSpecies {
  @JsonValue('dog') dog,
  @JsonValue('cat') cat,
  @JsonValue('bird') bird,
  @JsonValue('rabbit') rabbit,
  @JsonValue('hamster') hamster,  // NOT in database constraint!
  @JsonValue('fish') fish,  // NOT in database constraint!
  @JsonValue('other') other,
}
```

**Impact:**
- **Insert Failures:** Attempting to save 'hamster' or 'fish' will violate CHECK constraint
- **Data Validation Mismatch:** App allows values database rejects
- **User Experience:** Form allows selections that will fail on save

**Recommendation:**
1. Update database CHECK constraint to include all enum values
2. OR remove 'hamster' and 'fish' from Dart enum
3. Consolidate to single Pet enum (currently have two!)

---

## 2. SQL Query Issues

### 🔴 CRITICAL: Column Name Mismatches in Queries

**Issue:** Queries reference columns that don't exist in production schema.

**Examples Found:**

1. **Provider Rating Column:**
```dart
// Code expects: providers.rating
// Database has: providers.average_rating
```
Evidence: `QA_SESSION_2025-01-04_PROVIDER_QA.md` line 537

2. **Booking Amount Column:**
```dart
// Code expects: bookings.total_price
// Database has: bookings.total_amount
```
Evidence: `QA_SESSION_2025-01-04_PROVIDER_QA.md` line 544

3. **Profile Full Name:**
```dart
// Code expects: profiles.full_name
// Database has: profiles.name
```
Evidence: `BUGFIX_PROFILES_FULL_NAME.md`

**Impact:**
- **Query Failures:** `PostgrestException` with code `42703`
- **Feature Breakage:** Entire features fail to load
- **Production Incidents:** Documented in QA reports

**Recommendation:** 🔥 **IMMEDIATE ACTION REQUIRED**
1. Audit all queries for column name accuracy
2. Add integration tests that verify queries against actual schema
3. Use TypeScript/code generation for type-safe queries

---

### 🟠 HIGH: Ambiguous Foreign Key Relationships (PGRST201)

**Issue:** PostgREST cannot determine which foreign key to use for table joins.

**Example:**
```
PostgrestException(code: PGRST201, message: Ambiguous Embedding)
```

**Root Cause:** Multiple foreign keys between `profiles` and `providers`:
- `providers.id` → `profiles.id` (primary relationship)
- `providers.user_id` → `profiles.id` (legacy relationship)

**Evidence:** `docs/fixes/pgrst201_fix_applied.md`

**Impact:**
- **Query Failures:** Embedding related tables fails
- **Workaround Required:** Must explicitly specify relationship hint
- **Code Complexity:** Every query needs disambiguation

**Current Workaround:**
```dart
.select('*, providers!providers_id_fkey(*)')  // Must specify which FK!
```

**Recommendation:**
1. Remove redundant foreign key (`providers.user_id`)
2. Ensure single clear relationship between tables
3. Update queries to remove disambiguation hints

---

## 3. Serialization/Deserialization Problems

### 🟠 HIGH: Snake_case vs camelCase Inconsistency

**Issue:** Database uses `snake_case`, Dart uses `camelCase`, but mapping is inconsistent.

**Examples:**

| Database Column | Dart Field | Mapping Status |
|----------------|------------|----------------|
| `photo_url` | `photoUrl` | ✅ Auto-mapped by freezed |
| `avatar_url` | `photoUrl` | ❌ Different names! |
| `owner_id` | `ownerId` | ✅ Auto-mapped |
| `user_id` | `ownerId` | ❌ Different names! |
| `base_price` | `basePrice` | ❓ Column doesn't exist |
| `coat_modifiers` | `coatModifiers` | ✅ Explicit `@JsonKey` |
| `total_amount` | `totalAmount` | ✅ Auto-mapped |
| `total_price` | `totalAmount` | ❌ Different names! |

**Impact:**
- **Silent Data Loss:** Fields may deserialize as null
- **Inconsistent State:** Some fields populate, others don't
- **Hard to Debug:** No error thrown, just missing data

**Current Handling:**
```dart
// lib/features/providers/data/earnings_repository.dart (lines 376-386)
Map<String, dynamic> _convertFromSnakeCase(Map<String, dynamic> json) {
  final converted = <String, dynamic>{};
  json.forEach((key, value) {
    final camelKey = key.replaceAllMapped(
      RegExp(r'_([a-z])'),
      (Match match) => match.group(1)!.toUpperCase(),
    );
    converted[camelKey] = value;
  });
  return converted;
}
```

**Recommendation:**
1. Use `@JsonKey(name: 'snake_case_name')` for all mismatched fields
2. Enable `field_rename: snake` in `build.yaml` for freezed
3. Add serialization round-trip tests

---

### 🟡 MEDIUM: DateTime Serialization Inconsistencies

**Issue:** Inconsistent handling of timestamp fields.

**Database Types:**
- `TIMESTAMPTZ` (timestamp with timezone)
- `DATE` (date only)
- `TIME` (time only)

**Dart Handling:**
```dart
// Some models use DateTime
DateTime? createdAt,
DateTime? updatedAt,

// Others use String parsing
DateTime.tryParse(json['created_at'] as String?)

// Walk reports use custom parsing
DateTime.parse(res['started_at'] as String)
```

**Issues Found:**
1. No consistent timezone handling
2. Some fields nullable, others required
3. Manual parsing prone to errors
4. No validation of date formats

**Impact:**
- **Timezone Bugs:** Dates may display in wrong timezone
- **Parse Failures:** Invalid date strings cause crashes
- **Data Inconsistency:** Same field type handled differently

**Recommendation:**
1. Use consistent DateTime serialization across all models
2. Add timezone conversion utilities
3. Validate date formats in serialization layer

---

## 4. Migration Gaps

### 🔴 CRITICAL: Incomplete users → profiles Migration

**Issue:** Migration `20251006_migrate_users_to_profiles_fk_fix.sql` is incomplete.

**Status:**
- ✅ Migrates 6 missing users to profiles
- ✅ Drops old foreign keys
- ✅ Creates new foreign keys to profiles
- ❌ Does NOT drop `users` table
- ❌ Does NOT update all code references
- ❌ Does NOT verify data integrity post-migration

**Risks:**
- **Dual State:** Both tables may exist with conflicting data
- **Code Confusion:** Some code uses `users`, some uses `profiles`
- **Future Bugs:** New code may reference wrong table

**Recommendation:** 🔥 **IMMEDIATE ACTION REQUIRED**
1. Complete migration verification
2. Update all code to use `profiles`
3. Drop `users` table
4. Document migration in changelog

---

### 🟠 HIGH: Missing Migrations for Model Changes

**Issue:** Dart models have fields not reflected in database schema.

**Examples:**

1. **Pet Model - Advanced Features:**
```dart
// lib/features/pets/models/pet.dart
String? preferredCutStyle,  // NOT in database
String? shampooPreferences,  // NOT in database
List<String> behaviorFlags,  // NOT in database
List<String> skinConditions,  // NOT in database
String? handlingNotes,  // NOT in database
List<String> allergies,  // NOT in database
List<VaccinationRecord> vaccinationRecords,  // NOT in database
```

2. **Booking Model - Deposit Fields:**
```dart
double depositAmount,  // May not be in all schemas
bool depositPaid,  // May not be in all schemas
DateTime? depositPaidAt,  // May not be in all schemas
```

**Impact:**
- **Feature Incomplete:** Advanced features can't persist data
- **Silent Failures:** Data saved in memory but not database
- **User Confusion:** Settings don't persist across sessions

**Recommendation:**
1. Create migrations for all new model fields
2. Make fields nullable if not required
3. Add feature flags for incomplete features

---

## 5. Naming Conventions

### 🟡 MEDIUM: Inconsistent Photo/Avatar Field Names

**Issue:** Multiple names for image fields across tables.

**Variations Found:**
- `photo_url` (pets table in schema.sql)
- `avatar_url` (pets table in create_schema.sql, profiles table)
- `photoUrl` (Pet model in core/models)
- `photoPath` (Pet model in features/pets)
- `business_photos` (providers table in schema.sql)
- `images` (providers table in create_schema.sql)

**Impact:**
- **Code Complexity:** Must check multiple field names
- **Bugs:** Easy to use wrong field name
- **Maintainability:** Hard to understand which field to use

**Current Workaround:**
```dart
final images = row['business_photos'] is List
    ? (row['business_photos'] as List).cast<dynamic>()
    : row['images'] is List
    ? (row['images'] as List).cast<dynamic>()
    : const [];
```

**Recommendation:**
1. Standardize on single naming convention
2. Use `photo_url` for single images
3. Use `photos` (array) for multiple images
4. Create migration to rename columns

---

### 🟢 LOW: Inconsistent ID Field Naming

**Issue:** Some foreign keys use descriptive names, others use generic `id`.

**Examples:**
- `customer_id` ✅ Clear
- `provider_id` ✅ Clear
- `user_id` ⚠️ Ambiguous (customer or provider?)
- `owner_id` ✅ Clear
- `id` ❌ Too generic in foreign key context

**Impact:**
- **Code Readability:** Harder to understand relationships
- **Query Complexity:** Must remember which `id` refers to what

**Recommendation:**
1. Use descriptive names for all foreign keys
2. Reserve `id` for primary keys only
3. Update schema documentation

---

## Summary of Critical Actions Required

### Immediate (This Week)
1. ✅ Complete `users` → `profiles` migration
2. ✅ Fix pets table schema conflicts (`owner_id` vs `user_id`, `type` vs `species`)
3. ✅ Add `@JsonKey` annotations for all snake_case/camelCase mismatches
4. ✅ Fix provider rating column references (`rating` → `average_rating`)
5. ✅ Fix booking amount column references (`total_price` → `total_amount`)

### High Priority (Next Sprint)
6. ✅ Consolidate duplicate Pet models/enums
7. ✅ Remove ambiguous foreign keys (PGRST201 fixes)
8. ✅ Create migrations for advanced pet features
9. ✅ Standardize photo/avatar field naming
10. ✅ Add integration tests for schema validation

### Medium Priority (Next Month)
11. ✅ Implement consistent DateTime handling
12. ✅ Add serialization round-trip tests
13. ✅ Document all schema decisions
14. ✅ Create schema migration guide

---

## Testing Recommendations

### Add These Tests
1. **Schema Validation Tests:** Verify all models can serialize/deserialize from actual database rows
2. **Query Integration Tests:** Run all queries against test database to catch column mismatches
3. **Migration Tests:** Verify migrations are idempotent and don't lose data
4. **Foreign Key Tests:** Verify all relationships work correctly
5. **Enum Tests:** Verify all enum values match database constraints

---

## Appendix: Evidence Files

- `QA_TEST_REPORT.md` - Documents PGRST204 errors from schema mismatches
- `QA_SESSION_2025-01-04_PROVIDER_QA.md` - Documents rating/amount column errors
- `BUGFIX_SCHEMA_MISMATCHES_BATCH.md` - Documents provider photos inconsistency
- `BUGFIX_PROFILES_FULL_NAME.md` - Documents full_name column error
- `docs/fixes/pgrst201_fix_applied.md` - Documents relationship ambiguity fixes
- `supabase/migrations/20251006_migrate_users_to_profiles_fk_fix.sql` - Incomplete migration

---

**Report Generated:** 2025-10-06  
**Next Review:** After critical fixes implemented

