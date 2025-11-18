# Database Schema Audit - Executive Summary

**Date:** 2025-10-06  
**Project:** Scrubby/PetBooker  
**Status:** 🔴 Critical Issues Found

---

## Quick Stats

- **Total Issues Found:** 23
- **Critical (Immediate Action):** 8
- **High (This Sprint):** 9
- **Medium (Next Sprint):** 4
- **Low (Backlog):** 2

---

## Top 5 Critical Issues

### 1. 🔥 Dual Schema Definitions (CRITICAL)
**Problem:** Two competing schema files define tables differently.
- `supabase/schema.sql` vs `scripts/create_schema.sql`
- Pets table: `owner_id` vs `user_id`, `type` vs `species`
- Services table: `price` vs `basePrice`
- Providers table: `rating` vs `average_rating`

**Impact:** Runtime failures, data loss, query errors

**Action:** Consolidate to single source of truth

---

### 2. 🔥 Users vs Profiles Table Confusion (CRITICAL)
**Problem:** 12 foreign keys point to wrong table.
- Some point to `public.users`
- Should point to `public.profiles`
- Migration incomplete

**Impact:** Cascading deletes broken, data integrity at risk

**Action:** Complete migration, drop `users` table

---

### 3. 🔥 Missing @JsonKey Annotations (CRITICAL)
**Problem:** Database columns don't map to Dart fields.
- `price` → `basePrice` (no mapping)
- `photo_url` → `photoPath` (inconsistent)
- `average_rating` → `rating` (wrong name)

**Impact:** Silent data loss, fields deserialize as null

**Action:** Add `@JsonKey(name: 'db_column')` annotations

---

### 4. 🔥 Pet Model Conflicts (CRITICAL)
**Problem:** Two different Pet models in codebase.
- `lib/core/models/pet.dart` uses `PetType`, `age`, `photoUrl`, `ownerId`
- `lib/features/pets/models/pet.dart` uses `PetSpecies`, `birthDate`, `photoPath`, no owner field

**Impact:** Inconsistent behavior, serialization failures

**Action:** Consolidate to single Pet model

---

### 5. 🔥 Enum Value Mismatches (CRITICAL)
**Problem:** Dart enums include values not in database constraints.
- Database: `('dog', 'cat', 'bird', 'rabbit', 'other')`
- Dart enum: includes `'hamster'` and `'fish'`

**Impact:** Insert failures when users select hamster/fish

**Action:** Update database constraint OR remove from enum

---

## Evidence of Problems

### Production Errors Documented
1. **QA_TEST_REPORT.md** - PGRST204 errors from missing columns
2. **QA_SESSION_2025-01-04_PROVIDER_QA.md** - Provider rating/amount column errors
3. **BUGFIX_PROFILES_FULL_NAME.md** - full_name column doesn't exist
4. **docs/fixes/pgrst201_fix_applied.md** - Relationship ambiguity errors

### Fallback Logic Everywhere
The codebase has extensive try/catch blocks to handle schema mismatches:

```dart
// Example from pets_gateway.dart
try {
  response = await _client.from('pets').select().eq('user_id', userId);
} on PostgrestException catch (e) {
  if (e.code == '42703') {  // Column does not exist
    response = await _client.from('pets').select().eq('owner_id', userId);
  }
}
```

**This pattern appears in:**
- `lib/features/pets/data/pets_gateway.dart`
- `lib/features/bookings/data/bookings_gateway.dart`
- `lib/features/reviews/data/supabase_reviews_repository.dart`
- `lib/features/provider/data/provider_bookings_provider.dart`
- `lib/core/utils/database_optimizer.dart`

**Interpretation:** Code doesn't know what the actual schema is!

---

## Immediate Action Plan

### Week 1: Schema Consolidation
- [ ] Choose authoritative schema file (recommend `supabase/schema.sql`)
- [ ] Delete or archive `scripts/create_schema.sql`
- [ ] Document all schema decisions in `docs/SCHEMA.md`
- [ ] Run verification queries (see Technical Appendix)

### Week 2: Critical Migrations
- [ ] Complete `users` → `profiles` migration
- [ ] Standardize pets table (`owner_id` → `user_id`, `type` → `species`)
- [ ] Verify all foreign keys point to correct tables
- [ ] Drop deprecated tables/columns

### Week 3: Code Updates
- [ ] Add `@JsonKey` annotations for all mismatched fields
- [ ] Consolidate duplicate Pet models
- [ ] Update all queries to use correct column names
- [ ] Remove fallback logic

### Week 4: Testing & Validation
- [ ] Add schema validation tests
- [ ] Add serialization round-trip tests
- [ ] Run full integration test suite
- [ ] Deploy to staging and verify

---

## Files to Review

### Schema Definitions
1. ✅ `supabase/schema.sql` - Primary schema (KEEP)
2. ❌ `scripts/create_schema.sql` - Legacy schema (ARCHIVE)
3. ⚠️ `supabase/migrations/` - 70+ migration files (AUDIT)

### Model Definitions
1. `lib/core/models/pet.dart` - Simple Pet model
2. `lib/features/pets/models/pet.dart` - Advanced Pet model (CONFLICTS!)
3. `lib/core/models/booking.dart` - Booking model
4. `lib/core/models/service.dart` - Service model (missing @JsonKey)
5. `lib/features/auth/models/user.dart` - User model

### Data Access Layer
1. `lib/features/pets/data/pets_gateway.dart` - Has fallback logic
2. `lib/features/bookings/data/bookings_gateway.dart` - Has fallback logic
3. `lib/features/reviews/data/supabase_reviews_repository.dart` - Has fallback logic
4. `lib/core/utils/database_optimizer.dart` - Has fallback logic

### Migrations
1. `supabase/migrations/20251006_migrate_users_to_profiles_fk_fix.sql` - INCOMPLETE
2. `supabase/migrations/20250917_bookings_customer_column.sql` - customer_id migration
3. `supabase/migrations/20250917_reviews_customer_column.sql` - customer_id migration

---

## Success Metrics

### Before Fix
- ❌ 23 schema mismatches identified
- ❌ 100+ lines of fallback logic
- ❌ 4 documented production errors
- ❌ 2 competing schema definitions
- ❌ 12 foreign keys pointing to wrong table

### After Fix (Target)
- ✅ 0 schema mismatches
- ✅ 0 fallback logic needed
- ✅ 0 production errors from schema issues
- ✅ 1 authoritative schema definition
- ✅ All foreign keys correct

---

## Risk Assessment

### If Not Fixed
- **Data Loss:** Users may lose pet profiles, bookings, reviews
- **Feature Breakage:** Advanced pet features won't persist
- **Production Incidents:** Continued PGRST errors
- **Technical Debt:** Fallback logic makes code unmaintainable
- **Developer Confusion:** New developers won't know which schema is correct

### If Fixed
- **Stability:** Predictable, reliable data persistence
- **Performance:** No need for fallback queries
- **Maintainability:** Clear schema, no ambiguity
- **Confidence:** Can add features without schema fears
- **Testing:** Can write reliable integration tests

---

## Resources

### Documentation Created
1. **DATABASE_SCHEMA_AUDIT_REPORT.md** - Full detailed report (23 issues)
2. **DATABASE_SCHEMA_AUDIT_TECHNICAL_APPENDIX.md** - SQL queries, code examples, tests
3. **DATABASE_SCHEMA_AUDIT_SUMMARY.md** - This executive summary

### Verification Queries
See Technical Appendix for SQL queries to verify:
- Which columns exist in each table
- Which foreign keys point where
- Which constraints are active
- Which tables have data

### Recommended Tools
1. **Supabase Studio** - Visual schema editor
2. **pgAdmin** - PostgreSQL administration
3. **Freezed** - Dart code generation for models
4. **json_serializable** - JSON serialization

---

## Next Steps

1. **Review** this summary with team
2. **Run** verification queries from Technical Appendix
3. **Prioritize** fixes based on impact
4. **Create** tickets for each critical issue
5. **Schedule** fix implementation
6. **Test** thoroughly before deploying

---

## Questions?

**For schema questions:** Review `DATABASE_SCHEMA_AUDIT_REPORT.md`  
**For technical details:** Review `DATABASE_SCHEMA_AUDIT_TECHNICAL_APPENDIX.md`  
**For verification:** Run SQL queries from Technical Appendix  
**For code examples:** See fallback logic examples in Technical Appendix

---

**Report Generated:** 2025-10-06  
**Estimated Fix Time:** 2-4 weeks  
**Risk Level:** 🔴 High (Critical issues present)  
**Recommended Action:** Start immediately

