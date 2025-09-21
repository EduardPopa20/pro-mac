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
  const token = btoa(`${email}:${Date.now()}`).replace(/[+/=]/g, '')
  const baseUrl = 'http://localhost:5176'
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

// Create HTML email template
function createNewsletterEmailTemplate(subject: string, content: string, email: string): string {
  const unsubscribeUrl = generateUnsubscribeUrl(email)
  
  return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
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
        .header { 
            text-align: center; 
            background: linear-gradient(135deg, #1976d2, #1565c0); 
            color: white; 
            padding: 30px 20px;
        }
        .test-banner {
            background: #ff9800;
            color: white;
            text-align: center;
            padding: 10px;
            font-weight: bold;
            font-size: 14px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content { 
            padding: 40px 30px;
            background: white;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="test-banner">
            📧 TEST MODE - Configurează domeniu propriu pentru toate email-urile
        </div>
        <div class="header">
            <h1>Pro-Mac</h1>
            <p>Magazin de faianta și gresie</p>
        </div>
        <div class="content">
            <p><strong>Destinatar de test:</strong> ${email}</p>
            <hr>
            ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
            <p><strong>Pro-Mac SRL</strong> - Test Newsletter</p>
            <p>
                <a href="${unsubscribeUrl}">Dezabonează-te</a> | 
                <a href="http://localhost:5176">Site</a>
            </p>
            <p><small>⚠️ Acest email funcționează doar cu domeniu configurat</small></p>
        </div>
    </div>
</body>
</html>
`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { subject, content }: NewsletterRequest = await req.json()

    if (!subject || !content) {
      return new Response(
        JSON.stringify({ error: 'Subject și content sunt obligatorii' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get admin email from site_settings instead of all subscribers
    // This is for testing - send only to verified email
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_email')
      .single()

    if (settingsError || !settings?.value) {
      console.error('Admin email not configured:', settingsError)
      return new Response(
        JSON.stringify({ error: 'Admin email not configured for testing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const adminEmail = settings.value
    console.log(`Sending test newsletter to admin email: ${adminEmail}`)

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

    try {
      const htmlContent = createNewsletterEmailTemplate(subject, content, adminEmail)
      
      const emailContent = {
        to: [adminEmail],
        from: 'onboarding@resend.dev', // Test domain - works only for registered email
        subject: `[TEST] ${subject}`,
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
        console.error(`Failed to send test email:`, errorText)
        return new Response(
          JSON.stringify({ 
            success: false,
            message: `Failed to send test email: ${errorText}` 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        const emailResult = await emailResponse.json()
        console.log(`Test email sent successfully:`, emailResult.id)
      }

    } catch (emailError) {
      console.error(`Error sending test email:`, emailError)
      return new Response(
        JSON.stringify({ 
          success: false,
          message: `Error sending test email: ${emailError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return results
    const response = {
      success: true,
      message: `Newsletter de test trimis cu succes către ${adminEmail}! Pentru a trimite către toți abonații, configurează domeniu propriu în Resend.`,
      details: {
        testMode: true,
        sentTo: adminEmail,
        note: "Configurează domeniu în Resend pentru email-uri către toți abonații"
      }
    }

    console.log('Test newsletter sending completed:', response)

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-newsletter-test function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Eroare internă la trimiterea newsletter-ului de test',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})