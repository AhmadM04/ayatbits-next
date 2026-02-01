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
  Button,
} from '@react-email/components';
import * as React from 'react';

interface MembershipEndingSoonEmailProps {
  firstName: string;
  daysRemaining: number;
  subscriptionEndDate: Date;
}

export const MembershipEndingSoonEmail = ({
  firstName = 'there',
  daysRemaining = 3,
  subscriptionEndDate = new Date(),
}: MembershipEndingSoonEmailProps) => {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://ayatbits.com';
  const renewUrl = `${appUrl}/dashboard/billing`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{`Your AyatBits membership ends in ${daysRemaining} days`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AyatBits</Heading>
          </Section>

          <Section style={card}>
            <Heading style={greeting}>As-salamu alaykum, {firstName}</Heading>
            
            <Text style={paragraph}>
              Your AyatBits membership will end in <strong>{daysRemaining} days</strong> on{' '}
              {subscriptionEndDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}.
            </Text>

            <Section style={warningBox}>
              <Text style={warningText}>
                ⚠️ <strong>Don't lose access to:</strong>
              </Text>
              <Text style={benefitText}>✓ Unlimited Quranic puzzles</Text>
              <Text style={benefitText}>✓ Your progress and achievements</Text>
              <Text style={benefitText}>✓ Personalized learning experience</Text>
              <Text style={benefitText}>✓ Ad-free experience</Text>
            </Section>

            <Text style={paragraph}>
              Renew now to continue your journey of mastering the Quran.
            </Text>

            <Section style={buttonContainer}>
              <Link href={renewUrl} style={button}>
                Renew Membership
              </Link>
            </Section>

            <Text style={signature}>
              BarakAllahu feek,<br />
              <strong>The AyatBits Team</strong>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} AyatBits. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default MembershipEndingSoonEmail;

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
  margin: '0',
  fontWeight: 'bold',
};

const card = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const greeting = {
  color: '#111827',
  fontSize: '22px',
  margin: '0 0 16px 0',
  fontWeight: '600',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const warningBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  padding: '20px',
  margin: '20px 0',
  borderRadius: '8px',
};

const warningText = {
  color: '#92400e',
  fontSize: '16px',
  margin: '0 0 12px 0',
  fontWeight: '600',
};

const benefitText = {
  color: '#78350f',
  fontSize: '14px',
  margin: '0 0 8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '28px 0',
};

const button = {
  display: 'inline-block',
  backgroundColor: '#16a34a',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '12px 28px',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '16px',
};

const signature = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '24px 0 0 0',
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
  margin: '0',
};

