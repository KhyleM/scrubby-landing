# Setting Up Email for Scrubby.app with ZohoMail

## Step 1: Sign Up for ZohoMail

1. Go to https://www.zoho.com/mail/
2. Click "Get Started Now" or "Sign Up Now"
3. Choose the **"Mail Lite"** plan (Free for up to 5 users)
4. Click "Sign Up for Free"

## Step 2: Add Your Domain

1. During signup, select **"Already have a domain"**
2. Enter `scrubby.app` as your domain
3. Click "Proceed" or "Add"

## Step 3: Verify Domain Ownership

Zoho will ask you to verify you own the domain. They'll provide one of these options:

### Option A: TXT Record Verification (Recommended)
1. Zoho will give you a TXT record like: `zoho-verification=zb12345678.zmverify.zoho.com`
2. Go to Namecheap → Domain List → Manage scrubby.app → Advanced DNS
3. Add New Record:
   - Type: TXT Record
   - Host: @
   - Value: [paste the verification code from Zoho]
   - TTL: Automatic
4. Save changes
5. Return to Zoho and click "Verify"

### Option B: CNAME Verification
1. If Zoho provides a CNAME record instead
2. Add it in Namecheap the same way with their provided values

## Step 4: Configure MX Records in Namecheap

After domain verification, Zoho will provide MX records. In Namecheap:

1. Go to Advanced DNS for scrubby.app
2. **Delete any existing MX records**
3. Add these MX records:

| Type | Host | Value | Priority | TTL |
|------|------|-------|----------|-----|
| MX Record | @ | mx.zoho.com | 10 | Automatic |
| MX Record | @ | mx2.zoho.com | 20 | Automatic |
| MX Record | @ | mx3.zoho.com | 50 | Automatic |

## Step 5: Add SPF Record (Important for Deliverability)

Add this TXT record to prevent your emails from going to spam:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT Record | @ | v=spf1 include:zoho.com ~all | Automatic |

## Step 6: Add DKIM Records (Optional but Recommended)

1. In Zoho Mail Admin Console → Email Authentication → DKIM
2. Click "Add Domain" for scrubby.app
3. Zoho will provide a DKIM record
4. In Namecheap, add:
   - Type: TXT Record
   - Host: [selector]._domainkey (Zoho will provide the selector)
   - Value: [long string from Zoho]
   - TTL: Automatic

## Step 7: Create Your Email Accounts in Zoho

1. Once DNS is configured, go to Zoho Mail Admin Console
2. Click "Users" → "Add User"
3. Create these accounts:

### Primary Account (Admin):
- First Name: Support
- Last Name: Team  
- Email: support@scrubby.app
- Set a strong password

### Email Aliases (Free with Lite plan):
After creating the support account, add aliases:
1. Click on the support@scrubby.app user
2. Go to "Email Aliases"
3. Add:
   - providers@scrubby.app
   - social@scrubby.app

This way all emails go to one inbox but you can send from different addresses.

### Alternative: Create Separate Accounts
If you prefer separate inboxes (uses 3 of your 5 free users):
- support@scrubby.app
- providers@scrubby.app  
- social@scrubby.app

## Step 8: Access Your Email

Once setup is complete:

### Webmail Access:
- Go to https://mail.zoho.com
- Login with support@scrubby.app and your password

### Mobile Apps:
- Download Zoho Mail app for iOS/Android
- Login with your credentials

### Email Clients (Outlook, Apple Mail, etc):
**Incoming Server (IMAP):**
- Server: imap.zoho.com
- Port: 993
- Security: SSL/TLS
- Username: support@scrubby.app
- Password: [your password]

**Outgoing Server (SMTP):**
- Server: smtp.zoho.com
- Port: 465
- Security: SSL/TLS
- Username: support@scrubby.app
- Password: [your password]

## Step 9: Wait for DNS Propagation

- DNS changes can take 10 minutes to 48 hours
- MX records typically propagate within 1-2 hours
- Test by sending an email to support@scrubby.app from Gmail

## Step 10: Set Up Email Signatures

1. In Zoho Mail → Settings → Mail Settings → Signatures
2. Create professional signatures:

```
Best regards,

Scrubby Support Team
support@scrubby.app
https://scrubby.app
Book Pet Care Your Way
```

```
Scrubby Provider Relations
providers@scrubby.app
Join our network of pet care professionals
First month free for new providers!
```

```
Scrubby Social Team
social@scrubby.app
Follow us: @scrubbyapp
```

## Troubleshooting

### Emails not receiving after 24 hours:
1. Check MX records are exactly as shown above
2. Ensure no other MX records exist
3. Verify @ is used for host, not blank
4. Check Zoho dashboard for any warnings

### Can't send emails:
1. Verify SPF record is added
2. Check SMTP settings if using email client
3. Ensure account is activated in Zoho

### Verification failing:
1. Wait 15 minutes after adding DNS records
2. Try verification again
3. Check for typos in the verification string

## Important Notes

- Keep GitHub Pages A records and CNAME for www intact
- Don't delete the existing A records for scrubby.app
- Only add/modify MX and TXT records
- The free plan includes 5GB storage per user
- You can upgrade later if needed

## Quick DNS Summary for Namecheap

Your final DNS configuration should have:
- **4 A Records** (for GitHub Pages - already set)
- **1 CNAME** for www (for GitHub Pages - already set)  
- **3 MX Records** (for Zoho Mail - new)
- **2-3 TXT Records** (verification, SPF, and optionally DKIM - new)

Don't remove existing A and CNAME records!