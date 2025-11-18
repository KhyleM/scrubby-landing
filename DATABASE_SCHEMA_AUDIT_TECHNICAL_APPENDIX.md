# Database Schema Audit - Technical Appendix

**Date:** 2025-10-06  
**Companion to:** DATABASE_SCHEMA_AUDIT_REPORT.md

---

## Verification Queries

Run these SQL queries in your Supabase SQL Editor to verify the issues identified in the audit.

### 1. Verify Pets Table Schema

```sql
-- Check which columns exist in pets table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'pets'
ORDER BY ordinal_position;

-- Expected issues:
-- - May have 'owner_id' OR 'user_id' (not both)
-- - May have 'type' OR 'species' (not both)
-- - May have 'photo_url' OR 'avatar_url' (not both)
-- - May be missing: preferred_cut_style, shampoo_preferences, behavior_flags, etc.
```

### 2. Verify Users vs Profiles Tables

```sql
-- Check if both tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'profiles')
ORDER BY table_name;

-- Check for orphaned records
SELECT 
  'users not in profiles' as issue,
  COUNT(*) as count
FROM public.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
  'profiles not in users' as issue,
  COUNT(*) as count
FROM public.profiles p
LEFT JOIN public.users u ON p.id = u.id
WHERE u.id IS NULL;
```

### 3. Verify Foreign Key Targets

```sql
-- List all foreign keys and their target tables
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (ccu.table_name = 'users' OR ccu.table_name = 'profiles')
ORDER BY tc.table_name, kcu.column_name;

-- Expected issues:
-- - Some FKs point to 'users', some to 'profiles'
-- - Should ALL point to 'profiles'
```

### 4. Verify Bookings Table Columns

```sql
-- Check bookings table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
  AND column_name IN ('customer_id', 'user_id', 'total_amount', 'total_price')
ORDER BY column_name;

-- Expected issues:
-- - May have both 'customer_id' AND 'user_id'
-- - Should have 'total_amount' (not 'total_price')
```

### 5. Verify Services Table Columns

```sql
-- Check services table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'services'
  AND column_name IN ('price', 'base_price', 'basePrice')
ORDER BY column_name;

-- Expected: Should have 'price' column
-- Issue: Dart model uses 'basePrice'
```

### 6. Verify Providers Table Columns

```sql
-- Check providers table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'providers'
  AND column_name IN ('rating', 'average_rating', 'images', 'business_photos', 'user_id')
ORDER BY column_name;

-- Expected issues:
-- - Should have 'average_rating' (not 'rating')
-- - May have 'images' OR 'business_photos'
-- - May have 'user_id' (should be removed after migration)
```

### 7. Verify Pet Type Constraints

```sql
-- Check CHECK constraint on pets.type or pets.species
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'pets'
  AND con.contype = 'c'
  AND pg_get_constraintdef(con.oid) LIKE '%dog%';

-- Expected: Should include 'dog', 'cat', 'bird', 'rabbit', 'other'
-- Issue: Dart enum includes 'hamster' and 'fish' which may not be in constraint
```

### 8. Check for Ambiguous Foreign Keys (PGRST201)

```sql
-- Find tables with multiple FKs to the same target table
SELECT
  tc.table_name,
  ccu.table_name AS foreign_table_name,
  COUNT(*) as fk_count,
  STRING_AGG(kcu.column_name, ', ') as fk_columns
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
GROUP BY tc.table_name, ccu.table_name
HAVING COUNT(*) > 1
ORDER BY tc.table_name;

-- Expected issue: providers table has multiple FKs to profiles
```

---

## Code Examples of Fallback Logic

### Example 1: Pets Gateway - Column Name Fallback

**File:** `lib/features/pets/data/pets_gateway.dart`

```dart
Future<List<Map<String, dynamic>>> fetchByOwner(String userId) async {
  try {
    List<dynamic> response;
    try {
      // Try modern column name first
      response = await _client.from('pets').select().eq('user_id', userId);
    } on PostgrestException catch (e) {
      if (e.code == '42703') {  // Column does not exist
        // Fall back to legacy column
        debugPrint('pets.user_id missing; retrying with pets.owner_id (legacy)');
        response = await _client.from('pets').select().eq('owner_id', userId);
      } else {
        rethrow;
      }
    }
    return response.cast<Map<String, dynamic>>();
  } catch (e, st) {
    debugPrint('[pets-gateway] fetchByOwner failed: $e\n$st');
    rethrow;
  }
}
```

**Issue:** This fallback logic indicates schema inconsistency. Production should have ONE column name.

---

### Example 2: Bookings Gateway - Dual Column Support

**File:** `lib/features/bookings/data/bookings_gateway.dart`

```dart
Future<List<Map<String, dynamic>>> fetchBookingsForUser(String userId) async {
  try {
    List<dynamic> response;
    try {
      response = await _client
          .from('bookings')
          .select(_modernColumns)
          // Checks BOTH customer_id AND user_id!
          .or('customer_id.eq.$userId,user_id.eq.$userId')
          .order('scheduled_at', ascending: false);
    } on PostgrestException catch (e) {
      if (e.code == '42703') {
        // Fall back to legacy columns
        response = await _client
            .from('bookings')
            .select(_legacyColumns)
            .or('customer_id.eq.$userId,user_id.eq.$userId')
            .order('scheduled_at', ascending: false);
      } else {
        rethrow;
      }
    }
    return response.cast<Map<String, dynamic>>();
  }
}
```

**Issue:** Query checks both columns, indicating uncertainty about which is authoritative.

---

### Example 3: Reviews Repository - customer_id vs user_id

**File:** `lib/features/reviews/data/supabase_reviews_repository.dart`

```dart
Future<Review> createReview({
  required String bookingId,
  required String providerId,
  required String userId,
  required int rating,
  required String comment,
  List<String>? photoUrls,
}) async {
  final insert = {
    'booking_id': bookingId,
    'provider_id': providerId,
    'customer_id': userId,  // Uses customer_id
    'rating': rating,
    'comment': sanitized,
    'photos': photoUrls,
  };

  try {
    final row = await _client
        .from('reviews')
        .insert(insert)
        .select(_selectColumns)
        .single();
    return _safeRowToReview(row);
  } on PostgrestException catch (e) {
    if (_isMissingColumn(e)) {
      // Fall back to legacy schema
      final legacyInsert = Map<String, dynamic>.from(insert)
        ..remove('customer_id')
        ..remove('photos')
        ..['user_id'] = userId;  // Falls back to user_id
      final legacyQuery = _client
          .from('reviews')
          .insert(legacyInsert)
          .select(_selectColumns)
          .single();
      final legacyRow = await _execSingle(legacyQuery);
      return _safeRowToReview(legacyRow);
    }
    rethrow;
  }
}
```

**Issue:** Code tries `customer_id` first, falls back to `user_id` if column doesn't exist.

---

### Example 4: Provider Bookings - species vs type

**File:** `lib/features/provider/data/provider_bookings_provider.dart`

```dart
Future<void> _loadBookings() async {
  const modernColumns = '''
    *,
    customer:profiles!bookings_customer_id_fkey(id, name, phone, avatar_url),
    pet:pets(id, name, species, breed),  // Uses 'species'
    service:services(id, name, description, service_type)
  ''';
  
  const legacyColumns = '''
    *,
    customer:profiles!bookings_customer_id_fkey(id, name, phone, avatar_url),
    pet:pets(id, name, type, breed),  // Uses 'type'
    service:services(id, name, description, service_type)
  ''';

  List<dynamic> response;
  try {
    response = await _fetchBookings(modernColumns);
  } on PostgrestException catch (e) {
    if (e.code == '42703') {  // Column does not exist
      response = await _fetchBookings(legacyColumns);
    } else {
      rethrow;
    }
  }
}
```

**Issue:** Code doesn't know if pets table uses `species` or `type` column.

---

### Example 5: Database Optimizer - Dual Column Check

**File:** `lib/core/utils/database_optimizer.dart`

```dart
// Preload user's pets (support both user_id and legacy owner_id)
futures.add(
  cachedQuery(
    cacheKey: 'pet_profiles',
    query: () async {
      try {
        return await _supabase
            .from('pets')
            .select()
            .eq('user_id', user.id);
      } on PostgrestException catch (e) {
        if (e.code == '42703') {  // Column does not exist
          return await _supabase
              .from('pets')
              .select()
              .eq('owner_id', user.id);
        }
        rethrow;
      }
    },
  ),
);
```

**Issue:** Even the caching layer has to handle schema ambiguity.

---

## Serialization Issues

### Example 1: Missing @JsonKey Annotation

**File:** `lib/core/models/service.dart`

```dart
@freezed
class Service with _$Service {
  const factory Service({
    required String id,
    required String name,
    required String description,
    required double basePrice,  // ❌ No @JsonKey annotation!
    required int durationMinutes,
    required String providerId,
    // ...
  }) = _Service;

  factory Service.fromJson(Map<String, dynamic> json) =>
      _$ServiceFromJson(json);
}
```

**Database Column:** `price` (not `base_price`)

**Issue:** When deserializing from database, `basePrice` will be null because:
1. Database returns `{"price": 50.00}`
2. Freezed looks for `base_price` or `basePrice` key
3. Doesn't find it, sets field to null
4. No error thrown!

**Fix:**
```dart
@JsonKey(name: 'price')
required double basePrice,
```

---

### Example 2: Explicit Mapping for coat_modifiers

**File:** `lib/core/models/service.dart`

```dart
@freezed
class Service with _$Service {
  const factory Service({
    // ...
    // ignore: invalid_annotation_target
    @JsonKey(name: 'coat_modifiers')  // ✅ Correct!
    Map<String, dynamic>? coatModifiers,
  }) = _Service;
}
```

**This is the correct pattern** - explicitly map snake_case to camelCase.

---

### Example 3: Manual Snake Case Conversion

**File:** `lib/features/providers/data/earnings_repository.dart`

```dart
// Helper method to convert snake_case to camelCase
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

**Issue:** This manual conversion is error-prone and shouldn't be necessary if models are properly annotated.

---

## Migration Analysis

### Incomplete Migration: users → profiles

**File:** `supabase/migrations/20251006_migrate_users_to_profiles_fk_fix.sql`

**What it does:**
1. ✅ Migrates 6 missing users from `public.users` to `public.profiles`
2. ✅ Drops 12 foreign key constraints pointing to `public.users`
3. ✅ Creates 12 new foreign key constraints pointing to `public.profiles`

**What it DOESN'T do:**
1. ❌ Drop the `public.users` table
2. ❌ Verify data integrity after migration
3. ❌ Handle potential data conflicts
4. ❌ Update application code references

**Risks:**
- Both tables may continue to exist
- New code may insert into wrong table
- Data may diverge between tables
- Rollback becomes impossible after data diverges

**Recommended Completion Steps:**

```sql
-- Step 1: Verify migration success
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM public.users
UNION ALL
SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count
FROM public.profiles;

-- Step 2: Verify all FKs point to profiles
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND ccu.table_name = 'users';  -- Should return 0 rows

-- Step 3: Drop users table (after verification)
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Step 4: Update RLS policies that reference users
-- (Check for any policies that still reference the old table)
```

---

## Testing Recommendations

### 1. Schema Validation Test

```dart
// test/integration/schema_validation_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() {
  group('Schema Validation', () {
    late SupabaseClient supabase;

    setUpAll(() async {
      await Supabase.initialize(
        url: 'YOUR_SUPABASE_URL',
        anonKey: 'YOUR_ANON_KEY',
      );
      supabase = Supabase.instance.client;
    });

    test('pets table has correct columns', () async {
      // Query information_schema to verify columns
      final result = await supabase.rpc('get_table_columns', params: {
        'table_name': 'pets',
      });

      final columns = (result as List).map((r) => r['column_name']).toList();

      // Verify expected columns exist
      expect(columns, contains('id'));
      expect(columns, contains('name'));
      
      // Verify we're using the correct owner column
      // Should have EITHER owner_id OR user_id, not both
      final hasOwnerId = columns.contains('owner_id');
      final hasUserId = columns.contains('user_id');
      expect(hasOwnerId || hasUserId, isTrue, 
        reason: 'Must have either owner_id or user_id');
      expect(hasOwnerId && hasUserId, isFalse,
        reason: 'Should not have both owner_id and user_id');

      // Verify we're using the correct species/type column
      final hasSpecies = columns.contains('species');
      final hasType = columns.contains('type');
      expect(hasSpecies || hasType, isTrue,
        reason: 'Must have either species or type');
      expect(hasSpecies && hasType, isFalse,
        reason: 'Should not have both species and type');
    });

    test('services table uses price column', () async {
      final result = await supabase.rpc('get_table_columns', params: {
        'table_name': 'services',
      });

      final columns = (result as List).map((r) => r['column_name']).toList();
      
      expect(columns, contains('price'),
        reason: 'Services table must have price column');
      expect(columns, isNot(contains('base_price')),
        reason: 'Services table should not have base_price column');
    });
  });
}
```

### 2. Serialization Round-Trip Test

```dart
// test/models/serialization_roundtrip_test.dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Serialization Round-Trip Tests', () {
    test('Service model serializes and deserializes correctly', () {
      // Simulate database response with snake_case
      final dbResponse = {
        'id': 'service-123',
        'name': 'Dog Grooming',
        'description': 'Full grooming service',
        'price': 50.00,  // Database uses 'price'
        'duration_minutes': 60,
        'provider_id': 'provider-123',
      };

      // Deserialize
      final service = Service.fromJson(dbResponse);

      // Verify fields populated correctly
      expect(service.id, 'service-123');
      expect(service.name, 'Dog Grooming');
      expect(service.basePrice, 50.00);  // Should map price -> basePrice
      expect(service.durationMinutes, 60);

      // Serialize back
      final json = service.toJson();

      // Verify it serializes back to database format
      expect(json['price'], 50.00);  // Should map basePrice -> price
      expect(json, isNot(contains('basePrice')));
      expect(json, isNot(contains('base_price')));
    });
  });
}
```

---

## Recommended Fixes Priority Matrix

| Issue | Severity | Effort | Impact | Priority |
|-------|----------|--------|--------|----------|
| Complete users→profiles migration | Critical | Medium | High | 1 |
| Fix pets table schema conflicts | Critical | High | High | 2 |
| Add @JsonKey for price→basePrice | Critical | Low | High | 3 |
| Fix provider rating column refs | Critical | Low | Medium | 4 |
| Consolidate Pet models/enums | High | Medium | Medium | 5 |
| Remove ambiguous FKs (PGRST201) | High | Medium | Medium | 6 |
| Standardize photo/avatar naming | Medium | High | Low | 7 |
| Add DateTime serialization utils | Medium | Medium | Low | 8 |

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-06

