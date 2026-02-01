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

interface StreakWarningEmailProps {
  firstName: string;
  streakCount: number;
}

export const StreakWarningEmail = ({
  firstName = 'there',
  streakCount = 7,
}: StreakWarningEmailProps) => {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://ayatbits.com';

  return (
    <Html lang="en">
      <Head />
      <Preview>{`Don't lose your ${streakCount}-day streak!`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AyatBits</Heading>
          </Section>

          <Section style={card}>
            <div style={fireEmoji}>🔥</div>
            
            <Heading style={greeting}>As-salamu alaykum, {firstName}</Heading>
            
            <Text style={paragraph}>
              You've built an incredible <strong>{streakCount}-day streak</strong> of consistent learning. 
              Don't let it end today!
            </Text>

            <Section style={warningBox}>
              <Text style={warningText}>
                ⏰ You haven't completed a puzzle today yet.
              </Text>
              <Text style={warningSubtext}>
                Complete just one puzzle to keep your streak alive.
              </Text>
            </Section>

            <Text style={paragraph}>
              Remember, consistency is key to mastering the Quran. Even a few minutes today 
              can make a huge difference in your learning journey.
            </Text>

            <Section style={motivationBox}>
              <Text style={motivationText}>
                🌟 {streakCount} days of dedication
              </Text>
              <Text style={motivationText}>
                📚 Knowledge gained every single day
              </Text>
              <Text style={motivationText}>
                💪 Stronger connection with the Quran
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Link href={`${appUrl}/dashboard`} style={button}>
                Continue Your Streak
              </Link>
            </Section>

            <Text style={signature}>
              We believe in you!<br />
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

export default StreakWarningEmail;

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

const fireEmoji = {
  fontSize: '64px',
  marginBottom: '20px',
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
  textAlign: 'left' as const,
};

const warningBox = {
  backgroundColor: '#fee2e2',
  border: '2px solid #ef4444',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const warningText = {
  color: '#991b1b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const warningSubtext = {
  color: '#b91c1c',
  fontSize: '14px',
  margin: '0',
};

const motivationBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const motivationText = {
  color: '#166534',
  fontSize: '15px',
  margin: '0 0 10px 0',
  textAlign: 'left' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '28px 0',
};

const button = {
  display: 'inline-block',
  backgroundColor: '#ef4444',
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

