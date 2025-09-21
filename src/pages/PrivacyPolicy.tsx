import React from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Security,
  Storage,
  Person,
  AccessTime,
  Shield,
  ContactMail,
  Info
} from '@mui/icons-material'

const PrivacyPolicy: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const sections = [
    { id: 'operator', title: '1. Cine suntem', icon: <Person /> },
    { id: 'date-colectate', title: '2. Ce date prelucrăm', icon: <Storage /> },
    { id: 'scopuri', title: '3. Scopuri și temeiuri legale', icon: <Info /> },
    { id: 'pastrare', title: '4. Perioada de păstrare', icon: <AccessTime /> },
    { id: 'destinatari', title: '5. Destinatari', icon: <Person /> },
    { id: 'cookies', title: '6. Cookie-uri și stocare', icon: <Storage /> },
    { id: 'securitate', title: '7. Securitatea datelor', icon: <Security /> },
    { id: 'drepturi', title: '8. Drepturile tale GDPR', icon: <Info /> },
    { id: 'minori', title: '9. Minori', icon: <Person /> },
    { id: 'modificari', title: '10. Actualizări', icon: <Info /> },
    { id: 'contact', title: '11. Contact', icon: <ContactMail /> }
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>
            Acasă
          </Link>
          <Typography color="text.primary">Politica de Confidențialitate</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 700
          }}
        >
          Politica de Confidențialitate
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Ultima actualizare: {new Date().toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Sidebar Navigation - Desktop Only */}
        {!isMobile && (
          <Box sx={{ flex: '0 0 280px' }}>
            <Paper sx={{ p: 2, position: 'sticky', top: 80 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Navigare Rapidă
              </Typography>
              <List>
                {sections.map((section) => (
                  <ListItem
                    key={section.id}
                    button
                    onClick={() => scrollToSection(section.id)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': { backgroundColor: 'grey.100' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {section.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={section.title}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {/* Main Content */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: { xs: 2, md: 4 } }}>
            {/* Introduction */}
            <Alert severity="info" sx={{ mb: 4 }}>
              <Typography variant="body1">
                Această politică explică modul în care PRO MAC PROD COM IMPEX SRL („PRO-MAC", „noi") colectează,
                utilizează și protejează datele cu caracter personal ale vizitatorilor și utilizatorilor
                website-ului pro-mac.ro.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                <strong>Status platformă:</strong> Site-ul are în prezent scop prezentațional. Funcționalitățile
                de e-commerce (coș, checkout, plăți) sunt dezactivate și vor putea fi activate în viitor.
              </Typography>
            </Alert>

            {/* Section 1: Operatorul de Date */}
            <Box id="operator" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                1. Cine suntem - Date de identificare
              </Typography>
              <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
                <Typography variant="body1" paragraph>
                  <strong>PRO MAC PROD COM IMPEX SRL</strong><br />
                  CUI: [Completați CUI]<br />
                  Nr. Reg. Com.: [Completați numărul]<br />
                  Sediu social: [Completați adresa completă]<br />
                  Email: contact@pro-mac.ro<br />
                  Telefon: [Completați telefonul]
                </Typography>
              </Paper>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 2: Ce Date Colectăm */}
            <Box id="date-colectate" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                2. Ce date prelucrăm și din ce surse
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
                Prelucrăm doar datele necesare, furnizate direct de dumneavoastră sau generate
                prin utilizarea Site-ului:
              </Typography>

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                Cont de utilizator (dacă vă creați cont):
              </Typography>
              <List sx={{ mb: 3 }}>
                <ListItem>• Nume și prenume</ListItem>
                <ListItem>• Adresă de email</ListItem>
                <ListItem>• Număr de telefon (opțional)</ListItem>
                <ListItem>
                  <Typography variant="body2" component="span">
                    • Adresă de livrare <em>(va fi solicitată doar când vom activa checkout-ul)</em>
                  </Typography>
                </ListItem>
              </List>

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                Abonare newsletter:
              </Typography>
              <List sx={{ mb: 3 }}>
                <ListItem>• Adresă de email</ListItem>
                <ListItem>• Preferințe de comunicare</ListItem>
              </List>

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                Formular de contact:
              </Typography>
              <List sx={{ mb: 3 }}>
                <ListItem>• Nume</ListItem>
                <ListItem>• Email</ListItem>
                <ListItem>• Număr de telefon</ListItem>
                <ListItem>• Conținutul mesajului</ListItem>
              </List>

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                Date tehnice colectate automat:
              </Typography>
              <List sx={{ mb: 3 }}>
                <ListItem>• Adresă IP</ListItem>
                <ListItem>• Tipul browserului</ListItem>
                <ListItem>• Sistemul de operare</ListItem>
                <ListItem>• Pagini vizitate și marcaje de timp</ListItem>
              </List>

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                Stocare locală în browser (localStorage/sessionStorage):
              </Typography>
              <List>
                <ListItem>• Coș de cumpărături (când va fi disponibil)</ListItem>
                <ListItem>• Produse favorite</ListItem>
                <ListItem>• Preferințe de afișare</ListItem>
                <ListItem>• Token de autentificare pentru menținerea sesiunii</ListItem>
              </List>
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                Nu folosim cookie-uri de tracking sau marketing. Detalii la Secțiunea 6.
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 3: Scopuri și temeiuri legale */}
            <Box id="scopuri" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                3. Scopuri și temeiuri legale (art. 6 GDPR)
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
                Prelucrăm datele în următoarele scopuri:
              </Typography>

              <List>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Gestionarea contului</strong> – pentru a crea și administra contul dvs. de utilizator
                  și a vă furniza funcționalități aferente.<br />
                  <Typography variant="body2" component="span" color="text.secondary">
                    Temei: executarea contractului / măsuri precontractuale (art. 6(1)(b) GDPR)
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Comunicări comerciale (newsletter)</strong> – trimiterea de noutăți și oferte,
                  doar dacă vă abonați.<br />
                  <Typography variant="body2" component="span" color="text.secondary">
                    Temei: consimțământ (art. 6(1)(a) GDPR), cu posibilitatea de dezabonare oricând
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Relații cu clienții</strong> – gestionarea solicitărilor venite prin formularele de contact.<br />
                  <Typography variant="body2" component="span" color="text.secondary">
                    Temei: interes legitim de a răspunde cererilor (art. 6(1)(f) GDPR)
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Îmbunătățirea și securitatea Site-ului</strong> – analiză tehnică de funcționare,
                  prevenirea abuzurilor și a incidentelor de securitate.<br />
                  <Typography variant="body2" component="span" color="text.secondary">
                    Temei: interes legitim (art. 6(1)(f) GDPR)
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Conformitate legală</strong> – atunci când legea impune păstrarea sau comunicarea unor date.<br />
                  <Typography variant="body2" component="span" color="text.secondary">
                    Temei: obligație legală (art. 6(1)(c) GDPR)
                  </Typography>
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 4: Perioada de păstrare */}
            <Box id="pastrare" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                4. Cât timp păstrăm datele
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
                Aplicăm principii de minimizare și limitare a stocării:
              </Typography>

              <List>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Cont de utilizator:</strong> până la ștergerea contului sau, după caz, conform termenelor legale aplicabile
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Newsletter:</strong> până la dezabonare
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Mesaje prin formular:</strong> până la 3 ani (pentru dovada corespondenței și soluționarea cererilor)
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Date tehnice/jurnale:</strong> până la 12 luni, dacă nu sunt necesare mai mult pentru securitate/constatarea incidentelor
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 5: Destinatari */}
            <Box id="destinatari" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                5. Cui divulgăm datele (destinatari)
              </Typography>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Nu vindem datele și nu le dezvăluim în scopuri de marketing către terți.</strong>
                </Typography>
              </Alert>

              <Typography variant="body1" paragraph>
                Putem folosi furnizori (persoane împuternicite) strict pentru funcționarea Site-ului, cu garanții contractuale:
              </Typography>

              <List>
                <ListItem>
                  • <strong>Supabase</strong> – autentificare și bază de date (infrastructură în UE, conform setărilor noastre curente)
                </ListItem>
                <ListItem>
                  • <strong>Servicii de email</strong> – tranzacționale și newsletter, după caz
                </ListItem>
              </List>

              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                Dacă în viitor vom folosi servicii din afara SEE, vom asigura măsuri de transfer conforme
                (de ex. Clauze Contractuale Standard) și vă vom informa în această Politică.
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 6: Cookie-uri și stocare */}
            <Box id="cookies" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                6. Cookie-uri și stocarea în browser
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                Site-ul <strong>nu utilizează cookie-uri de tracking sau marketing</strong>.
              </Alert>

              <Typography variant="body1" paragraph>
                Folosim doar stocarea locală a browserului (localStorage/sessionStorage) pentru funcții esențiale:
              </Typography>

              <List>
                <ListItem>• Produse favorite</ListItem>
                <ListItem>• Preferințe de afișare</ListItem>
                <ListItem>• Menținerea sesiunii de autentificare</ListItem>
                <ListItem>• Coș de cumpărături (când va fi activat)</ListItem>
              </List>

              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                Aceste date rămân în browserul dvs. și le puteți șterge oricând din setările browserului.
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 7: Securitatea datelor */}
            <Box id="securitate" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                7. Securitatea datelor
              </Typography>

              <Typography variant="body1" paragraph>
                Ne angajăm să protejăm datele dvs. personale și aplicăm măsuri rezonabile pentru a preveni
                accesul neautorizat, pierderea sau divulgarea acestora:
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon><Shield /></ListItemIcon>
                  <ListItemText primary="Folosirea de conexiuni criptate SSL/TLS pentru toate transferurile de date" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Shield /></ListItemIcon>
                  <ListItemText primary="Stocarea parolelor în format criptat, utilizând algoritmi moderni" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Shield /></ListItemIcon>
                  <ListItemText primary="Limitarea accesului la date doar pentru persoanele autorizate" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Shield /></ListItemIcon>
                  <ListItemText primary="Infrastructură securizată Supabase cu actualizări regulate de securitate" />
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 8: Drepturile tale */}
            <Box id="drepturi" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                8. Drepturile tale (art. 15–22 GDPR)
              </Typography>

              <Alert severity="success" sx={{ mb: 2 }}>
                Aveți următoarele drepturi pe care le puteți exercita oricând:
              </Alert>

              <List>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Dreptul de acces</strong> – Puteți solicita o copie a datelor dvs. personale
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Dreptul la rectificare</strong> – Puteți cere corectarea datelor incorecte
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Dreptul la ștergere</strong> – Puteți cere ștergerea datelor dvs. ("dreptul de a fi uitat")
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Dreptul la restricționare</strong> – Puteți solicita restricționarea prelucrării în anumite condiții
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Dreptul la portabilitate</strong> – Puteți primi datele dvs. într-un format structurat
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Dreptul la opoziție</strong> – Vă puteți opune anumitor prelucrări efectuate în temeiul interesului legitim
                </ListItem>
                <ListItem sx={{ display: 'list-item', ml: 2 }}>
                  <strong>Retragerea consimțământului</strong> – Puteți retrage consimțământul pentru newsletter oricând, fără a afecta legalitatea prelucrării anterioare
                </ListItem>
              </List>

              <Typography variant="body1" sx={{ mt: 2 }}>
                Pentru exercitarea acestor drepturi, ne puteți contacta la: <strong>contact@pro-mac.ro</strong>
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 9: Minori */}
            <Box id="minori" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                9. Minori
              </Typography>

              <Typography variant="body1" paragraph>
                Site-ul nu vizează în mod intenționat persoane sub 16 ani. Dacă aveți sub 16 ani,
                vă rugăm să nu furnizați date personale fără acordul părintelui/tutorelui legal.
              </Typography>

              <Typography variant="body1">
                Dacă descoperim că am colectat date de la persoane sub 16 ani fără consimțământul
                părinților, vom șterge aceste informații cât mai curând posibil.
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 10: Actualizări */}
            <Box id="modificari" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                10. Actualizări ale Politicii
              </Typography>

              <Typography variant="body1" paragraph>
                Putem actualiza ocazional această Politică pentru a reflecta schimbări legislative
                sau funcționale (de ex. activarea e-commerce).
              </Typography>

              <Typography variant="body1">
                Orice modificare semnificativă va fi anunțată pe Site și, când este cazul, prin email.
                Vă încurajăm să verificați periodic această pagină.
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 11: Contact */}
            <Box id="contact">
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                11. Contact și reclamații
              </Typography>

              <Paper sx={{ p: 3, backgroundColor: 'primary.50', mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Pentru orice întrebări despre datele dvs. personale sau pentru exercitarea drepturilor GDPR:
                </Typography>
                <Typography variant="body1">
                  Email: <strong>contact@pro-mac.ro</strong><br />
                  Telefon: [Completați telefonul]<br />
                  Răspundem în maximum 30 de zile.
                </Typography>
              </Paper>

              <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Autoritatea de Supraveghere:
                </Typography>
                <Typography variant="body1">
                  Aveți dreptul să vă adresați și:<br />
                  <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong><br />
                  Adresă: B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București<br />
                  Website: <Link href="https://www.dataprotection.ro" target="_blank">www.dataprotection.ro</Link><br />
                  Email: anspdcp@dataprotection.ro
                </Typography>
              </Paper>
            </Box>

            {/* Footer Note */}
            <Alert severity="info" sx={{ mt: 4 }}>
              Această politică poate fi actualizată periodic. Te vom notifica despre modificări importante
              prin email sau prin afișarea unei notificări pe site.
            </Alert>
          </Paper>
        </Box>
      </Box>
    </Container>
  )
}

export default PrivacyPolicy