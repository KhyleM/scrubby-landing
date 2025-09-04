# Scrubby Landing Page

This is the customer-facing landing page for Scrubby.app - your on-demand pet grooming and vet care service.

## Setup Instructions

### Domain Configuration (scrubby.app)

1. **GitHub Pages Setup:**
   - Create a new GitHub repository named `scrubby-landing`
   - Push this code to the repository:
   ```bash
   cd scrubby-landing
   git init
   git add .
   git commit -m "Initial landing page"
   git remote add origin https://github.com/YOUR_USERNAME/scrubby-landing.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings > Pages
   - Source: Deploy from branch
   - Branch: main
   - Folder: / (root)
   - Save

3. **Configure Domain:**
   - In your domain registrar (where you bought scrubby.app):
   - Add these DNS records:
     ```
     Type: A
     Name: @
     Value: 185.199.108.153
     
     Type: A
     Name: @
     Value: 185.199.109.153
     
     Type: A
     Name: @
     Value: 185.199.110.153
     
     Type: A
     Name: @
     Value: 185.199.111.153
     
     Type: CNAME
     Name: www
     Value: YOUR_USERNAME.github.io
     ```

4. **Verify Domain in GitHub:**
   - Go to Settings > Pages
   - Custom domain: scrubby.app
   - Check "Enforce HTTPS"
   - The CNAME file is already included

## Required Assets

Add these files to the `/images` directory:
- `app-screenshot.png` - Main app screenshot for hero section
- `og-image.png` - Open Graph image (1200x630px) for social sharing
- Additional app screenshots as needed

Create a `favicon.png` in the root directory (32x32px or 64x64px)

## Update App Store Links

Once your apps are published, update these placeholders:
1. Search for `href="#"` in index.html
2. Replace with actual App Store and Google Play URLs

## Social Media Integration

The footer already includes links to social media profiles. Make sure to create:
- Instagram: @scrubbyapp
- Facebook: facebook.com/scrubbyapp
- TikTok: @scrubbyapp
- Twitter: @scrubbyapp

## Launch Checklist

- [ ] Push code to GitHub repository
- [ ] Enable GitHub Pages
- [ ] Configure DNS records for scrubby.app
- [ ] Add app screenshots and favicon
- [ ] Update app store links when apps are published
- [ ] Create and link social media accounts
- [ ] Test on mobile devices
- [ ] Verify HTTPS is working
- [ ] Test all links and forms

## Support

For any issues or questions, contact: info@globalnexus.llc