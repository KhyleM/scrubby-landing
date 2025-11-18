# 📱 App Store Reviewer Instructions for Scrubby

**App Name:** Scrubby  
**Version:** 1.0.1 (Build 2)  
**Bundle ID:** com.scrubby.app  
**Category:** Lifestyle

---

## 🔐 Test Account Credentials

### Customer Account (Pet Owner)
```
Email: customer@test.com
Password: [Use the actual password from your test database]
```

**What this account can do:**
- Browse available groomers (salon and mobile)
- View provider profiles and services
- Create and manage pet profiles
- Book grooming appointments
- Make test payments
- Send messages to providers
- View booking history

### Provider Account #1 - Salon Groomer
```
Email: salon@test.com
Password: [Use the actual password from your test database]
```

**What this account can do:**
- View incoming booking requests
- Manage availability and schedule
- Accept/decline appointments
- View customer pet profiles
- Message customers
- Manage services and pricing

### Provider Account #2 - Mobile Groomer
```
Email: mobile@test.com
Password: [Use the actual password from your test database]
```

**What this account can do:**
- Same as salon groomer, plus:
- Set service radius for mobile services
- Update location/route for customers to track
- Manage travel time between appointments

---

## 🧪 Testing Instructions

### 1. Customer Booking Flow (Primary Test Path)

**Sign in as Customer:**
1. Launch the app
2. Sign in with `customer@test.com`
3. Allow location permissions when prompted (or manually set location)
4. Browse available groomers on the map/list view
5. Tap on a provider to view their profile
6. Select a service and time slot
7. Proceed to payment

**Test Payment:**
- Use Stripe test card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

8. Complete the booking
9. View confirmation screen
10. Check booking in "My Bookings" section

### 2. Provider Management Flow

**Sign in as Provider:**
1. Sign out from customer account
2. Sign in with `salon@test.com` or `mobile@test.com`
3. View the provider dashboard
4. Check incoming bookings
5. Accept/decline a booking
6. View customer pet information
7. Send a message to the customer

### 3. Additional Features to Test

**Pet Profiles:**
- Add a new pet profile
- Upload a pet photo
- Add vaccination records
- Edit pet information

**Messaging:**
- Send messages between customer and provider
- Receive notifications (if enabled)

**Location Services:**
- For mobile groomers: Track provider location
- View service radius on map
- Get directions to provider (for salon)

---

## 💳 Payment Testing Notes

**IMPORTANT:** This build uses **Stripe TEST mode** for App Store review.

- All payments are simulated and no real money is charged
- Test cards will always succeed or fail predictably
- After approval, we will release an update with live payment processing

**Test Cards:**
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Authentication:** 4000 0025 0000 3155

---

## 📍 Location Permissions

The app requests location permissions for:
- Finding nearby groomers
- Showing provider locations on map
- Tracking mobile groomer arrival (for mobile services)
- Distance calculations for service radius

**Testing without real location:**
- You can deny location permissions
- The app will allow manual location entry
- Or use the search bar to find providers by area

---

## 🔔 Push Notifications

The app requests notification permissions for:
- Booking confirmations
- Appointment reminders
- Provider messages
- Mobile groomer arrival notifications

**Optional for testing:**
- You can deny notification permissions
- The app will still function fully
- In-app notifications will still appear

---

## 📸 Photo Upload

The app requests photo library/camera access for:
- Uploading pet profile photos
- Sharing pet photos with groomers
- Provider profile pictures

**Testing:**
- You can deny photo permissions
- The app will use default avatars
- Or allow access to test photo upload

---

## 🐛 Known Limitations (Review Build)

1. **Test Payment Mode:** All payments use Stripe test mode
2. **Limited Test Data:** Only 2 test providers available (salon@test.com and mobile@test.com)
3. **Demo Environment:** Using test Supabase database with sample data

---

## 🆘 Troubleshooting

### If you can't sign in:
- Ensure you're using the exact email addresses provided
- Check that you're connected to the internet
- Try force-closing and reopening the app

### If location doesn't work:
- Grant location permissions in iOS Settings
- Or use the search bar to manually enter a location
- The app works without location access

### If payment fails:
- Use the test card: 4242 4242 4242 4242
- Ensure you're entering a future expiry date
- Any CVC and ZIP code will work

### If you encounter a crash:
- Please note the exact steps to reproduce
- Include any error messages shown
- We will fix and resubmit immediately

---

## 📞 Contact Information

**Developer Contact:**
- Email: support@scrubby.app
- Phone: +1 (757) 509-9749

**Response Time:**
- We monitor submissions 24/7 during review
- Will respond to any questions within 2 hours
- Can provide additional test accounts if needed

---

## 🎯 What Makes This App Valuable

Scrubby solves a real problem for pet owners:
- **Convenience:** Book groomers instantly without phone calls
- **Trust:** All providers are verified and background-checked
- **Transparency:** See ratings, reviews, and pricing upfront
- **Flexibility:** Choose between salon visits or mobile services
- **Safety:** Secure payments and encrypted data

---

## 📋 Review Checklist

For your convenience, here's what to test:

- [ ] Sign in with customer@test.com
- [ ] Browse groomers on map/list
- [ ] View a provider profile
- [ ] Create a pet profile
- [ ] Book an appointment
- [ ] Complete test payment (4242 4242 4242 4242)
- [ ] View booking confirmation
- [ ] Sign in with salon@test.com or mobile@test.com
- [ ] View provider dashboard
- [ ] Accept/decline a booking
- [ ] Send a message to customer
- [ ] Test location permissions
- [ ] Test notification permissions
- [ ] Test photo upload

---

## 🚀 Post-Approval Plans

After approval, we will:
1. Switch to live Stripe payment processing
2. Add more verified providers to the marketplace
3. Expand to additional cities
4. Release regular updates with new features

Thank you for reviewing Scrubby! We're excited to help pet owners find trusted groomers.

