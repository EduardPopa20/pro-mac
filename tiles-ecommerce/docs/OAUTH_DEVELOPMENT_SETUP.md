# 🚀 Ghid Pas cu Pas OAuth pentru Development Local

## Estimare timp: 15-20 minute total

---

## **PASUL 1: Configurare Google OAuth (5-10 minute)**

### **1.1 Accesează Google Cloud Console**
```
https://console.cloud.google.com/
```

### **1.2 Creează un proiect nou (dacă nu ai unul)**
- Click pe dropdown-ul de proiect (top-left)
- "New Project" → Nume: "Pro-Mac Tiles" → Create

### **1.3 Activează Google+ API**
- Mergi la "APIs & Services" → "Library"
- Caută "Google+ API" și activează-l
- Sau direct: "Identity and Access Management (IAM) API"

### **1.4 Creează OAuth Credentials**
- Mergi la "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"

### **1.5 Configurează OAuth consent screen (dacă nu e făcut)**
- "OAuth consent screen" → External → Create
- App name: "Pro-Mac Tiles"
- User support email: [email-ul tău]
- Developer contact: [email-ul tău]
- Save and Continue (sări peste scopurile)

### **1.6 Configurează Client ID**
```
Application type: Web application
Name: Pro-Mac Development

Authorized JavaScript origins:
http://localhost:5173

Authorized redirect URIs:
https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback
```

**📝 IMPORTANT**: Să găsești PROJECT_ID din Supabase:
- Supabase Dashboard → Settings → General → Reference ID

### **1.7 Copiază credentialele**
- Vei primi un Client ID și Client Secret
- **PĂSTREAZĂ-LE** - le vei folosi în pasul 3

---

## **PASUL 2: Configurare Facebook OAuth (5-10 minute)**

### **2.1 Accesează Facebook Developers**
```
https://developers.facebook.com/
```

### **2.2 Creează o aplicație nouă**
- "My Apps" → "Create App"
- App Type: "Business" → Continue
- App Name: "Pro-Mac Tiles Development"
- Email: [email-ul tău]

### **2.3 Adaugă Facebook Login**
- Dashboard-ul aplicației → "Add Product"
- Găsește "Facebook Login" → "Set Up"

### **2.4 Configurează redirect URIs**
- "Facebook Login" → "Settings"
- "Valid OAuth Redirect URIs":
```
https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback
```

### **2.5 Copiază credentialele**
- App Dashboard → "Settings" → "Basic"
- **App ID** și **App Secret** - păstrează-le pentru pasul 3!

---

## **PASUL 3: Configurare Supabase Dashboard (2-3 minute)**

### **3.1 Accesează Supabase Project**
```
https://supabase.com/dashboard
```
- Selectează proiectul Pro-Mac Tiles

### **3.2 Activează Google Provider**
- Authentication → Providers → Google
- **Enable**: ON
- **Client ID**: [copiază din Google Cloud Console]
- **Client Secret**: [copiază din Google Cloud Console]
- Save

### **3.3 Activează Facebook Provider**
- Authentication → Providers → Facebook  
- **Enable**: ON
- **Client ID**: [copiază App ID din Facebook]
- **Client Secret**: [copiază App Secret din Facebook]
- Save

---

## **PASUL 4: Testarea în Aplicație (1-2 minute)**

### **4.1 Pornește aplicația**
```bash
cd C:/Users/eduar/OneDrive/Desktop/Personal_Project/tiles-ecommerce
npm run dev
```

### **4.2 Testează funcționalitatea**
1. Accesează: `http://localhost:5173/auth`
2. Click pe "Conectează-te cu Google"
3. Ar trebui să te redirectioneze către Google
4. Repetă pentru Facebook

---

## 📋 Verificări și Troubleshooting

### **Cum să știi că funcționează:**

✅ **Google/Facebook button redirect** către platformă externă  
✅ **După autentificare** revii în aplicație la `/auth/callback`  
✅ **Loading screen** se afișează  
✅ **Redirectionare automată** către home page  
✅ **Profilul se creează** automat în aplicație  

### **Probleme comune și soluții:**

❌ **"OAuth error: invalid_client"**
- **Soluția**: Verifică Client ID/Secret în Supabase
- **Verifică**: Authorized redirect URIs în Google/Facebook

❌ **"Redirect URI mismatch"**  
- **Soluția**: Verifică că redirect URI e exact:
  ```
  https://[PROJECT_ID].supabase.co/auth/v1/callback
  ```

❌ **Loading infinit pe /auth/callback**
- **Soluția**: Verifică că toate providerele sunt activate în Supabase
- **Debug**: Browser Console → verifică erori

❌ **"This app is blocked"**
- **Soluția**: Pentru Google - app-ul e în development mode, adaugă emailul tău ca test user

---

## 🎯 Rezultat Final

După acești pași:
- ✅ OAuth Google funcțional
- ✅ OAuth Facebook funcțional  
- ✅ Conturi create automat cu profil
- ✅ Autentificare cu un singur click
- ✅ Gestionare unificată a utilizatorilor

**Status**: Gata pentru development și testare locală! 🎉

---

**Data creării**: 30 August 2025  
**Pentru**: Pro-Mac Tiles E-commerce Development