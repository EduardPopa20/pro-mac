# Email Setup Commands

Follow these commands step by step in PowerShell (as Administrator):

## Step 1: Navigate to project directory
```powershell
cd "C:\Users\eduar\OneDrive\Desktop\Personal_Project\tiles-ecommerce"
```

## Step 2: Test Docker Supabase CLI
```powershell
docker run --rm supabase/cli:latest --version
```

## Step 3: Initialize Supabase (if not already done)
```powershell
docker run --rm -v "${PWD}:/workspace" -w /workspace supabase/cli:latest init
```

## Step 4: Login to Supabase
```powershell
docker run --rm -it -v "${PWD}:/workspace" -w /workspace supabase/cli:latest login
```
*(This will open a browser window - login with your Supabase account)*

## Step 5: Link to your project
**IMPORTANT: Replace YOUR_PROJECT_ID with your actual project ID**
```powershell
docker run --rm -v "${PWD}:/workspace" -w /workspace supabase/cli:latest link --project-ref YOUR_PROJECT_ID
```

## Step 6: Deploy the Edge Function
```powershell
docker run --rm -v "${PWD}:/workspace" -w /workspace supabase/cli:latest functions deploy send-contact-email
```

## Step 7: Set your Resend API key
**IMPORTANT: Replace re_your_actual_key_here with your real Resend API key**
```powershell
docker run --rm -v "${PWD}:/workspace" -w /workspace supabase/cli:latest secrets set RESEND_API_KEY=re_your_actual_key_here
```

## Step 8: Verify secrets are set
```powershell
docker run --rm -v "${PWD}:/workspace" -w /workspace supabase/cli:latest secrets list
```

## Step 9: Test the Edge Function
```powershell
docker run --rm -v "${PWD}:/workspace" -w /workspace supabase/cli:latest functions invoke send-contact-email --data "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"message\":\"Hello from Edge Function test!\"}"
```

---

## Troubleshooting

If you get "permission denied" errors:
- Make sure PowerShell is running as Administrator
- Make sure Docker Desktop is running

If login doesn't work:
- Try the manual login method (I'll provide this if needed)

If the function doesn't deploy:
- Check that the supabase/functions/send-contact-email/index.ts file exists
- Check for syntax errors in the TypeScript file