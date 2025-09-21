# Localhost Development Setup Guide

This guide will help you set up the contact form email functionality for local development.

## 🛠️ Step 1: Install Supabase CLI

### For Windows (Choose ONE method):

**Method 1 - Using Scoop (Recommended):**
```powershell
# First install Scoop if you don't have it
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Then install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Method 2 - Direct Download:**
1. Go to: https://github.com/supabase/cli/releases
2. Download the latest Windows .zip file
3. Extract to a folder (e.g., `C:\supabase`)
4. Add the folder to your PATH environment variable

**Method 3 - Using GitHub CLI:**
```bash
gh release download -R supabase/cli --pattern "*windows-amd64.tar.gz"
```

## 🔧 Step 2: Initialize and Link Supabase Project

Open PowerShell/Command Prompt in your project directory:

```bash
cd C:\Users\eduar\OneDrive\Desktop\Personal_Project\tiles-ecommerce

# Check installation
supabase --version

# Initialize project (if not done already)
supabase init

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID
```

**To find your PROJECT_ID:**
1. Go to your Supabase dashboard
2. Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`
3. Copy the PROJECT_ID from the URL

## 📧 Step 3: Configure Resend for Testing

### For Local Development (No Domain Required):
1. **Login to Resend Dashboard:** https://resend.com/dashboard
2. **Use the default domain for testing:** 
   - Resend provides `onboarding@resend.dev` for testing
   - You can send emails FROM this address without domain verification
   - Perfect for localhost testing!

### Update Edge Function for Testing:
```typescript
// In supabase/functions/send-contact-email/index.ts
// Change the 'from' field to:
from: 'onboarding@resend.dev', // Resend's test domain (works immediately)
```

## 🚀 Step 4: Deploy Edge Function Locally

```bash
# Start Supabase local development
supabase start

# Deploy the Edge Function
supabase functions deploy send-contact-email

# Set your Resend API key
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

## 🔗 Step 5: Add Admin Email to Database

```sql
-- Run this in Supabase SQL Editor or locally
INSERT INTO site_settings (key, value, description) 
VALUES ('admin_email', 'your-email@gmail.com', 'Email address where contact form messages are sent');
```

## ✅ Step 6: Test the Setup

1. **Start your React app:**
   ```bash
   npm run dev
   ```

2. **Go to:** http://localhost:5173/contact

3. **Fill out the form** and submit

4. **Check:**
   - Message appears in `contact_messages` table in Supabase
   - Email arrives at your admin email address

## 🐛 Troubleshooting

**If Supabase CLI won't install:**
- Use Docker method (see alternative below)
- Use Supabase Studio web interface instead

**If emails don't send:**
- Check Resend dashboard for delivery status
- Verify API key is correct
- Check Supabase function logs: `supabase functions logs send-contact-email`

## 🐳 Alternative: Docker Method (If CLI issues persist)

If you have Docker installed:

```bash
# Use Supabase via Docker
docker run --rm -it -v $(pwd):/workspace supabase/cli:latest /bin/bash

# Then run Supabase commands inside the container
```

## 📝 Quick Commands Reference

```bash
# Check what's running locally
supabase status

# View function logs
supabase functions logs send-contact-email

# Test function directly
supabase functions invoke send-contact-email --data '{"name":"Test","email":"test@example.com","message":"Hello"}'

# Stop local services
supabase stop
```

---

**Need help?** 
- Supabase CLI Docs: https://supabase.com/docs/reference/cli/introduction
- Resend Docs: https://resend.com/docs/introduction