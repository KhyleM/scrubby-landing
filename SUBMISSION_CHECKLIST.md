# ✅ App Store Submission Checklist - Scrubby v1.0.1

**Date:** October 14, 2025  
**Status:** Ready to Submit  
**Archive Location:** `/Users/khylemott/Projects/petbooker/build/ios/archive/Runner.xcarchive`

---

## 📦 Step 1: Upload Archive to App Store Connect

### Using Xcode (Recommended)

```bash
# Open the archive in Xcode
open /Users/khylemott/Projects/petbooker/build/ios/archive/Runner.xcarchive
```

**In Xcode Organizer:**

- [ ] Archive appears in the list
- [ ] Click "Validate App"
  - [ ] Choose "Automatically manage signing"
  - [ ] Sign in with Apple ID if prompted
  - [ ] Wait for validation to complete
  - [ ] Fix any errors (if any)
- [ ] Click "Distribute App"
  - [ ] Select "App Store Connect"
  - [ ] Click "Upload"
  - [ ] Choose "Automatically manage signing"
  - [ ] Click "Upload"
  - [ ] Wait for upload to complete (5-10 minutes)
- [ ] Receive confirmation email from Apple
- [ ] Wait for build processing (10-30 minutes)

---

## 📝 Step 2: Complete App Store Connect Listing

### 2.1: Create App Record (if not already created)

Go to: https://appstoreconnect.apple.com

- [ ] Click "My Apps" → "+" → "New App"
- [ ] Fill in:
  - Platform: **iOS**
  - Name: **Scrubby**
  - Primary Language: **English (U.S.)**
  - Bundle ID: **com.scrubby.app**
  - SKU: **scrubby-ios-001**
  - User Access: **Full Access**
- [ ] Click "Create"

### 2.2: App Information

Navigate to: App Information tab

- [ ] **Subtitle:** Book trusted pet groomers instantly
- [ ] **Category:** 
  - Primary: **Lifestyle**
  - Secondary: **Business**
- [ ] **Privacy Policy URL:** https://scrubby.app/privacy
- [ ] **Support URL:** mailto:support@scrubby.app
- [ ] **Marketing URL:** https://scrubby.app (optional)
- [ ] Click "Save"

### 2.3: Pricing & Availability

Navigate to: Pricing and Availability tab

- [ ] **Price:** Free
- [ ] **Availability:** All territories (or select specific countries)
- [ ] Click "Save"

### 2.4: Prepare for Submission

Navigate to: App Store tab → iOS App → Version 1.0.1

**Screenshots:**
- [ ] Click "6.7" Display (iPhone 15 Pro Max)
- [ ] Upload screenshots from `app_store_screenshots/ios/`
- [ ] Minimum 3 screenshots uploaded
- [ ] Screenshots in good order (Welcome → Browse → Details → Booking)

**Promotional Text (170 chars max):**
```
Find and book trusted pet groomers instantly! Browse verified professionals, read reviews, and schedule appointments with ease. Your pet deserves the best care.
```
- [ ] Promotional text added (170 characters)

**Description (4000 chars max):**
```
Scrubby makes it easy to find and book trusted pet groomers in your area. Whether you need a quick bath or a full grooming session, connect with verified professionals who love pets as much as you do.

KEY FEATURES:
• Browse verified groomers and mobile groomers near you
• View detailed profiles with ratings and reviews
• Book appointments instantly with real-time availability
• Secure payment processing with flexible options
• Track your groomer's arrival for mobile services
• Manage your pet profiles and vaccination records
• Direct messaging with your groomer
• Booking history and easy rebooking

FOR PET OWNERS:
Find the perfect groomer for your furry friend. Filter by services, location, and availability. Read reviews from other pet parents and book with confidence.

FOR MOBILE GROOMERS:
Scrubby supports mobile groomers who bring their services to you. Track their route and get notified when they're on the way.

SAFE & SECURE:
All groomers are verified and background-checked. Payments are processed securely through Stripe. Your pet's information is protected with industry-standard encryption.

Download Scrubby today and give your pet the care they deserve!
```
- [ ] Description added (under 4000 characters)

**Keywords (100 chars max):**
```
pet grooming,dog groomer,mobile groomer,pet care,dog bath,cat grooming,pet services
```
- [ ] Keywords added (100 characters)

**What's New in This Version:**
```
Initial release of Scrubby!

• Find and book trusted pet groomers
• Browse verified professionals near you
• Secure payment processing
• Real-time booking and scheduling
• Pet profile management
• Direct messaging with groomers
• Track mobile groomer arrivals
```
- [ ] What's New text added

**Support URL:**
- [ ] Support URL: mailto:support@scrubby.app

**Marketing URL (optional):**
- [ ] Marketing URL: https://scrubby.app

### 2.5: Build

- [ ] Wait for build processing to complete (check email)
- [ ] Build appears in "Build" section
- [ ] Click "+" to add build
- [ ] Select build 1.0.1 (2)
- [ ] Click "Done"

### 2.6: Age Rating

- [ ] Click "Edit" next to Age Rating
- [ ] Complete questionnaire:
  - Unrestricted Web Access: **No**
  - Gambling: **No**
  - Contests: **No**
  - Mature/Suggestive Themes: **None**
  - Violence: **None**
  - Medical/Treatment Information: **None**
  - Profanity or Crude Humor: **None**
  - Horror/Fear Themes: **None**
- [ ] Expected rating: **4+**
- [ ] Click "Done"

### 2.7: App Review Information

**CRITICAL: This section is required for approval**

**Sign-in required:** Yes

**Demo Account Credentials:**
```
Username: customer@test.com
Password: [Your actual test account password]
```
- [ ] Demo account username entered
- [ ] Demo account password entered

**Notes for Reviewer:**
```
This is a pet grooming marketplace connecting pet owners with verified groomers.

TESTING INSTRUCTIONS:
1. Sign in with the provided demo account (customer@test.com)
2. Browse available groomers in the marketplace
3. View provider profiles and services
4. Test the booking flow (payments use Stripe test mode)
5. Use test card: 4242 4242 4242 4242, any future expiry, any CVC

ADDITIONAL TEST ACCOUNTS:
- Provider (Salon): salon@test.com (same password)
- Provider (Mobile): mobile@test.com (same password)

You can sign into these accounts to see the provider side of the app, manage bookings, and message customers.

The app uses Stripe test keys during review to allow safe testing. After approval, we will switch to live payment processing.

For location testing, you may need to allow location permissions or manually set a location.
```
- [ ] Notes for reviewer added

**Contact Information:**
- [ ] First Name: [Your first name]
- [ ] Last Name: [Your last name]
- [ ] Phone: +1 (757) 509-9749
- [ ] Email: support@scrubby.app

**Attachment (optional):**
- [ ] Upload `APP_STORE_REVIEWER_INSTRUCTIONS.md` as PDF (optional but helpful)

### 2.8: Version Information

- [ ] **Copyright:** 2025 Global Nexus Enterprises LLC
- [ ] **Version:** 1.0.1
- [ ] **Build:** 2

### 2.9: Export Compliance

- [ ] Answer export compliance questions
  - Most apps: **No** (unless you have custom encryption)
- [ ] Click "Save"

---

## 🚀 Step 3: Final Review & Submit

### Pre-Submission Checklist

**Required Fields:**
- [ ] App name: Scrubby
- [ ] Subtitle added
- [ ] Screenshots uploaded (minimum 3)
- [ ] Description added
- [ ] Keywords added
- [ ] Privacy Policy URL verified
- [ ] Support URL added
- [ ] Build selected
- [ ] Age rating completed
- [ ] Demo account credentials provided
- [ ] Reviewer notes added
- [ ] Contact information complete
- [ ] Export compliance answered

**Optional but Recommended:**
- [ ] Promotional text added
- [ ] Marketing URL added
- [ ] Additional test account info in notes

### Submit for Review

- [ ] Click "Add for Review" or "Submit for Review"
- [ ] Review all information one final time
- [ ] Click "Submit"
- [ ] Receive confirmation email
- [ ] Status changes to "Waiting for Review"

---

## 📧 Step 4: Post-Submission

### Immediate Actions

- [ ] Save confirmation email from Apple
- [ ] Note submission date and time
- [ ] Monitor email for App Store Connect notifications
- [ ] Check App Store Connect daily for status updates

### Expected Timeline

- **Waiting for Review:** Immediately after submission
- **In Review:** Typically 24-48 hours
- **Pending Developer Release** or **Ready for Sale:** If approved
- **Rejected:** If issues found (respond quickly)

### Status Monitoring

Check status at: https://appstoreconnect.apple.com

**Possible Statuses:**
- ⏳ **Waiting for Review** - In queue
- 🔍 **In Review** - Being reviewed by Apple
- ✅ **Pending Developer Release** - Approved, waiting for you to release
- ✅ **Ready for Sale** - Approved and live
- ❌ **Rejected** - Issues found, needs fixes

### If Approved

- [ ] Celebrate! 🎉
- [ ] Download app from App Store
- [ ] Test the live app
- [ ] Share with team
- [ ] Begin marketing
- [ ] Follow `POST_APPROVAL_ACTION_PLAN.md` for production transition

### If Rejected

- [ ] Read rejection reason carefully
- [ ] Fix issues mentioned
- [ ] Respond to reviewer if needed
- [ ] Resubmit as soon as possible
- [ ] Most apps are approved on second submission

---

## 📞 Support Resources

**Apple Developer Support:**
- https://developer.apple.com/support/

**App Store Review Guidelines:**
- https://developer.apple.com/app-store/review/guidelines/

**App Store Connect Help:**
- https://help.apple.com/app-store-connect/

**Your Support:**
- Email: support@scrubby.app
- Phone: +1 (757) 509-9749

---

## 🎯 Quick Command Reference

```bash
# Open archive in Xcode
open /Users/khylemott/Projects/petbooker/build/ios/archive/Runner.xcarchive

# Check build output
ls -lh /Users/khylemott/Projects/petbooker/build/ios/archive/

# View app screenshots
open app_store_screenshots/ios/

# Open App Store Connect
open https://appstoreconnect.apple.com
```

---

## ✅ Final Status

- [x] **Build Created:** ✅ Archive ready at `build/ios/archive/Runner.xcarchive`
- [ ] **Build Uploaded:** Upload via Xcode Organizer
- [ ] **Build Processed:** Wait 10-30 minutes after upload
- [ ] **Metadata Complete:** Fill out all required fields
- [ ] **Submitted for Review:** Click "Submit for Review"
- [ ] **Approved:** Wait 24-48 hours
- [ ] **Live in App Store:** Ready for customers!

---

**Good luck with your submission! 🚀**

You're ready to upload and submit. Follow the steps above carefully, and you should have a smooth submission process.

