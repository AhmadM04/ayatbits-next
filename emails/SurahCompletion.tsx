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

interface SurahCompletionEmailProps {
  firstName: string;
  surahName: string;
  surahNumber: number;
  totalSurahsCompleted: number;
}

export const SurahCompletionEmail = ({
  firstName = 'there',
  surahName = 'Al-Fatiha',
  surahNumber = 1,
  totalSurahsCompleted = 1,
}: SurahCompletionEmailProps) => {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://ayatbits.com';
  const percentage = ((totalSurahsCompleted / 114) * 100).toFixed(1);

  return (
    <Html lang="en">
      <Head />
      <Preview>{`You completed Surah ${surahName}! MashaAllah!`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AyatBits</Heading>
          </Section>

          <Section style={card}>
            <div style={celebrationEmoji}>🎊</div>
            
            <Heading style={greeting}>As-salamu alaykum, {firstName}!</Heading>
            
            <Section style={achievementBox}>
              <Text style={achievementLabel}>Surah Completed!</Text>
              <Text style={surahTitle}>
                Surah {surahName} ({surahNumber})
              </Text>
            </Section>

            <Text style={paragraph}>
              <strong>MashaAllah!</strong> You've successfully completed all puzzles for Surah {surahName}. 
              Your dedication to learning the Quran is truly admirable.
            </Text>

            <Section style={statsBox}>
              <div style={statItem}>
                <div style={statNumber}>{totalSurahsCompleted}</div>
                <div style={statLabel}>Surahs Completed</div>
              </div>
              <div style={statDivider} />
              <div style={statItem}>
                <div style={statNumber}>{percentage}%</div>
                <div style={statLabel}>Quran Progress</div>
              </div>
            </Section>

            <Section style={motivationBox}>
              <Text style={quoteText}>
                "Whoever recites a letter from the Book of Allah, he will be credited with a good deed, 
                and a good deed gets a ten-fold reward."
              </Text>
              <Text style={quoteSource}>— Prophet Muhammad ﷺ</Text>
            </Section>

            <Text style={paragraph}>
              Keep up the excellent work! Continue your journey to master the entire Quran.
            </Text>

            <Section style={buttonContainer}>
              <Link href={`${appUrl}/dashboard`} style={button}>
                Continue to Next Surah
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

export default SurahCompletionEmail;

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
  backgroundColor: '#dbeafe',
  border: '3px solid #3b82f6',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const achievementLabel = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px 0',
};

const surahTitle = {
  color: '#1e3a8a',
  fontSize: '24px',
  fontWeight: 'bold',
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
  padding: '24px',
  margin: '24px 0',
};

const statItem = {
  textAlign: 'center' as const,
  flex: '1',
};

const statNumber = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#16a34a',
  margin: '0',
};

const statLabel = {
  fontSize: '14px',
  color: '#166534',
  marginTop: '4px',
};

const statDivider = {
  width: '1px',
  height: '60px',
  backgroundColor: '#bbf7d0',
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

