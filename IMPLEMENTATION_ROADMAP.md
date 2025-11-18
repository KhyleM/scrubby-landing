# Database Schema Fix Implementation Roadmap

**Date:** 2025-10-06  
**Status:** Phase 1 In Progress  
**Estimated Timeline:** 2-4 weeks

---

## Quick Start

### What You Need to Do Right Now

1. **Run the verification script** (5 minutes)
   - Open Supabase SQL Editor
   - Copy/paste `scripts/verify_production_schema.sql`
   - Run it and save the output

2. **Fill in the findings** (15 minutes)
   - Open `CURRENT_SCHEMA_STATE.md`
   - Replace all ❓ with actual findings
   - Determine which schema file matches production

3. **Review the plan** (10 minutes)
   - Read `docs/PHASE2_MODEL_FIXES_PLAN.md`
   - Understand what fixes are needed
   - Ask questions if anything is unclear

4. **Start implementing** (ongoing)
   - Follow the phase-by-phase plan below
   - Check off tasks as you complete them
   - Test thoroughly at each step

---

## Implementation Phases

### ✅ Phase 0: Audit Complete

**Status:** ✅ DONE

**Deliverables:**
- [x] DATABASE_SCHEMA_AUDIT_REPORT.md
- [x] DATABASE_SCHEMA_AUDIT_TECHNICAL_APPENDIX.md
- [x] DATABASE_SCHEMA_AUDIT_SUMMARY.md

**Findings:** 23 issues identified (8 critical, 9 high, 4 medium, 2 low)

---

### 🔄 Phase 1: Schema Verification & Consolidation

**Status:** 🔄 IN PROGRESS

**Goal:** Determine actual production schema state

**Tasks:**
- [x] 1.1: Create verification SQL script
- [ ] 1.2: Run verification queries on production ← **YOU ARE HERE**
- [ ] 1.3: Create authoritative schema reference

**Deliverables:**
- [x] `scripts/verify_production_schema.sql`
- [x] `SCHEMA_VERIFICATION_INSTRUCTIONS.md`
- [ ] `CURRENT_SCHEMA_STATE.md` (filled in)
- [ ] `docs/AUTHORITATIVE_SCHEMA.md`

**Time Estimate:** 1-2 hours

**How to Complete:**
1. Run `scripts/verify_production_schema.sql` in Supabase
2. Fill in `CURRENT_SCHEMA_STATE.md` with findings
3. Compare with `supabase/schema.sql` and `scripts/create_schema.sql`
4. Create `docs/AUTHORITATIVE_SCHEMA.md` based on production state

**Blockers:** None - ready to proceed

**Next:** Once complete, move to Phase 2

---

### ⏳ Phase 2: Critical Model Fixes

**Status:** ⏳ WAITING (depends on Phase 1)

**Goal:** Fix model-to-database serialization issues

**Tasks:**
- [ ] 2.1: Consolidate Pet models
- [ ] 2.2: Add @JsonKey annotations
- [ ] 2.3: Update PetSpecies enum
- [ ] 2.4: Handle missing database columns

**Deliverables:**
- [x] `docs/PHASE2_MODEL_FIXES_PLAN.md` (plan ready)
- [ ] `lib/models/pet_unified.dart` (new consolidated model)
- [ ] Updated `lib/core/models/service.dart` (with @JsonKey)
- [ ] Unit tests for serialization
- [ ] Integration tests for persistence

**Time Estimate:** 1 week

**How to Complete:**
1. Read `docs/PHASE2_MODEL_FIXES_PLAN.md`
2. Create unified Pet model based on Phase 1 findings
3. Add @JsonKey annotations to Service and other models
4. Update enum to match database constraints
5. Write and run tests
6. Migrate existing code to use new models

**Blockers:** Requires Phase 1 completion

**Next:** Once complete, move to Phase 3

---

### ⏳ Phase 3: Database Migrations

**Status:** ⏳ WAITING (depends on Phase 2)

**Goal:** Standardize database schema

**Tasks:**
- [ ] 3.1: Complete users→profiles migration
- [ ] 3.2: Standardize pets table columns
- [ ] 3.3: Update all foreign keys
- [ ] 3.4: Remove ambiguous foreign keys
- [ ] 3.5: Update CHECK constraints

**Deliverables:**
- [ ] `supabase/migrations/20251007_complete_users_to_profiles.sql`
- [ ] `supabase/migrations/20251007_standardize_pets_table.sql`
- [ ] `supabase/migrations/20251007_update_foreign_keys.sql`
- [ ] `supabase/migrations/20251007_remove_ambiguous_fks.sql`
- [ ] Migration verification tests

**Time Estimate:** 1 week

**How to Complete:**
1. Review incomplete migration: `supabase/migrations/20251006_migrate_users_to_profiles_fk_fix.sql`
2. Create completion migration
3. Create pets table standardization migration
4. Test migrations on staging database
5. Run migrations on production
6. Verify data integrity

**Blockers:** Requires Phase 2 completion

**Next:** Once complete, move to Phase 4

---

### ⏳ Phase 4: Code Cleanup

**Status:** ⏳ WAITING (depends on Phase 3)

**Goal:** Remove fallback logic and update queries

**Tasks:**
- [ ] 4.1: Remove fallback logic from pets_gateway
- [ ] 4.2: Remove fallback logic from bookings_gateway
- [ ] 4.3: Remove fallback logic from reviews_repository
- [ ] 4.4: Remove fallback logic from database_optimizer
- [ ] 4.5: Update all queries to use standardized columns
- [ ] 4.6: Remove deprecated models

**Deliverables:**
- [ ] Updated data access layers (no fallback logic)
- [ ] Updated queries (correct column names)
- [ ] Removed deprecated code
- [ ] Updated documentation

**Time Estimate:** 3-5 days

**How to Complete:**
1. Search for all try/catch blocks with PostgrestException
2. Remove fallback logic for column names
3. Update queries to use correct columns
4. Remove old Pet models
5. Run full test suite
6. Deploy to staging and verify

**Blockers:** Requires Phase 3 completion

**Next:** Final verification and deployment

---

## Files Created for You

### Documentation
- ✅ `DATABASE_SCHEMA_AUDIT_REPORT.md` - Full audit report
- ✅ `DATABASE_SCHEMA_AUDIT_TECHNICAL_APPENDIX.md` - Technical details
- ✅ `DATABASE_SCHEMA_AUDIT_SUMMARY.md` - Executive summary
- ✅ `SCHEMA_VERIFICATION_INSTRUCTIONS.md` - How to verify schema
- ✅ `docs/PHASE2_MODEL_FIXES_PLAN.md` - Model fix implementation plan
- ✅ `IMPLEMENTATION_ROADMAP.md` - This file

### Scripts
- ✅ `scripts/verify_production_schema.sql` - Schema verification queries

### Templates
- ✅ `CURRENT_SCHEMA_STATE.md` - Template for documenting findings

### To Be Created
- ⏳ `docs/AUTHORITATIVE_SCHEMA.md` - Single source of truth (Phase 1)
- ⏳ `lib/models/pet_unified.dart` - Consolidated Pet model (Phase 2)
- ⏳ Migration files (Phase 3)

---

## Progress Tracking

### Overall Progress: 25% Complete

- [x] Phase 0: Audit (100%)
- [/] Phase 1: Verification (33%)
- [ ] Phase 2: Model Fixes (0%)
- [ ] Phase 3: Migrations (0%)
- [ ] Phase 4: Cleanup (0%)

### Critical Issues Fixed: 0/8

- [ ] Dual schema definitions
- [ ] Users vs profiles confusion
- [ ] Missing @JsonKey annotations
- [ ] Pet model conflicts
- [ ] Enum value mismatches
- [ ] Column name mismatches in queries
- [ ] Ambiguous foreign keys
- [ ] Incomplete migrations

---

## Risk Mitigation

### Before Making Changes

1. **Backup production database**
   - Create snapshot in Supabase dashboard
   - Document backup timestamp

2. **Test on staging first**
   - Run all migrations on staging
   - Verify data integrity
   - Test all features

3. **Have rollback plan**
   - Keep old code in git
   - Document rollback steps
   - Test rollback procedure

### During Implementation

1. **Make small, incremental changes**
   - One fix at a time
   - Test after each change
   - Commit frequently

2. **Monitor for errors**
   - Check Supabase logs
   - Monitor Sentry (if configured)
   - Watch for user reports

3. **Communicate with team**
   - Update team on progress
   - Share findings
   - Ask for help when stuck

---

## Success Metrics

### Before Fixes
- ❌ 23 schema mismatches
- ❌ 100+ lines of fallback logic
- ❌ 4 documented production errors
- ❌ 2 competing schema definitions
- ❌ 12 foreign keys pointing to wrong table

### After Fixes (Target)
- ✅ 0 schema mismatches
- ✅ 0 fallback logic
- ✅ 0 production errors from schema
- ✅ 1 authoritative schema
- ✅ All foreign keys correct

---

## Getting Help

### If You Get Stuck

1. **Review the documentation**
   - Check the audit report for context
   - Read the technical appendix for examples
   - Review the phase plan for details

2. **Run verification queries**
   - Use SQL queries from technical appendix
   - Check actual database state
   - Compare with expected state

3. **Check existing code**
   - Look for similar patterns
   - Review how fallback logic works
   - See how other models handle serialization

4. **Ask for help**
   - Share CURRENT_SCHEMA_STATE.md
   - Describe what you've tried
   - Include error messages

---

## Next Steps

### Immediate (Today)

1. [ ] Run `scripts/verify_production_schema.sql`
2. [ ] Fill in `CURRENT_SCHEMA_STATE.md`
3. [ ] Review findings with team

### This Week

1. [ ] Complete Phase 1 (verification)
2. [ ] Start Phase 2 (model fixes)
3. [ ] Write tests for new models

### Next Week

1. [ ] Complete Phase 2 (model fixes)
2. [ ] Start Phase 3 (migrations)
3. [ ] Test on staging

### Week 3-4

1. [ ] Complete Phase 3 (migrations)
2. [ ] Complete Phase 4 (cleanup)
3. [ ] Deploy to production

---

## Questions?

**For schema questions:** Review `DATABASE_SCHEMA_AUDIT_REPORT.md`  
**For technical details:** Review `DATABASE_SCHEMA_AUDIT_TECHNICAL_APPENDIX.md`  
**For verification:** Run queries from `scripts/verify_production_schema.sql`  
**For model fixes:** Review `docs/PHASE2_MODEL_FIXES_PLAN.md`

---

**Last Updated:** 2025-10-06  
**Next Review:** After Phase 1 completion  
**Status:** 🔄 Phase 1 in progress - awaiting verification results

