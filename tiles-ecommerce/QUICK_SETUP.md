# 🚀 Quick Setup for Contact Form (5 Minutes)

Since you have Docker and have created your Resend account, let's get everything working quickly!

## 📋 Prerequisites Check
- ✅ Database setup complete (contact-schema.sql executed)
- ✅ Resend account created
- ✅ Resend API key generated
- ✅ Docker installed

## 🎯 Step-by-Step Commands

### 1. Add Admin Email to Database
Go to your Supabase dashboard → Table Editor → `site_settings` and add:
```
key: admin_email
value: your-email@gmail.com
description: Email address where contact form messages are sent
```

### 2. Test Without Edge Functions First

Let's test the basic contact form (saves to database only):

```bash
# In your project directory
npm run dev
```

1. Go to: http://localhost:5173/contact
2. Fill out the form and submit
3. Check your Supabase dashboard → Table Editor → `contact_messages`
4. You should see your message saved!

### 3. Add Email Functionality (Docker Method)

Open **PowerShell as Administrator** in your project directory:

```powershell
# Test Docker Supabase CLI
docker run --rm supabase/cli:latest --version

# Initialize Supabase (if not done)
docker run --rm -v "${PWD}:/workspace" -w /workspace supabase/cli:latest init

# Login to Supabase
docker run --rm -it -v "${PWD}:/workspace" -w /workspace supabase/cli:latest login

# Link to your project (replace YOUR_PROJECT_ID with your actual project ID)
docker run --rm -v "${PWD}:/workspace" -w /workspace supabase/cli:latest link --project-ref YOUR_PROJECT_ID

# Deploy the Edge Function
docker run --rm -v "${PWD}:/workspace" -w /workspace supabase/cli:latest functions deploy send-contact-email

# Set your Resend API key (replace with your actual key)
docker run --rm -v "${PWD}:/workspace" -w /workspace supabase/cli:latest secrets set RESEND_API_KEY=re_your_key_here
```

## 🔍 Find Your Project ID

1. Go to your Supabase dashboard
2. Look at the URL: `https://supabase.com/dashboard/project/abcdefgh`
3. The part after `/project/` is your PROJECT_ID

## ✅ Test Complete Setup

1. Restart your React app: `npm run dev`
2. Go to: http://localhost:5173/contact
3. Fill out the form with your real email
4. Submit the form
5. Check:
   - Message appears in `contact_messages` table
   - Email arrives in your inbox

## 🐛 Quick Troubleshooting

**Form submits but no database entry:**
- Check browser console for errors
- Verify you ran the database schema

**Database works but no email:**
- Check Resend dashboard for delivery status
- Verify your API key is correct
- Check Supabase Functions logs in dashboard

**Docker issues:**
- Make sure Docker Desktop is running
- Try running PowerShell as Administrator

## 🎉 Success Indicators

- ✅ Form submission shows success message
- ✅ Message appears in `contact_messages` table
- ✅ Email arrives at your admin email address
- ✅ No console errors

## ⚡ Alternative: Skip Email for Now

If you have Docker issues, you can skip the email functionality for now:

1. The contact form will still work (saves to database)
2. Users will see "Message sent successfully"
3. You can view messages in Supabase dashboard
4. Add email functionality later when deployed to production

The form is fully functional without the Edge Function!