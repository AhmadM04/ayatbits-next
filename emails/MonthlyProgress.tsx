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

interface MonthlyProgressEmailProps {
  firstName: string;
  stats: {
    puzzlesCompleted: number;
    longestStreak: number;
    surahsCompleted: number;
    juzCompleted: number;
    newAchievements: number;
  };
}

export const MonthlyProgressEmail = ({
  firstName = 'there',
  stats = {
    puzzlesCompleted: 42,
    longestStreak: 7,
    surahsCompleted: 3,
    juzCompleted: 1,
    newAchievements: 2,
  },
}: MonthlyProgressEmailProps) => {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://ayatbits.com';
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Html lang="en">
      <Head />
      <Preview>{`Your ${currentMonth} progress on AyatBits`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AyatBits</Heading>
            <Text style={monthLabel}>📊 Monthly Progress Report</Text>
          </Section>

          <Section style={card}>
            <Heading style={greeting}>As-salamu alaykum, {firstName}!</Heading>
            
            <Text style={paragraph}>
              <strong>Alhamdulillah!</strong> Here's a summary of your Quranic learning journey this month.
            </Text>

            <Section style={monthHeader}>
              <Text style={monthTitle}>{currentMonth}</Text>
            </Section>

            {/* Stats Grid */}
            <Section style={statsGrid}>
              <div style={statCard}>
                <div style={statIcon}>🎯</div>
                <div style={statNumber}>{stats.puzzlesCompleted}</div>
                <div style={statLabel}>Puzzles Completed</div>
              </div>
              <div style={statCard}>
                <div style={statIcon}>🔥</div>
                <div style={statNumber}>{stats.longestStreak}</div>
                <div style={statLabel}>Longest Streak</div>
              </div>
              <div style={statCard}>
                <div style={statIcon}>📖</div>
                <div style={statNumber}>{stats.surahsCompleted}</div>
                <div style={statLabel}>Surahs Completed</div>
              </div>
              <div style={statCard}>
                <div style={statIcon}>📚</div>
                <div style={statNumber}>{stats.juzCompleted}</div>
                <div style={statLabel}>Juz Completed</div>
              </div>
              <div style={statCard}>
                <div style={statIcon}>🏆</div>
                <div style={statNumber}>{stats.newAchievements}</div>
                <div style={statLabel}>New Achievements</div>
              </div>
            </Section>

            {/* Highlights */}
            <Section style={highlightsBox}>
              <Text style={highlightsTitle}>✨ This Month's Highlights</Text>
              
              {stats.puzzlesCompleted > 30 && (
                <Text style={highlightItem}>
                  🎉 Outstanding! You completed over 30 puzzles this month!
                </Text>
              )}
              
              {stats.longestStreak >= 7 && (
                <Text style={highlightItem}>
                  🔥 Amazing consistency with your {stats.longestStreak}-day streak!
                </Text>
              )}
              
              {stats.surahsCompleted > 0 && (
                <Text style={highlightItem}>
                  📖 MashaAllah! You completed {stats.surahsCompleted} {stats.surahsCompleted === 1 ? 'Surah' : 'Surahs'}!
                </Text>
              )}
              
              {stats.juzCompleted > 0 && (
                <Text style={highlightItem}>
                  📚 Incredible! You finished {stats.juzCompleted} {stats.juzCompleted === 1 ? 'Juz' : 'Juz'}!
                </Text>
              )}
              
              {stats.newAchievements > 0 && (
                <Text style={highlightItem}>
                  🏆 You unlocked {stats.newAchievements} new {stats.newAchievements === 1 ? 'achievement' : 'achievements'}!
                </Text>
              )}
            </Section>

            {/* Motivation */}
            <Section style={motivationBox}>
              <Text style={quoteText}>
                "The best of deeds is that which is done consistently, even if it is small."
              </Text>
              <Text style={quoteSource}>— Prophet Muhammad ﷺ</Text>
            </Section>

            {/* Encouragement based on stats */}
            <Text style={paragraph}>
              {stats.puzzlesCompleted === 0 
                ? "We haven't seen you this month! Your Quranic journey awaits. Even a few minutes a day makes a difference."
                : stats.puzzlesCompleted < 10
                ? "Great start! Try to increase your learning time gradually. Small, consistent steps lead to great achievements."
                : stats.puzzlesCompleted < 30
                ? "Excellent work! You're building a solid habit. Keep up the momentum!"
                : "SubhanAllah! Your dedication is truly inspiring. May Allah reward your efforts and increase you in knowledge."}
            </Text>

            <Section style={goalBox}>
              <Text style={goalTitle}>🎯 Goal for Next Month</Text>
              <Text style={goalText}>
                Complete {Math.max(stats.puzzlesCompleted + 10, 30)} puzzles and maintain a 7-day streak!
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Link href={`${appUrl}/dashboard`} style={button}>
                Continue Your Journey
              </Link>
            </Section>

            <Text style={signature}>
              BarakAllahu feek,<br />
              <strong>The AyatBits Team</strong>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Want to adjust your email preferences?{' '}
              <Link href={`${appUrl}/dashboard/profile`} style={footerLink}>
                Update settings
              </Link>
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

export default MonthlyProgressEmail;

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
  margin: '0 0 8px 0',
  fontWeight: 'bold',
};

const monthLabel = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0',
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

const monthHeader = {
  textAlign: 'center' as const,
  backgroundColor: '#faf5ff',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
};

const monthTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#6b21a8',
  margin: '0',
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px',
  margin: '24px 0',
};

const statCard = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #bbf7d0',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
};

const statIcon = {
  fontSize: '32px',
  marginBottom: '8px',
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

const highlightsBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const highlightsTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 16px 0',
};

const highlightItem = {
  color: '#78350f',
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

const goalBox = {
  backgroundColor: '#dbeafe',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const goalTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e40af',
  margin: '0 0 8px 0',
};

const goalText = {
  fontSize: '15px',
  color: '#1e3a8a',
  margin: '0',
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

const footerLink = {
  color: '#16a34a',
  textDecoration: 'underline',
};

