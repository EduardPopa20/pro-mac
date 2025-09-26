/**
 * React Email Template pentru Newsletter Pro-Mac
 * Template vizual profesional pentru emailuri de marketing
 */
import React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Img,
  Button,
  Hr,
  Link
} from '@react-email/components'

// Definim interfața direct aici pentru a evita problemele de import
interface NewsletterTemplateProps {
  subject: string
  headerImage?: string
  mainTitle: string
  mainContent: string
  productsSection?: {
    title: string
    products: Array<{
      id: string
      name: string
      image: string
      price: string
      url: string
    }>
  }
  footerText?: string
  unsubscribeUrl: string
  websiteUrl: string
}

export const NewsletterTemplate: React.FC<NewsletterTemplateProps> = ({
  subject,
  headerImage,
  mainTitle,
  mainContent,
  productsSection,
  footerText = "Mulțumim că faci parte din comunitatea Pro-Mac!",
  unsubscribeUrl,
  websiteUrl = "https://promac.ro"
}) => {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header cu logo */}
          <Section style={headerStyle}>
            <Row>
              <Column>
                <Img
                  src={headerImage || `${websiteUrl}/logo-email.png`}
                  alt="Pro-Mac Logo"
                  width="200"
                  height="60"
                  style={logoStyle}
                />
              </Column>
            </Row>
          </Section>

          {/* Titlu principal */}
          <Section style={mainSectionStyle}>
            <Heading style={mainTitleStyle}>
              {mainTitle}
            </Heading>

            {/* Conținut principal */}
            <Text style={mainTextStyle}>
              {mainContent}
            </Text>
          </Section>

          {/* Secțiune produse (opțională) */}
          {productsSection && (
            <Section style={productsSectionStyle}>
              <Heading style={sectionTitleStyle}>
                {productsSection.title}
              </Heading>

              <Row>
                {productsSection.products.slice(0, 3).map((product, index) => (
                  <Column key={product.id} style={productColumnStyle}>
                    <Img
                      src={product.image}
                      alt={product.name}
                      width="150"
                      height="150"
                      style={productImageStyle}
                    />
                    <Text style={productNameStyle}>{product.name}</Text>
                    <Text style={productPriceStyle}>{product.price}</Text>
                    <Button style={productButtonStyle} href={product.url}>
                      Vezi Detalii
                    </Button>
                  </Column>
                ))}
              </Row>
            </Section>
          )}

          {/* Call-to-Action */}
          <Section style={ctaSectionStyle}>
            <Button style={mainButtonStyle} href={websiteUrl}>
              Vizitează Magazinul
            </Button>
          </Section>

          {/* Separator */}
          <Hr style={separatorStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              {footerText}
            </Text>

            <Text style={footerLinksStyle}>
              <Link href={websiteUrl} style={linkStyle}>
                Vizitează site-ul
              </Link>
              {" | "}
              <Link href={`${websiteUrl}/showrooms`} style={linkStyle}>
                Showroom-uri
              </Link>
              {" | "}
              <Link href={`${websiteUrl}/contact`} style={linkStyle}>
                Contact
              </Link>
            </Text>

            <Text style={unsubscribeStyle}>
              Nu mai dorești să primești aceste emailuri?{" "}
              <Link href={unsubscribeUrl} style={linkStyle}>
                Dezabonează-te aici
              </Link>
            </Text>

            <Text style={companyInfoStyle}>
              Pro-Mac SRL<br />
              Materiale de construcții și amenajări<br />
              România
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Stiluri pentru email (inline pentru compatibilitate maximă)
const bodyStyle = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
}

const containerStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
  margin: '0 auto',
  padding: '0',
  width: '600px',
}

const headerStyle = {
  backgroundColor: '#1976d2',
  padding: '20px',
  textAlign: 'center' as const,
}

const logoStyle = {
  margin: '0 auto',
}

const mainSectionStyle = {
  padding: '40px 30px',
}

const mainTitleStyle = {
  color: '#1976d2',
  fontSize: '28px',
  fontWeight: 'bold',
  lineHeight: '1.2',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
}

const mainTextStyle = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
}

const productsSectionStyle = {
  backgroundColor: '#f8f9fa',
  padding: '30px',
}

const sectionTitleStyle = {
  color: '#1976d2',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 30px 0',
  textAlign: 'center' as const,
}

const productColumnStyle = {
  textAlign: 'center' as const,
  verticalAlign: 'top',
  width: '33.33%',
  padding: '0 10px',
}

const productImageStyle = {
  borderRadius: '8px',
  margin: '0 0 15px 0',
}

const productNameStyle = {
  color: '#333333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const productPriceStyle = {
  color: '#1976d2',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
}

const productButtonStyle = {
  backgroundColor: '#1976d2',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
}

const ctaSectionStyle = {
  padding: '30px',
  textAlign: 'center' as const,
}

const mainButtonStyle = {
  backgroundColor: '#1976d2',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  padding: '16px 32px',
  textDecoration: 'none',
}

const separatorStyle = {
  borderColor: '#e0e0e0',
  margin: '20px 0',
}

const footerStyle = {
  backgroundColor: '#f8f9fa',
  padding: '30px',
  textAlign: 'center' as const,
}

const footerTextStyle = {
  color: '#666666',
  fontSize: '16px',
  margin: '0 0 20px 0',
}

const footerLinksStyle = {
  color: '#666666',
  fontSize: '14px',
  margin: '0 0 20px 0',
}

const linkStyle = {
  color: '#1976d2',
  textDecoration: 'none',
}

const unsubscribeStyle = {
  color: '#999999',
  fontSize: '12px',
  margin: '0 0 20px 0',
}

const companyInfoStyle = {
  color: '#999999',
  fontSize: '12px',
  margin: '0',
}

export default NewsletterTemplate
export type { NewsletterTemplateProps }