# 🎉 Post-Approval Action Plan for Scrubby

**Purpose:** Steps to take after App Store approval to transition from test mode to production  
**Timeline:** Execute within 24-48 hours of approval  
**Priority:** CRITICAL - Affects payment processing

---

## 📊 Current State vs. Production State

### Current (Review Build)
- ✅ Using `.env.appstore` configuration
- ✅ Stripe TEST keys (`pk_test_...`)
- ✅ Test payment processing
- ✅ Reviewers can safely test with test cards
- ⚠️ No real payments can be processed

### Target (Production)
- 🎯 Switch to `.env.production` configuration
- 🎯 Stripe LIVE keys (`pk_live_...`)
- 🎯 Real payment processing
- 🎯 Actual customer transactions
- 🎯 Real provider payouts

---

## 🚨 CRITICAL: Two Approaches to Production Transition

You have **two options** for transitioning to live payments after approval:

### **Option A: Immediate Update (Recommended)**
Submit version 1.0.2 with live Stripe keys immediately after 1.0.1 approval.

**Pros:**
- Clean separation between test and production
- No server-side complexity
- Clear audit trail

**Cons:**
- Requires another App Store review (~24-48 hours)
- Users must update to process real payments

**Timeline:** 2-3 days total

### **Option B: Server-Side Feature Flag (Advanced)**
Use Supabase to control which Stripe keys the app uses without requiring an update.

**Pros:**
- Instant activation after approval
- No additional App Store review needed
- Can toggle back to test mode if issues arise

**Cons:**
- Requires backend changes
- More complex implementation
- Needs careful testing

**Timeline:** 4-6 hours implementation + testing

---

## 📋 Option A: Immediate Update (Step-by-Step)

### Phase 1: Monitor App Store Status (Day 1)

**Watch for approval email:**
```
Subject: "App Store Submission - Scrubby - Version 1.0.1 - Approved"
```

**Immediate actions:**
1. ✅ Celebrate! 🎉
2. ✅ Verify app is live in App Store
3. ✅ Download and test the live app
4. ✅ Begin Phase 2 immediately

---

### Phase 2: Prepare Live Stripe Keys (Day 1 - 2 hours)

**Prerequisites:**
- Stripe account must be fully verified
- Live mode must be activated
- Bank account connected for payouts

**Steps:**

1. **Activate Stripe Live Mode**
   ```bash
   # Log into Stripe Dashboard
   # https://dashboard.stripe.com/
   
   # Verify business information is complete:
   # - Legal business name: Global Nexus Enterprises LLC
   # - Tax ID (EIN)
   # - Bank account for payouts
   # - Business address
   ```

2. **Obtain Live API Keys**
   ```bash
   # In Stripe Dashboard:
   # Developers → API keys → Reveal live key
   
   # Copy both:
   # - Publishable key (pk_live_...)
   # - Secret key (sk_live_...)
   ```

3. **Update `.env.production`**
   ```bash
   cd /Users/khylemott/Projects/petbooker
   
   # Edit .env.production
   # Update line 15:
   STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_LIVE_KEY_HERE
   
   # Verify NODE_ENV is set to production
   NODE_ENV=production
   ```

4. **Update Supabase Secrets**
   ```bash
   supabase secrets set \
     STRIPE_SECRET_KEY='sk_live_YOUR_ACTUAL_SECRET_KEY' \
     STRIPE_WEBHOOK_SECRET='whsec_YOUR_WEBHOOK_SECRET' \
     PAYMENTS_ENABLED='true' \
     --project-ref anltnskudvrymdqoubez
   ```

5. **Configure Live Stripe Webhook**
   ```bash
   # In Stripe Dashboard → Developers → Webhooks
   # Add endpoint: https://anltnskudvrymdqoubez.supabase.co/functions/v1/stripe-webhook
   
   # Select events:
   # - payment_intent.succeeded
   # - payment_intent.payment_failed
   # - charge.refunded
   # - account.updated
   # - account.application.deauthorized
   
   # Copy webhook signing secret (whsec_...)
   # Update Supabase secret in step 4
   ```

---

### Phase 3: Build Version 1.0.2 (Day 1 - 1 hour)

**Update version number:**

1. **Edit `pubspec.yaml`**
   ```yaml
   # Change line 19 from:
   version: 1.0.1+2
   
   # To:
   version: 1.0.2+3
   ```

2. **Build with production config**
   ```bash
   cd /Users/khylemott/Projects/petbooker
   
   # Clean previous build
   flutter clean
   flutter pub get
   
   # Load production environment
   export $(cat .env.production | grep -v '^#' | grep -v 'FCM_SERVICE_ACCOUNT_KEY' | xargs)
   
   # Build IPA
   flutter build ipa --release \
     --dart-define=GOOGLE_MAPS_API_KEY_IOS=$GOOGLE_MAPS_API_KEY_IOS \
     --dart-define=STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY \
     --export-options-plist=ios/ExportOptions.plist
   ```

3. **Archive in Xcode**
   ```bash
   open ios/Runner.xcworkspace
   
   # Select "Any iOS Device (arm64)"
   # Product → Archive
   # Wait for archive to complete
   ```

---

### Phase 4: Submit Version 1.0.2 (Day 1 - 30 minutes)

**In Xcode Organizer:**

1. **Validate Archive**
   - Select your 1.0.2 archive
   - Click "Validate App"
   - Fix any validation errors

2. **Upload to App Store Connect**
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Upload
   - Wait for processing (~10-30 minutes)

**In App Store Connect:**

1. **Create New Version**
   - Go to your app
   - Click "+" to add new version
   - Version: 1.0.2

2. **What's New in This Version:**
   ```
   Bug fixes and performance improvements.
   
   • Enhanced payment processing
   • Improved stability
   • Minor UI refinements
   ```

3. **Add Build**
   - Wait for build processing
   - Add build 1.0.2+3 to version

4. **Submit for Review**
   - Use same reviewer notes as 1.0.1
   - Submit

---

### Phase 5: Monitor & Test (Day 2-3)

**While waiting for 1.0.2 review:**

1. **Test Live Payments in Staging**
   ```bash
   # Use a test device with production build
   # Make a small real payment ($0.50)
   # Verify it appears in Stripe Dashboard
   # Refund the test payment
   ```

2. **Prepare Customer Support**
   - Set up support@scrubby.app email monitoring
   - Prepare FAQ for payment issues
   - Have refund process ready

3. **Monitor Stripe Dashboard**
   - Watch for any webhook errors
   - Verify payments are processing correctly
   - Check for any disputes or issues

**After 1.0.2 approval:**

1. ✅ Verify live payments work in production
2. ✅ Test full booking flow with real card
3. ✅ Confirm provider payouts are configured
4. ✅ Monitor for any customer issues

---

## 📋 Option B: Server-Side Feature Flag (Advanced)

### Implementation Overview

Instead of hardcoding Stripe keys in the app, fetch them from Supabase based on a feature flag.

**Architecture:**
```
App → Supabase Edge Function → Returns appropriate Stripe key
                              ↓
                    Feature flag in database
                    (test_mode: true/false)
```

### Phase 1: Database Setup (1 hour)

1. **Create feature flags table**
   ```sql
   -- In Supabase SQL Editor
   CREATE TABLE app_config (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     key TEXT UNIQUE NOT NULL,
     value JSONB NOT NULL,
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Insert Stripe config
   INSERT INTO app_config (key, value) VALUES
   ('stripe_config', '{
     "test_mode": true,
     "test_publishable_key": "pk_test_51RywbmRcjO5ZtOxP3GNZxSfFmMECleDA0uYIXdwzhy07uomoUiEKZXCngtqKqivd0saSjcN7pubxExRvRbXd2iZy00Sc22IigC",
     "live_publishable_key": "pk_live_YOUR_LIVE_KEY_HERE"
   }'::jsonb);
   
   -- Create RLS policy (public read for config)
   ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Allow public read access to app_config"
   ON app_config FOR SELECT
   TO public
   USING (true);
   ```

2. **Create Edge Function to serve config**
   ```typescript
   // supabase/functions/get-stripe-config/index.ts
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
   
   serve(async (req) => {
     const supabase = createClient(
       Deno.env.get('SUPABASE_URL') ?? '',
       Deno.env.get('SUPABASE_ANON_KEY') ?? ''
     )
     
     const { data, error } = await supabase
       .from('app_config')
       .select('value')
       .eq('key', 'stripe_config')
       .single()
     
     if (error) {
       return new Response(JSON.stringify({ error: error.message }), {
         status: 500,
         headers: { 'Content-Type': 'application/json' }
       })
     }
     
     const config = data.value
     const publishableKey = config.test_mode 
       ? config.test_publishable_key 
       : config.live_publishable_key
     
     return new Response(JSON.stringify({ 
       publishable_key: publishableKey,
       test_mode: config.test_mode 
     }), {
       headers: { 'Content-Type': 'application/json' }
     })
   })
   ```

### Phase 2: App Changes (2 hours)

1. **Update Stripe initialization**
   ```dart
   // lib/core/services/stripe_service.dart
   
   Future<void> initializeStripe() async {
     try {
       // Fetch config from Supabase
       final response = await supabase.functions.invoke('get-stripe-config');
       final config = response.data as Map<String, dynamic>;
       
       final publishableKey = config['publishable_key'] as String;
       final testMode = config['test_mode'] as bool;
       
       Stripe.publishableKey = publishableKey;
       
       // Log mode for debugging
       debugPrint('Stripe initialized in ${testMode ? 'TEST' : 'LIVE'} mode');
     } catch (e) {
       // Fallback to environment variable
       Stripe.publishableKey = Environment.stripePublishableKey;
       debugPrint('Stripe initialized from environment');
     }
   }
   ```

### Phase 3: Activation (Instant)

**When ready to go live:**

```sql
-- In Supabase SQL Editor
UPDATE app_config 
SET value = jsonb_set(value, '{test_mode}', 'false'::jsonb)
WHERE key = 'stripe_config';
```

**To revert to test mode:**

```sql
UPDATE app_config 
SET value = jsonb_set(value, '{test_mode}', 'true'::jsonb)
WHERE key = 'stripe_config';
```

---

## ⚠️ Important Considerations

### Legal & Compliance

1. **Update Privacy Policy**
   - Mention live payment processing
   - Update data retention policies
   - Add payment dispute process

2. **Update Terms of Service**
   - Add refund policy
   - Payment terms and conditions
   - Provider payout terms

### Financial

1. **Stripe Fees**
   - Standard: 2.9% + $0.30 per transaction
   - Your platform fee: 10% (configured in .env)
   - Net to provider: ~87% of booking amount

2. **Provider Payouts**
   - Configure payout schedule (daily, weekly, monthly)
   - Set minimum payout threshold
   - Handle failed payouts

### Customer Support

1. **Payment Issues**
   - Declined cards
   - Refund requests
   - Dispute resolution

2. **Provider Issues**
   - Payout delays
   - Account verification
   - Tax documentation (1099 forms)

---

## 📞 Emergency Rollback Plan

If issues arise after going live:

### Option A Users (Version 1.0.2):
- Cannot rollback without another submission
- Must fix issues and submit 1.0.3

### Option B Users (Feature Flag):
```sql
-- Immediately revert to test mode
UPDATE app_config 
SET value = jsonb_set(value, '{test_mode}', 'true'::jsonb)
WHERE key = 'stripe_config';

-- All new app sessions will use test mode
-- Existing sessions may need app restart
```

---

## ✅ Final Checklist

Before going live with real payments:

- [ ] Stripe account fully verified
- [ ] Live API keys obtained
- [ ] Webhook configured and tested
- [ ] Test payment successful in staging
- [ ] Refund process tested
- [ ] Provider payout schedule configured
- [ ] Customer support ready
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Emergency rollback plan understood
- [ ] Team trained on payment issues

---

## 🎯 Recommendation

**For your first App Store submission, I recommend Option A:**

**Reasons:**
1. ✅ Simpler implementation
2. ✅ Clear separation of test vs. production
3. ✅ Easier to debug issues
4. ✅ Better audit trail
5. ✅ Less risk of accidental live charges during review

**Timeline:**
- Day 1: Submit 1.0.1 (test mode) ← **You are here**
- Day 2-3: Wait for approval
- Day 3: Submit 1.0.2 (live mode)
- Day 4-5: Wait for approval
- Day 5: Go live with real payments

**Total time to production:** ~5-7 days

---

## 📧 Questions?

If you need help with any of these steps, contact:
- Email: support@scrubby.app
- Phone: +1 (757) 509-9749

Good luck with your submission! 🚀

