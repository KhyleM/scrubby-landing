# Quick Fix Checklist - Landing Page Issues

## 🚨 CRITICAL FIXES (Do Before Launch)

### 1. Remove SMS Reference in Pricing Teaser
**File:** index.html, Line 176  
**Current:** `SMS, invoices, QuickBooks export, 2 staff seats`  
**Change to:** `Advanced messaging, invoices, QuickBooks export, 2 staff seats`  
**Status:** ⬜ Not Fixed

---

### 2. Fix Payout Timing Claims
**Issue:** Landing page says "24 hours" but pricing page says "weekly default"

**Files to update:**
- index.html Line 55: Change "24hrs Get paid" → "Fast payouts"
- index.html Line 103: Change "Get paid in 24 hours" → "Get paid fast (weekly default, instant available)"
- index.html Line 136: Change "Get paid in 24 hours" → "Get paid faster than Square"
- index.html Line 219: Change "✅ 24 hours" → "✅ Weekly (instant available)"

**Status:** ⬜ Not Fixed

---

### 3. Verify or Remove Unverified Claims

#### A. "70% Fewer Phone Calls" (Line 50)
**Question:** Do you have data to support this?
- ✅ YES → Keep it
- ❌ NO → Change to "Dramatically reduce phone calls" or "Save hours on phone tag"
**Status:** ⬜ Needs Decision

#### B. Testimonials (Lines 273-285)
**Question:** Are Sarah M., Mike T., and Jessica L. real customers?
- ✅ YES → Keep them
- ❌ NO → Remove entire testimonials section until you have real ones
**Status:** ⬜ Needs Decision

#### C. "Hundreds of Groomers" (Line 294)
**Question:** Do you actually have hundreds of active users?
- ✅ YES → Keep it
- ❌ NO → Change to "Join groomers who've ditched..." (remove number)
**Status:** ⬜ Needs Decision

---

### 4. Fix CTA Flow (CRITICAL for Conversions)

**Problem:** "Get Started Free" buttons link to email, not signup

**Options:**
A. **Best:** Create actual signup page
   - Build provider onboarding form
   - Update all CTAs to link to /signup or /get-started

B. **Quick Fix:** Change CTA text to be honest
   - "Contact Us to Get Started" (less compelling but honest)
   - "Request Access" (implies waitlist/beta)

**Files to update:**
- index.html Line 30 (nav)
- index.html Line 63 (hero)
- index.html Line 296 (final CTA)

**Status:** ⬜ Needs Decision

---

## ⚠️ IMPORTANT FIXES (Do Within 1 Week)

### 5. Explain "BYO" on First Use
**File:** index.html, Line 175  
**Current:** `0% on your own clients`  
**Change to:** `0% on BYO (bring-your-own) clients`  
**Status:** ⬜ Not Fixed

---

### 6. Standardize "Providers" vs "Groomers"

**Recommendation:**
- Marketing copy (headlines, pain points): Use "groomers"
- Navigation/footer: Use "providers" (future-proof)
- Legal/technical: Use "providers"

**Files to review:**
- index.html: Check all instances
- pricing.html: Check all instances
- Ensure consistency

**Status:** ⬜ Not Fixed

---

### 7. Standardize Navigation Across Pages

**Current:**
- index.html: Features, Pricing, vs Competitors, Support
- pricing.html: Home, Features, For Providers, Support

**Recommended Standard Nav:**
- Home (or Logo link)
- Features
- Pricing
- For Providers
- Support
- [CTA Button]

**Status:** ⬜ Not Fixed

---

### 8. Verify Calendly Link

**Files:** index.html Line 297, pricing.html Line 570  
**Current:** `https://calendly.com/scrubby-demo`  
**Action:** Verify this is correct Calendly URL  
**Status:** ⬜ Needs Verification

---

## ✅ NICE TO HAVE FIXES (When Time Permits)

### 9. Standardize Emoji Usage
**Issue:** Mix of emoji styles (📞 vs ✓ vs ✅)  
**Recommendation:** Pick one checkmark style and stick with it  
**Status:** ⬜ Not Fixed

---

### 10. Add Mobile Scroll Hint for Comparison Table
**File:** index.html, around Line 191  
**Add:** Visual indicator that table scrolls on mobile  
**Status:** ⬜ Not Fixed

---

### 11. Standardize Footer Tagline
**Current:**
- index.html: "Built for groomers, by people who care"
- pricing.html: "Pet care made simple"

**Pick one and use everywhere**  
**Status:** ⬜ Not Fixed

---

### 12. Improve Color Contrast (Accessibility)
**Issue:** Light gray text on light backgrounds  
**Action:** Run WCAG contrast checker  
**Target:** 4.5:1 ratio minimum  
**Status:** ⬜ Not Fixed

---

## 📋 DECISION NEEDED FROM YOU

Before I can fix these, I need your input:

1. **Payout Timing:** Should we emphasize "weekly default" or "instant available"?
   - Current: Landing page says "24 hours" everywhere
   - Reality: Weekly default, instant optional (Stripe fee)
   - Recommendation: Be honest - "Weekly payouts (instant available)"

2. **Statistics:**
   - "70% fewer phone calls" - Real data or remove?
   - "Hundreds of groomers" - Accurate count or remove?

3. **Testimonials:**
   - Are Sarah M., Mike T., Jessica L. real customers?
   - If not, should we remove section or use "Early feedback" disclaimer?

4. **Signup Flow:**
   - Do you have a signup page ready?
   - If not, should CTAs say "Contact Us" or "Request Access"?

5. **Calendly Link:**
   - Is `https://calendly.com/scrubby-demo` correct?

6. **Terminology:**
   - Prefer "groomers" or "providers" in marketing copy?

---

## 🎯 RECOMMENDED FIX ORDER

If you want to fix these yourself or want me to do it:

**Phase 1 (30 minutes):**
1. Remove "SMS" from pricing teaser (Line 176)
2. Add "BYO" explanation (Line 175)
3. Verify Calendly link

**Phase 2 (1 hour):**
4. Fix payout timing claims (4 locations)
5. Standardize navigation
6. Standardize footer tagline

**Phase 3 (Needs your input):**
7. Update/remove unverified stats
8. Update/remove testimonials if not real
9. Fix CTA flow (requires signup page or text change)

---

## ✅ READY TO FIX?

Let me know which fixes you want me to apply, and I'll make the changes immediately.

**Quick wins I can do right now:**
- ✅ Remove SMS reference
- ✅ Add BYO explanation
- ✅ Standardize navigation
- ✅ Fix footer tagline
- ✅ Improve payout timing language

**Need your decision first:**
- ⏸️ Testimonials (real or remove?)
- ⏸️ Stats (verified or change?)
- ⏸️ CTA flow (signup page ready?)
- ⏸️ Calendly link (correct URL?)

