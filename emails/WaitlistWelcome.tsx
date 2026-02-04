import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WaitlistWelcomeEmailProps {
  firstName: string;
}

export const WaitlistWelcomeEmail = ({
  firstName = 'there',
}: WaitlistWelcomeEmailProps) => {
  const currentYear = new Date().getFullYear();
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://ayatbits.com';

  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to the AyatBits waitlist! 🌙</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>AyatBits</Heading>
            <Text style={tagline}>Master the Quran, One Puzzle at a Time</Text>
          </Section>

          {/* Main Content Card */}
          <Section style={card}>
            <Heading style={greeting}>As-salamu alaykum, {firstName}! 🌙</Heading>
            
            <Text style={paragraph}>
              Thank you for joining the AyatBits waitlist! You'll be among the first to know about:
            </Text>

            <Section style={benefitsBox}>
              <Text style={benefit}>✨ <strong>New features and updates</strong></Text>
              <Text style={benefit}>🚀 <strong>Product launches and beta access</strong></Text>
              <Text style={benefit}>📚 <strong>Quranic learning tips and insights</strong></Text>
            </Section>

            <Text style={paragraph}>
              We're building something special to help you master the Quran through engaging, interactive puzzles. Stay tuned for exciting updates!
            </Text>

            <Section style={buttonContainer}>
              <Link href={appUrl} style={button}>
                Visit AyatBits
              </Link>
            </Section>

            <Text style={signature}>
              BarakAllahu feek,<br />
              <strong style={signatureStrong}>The AyatBits Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you signed up for the AyatBits waitlist.
            </Text>
            <Text style={footerText}>
              © {currentYear} AyatBits. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WaitlistWelcomeEmail;

// Styles
const main = {
  margin: '0',
  padding: '0',
  backgroundColor: '#f9fafb',
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '40px 20px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '40px',
};

const logo = {
  color: '#16a34a',
  fontSize: '32px',
  margin: '0',
  fontWeight: 'bold',
};

const tagline = {
  color: '#6b7280',
  marginTop: '8px',
  fontSize: '14px',
  margin: '8px 0 0 0',
};

const card = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '40px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const greeting = {
  color: '#111827',
  fontSize: '24px',
  margin: '0 0 16px 0',
  fontWeight: '600',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const benefitsBox = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #16a34a',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
};

const benefit = {
  margin: '0 0 12px 0',
  color: '#166534',
  fontSize: '15px',
  lineHeight: '1.5',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  display: 'inline-block',
  backgroundColor: '#16a34a',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '14px 32px',
  borderRadius: '12px',
  fontWeight: '600',
  fontSize: '16px',
};

const signature = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '32px 0 0 0',
  textAlign: 'center' as const,
};

const signatureStrong = {
  color: '#374151',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0 0 8px 0',
};


