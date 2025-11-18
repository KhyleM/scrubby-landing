# 🚀 Deploy Updated Landing Page - Quick Guide

## ✅ Pre-Deployment Checklist

- [ ] Review landing page in browser (should be open now)
- [ ] Test all navigation links
- [ ] Verify pricing information is correct
- [ ] Check mobile responsiveness (resize browser)
- [ ] Confirm contact emails are correct

---

## 📤 Deployment Steps

### If using GitHub Pages:

```bash
cd ~/Projects/scrubby-landing

# Check current status
git status

# Add all changes
git add index.html styles.css LANDING_PAGE_UPDATE_SUMMARY.md DEPLOY_NOW.md

# Commit with descriptive message
git commit -m "Update landing page: Provider-focused messaging with competitive positioning"

# Push to GitHub (will auto-deploy if GitHub Pages is enabled)
git push origin main
```

### If using custom hosting:

1. **Upload via FTP/SFTP:**
   - Upload `index.html` (overwrites old version)
   - Upload `styles.css` (includes new styles)
   - Keep `pricing.html` as-is (already correct)

2. **Or use rsync:**
```bash
rsync -avz ~/Projects/scrubby-landing/ user@yourserver.com:/var/www/scrubby.app/
```

---

## 🧪 Post-Deployment Testing

1. **Visit:** https://scrubby.app
2. **Check:**
   - [ ] Hero section displays correctly
   - [ ] Pain points section loads
   - [ ] Pricing teaser shows both plans
   - [ ] Comparison table is readable
   - [ ] Testimonials display
   - [ ] Final CTA buttons work
   - [ ] Footer links are correct

3. **Test on Mobile:**
   - [ ] Open on phone or use browser dev tools
   - [ ] All sections stack properly
   - [ ] Buttons are tappable
   - [ ] Table scrolls horizontally

4. **Test Links:**
   - [ ] "Get Started Free" → Email opens
   - [ ] "See Pricing" → /pricing.html loads
   - [ ] "Book a 10-Min Demo" → Calendly (update URL first!)
   - [ ] Footer links work

---

## ⚠️ Important: Update These Before Going Live

### 1. Calendly Demo Link
**Current:** `https://calendly.com/scrubby-demo` (placeholder)  
**Action:** Replace with your actual Calendly URL

**Find and replace in index.html:**
```html
<!-- Line ~280 and ~320 -->
<a href="https://calendly.com/scrubby-demo" ...>
```

### 2. Real Testimonials (Optional)
**Current:** Fictional testimonials  
**Action:** Replace with real customer quotes if available

**Location in index.html:** Lines ~260-280

### 3. Provider Application Email
**Current:** `info@globalnexus.llc`  
**Verify:** This is the correct email for provider signups

---

## 📊 Analytics Setup (Recommended)

Add Google Analytics or similar to track:
- Page views
- Button clicks (CTA conversion)
- Time on page
- Bounce rate

**Add before `</head>` in index.html:**
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong:

```bash
cd ~/Projects/scrubby-landing

# Restore old version
cp index-old-backup.html index.html

# Remove new styles (optional)
# Manually remove the appended styles from styles.css
# Or restore from git: git checkout styles.css

# Redeploy
git add index.html styles.css
git commit -m "Rollback to previous landing page"
git push origin main
```

---

## 📱 Social Media Update (After Deploy)

Once live, update social media bios/links:
- Instagram: @scrubbyapp
- Facebook: /scrubbyapp
- TikTok: @scrubbyapp
- Twitter: @scrubbyapp

**New bio suggestion:**
"Modern CRM & booking for pet groomers. Start free—pay only 10% per booking. Get paid in 24hrs. 🐾 scrubby.app"

---

## 🎯 Marketing Campaign Ideas

Now that landing page is provider-focused:

1. **LinkedIn Ads** - Target "pet grooming" job titles
2. **Facebook Groups** - Join groomer communities, share value
3. **Instagram Reels** - Show dashboard features, before/after
4. **Email Outreach** - Direct to local groomers with personalized message
5. **Comparison Content** - Blog post: "MoeGo vs Scrubby: Which is Right for You?"

---

## ✅ Deployment Complete Checklist

After deploying, verify:

- [ ] Landing page live at scrubby.app
- [ ] All images loading correctly
- [ ] CSS styles applied properly
- [ ] Mobile version looks good
- [ ] All links functional
- [ ] Contact forms/emails working
- [ ] Analytics tracking (if added)
- [ ] Social media links updated
- [ ] Team notified of new messaging

---

## 📞 Support

If you encounter issues:
- Check browser console for errors (F12)
- Verify file permissions on server
- Clear browser cache and test
- Check DNS if domain not resolving

---

**Ready to deploy?** Run the git commands above or upload via your hosting method!

**Questions?** Review LANDING_PAGE_UPDATE_SUMMARY.md for detailed change log.

