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

interface JuzCompletionEmailProps {
  firstName: string;
  juzNumber: number;
  totalJuzCompleted: number;
}

export const JuzCompletionEmail = ({
  firstName = 'there',
  juzNumber = 1,
  totalJuzCompleted = 1,
}: JuzCompletionEmailProps) => {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://ayatbits.com';
  const percentage = ((totalJuzCompleted / 30) * 100).toFixed(1);

  return (
    <Html lang="en">
      <Head />
      <Preview>{`Juz ${juzNumber} Complete! MashaAllah!`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AyatBits</Heading>
          </Section>

          <Section style={card}>
            <div style={celebrationEmoji}>📖</div>
            
            <Heading style={greeting}>As-salamu alaykum, {firstName}!</Heading>
            
            <Section style={achievementBox}>
              <Text style={achievementLabel}>Juz Completed!</Text>
              <Text style={juzTitle}>Juz {juzNumber}</Text>
              <Text style={juzSubtitle}>All puzzles mastered!</Text>
            </Section>

            <Text style={paragraph}>
              <strong>MashaAllah!</strong> You've successfully completed all puzzles in Juz {juzNumber}. 
              This is a significant milestone in your Quranic journey!
            </Text>

            <Section style={statsBox}>
              <div style={statItem}>
                <div style={statNumber}>{totalJuzCompleted}</div>
                <div style={statLabel}>Juz Completed</div>
              </div>
              <div style={statDivider} />
              <div style={statItem}>
                <div style={statNumber}>{30 - totalJuzCompleted}</div>
                <div style={statLabel}>Juz Remaining</div>
              </div>
              <div style={statDivider} />
              <div style={statItem}>
                <div style={statNumber}>{percentage}%</div>
                <div style={statLabel}>Complete</div>
              </div>
            </Section>

            <Section style={progressBarContainer}>
              <div style={progressBarBackground}>
                <div style={{...progressBarFill, width: `${percentage}%`}} />
              </div>
            </Section>

            <Section style={motivationBox}>
              <Text style={quoteText}>
                "Indeed, it is We who sent down the Quran and indeed, We will be its guardian."
              </Text>
              <Text style={quoteSource}>— Quran 15:9</Text>
            </Section>

            <Text style={paragraph}>
              {totalJuzCompleted === 30 
                ? '🎉 SubhanAllah! You\'ve completed ALL 30 Juz of the Quran! This is an incredible achievement!' 
                : `Keep going! Only ${30 - totalJuzCompleted} more Juz to complete the entire Quran.`
              }
            </Text>

            <Section style={buttonContainer}>
              <Link href={`${appUrl}/dashboard`} style={button}>
                {totalJuzCompleted === 30 ? 'View Your Achievement' : 'Continue to Next Juz'}
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

export default JuzCompletionEmail;

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

const achievementBox = {
  backgroundColor: '#faf5ff',
  border: '3px solid #9333ea',
  borderRadius: '12px',
  padding: '28px',
  margin: '24px 0',
};

const achievementLabel = {
  color: '#6b21a8',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px 0',
};

const juzTitle = {
  color: '#581c87',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
};

const juzSubtitle = {
  color: '#7e22ce',
  fontSize: '16px',
  margin: '0',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
  textAlign: 'left' as const,
};

const statsBox = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: '#f0fdf4',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0 16px 0',
};

const statItem = {
  textAlign: 'center' as const,
  flex: '1',
};

const statNumber = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#16a34a',
  margin: '0',
};

const statLabel = {
  fontSize: '13px',
  color: '#166534',
  marginTop: '4px',
};

const statDivider = {
  width: '1px',
  height: '50px',
  backgroundColor: '#bbf7d0',
};

const progressBarContainer = {
  margin: '0 0 24px 0',
};

const progressBarBackground = {
  width: '100%',
  height: '12px',
  backgroundColor: '#e5e7eb',
  borderRadius: '6px',
  overflow: 'hidden',
};

const progressBarFill = {
  height: '100%',
  backgroundColor: '#16a34a',
  transition: 'width 0.3s ease',
};

const motivationBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
};

const quoteText = {
  color: '#78350f',
  fontSize: '15px',
  fontStyle: 'italic',
  margin: '0 0 8px 0',
  textAlign: 'left' as const,
  lineHeight: '1.5',
};

const quoteSource = {
  color: '#92400e',
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

