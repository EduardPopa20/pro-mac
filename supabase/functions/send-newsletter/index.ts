import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsletterRequest {
  subject: string
  content: string
}

// Generate unsubscribe URL
function generateUnsubscribeUrl(email: string): string {
  // Create a simple token (in production, use proper JWT or similar)
  const token = btoa(`${email}:${Date.now()}`).replace(/[+/=]/g, '')
  // Use hardcoded localhost for development - in production this would be your domain
  const baseUrl = 'http://localhost:5176'
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

// Create HTML email template for development (admin preview)
function createNewsletterEmailTemplate(subject: string, content: string, adminEmail: string, subscriberCount: number): string {
  const unsubscribeUrl = generateUnsubscribeUrl(adminEmail)
  
  return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[PREVIEW] ${subject}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin: 20px;
        }
        .dev-banner {
            background: #ff9800;
            color: white;
            text-align: center;
            padding: 15px;
            font-weight: bold;
            font-size: 14px;
        }
        .header { 
            text-align: center; 
            background: linear-gradient(135deg, #1976d2, #1565c0); 
            color: white; 
            padding: 30px 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content { 
            padding: 40px 30px;
            background: white;
        }
        .content h2 {
            color: #1976d2;
            margin-top: 0;
        }
        .content p {
            margin-bottom: 16px;
        }
        .footer { 
            background: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px; 
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        .footer a {
            color: #1976d2; 
            text-decoration: none;
        }
        .footer a:hover { 
            text-decoration: underline; 
        }
        .divider {
            height: 1px;
            background: #e9ecef;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="dev-banner">
            📧 DEVELOPMENT PREVIEW - Acest newsletter va fi trimis către ${subscriberCount} abonați în producție
        </div>
        <div class="header">
            <h1>Pro-Mac</h1>
            <p>Magazin de faianta și gresie</p>
        </div>
        <div class="content">
            ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
            <p><strong>Pro-Mac SRL</strong> - Magazin de faianta și gresie</p>
            <div class="divider"></div>
            <p>În producție: Acest newsletter va fi trimis către ${subscriberCount} abonați activi.</p>
            <p>
                <a href="${unsubscribeUrl}">Preview Dezabonare</a> | 
                <a href="http://localhost:5176">Site Development</a> |
                <a href="mailto:contact@promac.ro">Contact</a>
            </p>
            <p><small>⚠️ Development Mode: Doar admin-ul vede acest email</small></p>
        </div>
    </div>
</body>
</html>
`
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase with service role key (no user auth needed for development)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse the request body
    const { subject, content }: NewsletterRequest = await req.json()

    // Validate input
    if (!subject || !content) {
      return new Response(
        JSON.stringify({ error: 'Subject și content sunt obligatorii' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get admin email for development testing
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_email')
      .single()

    if (settingsError || !settings?.value) {
      console.error('Admin email not configured:', settingsError)
      return new Response(
        JSON.stringify({ error: 'Admin email not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const adminEmail = settings.value

    // Get subscriber count for display purposes
    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscriptions')
      .select('email')
      .eq('status', 'active')

    if (subscribersError) {
      console.error('Error fetching subscriber count:', subscribersError)
      return new Response(
        JSON.stringify({ error: 'Eroare la numărarea abonaților' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const subscriberCount = subscribers ? subscribers.length : 0
    console.log(`Development mode: Sending newsletter preview to admin (${adminEmail}) representing ${subscriberCount} subscribers`)

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.error('Resend API key not configured')
      return new Response(
        JSON.stringify({ error: 'Serviciul de email nu este configurat' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Development mode: send only to admin as preview
    try {
      const htmlContent = createNewsletterEmailTemplate(subject, content, adminEmail, subscriberCount)
      
      const emailContent = {
        to: [adminEmail],
        from: 'onboarding@resend.dev', // Test domain that works in development
        subject: `[PREVIEW] ${subject}`,
        html: htmlContent,
        headers: {
          'List-Unsubscribe': `<${generateUnsubscribeUrl(adminEmail)}>`,
        }
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(emailContent),
      })

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text()
        console.error(`Failed to send preview email to ${adminEmail}:`, errorText)
        
        return new Response(
          JSON.stringify({ 
            success: false,
            message: `Eroare la trimiterea preview: ${errorText}`,
            details: {
              developmentMode: true,
              previewSentTo: adminEmail,
              wouldSendTo: subscriberCount
            }
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        const emailResult = await emailResponse.json()
        console.log(`Preview email sent successfully to ${adminEmail}:`, emailResult.id)
      }

    } catch (emailError) {
      console.error(`Error sending preview email:`, emailError)
      return new Response(
        JSON.stringify({ 
          success: false,
          message: `Eroare la trimiterea preview: ${emailError.message}`,
          details: {
            developmentMode: true,
            error: emailError.message
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return success results for development
    const response = {
      success: true,
      message: `Newsletter preview trimis cu succes către ${adminEmail}! În producție va fi trimis către ${subscriberCount} abonați.`,
      details: {
        developmentMode: true,
        previewSentTo: adminEmail,
        wouldSendTo: subscriberCount,
        subscribersWouldReceive: subscribers ? subscribers.map(s => s.email) : []
      }
    }

    console.log('Newsletter sending completed:', response)

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in send-newsletter function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Eroare internă la trimiterea newsletter-ului',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})