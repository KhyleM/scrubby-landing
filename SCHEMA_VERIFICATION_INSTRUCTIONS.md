# Schema Verification Instructions

**Date:** 2025-10-06  
**Purpose:** Determine the actual state of your production database schema

---

## Step 1: Run Verification Script

### Option A: Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `scripts/verify_production_schema.sql`
5. Paste into the SQL Editor
6. Click **Run**
7. **Save the output** - you'll need it for the next steps

### Option B: Command Line (If you have direct database access)

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the verification script
\i scripts/verify_production_schema.sql

# Save output to file
\o schema_verification_output.txt
\i scripts/verify_production_schema.sql
\o
```

---

## Step 2: Document Your Findings

Create a file called `CURRENT_SCHEMA_STATE.md` with the following template:

```markdown
# Current Production Schema State

**Date Verified:** [TODAY'S DATE]
**Database:** [Production/Staging]
**Verified By:** [YOUR NAME]

---

## Section 1: Table Existence

- [ ] `users` table exists: YES / NO
- [ ] `profiles` table exists: YES / NO
- [ ] Both tables exist: YES / NO (⚠️ if YES, migration incomplete)

**Record Counts:**
- `users`: [COUNT] records
- `profiles`: [COUNT] records

---

## Section 2: Pets Table Schema

**Owner Column:**
- [ ] Uses `owner_id`: YES / NO
- [ ] Uses `user_id`: YES / NO
- [ ] Has both: YES / NO (⚠️ if YES, needs cleanup)

**Species Column:**
- [ ] Uses `type`: YES / NO
- [ ] Uses `species`: YES / NO
- [ ] Has both: YES / NO (⚠️ if YES, needs cleanup)

**Photo Column:**
- [ ] Uses `photo_url`: YES / NO
- [ ] Uses `avatar_url`: YES / NO
- [ ] Has both: YES / NO (⚠️ if YES, needs cleanup)

**Age Column:**
- [ ] Uses `age` (INTEGER): YES / NO
- [ ] Uses `birth_date` (DATE): YES / NO
- [ ] Uses `birthDate` (camelCase): YES / NO

**CHECK Constraint on Species/Type:**
```
[PASTE CONSTRAINT DEFINITION HERE]
```

Allowed values: [LIST VALUES]

---

## Section 3: Bookings Table Schema

**Customer Column:**
- [ ] Uses `customer_id`: YES / NO
- [ ] Uses `user_id`: YES / NO
- [ ] Has both: YES / NO (⚠️ if YES, needs cleanup)

**Amount Column:**
- [ ] Uses `total_amount`: YES / NO
- [ ] Uses `total_price`: YES / NO
- [ ] Has both: YES / NO (⚠️ if YES, needs cleanup)

---

## Section 4: Services Table Schema

**Price Column:**
- [ ] Uses `price`: YES / NO
- [ ] Uses `base_price`: YES / NO
- [ ] Uses `basePrice`: YES / NO

---

## Section 5: Providers Table Schema

**Rating Column:**
- [ ] Uses `rating`: YES / NO
- [ ] Uses `average_rating`: YES / NO
- [ ] Has both: YES / NO (⚠️ if YES, needs cleanup)

**Photos Column:**
- [ ] Uses `images`: YES / NO
- [ ] Uses `business_photos`: YES / NO
- [ ] Has both: YES / NO (⚠️ if YES, needs cleanup)

**User Reference:**
- [ ] Has `user_id` column: YES / NO (⚠️ if YES, should be removed after migration)

---

## Section 6: Foreign Keys Pointing to Wrong Table

**Foreign Keys to `users` (should be `profiles`):**

[LIST ANY FOREIGN KEYS THAT POINT TO users TABLE]

Example:
- pets.user_id → users.id (should be profiles.id)
- bookings.user_id → users.id (should be profiles.id)

**Count:** [NUMBER] foreign keys need to be updated

---

## Section 7: Ambiguous Foreign Keys (PGRST201 Risk)

**Tables with multiple FKs to same target:**

[LIST ANY TABLES WITH MULTIPLE FKS TO SAME TABLE]

Example:
- providers → profiles (via id AND user_id) ⚠️ AMBIGUOUS

---

## Section 8: Schema Matches

**Which schema file matches production?**

Compare your findings above with:

### supabase/schema.sql defines:
- Pets: `owner_id`, `type`, `photo_url`
- Bookings: `customer_id`, `total_amount`
- Services: `price`
- Providers: `average_rating`, `business_photos`

### scripts/create_schema.sql defines:
- Pets: `user_id`, `species`, `avatar_url`
- Bookings: `user_id`, `total_price`
- Services: `price`
- Providers: `average_rating`, `images`

**Production matches:** [supabase/schema.sql / scripts/create_schema.sql / NEITHER / HYBRID]

---

## Section 9: Critical Issues Found

List all critical issues that need immediate attention:

1. [ ] Issue 1: [DESCRIPTION]
2. [ ] Issue 2: [DESCRIPTION]
3. [ ] Issue 3: [DESCRIPTION]

---

## Section 10: Recommended Actions

Based on findings above, prioritize:

### Immediate (This Week)
1. [ ] Action 1
2. [ ] Action 2

### High Priority (Next Sprint)
1. [ ] Action 1
2. [ ] Action 2

### Medium Priority
1. [ ] Action 1
2. [ ] Action 2

---

## Appendix: Raw Query Output

[PASTE FULL OUTPUT FROM verify_production_schema.sql HERE]
```

---

## Step 3: Compare with Schema Files

Once you've documented the current state, compare it with the two schema files:

### Check supabase/schema.sql

```bash
# View the pets table definition
grep -A 15 "CREATE TABLE.*pets" supabase/schema.sql

# View the bookings table definition
grep -A 20 "CREATE TABLE.*bookings" supabase/schema.sql

# View the services table definition
grep -A 15 "CREATE TABLE.*services" supabase/schema.sql
```

### Check scripts/create_schema.sql

```bash
# View the pets table definition
grep -A 15 "CREATE TABLE.*pets" scripts/create_schema.sql

# View the bookings table definition
grep -A 20 "CREATE TABLE.*bookings" scripts/create_schema.sql

# View the services table definition
grep -A 15 "CREATE TABLE.*services" scripts/create_schema.sql
```

---

## Step 4: Determine Authoritative Schema

Based on your comparison, answer these questions:

1. **Does production match `supabase/schema.sql`?**
   - If YES → Use `supabase/schema.sql` as authoritative
   - If NO → Continue to question 2

2. **Does production match `scripts/create_schema.sql`?**
   - If YES → Use `scripts/create_schema.sql` as authoritative
   - If NO → Continue to question 3

3. **Is production a hybrid of both?**
   - If YES → We need to create a new authoritative schema based on production
   - Document all differences

4. **Does production have columns not in either file?**
   - If YES → List them in CURRENT_SCHEMA_STATE.md
   - These may be from migrations

---

## Step 5: Create Authoritative Schema Reference

Once you know which schema matches production (or if you need to create a new one), create:

**File:** `docs/AUTHORITATIVE_SCHEMA.md`

This will be the single source of truth going forward.

---

## Common Findings & What They Mean

### Finding: Both `users` and `profiles` tables exist
**Meaning:** Migration incomplete  
**Action:** Complete users→profiles migration

### Finding: Pets table has both `owner_id` and `user_id`
**Meaning:** Migration in progress or schema confusion  
**Action:** Standardize to one column

### Finding: Foreign keys point to `users` instead of `profiles`
**Meaning:** Migration not run or incomplete  
**Action:** Run FK migration

### Finding: Providers has multiple FKs to profiles
**Meaning:** Will cause PGRST201 errors  
**Action:** Remove redundant FK

### Finding: Services uses `price` but model uses `basePrice`
**Meaning:** Serialization will fail  
**Action:** Add @JsonKey annotation

---

## Next Steps After Verification

1. ✅ Complete `CURRENT_SCHEMA_STATE.md`
2. ✅ Determine which schema file is authoritative
3. ✅ Create `docs/AUTHORITATIVE_SCHEMA.md`
4. → Move to Phase 2: Critical Model Fixes

---

## Need Help?

If you find:
- **Hybrid schema** (doesn't match either file) → Document all differences
- **Missing tables** → Check if migrations were run
- **Extra columns** → Check migration files in `supabase/migrations/`
- **Conflicting data** → May need data migration before schema changes

---

**Created:** 2025-10-06  
**Part of:** Database Schema Audit Fix Implementation  
**Next:** Phase 2 - Critical Model Fixes

