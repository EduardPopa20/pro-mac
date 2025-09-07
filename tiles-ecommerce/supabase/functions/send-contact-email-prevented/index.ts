import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactMessage {
  name: string
  email: string
  message: string
  honeypot?: string // Hidden field for bot detection
  formLoadTime?: number // Track how long form was displayed
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request metadata
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create service role Supabase client for rate limiting
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse the request body
    const { name, email, message, honeypot, formLoadTime }: ContactMessage = await req.json()

    // Basic validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Toate câmpurile sunt obligatorii' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Adresă de email invalidă' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Bot detection - honeypot field should be empty
    if (honeypot) {
      console.log('Bot detected via honeypot:', email)
      // Silently reject but return success to confuse bots
      return new Response(
        JSON.stringify({ success: true, message: 'Mesaj trimis cu succes' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Bot detection - form submitted too quickly (less than 3 seconds)
    if (formLoadTime && Date.now() - formLoadTime < 3000) {
      console.log('Bot detected via timing:', email)
      // Log as suspicious attempt
      await supabase.rpc('log_contact_attempt', {
        p_email: email.toLowerCase().trim(),
        p_ip_address: clientIp !== 'unknown' ? clientIp : null,
        p_user_agent: userAgent,
        p_success: false,
        p_metadata: { reason: 'form_submitted_too_quickly' }
      })
      
      return new Response(
        JSON.stringify({ error: 'Vă rugăm să completați formularul cu atenție' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check for suspicious activity
    const { data: suspiciousCheck } = await supabase.rpc('detect_suspicious_activity', {
      p_email: email.toLowerCase().trim(),
      p_ip_address: clientIp !== 'unknown' ? clientIp : null
    })

    if (suspiciousCheck?.suspicious) {
      console.log('Suspicious activity detected:', email, suspiciousCheck)
      
      // Log failed attempt
      await supabase.rpc('log_contact_attempt', {
        p_email: email.toLowerCase().trim(),
        p_ip_address: clientIp !== 'unknown' ? clientIp : null,
        p_user_agent: userAgent,
        p_success: false,
        p_metadata: { 
          reason: 'suspicious_activity',
          details: suspiciousCheck
        }
      })

      return new Response(
        JSON.stringify({ 
          error: 'Activitate suspectă detectată. Vă rugăm să încercați mai târziu.',
          requiresCaptcha: true 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check rate limits
    const { data: rateLimit } = await supabase.rpc('check_contact_rate_limit', {
      p_email: email.toLowerCase().trim(),
      p_ip_address: clientIp !== 'unknown' ? clientIp : null
    })

    if (!rateLimit?.allowed) {
      console.log('Rate limit exceeded:', email, rateLimit)
      
      // Log failed attempt
      await supabase.rpc('log_contact_attempt', {
        p_email: email.toLowerCase().trim(),
        p_ip_address: clientIp !== 'unknown' ? clientIp : null,
        p_user_agent: userAgent,
        p_success: false,
        p_metadata: { 
          reason: 'rate_limit_exceeded',
          email_count: rateLimit.email_count,
          ip_count: rateLimit.ip_count
        }
      })

      // Apply progressive delay if needed
      if (rateLimit.wait_seconds > 0) {
        await new Promise(resolve => setTimeout(resolve, rateLimit.wait_seconds * 1000))
      }

      return new Response(
        JSON.stringify({ 
          error: rateLimit.message || 'Prea multe mesaje. Vă rugăm să încercați mai târziu.',
          retryAfter: rateLimit.wait_seconds
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.wait_seconds || 60)
          } 
        }
      )
    }

    // Get admin email from site settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_email')
      .single()

    if (settingsError || !settings?.value) {
      console.error('Admin email not configured:', settingsError)
      return new Response(
        JSON.stringify({ error: 'Serviciul de email nu este configurat' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const adminEmail = settings.value

    // Log successful attempt (before sending email)
    const attemptId = await supabase.rpc('log_contact_attempt', {
      p_email: email.toLowerCase().trim(),
      p_ip_address: clientIp !== 'unknown' ? clientIp : null,
      p_user_agent: userAgent,
      p_success: true,
      p_metadata: { 
        name: name,
        message_length: message.length
      }
    })

    // Email content with rate limit info
    const emailContent = {
      to: [adminEmail],
      from: 'onboarding@resend.dev', // Change to your verified domain
      subject: `Mesaj nou de contact de la ${name}`,
      html: `
        <h2>Mesaj nou de pe site-ul Pro-Mac</h2>
        <p><strong>Nume:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mesaj:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <div style="font-size: 12px; color: #666; margin-top: 20px;">
          <p><strong>Informații tehnice:</strong></p>
          <ul>
            <li>IP: ${clientIp}</li>
            <li>User Agent: ${userAgent}</li>
            <li>Attempt ID: ${attemptId}</li>
            <li>Mesaje trimise în ultimele 24h: ${(rateLimit?.email_count || 0) + 1}/3</li>
          </ul>
        </div>
        <hr>
        <p><small>Acest email a fost trimis automat de pe site-ul Pro-Mac.</small></p>
      `,
      text: `
Mesaj nou de pe site-ul Pro-Mac

Nume: ${name}
Email: ${email}

Mesaj:
${message}

---
Informații tehnice:
- IP: ${clientIp}
- Attempt ID: ${attemptId}
- Mesaje trimise în ultimele 24h: ${(rateLimit?.email_count || 0) + 1}/3

---
Acest email a fost trimis automat de pe site-ul Pro-Mac.
      `
    }

    // Send email using Resend API
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
      console.error('Failed to send email:', errorText)
      
      // Update attempt as failed
      await supabase
        .from('contact_attempts')
        .update({ 
          success: false, 
          metadata: { error: 'email_send_failed' } 
        })
        .eq('id', attemptId)

      return new Response(
        JSON.stringify({ error: 'Eroare la trimiterea mesajului. Vă rugăm să încercați mai târziu.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult)

    // Prepare user-friendly response
    const remainingMessages = Math.max(0, 3 - (rateLimit?.email_count || 0) - 1)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mesajul dvs. a fost trimis cu succes! Vă vom contacta în curând.',
        remainingMessages: remainingMessages,
        emailId: emailResult.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-contact-email function:', error)
    return new Response(
      JSON.stringify({ error: 'A apărut o eroare. Vă rugăm să încercați mai târziu.' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})