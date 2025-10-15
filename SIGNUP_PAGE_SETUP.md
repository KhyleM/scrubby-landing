# Signup Page Setup Guide

## ✅ What Was Created

**File:** `/apply.html`  
**URL:** `https://scrubby.app/apply.html`

A professional provider application page with:
- ✅ Clean, branded design matching your landing page
- ✅ Comprehensive form collecting all necessary info
- ✅ Form validation (required fields, at least one service type)
- ✅ Success message after submission
- ✅ Mobile responsive
- ✅ Integrated with your existing navigation and footer

---

## 🔧 SETUP REQUIRED (Choose One Option)

### **Option 1: Formspree (Recommended - Easiest)**

**What it is:** Free service that sends form submissions to your email  
**Cost:** Free for up to 50 submissions/month  
**Setup time:** 2 minutes

**Steps:**
1. Go to https://formspree.io/
2. Sign up with your email (support@scrubby.app)
3. Create a new form
4. Copy your form endpoint (looks like: `https://formspree.io/f/xyzabc123`)
5. Open `/apply.html` and find line 253:
   ```html
   <form id="applicationForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
6. Replace `YOUR_FORM_ID` with your actual form ID
7. Done! Test it by submitting the form

**What happens:**
- User fills out form
- Formspree sends you an email with all the details
- User sees success message
- You respond to the applicant via email

---

### **Option 2: Direct Email (Fallback)**

If you don't want to use Formspree, you can make the form send directly to your email (though this is less reliable):

**Edit line 253 in apply.html:**
```html
<form id="applicationForm" action="mailto:support@scrubby.app" method="POST" enctype="text/plain">
```

**Downside:** This opens the user's email client instead of submitting in-browser. Not recommended.

---

### **Option 3: Google Forms (Alternative)**

**Steps:**
1. Create a Google Form with the same fields
2. Get the form's embed URL
3. Replace the entire form section with an iframe to your Google Form

**Downside:** Less branded, but very reliable.

---

## 📋 Form Fields Collected

The application form collects:

**Required Fields:**
- ✅ Name
- ✅ Business Name
- ✅ Email
- ✅ Phone
- ✅ City
- ✅ State
- ✅ Service Type (Salon and/or Mobile)

**Optional Fields:**
- Current booking method (Square, MoeGo, etc.)
- How they heard about Scrubby
- Additional message/notes

---

## 🔗 All CTAs Now Point to Signup Page

I've updated **7 locations** across your site:

### index.html (4 updates)
1. Navigation: "Apply Now" → `/apply.html`
2. Hero CTA: "Apply to Get Started" → `/apply.html`
3. Final CTA: "Apply to Get Started" → `/apply.html`
4. Footer: "Apply Now" → `/apply.html`

### pricing.html (3 updates)
5. Navigation: "Apply Now" → `/apply.html`
6. CTA section: "Apply to get started" → `/apply.html`
7. Footer: "Apply Now" → `/apply.html`

**No more email links!** Much better user experience.

---

## 🎨 Design Features

### Hero Section
- Gradient headline matching brand
- Clear value props (Free, Quick Setup, Full CRM, Fast Payouts)
- Benefit icons for visual appeal

### Form Design
- Clean, spacious layout
- Clear required field indicators (red asterisk)
- Helpful placeholder text
- Dropdown menus for consistency
- Checkbox validation (must select at least one service type)
- Large, prominent submit button

### Success State
- Form hides after submission
- Success message with checkmark icon
- Clear next steps ("We'll get back to you in 24 hours")
- Link back to homepage

### Mobile Responsive
- Form adapts to small screens
- Benefits grid stacks vertically
- Touch-friendly input fields

---

## 🧪 Testing Checklist

Before going live, test:

- [ ] Form submits successfully
- [ ] You receive the email with all form data
- [ ] Success message displays after submission
- [ ] All required fields are enforced
- [ ] Service type requires at least one checkbox
- [ ] Email validation works
- [ ] Phone field accepts various formats
- [ ] Form looks good on mobile
- [ ] Navigation links work
- [ ] Footer links work

---

## 📧 What You'll Receive

When someone submits the form, you'll get an email like:

```
Subject: New Scrubby Provider Application

Name: John Doe
Business Name: Paws & Claws Grooming
Email: john@example.com
Phone: (555) 123-4567
City: Brooklyn
State: NY
Service Type: salon, mobile
Current Booking: Phone calls only
Heard About: Google Search
Message: I've been grooming for 5 years and looking for better software...
```

---

## 🚀 Next Steps After Receiving Application

**Your workflow:**
1. Receive application email
2. Review applicant details
3. Reply within 24 hours (as promised on the page)
4. Send onboarding instructions or schedule call
5. Set them up in your system

**Suggested response template:**
```
Hi [Name],

Thanks for applying to join Scrubby! We're excited to have [Business Name] on board.

I'd love to schedule a quick 15-minute call to:
- Show you the platform
- Answer any questions
- Get you set up

Here's my calendar: https://calendly.com/khyle-scrubby

Looking forward to working with you!

Best,
Khyle
Scrubby Team
```

---

## 🔄 Future Enhancements (Optional)

Once you have more volume, consider:

1. **Auto-responder Email**
   - Formspree Pro allows auto-responses
   - Send instant "We received your application" email

2. **Airtable Integration**
   - Store applications in Airtable
   - Track application status (Pending, Approved, Onboarded)
   - Better than email for managing multiple applicants

3. **Zapier Automation**
   - Formspree → Zapier → Airtable/Google Sheets
   - Formspree → Zapier → Slack notification
   - Auto-send calendar invite

4. **Application Status Page**
   - Let applicants check their status
   - "Your application is under review"

---

## 💡 Pro Tips

1. **Respond Fast**
   - You promise 24 hours, but aim for 2-4 hours
   - Fast response = higher conversion

2. **Personalize Responses**
   - Mention their business name
   - Reference something from their message
   - Shows you actually read it

3. **Track Conversion**
   - How many apply?
   - How many you approve?
   - How many actually onboard?
   - Optimize based on data

4. **A/B Test**
   - Try different headlines
   - Test "Apply Now" vs "Get Started"
   - See what converts better

---

## 🐛 Troubleshooting

**Form doesn't submit:**
- Check that you replaced `YOUR_FORM_ID` with actual Formspree ID
- Check browser console for errors
- Make sure Formspree account is active

**Not receiving emails:**
- Check spam folder
- Verify email in Formspree settings
- Test with a different email address

**Success message doesn't show:**
- Check that Formspree endpoint is correct
- Check browser console for errors
- Make sure JavaScript is enabled

**Form looks broken:**
- Make sure `styles.css` is loading
- Check that all CSS files are in correct location
- Clear browser cache

---

## ✅ Ready to Launch!

Once you've set up Formspree (or chosen another option):

1. Test the form yourself
2. Have a friend test it
3. Check that you receive the email
4. Deploy to production
5. Monitor first few submissions

---

**Current Status:** ✅ Page created, CTAs updated, ready for Formspree setup!

**Next Step:** Sign up for Formspree and add your form ID to line 253 of apply.html

