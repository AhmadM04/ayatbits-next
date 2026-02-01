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

interface TrialEndingSoonEmailProps {
  firstName: string;
  daysRemaining: number;
  trialEndDate: Date;
}

export const TrialEndingSoonEmail = ({
  firstName = 'there',
  daysRemaining = 2,
  trialEndDate = new Date(),
}: TrialEndingSoonEmailProps) => {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://ayatbits.com';
  const subscribeUrl = `${appUrl}/pricing`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{`Your AyatBits trial ends in ${daysRemaining} days`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AyatBits</Heading>
          </Section>

          <Section style={card}>
            <Heading style={greeting}>As-salamu alaykum, {firstName}</Heading>
            
            <Text style={paragraph}>
              Your free trial of AyatBits Pro ends in <strong>{daysRemaining} days</strong> on{' '}
              {trialEndDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}.
            </Text>

            <Section style={timeBox}>
              <div style={clockEmoji}>⏰</div>
              <Text style={timeText}>
                Only {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left!
              </Text>
            </Section>

            <Text style={paragraph}>
              We hope you've enjoyed exploring the Quran through AyatBits. Don't let your learning journey end!
            </Text>

            <Section style={benefitsBox}>
              <Text style={benefitsTitle}>Continue enjoying:</Text>
              <Text style={benefitItem}>✓ Unlimited access to all Quranic puzzles</Text>
              <Text style={benefitItem}>✓ Complete Quran with translations & tafsir</Text>
              <Text style={benefitItem}>✓ Track your progress and achievements</Text>
              <Text style={benefitItem}>✓ Build your daily streak</Text>
              <Text style={benefitItem}>✓ Ad-free experience</Text>
            </Section>

            <Section style={pricingBox}>
              <Text style={pricingLabel}>Subscribe now:</Text>
              <div style={pricingOptions}>
                <div style={pricingOption}>
                  <Text style={pricingPlan}>Monthly</Text>
                  <Text style={pricingPrice}>$4.99/mo</Text>
                </div>
                <div style={pricingOption}>
                  <Text style={pricingPlan}>Yearly</Text>
                  <Text style={pricingPrice}>$39.99/yr</Text>
                  <Text style={pricingSavings}>Save 33%</Text>
                </div>
              </div>
            </Section>

            <Section style={buttonContainer}>
              <Link href={subscribeUrl} style={button}>
                Subscribe Now
              </Link>
            </Section>

            <Text style={paragraph}>
              Have questions? We're here to help! Just reply to this email.
            </Text>

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

export default TrialEndingSoonEmail;

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
  margin: '0 0 20px 0',
  fontWeight: '600',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const timeBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const clockEmoji = {
  fontSize: '48px',
  marginBottom: '8px',
};

const timeText = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0',
};

const benefitsBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const benefitsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#166534',
  margin: '0 0 12px 0',
};

const benefitItem = {
  color: '#166534',
  fontSize: '15px',
  margin: '0 0 8px 0',
};

const pricingBox = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const pricingLabel = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const pricingOptions = {
  display: 'flex',
  gap: '16px',
  justifyContent: 'center',
};

const pricingOption = {
  backgroundColor: '#ffffff',
  border: '2px solid #16a34a',
  borderRadius: '8px',
  padding: '16px',
  flex: '1',
  textAlign: 'center' as const,
};

const pricingPlan = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#16a34a',
  margin: '0 0 8px 0',
};

const pricingPrice = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0',
};

const pricingSavings = {
  fontSize: '12px',
  color: '#16a34a',
  fontWeight: '600',
  marginTop: '4px',
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
  padding: '14px 32px',
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

