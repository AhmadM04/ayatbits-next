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

interface HighestStreakEverEmailProps {
  firstName: string;
  streakCount: number;
}

export const HighestStreakEverEmail = ({
  firstName = 'there',
  streakCount = 7,
}: HighestStreakEverEmailProps) => {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://ayatbits.com';

  return (
    <Html lang="en">
      <Head />
      <Preview>{`You've reached a ${streakCount}-day streak! MashaAllah!`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AyatBits</Heading>
          </Section>

          <Section style={card}>
            <div style={celebrationEmoji}>🎉</div>
            
            <Heading style={greeting}>As-salamu alaykum, {firstName}!</Heading>
            
            <Section style={streakBox}>
              <div style={streakNumber}>{streakCount}</div>
              <div style={streakLabel}>Day Streak!</div>
            </Section>

            <Text style={paragraph}>
              <strong>MashaAllah!</strong> You've just achieved your highest streak ever on AyatBits! 
            </Text>

            <Text style={paragraph}>
              Your dedication to learning the Quran is truly inspiring. May Allah accept your efforts 
              and increase you in knowledge and understanding.
            </Text>

            <Section style={motivationBox}>
              <Text style={quoteText}>
                "The best of you are those who learn the Quran and teach it."
              </Text>
              <Text style={quoteSource}>— Prophet Muhammad ﷺ</Text>
            </Section>

            <Text style={paragraph}>
              Keep up the amazing work! Continue your journey today to maintain your streak.
            </Text>

            <Section style={buttonContainer}>
              <Link href={`${appUrl}/dashboard`} style={button}>
                Continue Learning
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

export default HighestStreakEverEmail;

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
  textAlign: 'center' as const,
};

const celebrationEmoji = {
  fontSize: '64px',
  marginBottom: '20px',
};

const greeting = {
  color: '#111827',
  fontSize: '22px',
  margin: '0 0 24px 0',
  fontWeight: '600',
};

const streakBox = {
  backgroundColor: '#fef3c7',
  border: '3px solid #f59e0b',
  borderRadius: '16px',
  padding: '32px',
  margin: '24px 0',
};

const streakNumber = {
  fontSize: '72px',
  fontWeight: 'bold',
  color: '#f59e0b',
  margin: '0',
  lineHeight: '1',
};

const streakLabel = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#92400e',
  marginTop: '8px',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
  textAlign: 'left' as const,
};

const motivationBox = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #16a34a',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
};

const quoteText = {
  color: '#166534',
  fontSize: '16px',
  fontStyle: 'italic',
  margin: '0 0 8px 0',
  textAlign: 'left' as const,
};

const quoteSource = {
  color: '#15803d',
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
  textAlign: 'left' as const,
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

