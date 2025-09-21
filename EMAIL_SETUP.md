# 📧 Configurare Email Custom pentru Verificare

## Problema Actuală
Supabase trimite email-uri de verificare prin sistemul lor default, dar trebuie să configurezi trimiterea prin `eduardpopa68@yahoo.com` cu conținut personalizat în română.

## 🚀 Soluția Recomandată: SMTP Custom în Supabase

### Pasul 1: Configurarea Yahoo SMTP

1. **Activează autentificarea în 2 pași pe Yahoo:**
   - Mergi pe Yahoo Account Security
   - Activează "Two-step verification"

2. **Generează o parolă de aplicație:**
   - În Yahoo Account Security → "Generate app password"
   - Alege "Mail" ca tip de aplicație
   - Notează parola generată (va fi folosită în loc de parola normală)

### Pasul 2: Configurarea în Supabase Dashboard

1. **Accesează Supabase Dashboard:**
   - Mergi la proiectul tău
   - Authentication → Settings → SMTP Settings

2. **Configurează SMTP:**
   ```
   Enable Custom SMTP: ON
   SMTP Host: smtp.mail.yahoo.com
   SMTP Port: 587
   SMTP User: eduardpopa68@yahoo.com
   SMTP Password: [PAROLA_DE_APLICAȚIE_GENERATĂ]
   Sender Name: Pro-Mac
   Sender Email: eduardpopa68@yahoo.com
   ```

### Pasul 3: Personalizarea Template-ului de Email

În Supabase Dashboard → Authentication → Email Templates → "Confirm signup":

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(45deg, #1976d2, #1565c0);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px 20px;
            border-radius: 0 0 8px 8px;
        }
        .button {
            display: inline-block;
            background: #1976d2;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Bun venit la Pro-Mac! 🏠</h1>
    </div>
    
    <div class="content">
        <p><strong>Salut!</strong></p>
        
        <p>Mulțumim că te-ai alăturat comunității noastre de faianta și gresie de calitate!</p>
        
        <p>Pentru a-ți activa contul și a începe să explorezi produsele noastre, te rugăm să confirmi adresa de email făcând clic pe butonul de mai jos:</p>
        
        <div style="text-align: center;">
            <a href="{{ .SiteURL }}/auth/verify-email?token={{ .TokenHash }}&type=email" class="button">
                ✅ Confirmă Email-ul
            </a>
        </div>
        
        <p>Sau copiază și lipește acest link în browser:</p>
        <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px;">
            {{ .SiteURL }}/auth/verify-email?token={{ .TokenHash }}&type=email
        </p>
        
        <p><strong>De ce să alegi Pro-Mac?</strong></p>
        <ul>
            <li>🎯 Cea mai largă gamă de faianta și gresie</li>
            <li>🚚 Livrare rapidă în toată țara</li>
            <li>💡 Consiliere specializată pentru proiectul tău</li>
            <li>🏆 Calitate garantată de peste 20 de ani</li>
        </ul>
    </div>
    
    <div class="footer">
        <p>Dacă nu te-ai înregistrat pe site-ul nostru, ignoră acest email.</p>
        <p>Cu stimă,<br><strong>Echipa Pro-Mac</strong></p>
        <p>📧 Contact: eduardpopa68@yahoo.com<br>
        🌐 www.promac.ro</p>
    </div>
</body>
</html>
```

## 🔧 Template pentru Resetarea Parolei

Pentru "Reset Password" template:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        /* Same styles as above */
    </style>
</head>
<body>
    <div class="header">
        <h1>Resetare Parolă - Pro-Mac 🔐</h1>
    </div>
    
    <div class="content">
        <p><strong>Salut!</strong></p>
        
        <p>Ai solicitat resetarea parolei pentru contul tău Pro-Mac.</p>
        
        <p>Pentru a crea o parolă nouă, fă clic pe butonul de mai jos:</p>
        
        <div style="text-align: center;">
            <a href="{{ .SiteURL }}/auth/reset-password?token={{ .TokenHash }}" class="button">
                🔄 Resetează Parola
            </a>
        </div>
        
        <p><strong>Linkul este valabil doar 60 de minute din motive de securitate.</strong></p>
        
        <p>Dacă nu ai solicitat resetarea parolei, ignoră acest email. Parola ta rămâne neschimbată.</p>
    </div>
    
    <div class="footer">
        <p>Cu stimă,<br><strong>Echipa Pro-Mac</strong></p>
        <p>📧 Contact: eduardpopa68@yahoo.com</p>
    </div>
</body>
</html>
```

## ✅ Informații Necesare de la Tine

Pentru a finaliza configurarea, am nevoie de:

1. **✅ Parola de aplicație Yahoo**
   - Generează parola de aplicație pe Yahoo
   - Trimite-mi parola (sau configurează tu direct în Supabase)

2. **✅ Access la Supabase Dashboard**
   - Poți să configurezi tu SMTP-ul cu informațiile de mai sus
   - Sau să-mi dai acces temporar pentru configurare

3. **✅ Testare**
   - După configurare, testează înregistrarea unui cont nou
   - Verifică că primești email-ul de la `eduardpopa68@yahoo.com`

## 🚨 Troubleshooting

### Probleme Comune:

1. **"Authentication failed"**
   - Verifică că ai folosit parola de aplicație, nu parola normală
   - Asigură-te că ai activat autentificarea în 2 pași

2. **"Connection timeout"**
   - Verifică că portul 587 nu este blocat
   - Încearcă portul 465 cu SSL

3. **"Email not received"**
   - Verifică folder-ul Spam/Junk
   - Testează cu o adresă de email diferită

## 📞 Next Steps

1. **Configurează Yahoo App Password**
2. **Configurează SMTP în Supabase Dashboard**
3. **Personalizează template-urile de email**
4. **Testează funcționalitatea**
5. **Raportează rezultatul pentru debugging**

---

*După configurare, utilizatorii vor primi email-uri personalizate și profesionale de la Pro-Mac!*