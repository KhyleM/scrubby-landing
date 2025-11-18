# Handoff Prompt: Database Schema Audit Fix Implementation

## Context & Current State

A comprehensive database schema audit has been completed for the Scrubby/PetBooker application, identifying **23 critical mismatches** between the application code and database schema. These mismatches cause:
- **Persistence failures** (data doesn't save correctly)
- **Data integrity issues** (orphaned records, broken foreign keys)
- **Runtime errors** (PostgrestException with codes 42703, PGRST201, PGRST204)
- **Silent data loss** (fields deserialize as null due to missing @JsonKey annotations)

**Severity Breakdown:**
- 8 Critical issues (immediate action required)
- 9 High priority issues (this sprint)
- 4 Medium priority issues (next sprint)
- 2 Low priority issues (backlog)

**Key Finding:** The codebase contains **100+ lines of fallback logic** attempting to handle schema ambiguity, indicating the code doesn't know what the actual database schema is. This appears in multiple data access layers (pets_gateway.dart, bookings_gateway.dart, reviews_repository.dart, database_optimizer.dart).

---

## What's Been Completed

### Phase 0: Comprehensive Audit ✅ COMPLETE

**Deliverables Created:**

1. **DATABASE_SCHEMA_AUDIT_REPORT.md** (Main Report)
   - Detailed analysis of all 23 issues
   - Categorized by: Schema vs Model Mismatches, SQL Query Issues, Serialization Problems, Migration Gaps, Naming Conventions
   - Evidence from production error logs (QA_TEST_REPORT.md, QA_SESSION_2025-01-04_PROVIDER_QA.md)
   - Specific code examples showing the problems

2. **DATABASE_SCHEMA_AUDIT_TECHNICAL_APPENDIX.md** (Implementation Guide)
   - SQL verification queries to run on production
   - Code examples of fallback logic patterns
   - Serialization issue examples
   - Migration analysis
   - Testing recommendations
   - Priority matrix for fixes

3. **DATABASE_SCHEMA_AUDIT_SUMMARY.md** (Executive Summary)
   - Quick stats and top 5 critical issues
   - Evidence of problems (production errors, fallback logic)
   - Immediate action plan
   - Success metrics (before/after)

### Phase 1: Verification Tools ✅ TOOLS READY, 🔄 AWAITING USER ACTION

**Deliverables Created:**

1. **scripts/verify_production_schema.sql** (Verification Script)
   - Comprehensive SQL queries to check actual production schema
   - 10 sections covering: table existence, column names, foreign keys, constraints, data counts
   - Identifies mismatches automatically with ⚠️ and ❌ markers
   - Ready to run in Supabase SQL Editor

2. **SCHEMA_VERIFICATION_INSTRUCTIONS.md** (Step-by-Step Guide)
   - How to run the verification script
   - How to interpret the results
   - Template for documenting findings
   - Common findings and what they mean

3. **CURRENT_SCHEMA_STATE.md** (Documentation Template)
   - Pre-filled template with ❓ placeholders
   - Sections for all critical schema elements
   - Comparison framework for schema files
   - Action plan template

**Status:** User needs to run `scripts/verify_production_schema.sql` and fill in `CURRENT_SCHEMA_STATE.md`

### Phase 2: Implementation Plan ✅ PLAN READY, ⏳ AWAITING PHASE 1

**Deliverables Created:**

1. **docs/PHASE2_MODEL_FIXES_PLAN.md** (Detailed Implementation Plan)
   - Fix 1: Consolidate two conflicting Pet models into one
   - Fix 2: Add missing @JsonKey annotations (Service.basePrice → price)
   - Fix 3: Update PetSpecies enum to match database CHECK constraint
   - Fix 4: Handle missing database columns for advanced features
   - Testing strategy with code examples
   - Implementation checklist

### Overall Roadmap ✅ COMPLETE

**Deliverables Created:**

1. **IMPLEMENTATION_ROADMAP.md** (Master Plan)
   - 4-phase implementation plan with timelines
   - Progress tracking (currently 25% complete)
   - Risk mitigation strategies
   - Success metrics
   - File reference guide

### Task Management ✅ ORGANIZED

**Task List Created:**
- Phase 1: Schema Verification & Consolidation (3 subtasks)
  - [x] 1.1: Create verification SQL script
  - [/] 1.2: Run verification queries on production ← **CURRENT TASK**
  - [ ] 1.3: Create authoritative schema reference
- Phase 2: Critical Model Fixes (4 subtasks)
- Phase 3: Database Migrations (TBD)
- Phase 4: Code Cleanup (TBD)

---

## Current Status: Phase 1 In Progress

**What's Happening Now:**

The user needs to:
1. Run `scripts/verify_production_schema.sql` in their Supabase SQL Editor
2. Save the output
3. Fill in `CURRENT_SCHEMA_STATE.md` with their findings
4. Determine which schema file matches production

**Why This is Critical:**

We have **two competing schema definitions**:
- `supabase/schema.sql` defines: pets(owner_id, type, photo_url)
- `scripts/create_schema.sql` defines: pets(user_id, species, avatar_url)

We don't know which one matches production! The verification will tell us.

**Blocking Issues Until Verification Complete:**
- Can't create unified Pet model (don't know which column names to use)
- Can't add @JsonKey annotations (don't know which DB columns exist)
- Can't write migrations (don't know current state)

---

## Immediate Next Steps (Your Role)

### 1. Help User Interpret Verification Results

When the user shares their verification output:

**Check for these critical findings:**

a) **Table Existence:**
   - Does `users` table exist? (should be migrated to `profiles`)
   - Does `profiles` table exist? (should be the only user table)
   - Both exist? → Migration incomplete

b) **Pets Table Columns:**
   - Uses `owner_id` or `user_id`? → Determines @JsonKey mapping
   - Uses `type` or `species`? → Determines enum field name
   - Uses `photo_url` or `avatar_url`? → Determines photo field mapping
   - Has `age` (INTEGER) or `birth_date` (DATE)? → Determines age handling

c) **Foreign Keys:**
   - How many FKs point to `users` instead of `profiles`? → Migration scope
   - Does `providers` have multiple FKs to `profiles`? → PGRST201 risk

d) **CHECK Constraints:**
   - What values are allowed in pets.type/species? → Enum validation
   - Does it include 'hamster' and 'fish'? → Determines if we update DB or Dart

### 2. Guide Filling in CURRENT_SCHEMA_STATE.md

Help the user:
- Replace all ❓ with actual findings
- Interpret what each finding means
- Identify critical issues vs. minor ones
- Prioritize fixes based on impact

### 3. Determine Authoritative Schema

Compare findings with both schema files:

**If production matches `supabase/schema.sql`:**
- Use it as authoritative
- Archive `scripts/create_schema.sql`
- Document decision

**If production matches `scripts/create_schema.sql`:**
- Use it as authoritative
- Archive `supabase/schema.sql`
- Document decision

**If production is a hybrid:**
- Create new `docs/AUTHORITATIVE_SCHEMA.md` based on actual production state
- Document all differences from both files
- This becomes the single source of truth

### 4. Create docs/AUTHORITATIVE_SCHEMA.md

Once schema is determined, create this file with:
- Complete table definitions matching production
- All column names, types, constraints
- All foreign key relationships
- All CHECK constraints
- Migration history notes
- "Last verified: [DATE]" timestamp

This becomes the **single source of truth** going forward.

---

## Subsequent Phases (After Phase 1)

### Phase 2: Critical Model Fixes (1 week)

**Goal:** Fix serialization issues and model conflicts

**Tasks:**

1. **Consolidate Pet Models** (Priority: CRITICAL)
   - Problem: Two incompatible Pet models exist
     - `lib/core/models/pet.dart` uses PetType, age, photoUrl, ownerId
     - `lib/features/pets/models/pet.dart` uses PetSpecies, birthDate, photoPath, NO ownerId
   - Solution: Create `lib/models/pet_unified.dart` with:
     - Correct @JsonKey annotations based on Phase 1 findings
     - All fields from both models (advanced fields optional)
     - Single enum matching database constraint
     - Helper methods (ageInYears, etc.)

2. **Add @JsonKey Annotations** (Priority: CRITICAL)
   - Service model: `@JsonKey(name: 'price') required double basePrice`
   - Pet model: Add annotations for owner_id/user_id, photo_url/avatar_url, type/species
   - Any other snake_case/camelCase mismatches found in Phase 1

3. **Update PetSpecies Enum** (Priority: HIGH)
   - Current: Includes 'hamster' and 'fish'
   - Database: Only allows 'dog', 'cat', 'bird', 'rabbit', 'other'
   - Decision needed: Remove from enum OR update database constraint

4. **Write Tests** (Priority: HIGH)
   - Unit tests for serialization round-trips
   - Integration tests for database persistence
   - Verify all fields map correctly

**Deliverables:**
- `lib/models/pet_unified.dart`
- Updated `lib/core/models/service.dart`
- Test files
- Migration guide for existing code

### Phase 3: Database Migrations (1 week)

**Goal:** Standardize database schema

**Tasks:**

1. **Complete users→profiles Migration**
   - Current: `supabase/migrations/20251006_migrate_users_to_profiles_fk_fix.sql` is incomplete
   - Needs: Drop users table, verify data integrity, update RLS policies

2. **Standardize Pets Table**
   - Choose: owner_id vs user_id
   - Choose: type vs species
   - Choose: photo_url vs avatar_url
   - Create migration to rename columns if needed

3. **Update Foreign Keys**
   - Fix all 12 FKs pointing to users → should point to profiles
   - Remove ambiguous FKs (providers.user_id if providers.id already references profiles)

4. **Update CHECK Constraints**
   - Add 'hamster' and 'fish' to pets constraint (if keeping in enum)
   - OR verify constraint matches enum

**Deliverables:**
- Migration SQL files
- Rollback scripts
- Verification queries
- Data integrity tests

### Phase 4: Code Cleanup (3-5 days)

**Goal:** Remove fallback logic and update queries

**Tasks:**

1. **Remove Fallback Logic**
   - `lib/features/pets/data/pets_gateway.dart` - remove owner_id/user_id fallback
   - `lib/features/bookings/data/bookings_gateway.dart` - remove customer_id/user_id fallback
   - `lib/features/reviews/data/supabase_reviews_repository.dart` - remove customer_id/user_id fallback
   - `lib/core/utils/database_optimizer.dart` - remove owner_id/user_id fallback

2. **Update Queries**
   - Use correct column names (no more checking both)
   - Remove try/catch blocks for PostgrestException 42703
   - Simplify query logic

3. **Remove Deprecated Code**
   - Delete old Pet models
   - Remove unused schema files
   - Clean up migration files

**Deliverables:**
- Updated data access layers
- Simplified queries
- Removed deprecated code
- Updated documentation

---

## Critical Context & Evidence

### The Fallback Logic Problem

The codebase has extensive try/catch blocks like this:

```dart
// lib/features/pets/data/pets_gateway.dart (lines 34-41)
try {
  response = await _client.from('pets').select().eq('user_id', userId);
} on PostgrestException catch (e) {
  if (e.code == '42703') {  // Column does not exist
    response = await _client.from('pets').select().eq('owner_id', userId);
  }
}
```

**This pattern appears in:**
- pets_gateway.dart (owner_id vs user_id)
- bookings_gateway.dart (customer_id vs user_id)
- reviews_repository.dart (customer_id vs user_id)
- database_optimizer.dart (owner_id vs user_id)
- provider_bookings_provider.dart (species vs type)

**What this means:** The code doesn't know which column names exist in the database, so it tries one, catches the error, then tries the other. This is a symptom of schema confusion.

### The Dual Pet Model Problem

**Model 1:** `lib/core/models/pet.dart`
```dart
class Pet {
  required String id,
  required String name,
  required PetType type,        // 5 values
  required int age,              // INTEGER
  String? photoUrl,              // camelCase
  required String ownerId,       // Has owner reference
}
```

**Model 2:** `lib/features/pets/models/pet.dart`
```dart
class Pet {
  required String id,
  required String name,
  required PetSpecies species,   // 7 values (includes hamster, fish)
  required DateTime birthDate,   // DATE instead of age
  String? photoPath,             // Different field name!
  // NO ownerId field!           // Missing owner reference!
}
```

**Impact:** Different parts of the app use different models, causing type errors and serialization failures.

### The Incomplete Migration Problem

**File:** `supabase/migrations/20251006_migrate_users_to_profiles_fk_fix.sql`

**What it does:**
- ✅ Migrates 6 missing users to profiles
- ✅ Drops 12 foreign keys pointing to users
- ✅ Creates 12 new foreign keys pointing to profiles

**What it DOESN'T do:**
- ❌ Drop the users table
- ❌ Verify data integrity
- ❌ Update RLS policies
- ❌ Update application code

**Risk:** Both tables may exist with conflicting data.

### Production Errors Documented

Evidence from QA reports:

1. **PGRST204 Error** (QA_TEST_REPORT.md)
   - "Could not find the 'address' column of 'users' in the schema cache"
   - Code was using users table, but production only has profiles

2. **42703 Error** (QA_SESSION_2025-01-04_PROVIDER_QA.md)
   - "column providers.rating does not exist"
   - Code expected `rating`, database has `average_rating`

3. **42703 Error** (QA_SESSION_2025-01-04_PROVIDER_QA.md)
   - "column bookings.total_price does not exist"
   - Code expected `total_price`, database has `total_amount`

4. **PGRST201 Error** (docs/fixes/pgrst201_fix_applied.md)
   - "Ambiguous Embedding"
   - providers table has multiple FKs to profiles

---

## File Reference Guide

### Audit Reports (Read These First)
- `DATABASE_SCHEMA_AUDIT_REPORT.md` - Complete analysis of 23 issues
- `DATABASE_SCHEMA_AUDIT_TECHNICAL_APPENDIX.md` - SQL queries, code examples, tests
- `DATABASE_SCHEMA_AUDIT_SUMMARY.md` - Executive summary

### Verification Tools (Use These Now)
- `scripts/verify_production_schema.sql` - Run this in Supabase SQL Editor
- `SCHEMA_VERIFICATION_INSTRUCTIONS.md` - How to run and interpret
- `CURRENT_SCHEMA_STATE.md` - Template to fill in with findings

### Implementation Plans (Reference These)
- `IMPLEMENTATION_ROADMAP.md` - Master plan for all 4 phases
- `docs/PHASE2_MODEL_FIXES_PLAN.md` - Detailed plan for model fixes

### Schema Files (Compare These)
- `supabase/schema.sql` - One possible schema definition
- `scripts/create_schema.sql` - Another possible schema definition
- `docs/AUTHORITATIVE_SCHEMA.md` - TO BE CREATED (single source of truth)

### Migration Files (Review These)
- `supabase/migrations/20251006_migrate_users_to_profiles_fk_fix.sql` - Incomplete migration
- `supabase/migrations/` - 70+ other migration files

### Model Files (These Need Fixing)
- `lib/core/models/pet.dart` - Simple Pet model (conflicts with below)
- `lib/features/pets/models/pet.dart` - Advanced Pet model (conflicts with above)
- `lib/core/models/service.dart` - Missing @JsonKey for basePrice
- `lib/core/models/booking.dart` - Check for customer_id/user_id issues

### Data Access Files (These Have Fallback Logic)
- `lib/features/pets/data/pets_gateway.dart` - owner_id/user_id fallback
- `lib/features/bookings/data/bookings_gateway.dart` - customer_id/user_id fallback
- `lib/features/reviews/data/supabase_reviews_repository.dart` - customer_id/user_id fallback
- `lib/core/utils/database_optimizer.dart` - owner_id/user_id fallback

---

## Expectations & Guidelines

### Timeline
- **Total:** 2-4 weeks
- **Phase 1:** 1-2 hours (verification)
- **Phase 2:** 1 week (model fixes)
- **Phase 3:** 1 week (migrations)
- **Phase 4:** 3-5 days (cleanup)

### Testing Requirements
- **Unit tests** for all model changes
- **Integration tests** for database persistence
- **Staging deployment** before production
- **Rollback plan** for each migration

### Safety First
1. **Never skip verification** - We need to know actual schema state
2. **Always test on staging first** - Never test migrations on production
3. **Always have backups** - Create database snapshot before migrations
4. **Always have rollback plan** - Document how to undo each change

### Success Metrics

**Before Fixes:**
- ❌ 23 schema mismatches
- ❌ 100+ lines of fallback logic
- ❌ 4 documented production errors
- ❌ 2 competing schema definitions
- ❌ 12 foreign keys pointing to wrong table

**After Fixes:**
- ✅ 0 schema mismatches
- ✅ 0 fallback logic needed
- ✅ 0 production errors from schema issues
- ✅ 1 authoritative schema definition
- ✅ All foreign keys correct
- ✅ All tests passing

---

## Your Mission

1. **Immediate:** Help user run verification and interpret results
2. **Phase 1:** Create authoritative schema reference
3. **Phase 2:** Implement model fixes with proper @JsonKey annotations
4. **Phase 3:** Write and test database migrations
5. **Phase 4:** Clean up fallback logic and deprecated code

**Start by asking the user:** "Have you run the verification script yet? If so, please share the output from `scripts/verify_production_schema.sql` so we can determine your actual production schema state and proceed with the fixes."

Good luck! This is critical infrastructure work that will significantly improve the stability and maintainability of the application.

