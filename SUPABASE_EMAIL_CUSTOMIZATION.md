# Supabase Email Customization Guide

## Overview
This guide explains how to customize Supabase authentication emails (registration, password recovery, etc.) to match the Pro-Mac brand identity and remove default Supabase branding.

---

## 1. Email Provider Configuration

### Option A: Using Resend (Recommended)
**Why Resend:** Modern API, excellent deliverability, easy setup, generous free tier (3,000 emails/month)

#### Setup Steps:
1. **Create Resend Account**
   ```
   https://resend.com/signup
   ```

2. **Add and Verify Domain**
   - Dashboard → Domains → Add Domain
   - Enter client domain: `promac.ro` (or subdomain like `mail.promac.ro`)
   - Add DNS records provided by Resend:
     ```
     Type: TXT
     Name: resend._domainkey
     Value: [provided by Resend]
     
     Type: MX (optional for replies)
     Name: @
     Value: feedback-smtp.eu-west-1.amazonses.com
     Priority: 10
     ```

3. **Generate API Key**
   - Dashboard → API Keys → Create API Key
   - Name: `supabase-production`
   - Copy the key (shown only once)

4. **Configure in Supabase**
   ```sql
   -- In Supabase SQL Editor
   ALTER TABLE auth.config 
   SET config = config || 
   '{
     "external_email_enabled": true,
     "mailer_autoconfirm": false,
     "smtp_host": "smtp.resend.com",
     "smtp_port": 587,
     "smtp_user": "resend",
     "smtp_pass": "YOUR_RESEND_API_KEY",
     "smtp_sender_email": "noreply@promac.ro",
     "smtp_sender_name": "Pro-Mac"
   }'::jsonb;
   ```

### Option B: Using SMTP (Gmail/Outlook)
**For Testing Only - Not recommended for production**

#### Gmail Setup:
1. Enable 2-factor authentication
2. Generate app-specific password
3. Configure in Supabase Dashboard:
   ```
   Authentication → Settings → Email Settings
   
   Enable Custom SMTP: ✓
   Sender email: contact@promac.ro
   Sender name: Pro-Mac
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: [app-specific password]
   ```

### Option C: Using SendGrid
```javascript
// Alternative provider configuration
const sendgridConfig = {
  smtp_host: "smtp.sendgrid.net",
  smtp_port: 587,
  smtp_user: "apikey",
  smtp_pass: "YOUR_SENDGRID_API_KEY",
  smtp_sender_email: "contact@promac.ro",
  smtp_sender_name: "Pro-Mac"
}
```

---

## 2. Email Templates Customization

### 2.1 Access Email Templates
**Supabase Dashboard:** Authentication → Email Templates

### 2.2 Confirmation Email (Sign Up)
```html
<!-- Subject Line -->
Confirmați contul Pro-Mac

<!-- Email Body -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      width: 180px;
      height: auto;
    }
    .content {
      padding: 40px 30px;
    }
    h1 {
      color: #333;
      font-size: 24px;
      margin-bottom: 10px;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin: 15px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: #2196F3;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background: #1976D2;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    .divider {
      border-top: 1px solid #eee;
      margin: 30px 0;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{ .SiteURL }}/logo-white.png" alt="Pro-Mac" class="logo">
    </div>
    
    <div class="content">
      <h1>Bine ați venit la Pro-Mac!</h1>
      
      <p>Salut {{ .Email }},</p>
      
      <p>Vă mulțumim pentru înregistrare! Pentru a vă activa contul și a începe să explorați colecția noastră premium de faianță și gresie, vă rugăm să confirmați adresa de email.</p>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">Confirmați Email-ul</a>
      </center>
      
      <p style="font-size: 14px; color: #999;">
        Sau copiați și lipiți acest link în browser:<br>
        <span style="color: #2196F3;">{{ .ConfirmationURL }}</span>
      </p>
      
      <div class="divider"></div>
      
      <p><strong>De ce să vă creați cont?</strong></p>
      <ul style="color: #666; line-height: 1.8;">
        <li>🛒 Salvați coșul de cumpărături pentru mai târziu</li>
        <li>📦 Urmăriți comenzile și livrările</li>
        <li>💰 Acces la oferte exclusive pentru membri</li>
        <li>📐 Utilizați calculatorul nostru de materiale</li>
        <li>🏪 Programări prioritare în showroom</li>
      </ul>
      
      <p style="font-size: 13px; color: #999;">
        Link-ul de confirmare expiră în 24 de ore. Dacă nu ați solicitat această înregistrare, puteți ignora acest email.
      </p>
    </div>
    
    <div class="footer">
      <div class="social-links">
        <a href="https://facebook.com/promactiles">
          <img src="{{ .SiteURL }}/icons/facebook.png" alt="Facebook" width="24">
        </a>
        <a href="https://instagram.com/promactiles">
          <img src="{{ .SiteURL }}/icons/instagram.png" alt="Instagram" width="24">
        </a>
      </div>
      
      <p>
        Pro-Mac SRL | București, România<br>
        Tel: 0721 234 567 | Email: contact@promac.ro<br>
        <a href="{{ .SiteURL }}/termeni" style="color: #999;">Termeni și Condiții</a> | 
        <a href="{{ .SiteURL }}/confidentialitate" style="color: #999;">Politica de Confidențialitate</a>
      </p>
      
      <p>© 2025 Pro-Mac. Toate drepturile rezervate.</p>
    </div>
  </div>
</body>
</html>
```

### 2.3 Password Recovery Email
```html
<!-- Subject Line -->
Resetare parolă - Pro-Mac

<!-- Email Body -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* Same styles as above */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{ .SiteURL }}/logo-white.png" alt="Pro-Mac" class="logo">
    </div>
    
    <div class="content">
      <h1>Resetare Parolă</h1>
      
      <p>Bună {{ .Email }},</p>
      
      <p>Am primit o cerere de resetare a parolei pentru contul dumneavoastră Pro-Mac. Pentru a continua, apăsați butonul de mai jos:</p>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">Resetați Parola</a>
      </center>
      
      <p style="font-size: 14px; color: #999;">
        Link alternativ:<br>
        <span style="color: #2196F3;">{{ .ConfirmationURL }}</span>
      </p>
      
      <div class="divider"></div>
      
      <p style="color: #ff5722; font-weight: 600;">
        ⚠️ Atenție la securitate:
      </p>
      <ul style="color: #666; line-height: 1.8;">
        <li>Link-ul expiră în 1 oră</li>
        <li>Nu partajați acest link cu nimeni</li>
        <li>Dacă nu ați solicitat resetarea, ignorați acest email</li>
        <li>Contul dvs. rămâne securizat</li>
      </ul>
      
      <p style="font-size: 13px; color: #999;">
        Pentru asistență suplimentară, contactați echipa noastră la support@promac.ro sau 0721 234 567.
      </p>
    </div>
    
    <div class="footer">
      <!-- Same footer as confirmation email -->
    </div>
  </div>
</body>
</html>
```

### 2.4 Magic Link Email
```html
<!-- Subject Line -->
Conectare rapidă - Pro-Mac

<!-- Email Body -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* Same styles */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{ .SiteURL }}/logo-white.png" alt="Pro-Mac" class="logo">
    </div>
    
    <div class="content">
      <h1>Link de Conectare Rapidă</h1>
      
      <p>Bună {{ .Email }},</p>
      
      <p>Apăsați butonul de mai jos pentru a vă conecta instant la contul Pro-Mac:</p>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">Conectare Automată</a>
      </center>
      
      <p style="font-size: 13px; color: #999;">
        🔒 Acest link este valabil pentru o singură utilizare și expiră în 10 minute.
      </p>
    </div>
    
    <div class="footer">
      <!-- Same footer -->
    </div>
  </div>
</body>
</html>
```

### 2.5 Email Change Confirmation
```html
<!-- Subject Line -->
Confirmare schimbare email - Pro-Mac

<!-- Similar template structure with appropriate content -->
```

---

## 3. Email Variables Available

### Standard Supabase Variables:
```javascript
{
  "{{ .Email }}": "User's email address",
  "{{ .ConfirmationURL }}": "Action link (confirmation/reset)",
  "{{ .Token }}": "Verification token",
  "{{ .TokenHash }}": "Hashed token",
  "{{ .SiteURL }}": "Your website URL",
  "{{ .RedirectTo }}": "Post-action redirect URL"
}
```

### Custom Variables (via metadata):
```javascript
// When creating user with metadata
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      full_name: 'Ion Popescu',
      phone: '0721234567'
    }
  }
})

// Use in template: {{ .Data.full_name }}
```

---

## 4. Advanced Configuration

### 4.1 Custom Email Function (Edge Function)
```typescript
// supabase/functions/custom-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  const { user, type, redirect_to } = await req.json()
  
  let template = ''
  let subject = ''
  
  switch(type) {
    case 'signup':
      template = getSignupTemplate(user, redirect_to)
      subject = 'Bine ați venit la Pro-Mac!'
      break
    case 'recovery':
      template = getRecoveryTemplate(user, redirect_to)
      subject = 'Resetare parolă - Pro-Mac'
      break
    case 'abandoned_cart':
      template = getAbandonedCartTemplate(user)
      subject = 'Ați uitat ceva în coș! 🛒'
      break
  }
  
  const { data, error } = await resend.emails.send({
    from: 'Pro-Mac <noreply@promac.ro>',
    to: user.email,
    subject: subject,
    html: template,
    reply_to: 'support@promac.ro',
    headers: {
      'X-Entity-Ref-ID': user.id,
    },
    tags: [
      { name: 'category', value: type },
      { name: 'user_id', value: user.id }
    ]
  })
  
  return new Response(
    JSON.stringify({ success: !error, data, error }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})

function getSignupTemplate(user: any, confirmUrl: string): string {
  return `
    <!-- Your custom HTML template -->
    <h1>Bună ${user.user_metadata?.full_name || user.email}!</h1>
    <a href="${confirmUrl}">Confirmați contul</a>
  `
}
```

### 4.2 Deploy Custom Function
```bash
# Deploy the edge function
supabase functions deploy custom-email

# Set environment variables
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 4.3 Configure Auth Hook
```sql
-- Set up auth hook to use custom email function
UPDATE auth.config 
SET config = config || '{"hook_custom_email_function_url": "https://your-project.supabase.co/functions/v1/custom-email"}'::jsonb;
```

---

## 5. Email Settings in Supabase Dashboard

### Navigate to: Authentication → Email Templates

1. **Enable Custom SMTP:** ✓
2. **Sender Settings:**
   - From Email: `noreply@promac.ro`
   - From Name: `Pro-Mac`
   - Reply-To: `support@promac.ro`

3. **Rate Limiting:**
   - Max emails per hour: 100 (adjust based on plan)
   - Enable double opt-in: ✓ (for GDPR compliance)

4. **URL Configuration:**
   - Site URL: `https://promac.ro`
   - Redirect URLs: 
     ```
     https://promac.ro/*
     https://www.promac.ro/*
     http://localhost:3000/* (for development)
     ```

---

## 6. Testing Email Configuration

### 6.1 Test SMTP Connection
```javascript
// Test script to verify SMTP settings
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 587,
  secure: false,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY
  }
})

async function testEmail() {
  try {
    await transporter.verify()
    console.log('✅ SMTP connection successful')
    
    const info = await transporter.sendMail({
      from: 'Pro-Mac <noreply@promac.ro>',
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<h1>Test successful!</h1>'
    })
    
    console.log('✅ Test email sent:', info.messageId)
  } catch (error) {
    console.error('❌ Email error:', error)
  }
}

testEmail()
```

### 6.2 Preview Templates
```javascript
// Local preview server for email templates
import express from 'express'
import { renderEmailTemplate } from './templates'

const app = express()

app.get('/preview/:type', (req, res) => {
  const mockData = {
    Email: 'test@example.com',
    ConfirmationURL: 'https://promac.ro/confirm?token=xxx',
    SiteURL: 'https://promac.ro'
  }
  
  const html = renderEmailTemplate(req.params.type, mockData)
  res.send(html)
})

app.listen(3001, () => {
  console.log('Preview server: http://localhost:3001/preview/signup')
})
```

---

## 7. Email Deliverability Best Practices

### 7.1 DNS Configuration
```dns
; SPF Record
TXT  @  "v=spf1 include:spf.resend.com ~all"

; DKIM Records
TXT  resend._domainkey  "p=MIGfMA0GCSq..."

; DMARC Record
TXT  _dmarc  "v=DMARC1; p=quarantine; rua=mailto:dmarc@promac.ro"

; MX Records (for receiving replies)
MX   @  10  feedback-smtp.eu-west-1.amazonses.com
```

### 7.2 Content Best Practices
- ✅ Use proper HTML structure with `<!DOCTYPE>`
- ✅ Include plain text version
- ✅ Optimize images (< 100KB each)
- ✅ Use web-safe fonts
- ✅ Test with spam checkers
- ✅ Include unsubscribe link
- ✅ Avoid spam trigger words
- ✅ Maintain 60/40 text-to-image ratio

### 7.3 Monitoring
```javascript
// Track email metrics
const emailMetrics = {
  sent: 0,
  delivered: 0,
  opened: 0,
  clicked: 0,
  bounced: 0,
  complained: 0
}

// Webhook handler for email events
app.post('/webhooks/email', (req, res) => {
  const { type, email, timestamp } = req.body
  
  switch(type) {
    case 'email.delivered':
      emailMetrics.delivered++
      break
    case 'email.opened':
      emailMetrics.opened++
      break
    case 'email.bounced':
      handleBounce(email)
      break
  }
  
  res.json({ received: true })
})
```

---

## 8. Troubleshooting

### Common Issues:

#### 1. Emails going to spam
- Verify SPF, DKIM, DMARC records
- Check spam score at mail-tester.com
- Review content for spam triggers
- Ensure proper authentication

#### 2. Emails not sending
```sql
-- Check Supabase logs
SELECT * FROM auth.audit_log_entries 
WHERE payload->>'type' = 'email_failed'
ORDER BY created_at DESC
LIMIT 10;
```

#### 3. Wrong sender showing
- Clear Supabase email cache
- Verify SMTP settings applied
- Check "From" header in raw email

#### 4. Template variables not working
```javascript
// Debug template rendering
console.log('Template vars:', {
  email: user.email,
  confirmationUrl: confirmUrl,
  siteUrl: process.env.SITE_URL
})
```

---

## 9. Migration Checklist

### Before Going Live:
- [ ] Domain DNS records configured
- [ ] SPF, DKIM, DMARC verified
- [ ] Email provider account active
- [ ] API keys secured in environment
- [ ] All templates customized
- [ ] Romanian translations complete
- [ ] Test emails sent successfully
- [ ] Spam score < 3.0
- [ ] Reply-to address monitored
- [ ] Bounce handling configured
- [ ] Rate limits appropriate
- [ ] Backup SMTP configured
- [ ] Analytics tracking enabled
- [ ] GDPR compliance verified
- [ ] Unsubscribe mechanism working

---

## 10. Environment Variables

### Required for Production:
```env
# Email Provider (choose one)
RESEND_API_KEY=re_xxxxxxxxxxxxx
# OR
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password

# Email Configuration
EMAIL_FROM=noreply@promac.ro
EMAIL_FROM_NAME=Pro-Mac
EMAIL_REPLY_TO=support@promac.ro

# URLs
SITE_URL=https://promac.ro
API_URL=https://api.promac.ro

# Optional
EMAIL_PREVIEW_MODE=false
EMAIL_DEV_RECIPIENT=dev@example.com
```

---

## Support & Resources

### Documentation:
- [Supabase Email Auth](https://supabase.com/docs/guides/auth/auth-email)
- [Resend Documentation](https://resend.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com)
- [Email Testing Tools](https://www.mail-tester.com)

### Contact for Issues:
- Supabase Support: support@supabase.com
- Resend Support: support@resend.com
- Development Team: dev@promac.ro

---

*Last Updated: January 2025*
*Version: 1.0*