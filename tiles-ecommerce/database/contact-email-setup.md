# Contact Form Email Setup Guide

This guide explains how to set up the contact form email functionality using Supabase Edge Functions and Resend API.

## Prerequisites

1. **Supabase Project** with Edge Functions enabled
2. **Resend Account** (https://resend.com) for email delivery
3. **Supabase CLI** installed locally

## Database Setup

1. **Run the contact schema SQL:**
   ```sql
   -- Execute the contents of database/contact-schema.sql in your Supabase SQL Editor
   ```

2. **Add admin email to site settings:**
   ```sql
   INSERT INTO site_settings (key, value, description) 
   VALUES ('admin_email', 'admin@promac.ro', 'Email address where contact form messages are sent');
   ```

## Email Service Setup (Resend)

1. **Create Resend Account:**
   - Go to https://resend.com
   - Sign up for a free account (100 emails/day free tier)
   - Verify your domain or use their test domain

2. **Get API Key:**
   - Go to API Keys in your Resend dashboard
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Configure Domain (Production):**
   - Add your domain (e.g., promac.ro) in Resend
   - Add the required DNS records
   - Verify domain ownership

## Supabase Edge Function Setup

1. **Initialize Supabase locally:**
   ```bash
   cd tiles-ecommerce
   supabase init
   supabase login
   supabase link --project-ref your-project-id
   ```

2. **Deploy the Edge Function:**
   ```bash
   supabase functions deploy send-contact-email
   ```

3. **Set Environment Variables:**
   ```bash
   # Set the Resend API key
   supabase secrets set RESEND_API_KEY=re_your_api_key_here
   
   # Verify secrets are set
   supabase secrets list
   ```

## Configuration Steps

1. **Update Admin Email:**
   - Go to your Supabase dashboard
   - Navigate to Table Editor → site_settings
   - Update the admin_email value to your actual email

2. **Test the Function:**
   ```bash
   # Test locally first
   supabase functions serve send-contact-email
   
   # Test with curl
   curl -i --location --request POST 'http://localhost:54321/functions/v1/send-contact-email' \
     --header 'Authorization: Bearer your-anon-key' \
     --header 'Content-Type: application/json' \
     --data '{"name":"Test User","email":"test@example.com","message":"Test message"}'
   ```

## Email Template Customization

The email template can be customized in the Edge Function (`supabase/functions/send-contact-email/index.ts`):

- **HTML Version:** Rich formatted email with styling
- **Text Version:** Plain text fallback
- **Subject Line:** Customizable with sender name
- **From Address:** Should match your verified domain

## Security Considerations

1. **Row Level Security:** Contact messages table has RLS enabled
2. **Admin Access:** Only admin users can view contact messages
3. **Public Insert:** Anyone can submit contact forms (required for public access)
4. **Input Validation:** Form validates required fields and email format
5. **Rate Limiting:** Consider implementing rate limiting in production

## Production Checklist

- [ ] Database schema applied
- [ ] Admin email configured in site_settings
- [ ] Resend account created and domain verified
- [ ] Edge Function deployed
- [ ] RESEND_API_KEY secret set
- [ ] Contact form tested end-to-end
- [ ] Email delivery confirmed

## Troubleshooting

**Contact form submits but no email received:**
1. Check Supabase Functions logs
2. Verify RESEND_API_KEY is set correctly
3. Check admin_email in site_settings table
4. Verify Resend domain configuration

**Edge Function errors:**
1. Check function logs: `supabase functions logs send-contact-email`
2. Verify environment variables are set
3. Test function locally first

**Database errors:**
1. Ensure contact-schema.sql was executed
2. Check RLS policies are correct
3. Verify table permissions

## Future Enhancements

- **Auto-response:** Send confirmation email to customer
- **Admin Dashboard:** View and manage contact messages
- **Email Templates:** More sophisticated email designs
- **Spam Protection:** Add reCAPTCHA to contact form
- **Notification Systems:** Slack/Discord notifications for new messages