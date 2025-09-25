import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE_URL = Deno.env.get('SITE_URL') || 'https://promac.ro'

// Email timing configuration (in milliseconds)
const EMAIL_TIMING = {
  FIRST_EMAIL: 30 * 60 * 1000,      // 30 minutes
  SECOND_EMAIL: 12 * 60 * 60 * 1000, // 12 hours
  THIRD_EMAIL: 48 * 60 * 60 * 1000   // 48 hours
}

// Email templates
const emailTemplates = {
  1: {
    getSubject: () => "Ați uitat ceva în coșul dvs. la Pro-Mac",
    getHtml: (cart: any, recoveryUrl: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px; }
          .product-list { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .product-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .product-item:last-child { border-bottom: none; }
          .btn { display: inline-block; padding: 12px 30px; background: #ff9800; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Pro-Mac</h1>
          </div>
          <div class="content">
            <h2>Bună ${cart.profiles?.full_name || 'Client Pro-Mac'},</h2>
            <p>Am observat că ați lăsat câteva produse în coșul dvs. de cumpărături. Nu vrem să pierdeți aceste articole speciale!</p>
            
            <div class="product-list">
              <h3>Produsele din coșul dvs.:</h3>
              ${cart.cart_items.map((item: any) => `
                <div class="product-item">
                  <div>
                    <strong>${item.product.name}</strong><br>
                    <small>Cantitate: ${item.quantity}</small>
                  </div>
                  <div>${(item.price * item.quantity).toFixed(2)} RON</div>
                </div>
              `).join('')}
              <div class="product-item" style="font-weight: bold; font-size: 18px; padding-top: 15px;">
                <div>Total:</div>
                <div>${cart.total_amount} RON</div>
              </div>
            </div>
            
            <p>Produsele selectate sunt încă disponibile și vă așteaptă. Finalizați comanda acum pentru a nu pierde aceste articole.</p>
            
            <center>
              <a href="${recoveryUrl}" class="btn">Finalizați Comanda</a>
            </center>
            
            <p style="color: #666; font-size: 14px;">
              Dacă aveți întrebări sau aveți nevoie de asistență, nu ezitați să ne contactați la 
              <a href="mailto:contact@promac.ro">contact@promac.ro</a> sau la telefon: 0722 123 456.
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Pro-Mac. Toate drepturile rezervate.</p>
            <p>Nu mai doriți să primiți aceste notificări? <a href="${SITE_URL}/unsubscribe">Dezabonați-vă aici</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  2: {
    getSubject: () => "Produsele dvs. vă așteaptă încă - Pro-Mac",
    getHtml: (cart: any, recoveryUrl: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px; }
          .testimonial { background: white; padding: 20px; border-left: 4px solid #ff9800; margin: 20px 0; border-radius: 4px; }
          .btn { display: inline-block; padding: 12px 30px; background: #ff9800; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .product-card { background: white; padding: 15px; border-radius: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Pro-Mac</h1>
          </div>
          <div class="content">
            <h2>Produsele selectate sunt încă disponibile!</h2>
            
            <p>Știm că alegerea faianței și gresiei perfecte necesită timp și atenție. De aceea, am păstrat produsele selectate de dvs. disponibile.</p>
            
            <div class="testimonial">
              <p><em>"Am fost foarte mulțumit de calitatea produselor de la Pro-Mac. Livrarea a fost promptă și echipa foarte profesionistă!"</em></p>
              <p><strong>- Ion Popescu, Client Pro-Mac</strong></p>
            </div>
            
            <h3>De ce să alegeți Pro-Mac?</h3>
            <ul>
              <li>✓ Produse de calitate superioară</li>
              <li>✓ Livrare rapidă în toată țara</li>
              <li>✓ Consiliere profesională</li>
              <li>✓ Garanție extinsă pentru toate produsele</li>
              <li>✓ Prețuri competitive</li>
            </ul>
            
            <center>
              <a href="${recoveryUrl}" class="btn">Continuați Cumpărăturile</a>
            </center>
            
            <p style="margin-top: 30px;">
              <strong>Aveți întrebări despre produse?</strong><br>
              Experții noștri sunt aici să vă ajute! Sunați-ne la 0722 123 456 sau vizitați unul dintre showroom-urile noastre.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  3: {
    getSubject: () => "Ultimă șansă + 10% reducere - Pro-Mac",
    getHtml: (cart: any, recoveryUrl: string, discountCode: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ff9800 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px; }
          .discount-box { background: #fff3e0; border: 2px dashed #ff9800; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .discount-code { font-size: 24px; font-weight: bold; color: #ff6b6b; letter-spacing: 2px; }
          .btn { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #ff6b6b 0%, #ff9800 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; font-size: 18px; }
          .timer { background: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .urgency { color: #ff6b6b; font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Ofertă Specială doar pentru Dvs.!</h1>
          </div>
          <div class="content">
            <h2>Ultima șansă de a finaliza comanda cu reducere!</h2>
            
            <div class="discount-box">
              <p style="margin: 0;">Folosiți codul de reducere:</p>
              <div class="discount-code">${discountCode}</div>
              <p style="margin: 10px 0 0 0; color: #666;">pentru <strong>10% REDUCERE</strong> la întreaga comandă!</p>
            </div>
            
            <div class="timer">
              <p class="urgency">⏰ Ofertă valabilă doar 24 de ore!</p>
              <p>Nu ratați această oportunitate excepțională!</p>
            </div>
            
            <h3>Produsele din coșul dvs. cu reducere:</h3>
            <table style="width: 100%; background: white; padding: 15px; border-radius: 8px;">
              ${cart.cart_items.map((item: any) => `
                <tr>
                  <td style="padding: 10px;">${item.product.name}</td>
                  <td style="padding: 10px; text-align: right;">
                    <s style="color: #999;">${(item.price * item.quantity).toFixed(2)} RON</s><br>
                    <strong style="color: #ff6b6b;">${(item.price * item.quantity * 0.9).toFixed(2)} RON</strong>
                  </td>
                </tr>
              `).join('')}
              <tr style="border-top: 2px solid #eee;">
                <td style="padding: 15px 10px; font-size: 18px;"><strong>Total cu reducere:</strong></td>
                <td style="padding: 15px 10px; text-align: right;">
                  <s style="color: #999;">${cart.total_amount} RON</s><br>
                  <strong style="color: #ff6b6b; font-size: 20px;">${(cart.total_amount * 0.9).toFixed(2)} RON</strong>
                </td>
              </tr>
            </table>
            
            <p style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              💚 <strong>Economisiți ${(cart.total_amount * 0.1).toFixed(2)} RON</strong> cu această ofertă specială!
            </p>
            
            <center>
              <a href="${recoveryUrl}?discount=${discountCode}" class="btn">Aplicați Reducerea Acum</a>
            </center>
            
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
              Această ofertă este personalizată și nu poate fi transferată.<br>
              După expirare, prețurile revin la normal.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find abandoned carts that need emails
    const { data: abandonedCarts, error: fetchError } = await supabase
      .from('carts')
      .select(`
        *,
        cart_items(
          *,
          product:products(*)
        ),
        profiles!user_id(
          email,
          full_name
        ),
        abandoned_cart_emails(
          email_number,
          sent_at
        )
      `)
      .eq('status', 'abandoned')
      .gte('abandoned_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Within last 7 days

    if (fetchError) {
      console.error('Error fetching abandoned carts:', fetchError)
      return new Response(JSON.stringify({ error: 'Failed to fetch abandoned carts' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const emailsSent = []
    const errors = []

    for (const cart of abandonedCarts || []) {
      // Skip if no items in cart
      if (!cart.cart_items || cart.cart_items.length === 0) continue

      // Skip if no email available
      if (!cart.profiles?.email) continue

      // Calculate total amount
      cart.total_amount = cart.cart_items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      ).toFixed(2)

      const timeSinceAbandonment = Date.now() - new Date(cart.abandoned_at).getTime()
      const emailsSentCount = cart.abandoned_cart_emails?.length || 0
      
      let shouldSendEmail = false
      let emailNumber = 0

      // Determine which email to send based on timing
      if (emailsSentCount === 0 && timeSinceAbandonment >= EMAIL_TIMING.FIRST_EMAIL) {
        shouldSendEmail = true
        emailNumber = 1
      } else if (emailsSentCount === 1 && timeSinceAbandonment >= EMAIL_TIMING.SECOND_EMAIL) {
        // Check if enough time has passed since the first email
        const lastEmailTime = new Date(cart.abandoned_cart_emails[0].sent_at).getTime()
        if (Date.now() - lastEmailTime >= (EMAIL_TIMING.SECOND_EMAIL - EMAIL_TIMING.FIRST_EMAIL)) {
          shouldSendEmail = true
          emailNumber = 2
        }
      } else if (emailsSentCount === 2 && timeSinceAbandonment >= EMAIL_TIMING.THIRD_EMAIL) {
        // Check if enough time has passed since the second email
        const lastEmailTime = new Date(cart.abandoned_cart_emails[1].sent_at).getTime()
        if (Date.now() - lastEmailTime >= (EMAIL_TIMING.THIRD_EMAIL - EMAIL_TIMING.SECOND_EMAIL)) {
          shouldSendEmail = true
          emailNumber = 3
        }
      }

      if (shouldSendEmail) {
        try {
          // Generate recovery token
          const token = crypto.randomUUID()
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

          // Store recovery token
          const { error: tokenError } = await supabase
            .from('cart_recovery_tokens')
            .insert({
              cart_id: cart.id,
              token,
              expires_at: expiresAt.toISOString()
            })

          if (tokenError) {
            console.error('Error creating recovery token:', tokenError)
            errors.push({ cart_id: cart.id, error: 'Failed to create recovery token' })
            continue
          }

          // Generate recovery URL
          const recoveryUrl = `${SITE_URL}/cart/recover?token=${token}`

          // Generate discount code for third email
          let discountCode = ''
          if (emailNumber === 3) {
            discountCode = `SAVE10${cart.id.substring(0, 6).toUpperCase()}`
          }

          // Get email template
          const template = emailTemplates[emailNumber as keyof typeof emailTemplates]
          const subject = template.getSubject()
          const html = emailNumber === 3 
            ? template.getHtml(cart, recoveryUrl, discountCode)
            : template.getHtml(cart, recoveryUrl)

          // Send email via Resend
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Pro-Mac <noreply@promac.ro>',
              to: cart.profiles.email,
              subject,
              html,
              tags: [
                { name: 'type', value: 'abandoned_cart' },
                { name: 'email_number', value: emailNumber.toString() },
                { name: 'cart_id', value: cart.id }
              ]
            }),
          })

          if (emailResponse.ok) {
            const emailResult = await emailResponse.json()
            
            // Track email sent
            const { error: trackError } = await supabase
              .from('abandoned_cart_emails')
              .insert({
                cart_id: cart.id,
                email_number: emailNumber,
                recipient_email: cart.profiles.email,
                subject,
                resend_id: emailResult.id,
                status: 'sent'
              })

            if (trackError) {
              console.error('Error tracking email:', trackError)
            }

            // Log event
            await supabase
              .from('cart_events')
              .insert({
                cart_id: cart.id,
                event_type: 'email_sent',
                event_data: { 
                  email_number: emailNumber,
                  resend_id: emailResult.id 
                }
              })

            emailsSent.push({
              cart_id: cart.id,
              email_number: emailNumber,
              recipient: cart.profiles.email,
              resend_id: emailResult.id
            })
          } else {
            const errorText = await emailResponse.text()
            console.error('Resend API error:', errorText)
            errors.push({ 
              cart_id: cart.id, 
              error: `Failed to send email: ${errorText}` 
            })
          }
        } catch (error) {
          console.error('Error sending email for cart:', cart.id, error)
          errors.push({ 
            cart_id: cart.id, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emails_sent: emailsSent.length,
        emails: emailsSent,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})