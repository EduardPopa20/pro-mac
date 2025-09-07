# Deployment Strategy for Pro-Mac Tiles E-commerce

## 🎯 Current Situation
- **Existing site**: promac.ro (old version, currently live)
- **New site**: Your React/Supabase e-commerce platform
- **Deployment platform**: Vercel
- **Email service**: Resend

## 📋 What You Need From Your Client

### Option 1: Subdomain for Testing (Recommended)
Ask your client to create a subdomain in their DNS settings:
- `beta.promac.ro` or `test.promac.ro` or `new.promac.ro`

**Client needs to add in DNS:**
```
Type: CNAME
Name: beta
Value: cname.vercel-dns.com
```

### Option 2: Full Domain (When Going Live)
**Client needs to provide either:**
- Access to DNS management panel, OR
- Change nameservers to Vercel's nameservers

## 🚀 Phased Deployment Approach

### Phase 1: Development Testing (Current)
```
Status: NOW
URL: your-project.vercel.app
Features:
- All features work except custom email domains
- Use onboarding@resend.dev for emails
- No domain verification needed
```

### Phase 2: Beta Testing with Subdomain
```
Status: NEXT WEEK
URL: beta.promac.ro
Setup Required:
1. Client creates subdomain
2. Add domain in Vercel dashboard
3. Password protect the site
4. Test all features with real domain
```

### Phase 3: Production Launch
```
Status: WHEN READY
URL: promac.ro
Steps:
1. Remove password protection
2. Switch DNS from old site to new
3. Verify domain in Resend for custom emails
4. Monitor and fix any issues
```

## 🔒 Password Protection Implementation

### Already Created for You:
- `src/middleware/PasswordProtection.tsx` - Password gate component

### How to Enable:
1. Wrap your App.tsx with PasswordProtection:
```tsx
// In App.tsx
import PasswordProtection from './middleware/PasswordProtection'

function App() {
  const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'beta'
  
  if (isDevelopment) {
    return (
      <PasswordProtection>
        {/* Your existing app */}
      </PasswordProtection>
    )
  }
  
  return (
    // Your existing app
  )
}
```

2. Set password in `.env`:
```env
VITE_BETA_PASSWORD=your-secure-password
VITE_ENVIRONMENT=beta
```

## 📧 Email Service Setup

### Current (Testing):
- **From address**: `onboarding@resend.dev`
- **Works**: Yes, immediately
- **Limitation**: Can't use custom domain

### Production (With Domain):
1. **Add domain to Resend**:
   - Login to Resend
   - Add `promac.ro` as verified domain
   - Add DNS records they provide

2. **DNS Records Needed** (example):
```
Type: TXT
Name: resend._domainkey
Value: [Resend will provide]

Type: TXT  
Name: @
Value: resend-verification=[code]
```

3. **After verification**:
   - Can send from `contact@promac.ro`
   - Better deliverability
   - Professional appearance

## 🛠️ Vercel Deployment Steps

### 1. Initial Deploy:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
```

### 2. Add Custom Domain in Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add `beta.promac.ro`
3. Vercel will show DNS records needed
4. Client adds these to their DNS

### 3. Environment Variables in Vercel:
Add all your `.env` variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_RECAPTCHA_SITE_KEY`
- `VITE_BETA_PASSWORD`
- `VITE_ENVIRONMENT`

## 📝 DNS Configuration Request Template

Send this to your client:

```
Bună ziua,

Pentru a testa noul site, avem nevoie să creați un subdomeniu. 
Vă rog să adăugați următoarea înregistrare DNS:

Tip: CNAME
Nume: beta
Valoare: cname.vercel-dns.com
TTL: 3600 (sau Automatic)

După ce ați făcut această modificare, site-ul va fi accesibil la:
https://beta.promac.ro

Acest lucru ne permite să testăm toate funcționalitățile înainte 
de lansarea oficială, fără a afecta site-ul actual.

Mulțumesc!
```

## 🚦 Testing Checklist Before Go-Live

### With Subdomain (beta.promac.ro):
- [ ] Password protection works
- [ ] All pages load correctly
- [ ] Contact form sends emails
- [ ] Newsletter subscription works
- [ ] Admin dashboard accessible
- [ ] Product images load from Supabase
- [ ] Cart functionality works
- [ ] Search works properly
- [ ] Mobile responsive on all devices

### Email Testing:
- [ ] Contact form emails arrive
- [ ] Newsletter welcome email works
- [ ] Admin receives notifications
- [ ] No spam folder issues

## 🔄 Migration Day Checklist

When ready to switch from old site to new:

1. **Backup Everything**:
   - Export database from Supabase
   - Download all images
   - Save environment variables

2. **DNS Switch** (with client):
   - Change A record from old server to Vercel
   - Or change nameservers to Vercel

3. **Remove Password Protection**:
   - Set `VITE_ENVIRONMENT=production`
   - Redeploy

4. **Monitor**:
   - Check all forms work
   - Monitor error logs
   - Test checkout process
   - Verify email delivery

5. **Quick Rollback Plan**:
   - Keep old DNS settings noted
   - Can revert in 5 minutes if issues

## ⚠️ Important Clarifications

### About Domain Requirements:

1. **What works WITHOUT custom domain**:
   - Everything in the app
   - Supabase auth
   - Database operations
   - Contact form (sends from resend.dev)

2. **What needs custom domain**:
   - Sending emails from @promac.ro
   - Better SEO
   - Professional appearance
   - SSL certificate (automatic with Vercel)

3. **You DON'T need domain for**:
   - Development
   - Testing features
   - Admin functionality
   - Database operations

### Common Misconceptions:
- ❌ "Newsletter needs domain to work" → Works with resend.dev address
- ❌ "Can't test without domain" → Can test everything on vercel.app URL
- ❌ "Need full domain access immediately" → Subdomain is perfect for testing
- ✅ "Custom domain needed for professional emails" → This is correct

## 📞 Support & Next Steps

1. **Tomorrow's Testing Plan**:
   - Deploy to Vercel (works immediately)
   - Test all features on `.vercel.app` URL
   - Ask client for subdomain when ready

2. **Email Setup Priority**:
   - Keep using `onboarding@resend.dev` for now
   - Verify domain in Resend when client provides access
   - Switch to `contact@promac.ro` after verification

3. **Timeline Suggestion**:
   - Week 1: Test on Vercel URL
   - Week 2: Add subdomain, password protect
   - Week 3-4: Client testing and feedback
   - Week 5: Go live on main domain

Remember: You can develop and test EVERYTHING right now without the domain. The domain is only needed for:
- Professional email addresses
- Public access
- SEO purposes