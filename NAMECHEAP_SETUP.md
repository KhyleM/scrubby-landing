# Namecheap Domain Configuration for Scrubby.app

Follow these steps to configure your scrubby.app domain on Namecheap to work with GitHub Pages.

## Step 1: Access Namecheap DNS Settings

1. Log in to your Namecheap account
2. Go to Dashboard → Domain List
3. Find `scrubby.app` and click "Manage"
4. Click on "Advanced DNS" tab

## Step 2: Remove Existing Records

Delete any existing A records and CNAME records for @ and www (if any exist).

## Step 3: Add GitHub Pages DNS Records

Add these records exactly as shown:

### A Records (for root domain)
Click "Add New Record" and create four A records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | 185.199.108.153 | Automatic |
| A Record | @ | 185.199.109.153 | Automatic |
| A Record | @ | 185.199.110.153 | Automatic |
| A Record | @ | 185.199.111.153 | Automatic |

### CNAME Record (for www subdomain)
Click "Add New Record" and create:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME Record | www | YOUR_GITHUB_USERNAME.github.io | Automatic |

**IMPORTANT:** Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username (e.g., if your GitHub username is "johndoe", enter `johndoe.github.io`)

## Step 4: Save Changes

Click the green checkmark (✓) or "Save All Changes" button to save your DNS settings.

## Step 5: Push Code to GitHub

1. Create a new repository on GitHub named `scrubby-landing`
2. Push your landing page code:

```bash
cd /Users/khylemott/Projects/scrubby-landing
git init
git add .
git commit -m "Initial Scrubby landing page"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/scrubby-landing.git
git branch -M main
git push -u origin main
```

## Step 6: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click Settings → Pages
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click Save
6. Under "Custom domain", enter: `scrubby.app`
7. Click Save
8. Check "Enforce HTTPS" (may take a few minutes to be available)

## Step 7: Verify Setup

DNS propagation can take 10 minutes to 48 hours. To check status:

1. Visit: https://www.whatsmydns.net
2. Enter `scrubby.app` and select "A" record
3. You should see the GitHub IPs (185.199.108-111.153) propagating globally

## Troubleshooting

### If the site doesn't load after 48 hours:

1. **Check GitHub Pages status:**
   - Go to Settings → Pages in your repo
   - Look for green checkmark saying "Your site is published at https://scrubby.app"

2. **Verify DNS records in Namecheap:**
   - Make sure all 4 A records are present
   - Ensure @ is used for host (not blank or *)
   - Check that IPs are exactly as shown above

3. **Common issues:**
   - CNAME file missing from repository (already included)
   - Wrong GitHub username in CNAME record
   - Old DNS records not deleted
   - Browser cache (try incognito mode)

### If HTTPS doesn't work:

1. Wait for DNS to fully propagate (up to 48 hours)
2. In GitHub Pages settings, uncheck and recheck "Enforce HTTPS"
3. GitHub automatically provisions SSL certificates once DNS is verified

## Success Checklist

- [ ] All 4 A records added in Namecheap
- [ ] CNAME record added for www
- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Custom domain configured in GitHub
- [ ] HTTPS enforced (after DNS propagation)
- [ ] Site loads at https://scrubby.app
- [ ] Site loads at https://www.scrubby.app

## Notes

- Keep the CNAME file in your repository (already created)
- Don't use Namecheap's URL redirect or parking features
- Use Namecheap DNS, not custom nameservers
- The site will be accessible at both scrubby.app and www.scrubby.app

## Need Help?

- Namecheap Support: https://www.namecheap.com/support/
- GitHub Pages Docs: https://docs.github.com/pages
- Contact: info@globalnexus.llc