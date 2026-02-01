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

interface RamadanVoucherEmailProps {
  firstName: string;
  voucherCode: string;
}

export const RamadanVoucherEmail = ({
  firstName = 'there',
  voucherCode = 'RAMADAN2026',
}: RamadanVoucherEmailProps) => {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://ayatbits.com';
  const redeemUrl = `${appUrl}/pricing?voucher=${voucherCode}`;

  return (
    <Html lang="en">
      <Head />
      <Preview>Ramadan Mubarak! Gift inside 🌙</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AyatBits</Heading>
            <div style={ramadanDecoration}>🌙 ⭐ 🌙</div>
          </Section>

          <Section style={card}>
            <Heading style={greeting}>Ramadan Mubarak, {firstName}! 🌙</Heading>
            
            <Text style={paragraph}>
              As we enter this blessed month of Ramadan, we want to support your journey of 
              connecting with the Quran. May this month bring you closer to Allah's words and wisdom.
            </Text>

            <Section style={giftBox}>
              <Text style={giftLabel}>🎁 Your Ramadan Gift</Text>
              <Text style={giftDescription}>
                One Month of AyatBits Pro - FREE
              </Text>
            </Section>

            <Section style={voucherBox}>
              <Text style={voucherLabel}>Your Voucher Code:</Text>
              <Text style={voucherCodeStyle}>{voucherCode}</Text>
              <Text style={voucherExpiry}>Valid throughout Ramadan</Text>
            </Section>

            <Text style={paragraph}>
              Use this voucher to unlock:
            </Text>

            <Section style={benefitsBox}>
              <Text style={benefitItem}>✓ Unlimited Quranic puzzles and ayahs</Text>
              <Text style={benefitItem}>✓ All Surahs and Juz unlocked</Text>
              <Text style={benefitItem}>✓ Detailed tafsir and translations</Text>
              <Text style={benefitItem}>✓ Track your Ramadan progress</Text>
              <Text style={benefitItem}>✓ Ad-free learning experience</Text>
            </Section>

            <Section style={motivationBox}>
              <Text style={quoteText}>
                "The month of Ramadan in which was revealed the Quran, a guidance for the people 
                and clear proofs of guidance and criterion."
              </Text>
              <Text style={quoteSource}>— Quran 2:185</Text>
            </Section>

            <Text style={paragraph}>
              Make this Ramadan your most spiritually enriching yet. Start your journey today!
            </Text>

            <Section style={buttonContainer}>
              <Link href={redeemUrl} style={button}>
                Redeem Your Gift
              </Link>
            </Section>

            <Text style={signature}>
              Ramadan Kareem,<br />
              <strong>The AyatBits Team</strong>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              May Allah accept your fasts and prayers this Ramadan.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} AyatBits. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default RamadanVoucherEmail;

// Styles
const main = {
  backgroundColor: '#f9fafb',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '40px 20px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const logo = {
  color: '#16a34a',
  fontSize: '28px',
  margin: '0 0 12px 0',
  fontWeight: 'bold',
};

const ramadanDecoration = {
  fontSize: '32px',
  marginTop: '8px',
};

const card = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const greeting = {
  color: '#111827',
  fontSize: '24px',
  margin: '0 0 20px 0',
  fontWeight: '600',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const giftBox = {
  backgroundColor: '#faf5ff',
  border: '3px solid #9333ea',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const giftLabel = {
  fontSize: '20px',
  color: '#6b21a8',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const giftDescription = {
  fontSize: '24px',
  color: '#581c87',
  fontWeight: 'bold',
  margin: '0',
};

const voucherBox = {
  backgroundColor: '#fef3c7',
  border: '2px dashed #f59e0b',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const voucherLabel = {
  fontSize: '14px',
  color: '#92400e',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 12px 0',
};

const voucherCodeStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#78350f',
  fontFamily: 'monospace',
  margin: '0 0 8px 0',
  letterSpacing: '2px',
};

const voucherExpiry = {
  fontSize: '13px',
  color: '#a16207',
  margin: '0',
};

const benefitsBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0 24px 0',
};

const benefitItem = {
  color: '#166534',
  fontSize: '15px',
  margin: '0 0 10px 0',
  lineHeight: '1.5',
};

const motivationBox = {
  backgroundColor: '#e0f2fe',
  borderLeft: '4px solid #0284c7',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
};

const quoteText = {
  color: '#075985',
  fontSize: '15px',
  fontStyle: 'italic',
  margin: '0 0 8px 0',
  lineHeight: '1.5',
};

const quoteSource = {
  color: '#0369a1',
  fontSize: '14px',
  margin: '0',
  textAlign: 'right' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '28px 0',
};

const button = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '14px 32px',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '16px',
};

const signature = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '28px',
  paddingTop: '20px',
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0 0 8px 0',
};

