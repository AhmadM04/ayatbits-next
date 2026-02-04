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

interface WelcomeNewMemberEmailProps {
  firstName: string;
  subscriptionPlan: string;
}

export const WelcomeNewMemberEmail = ({
  firstName = 'there',
  subscriptionPlan = 'monthly',
}: WelcomeNewMemberEmailProps) => {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://ayatbits.com';

  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to AyatBits Pro! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AyatBits</Heading>
            <div style={celebration}>🎉 ✨ 🎉</div>
          </Section>

          <Section style={card}>
            <Heading style={greeting}>Welcome to AyatBits Pro, {firstName}!</Heading>
            
            <Text style={paragraph}>
              <strong>Alhamdulillah!</strong> We're thrilled to have you as a member of the AyatBits Pro community. 
              You've just taken an important step in your journey to master the Quran.
            </Text>

            <Section style={planBox}>
              <Text style={planLabel}>Your Plan:</Text>
              <Text style={planName}>
                {subscriptionPlan === 'lifetime' ? '🏆 Lifetime Access' : 
                 subscriptionPlan === 'yearly' ? '📅 Annual Pro' : 
                 '📆 Monthly Pro'}
              </Text>
            </Section>

            <Section style={featuresBox}>
              <Text style={featuresTitle}>What's unlocked for you:</Text>
              <Text style={featureItem}>✅ <strong>Unlimited Puzzles</strong> - Access all 6,236 ayahs</Text>
              <Text style={featureItem}>✅ <strong>Complete Quran</strong> - All 114 Surahs & 30 Juz</Text>
              <Text style={featureItem}>✅ <strong>Deep Learning</strong> - Tafsir & translations in 15 languages</Text>
              <Text style={featureItem}>✅ <strong>Track Progress</strong> - Achievements, streaks & stats</Text>
              <Text style={featureItem}>✅ <strong>Ad-Free</strong> - Distraction-free learning</Text>
              <Text style={featureItem}>✅ <strong>Priority Support</strong> - We're here to help!</Text>
            </Section>

            <Section style={tipsBox}>
              <Text style={tipsTitle}>💡 Getting Started Tips:</Text>
              <Text style={tipItem}>
                <strong>1. Set Your Goal:</strong> Start with just 5 minutes a day
              </Text>
              <Text style={tipItem}>
                <strong>2. Build a Streak:</strong> Consistency is more important than perfection
              </Text>
              <Text style={tipItem}>
                <strong>3. Explore Translations:</strong> Read ayahs in your preferred language
              </Text>
              <Text style={tipItem}>
                <strong>4. Track Achievements:</strong> Celebrate your milestones
              </Text>
            </Section>

            <Section style={motivationBox}>
              <Text style={quoteText}>
                "Whoever reads one letter from the Book of Allah, he will receive a good deed 
                as a reward, and every good deed receives a ten-fold reward."
              </Text>
              <Text style={quoteSource}>— Prophet Muhammad ﷺ</Text>
            </Section>

            <Text style={paragraph}>
              Ready to begin? Start your first puzzle now!
            </Text>

            <Section style={buttonContainer}>
              <Link href={`${appUrl}/dashboard`} style={button}>
                Start Learning
              </Link>
            </Section>

            <Text style={supportNote}>
              Have questions or need help? Just reply to this email - we're here for you! 💚
            </Text>

            <Text style={signature}>
              BarakAllahu feek,<br />
              <strong>The AyatBits Team</strong>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              You can manage your subscription anytime in your{' '}
              <Link href={`${appUrl}/dashboard/billing`} style={footerLink}>
                billing settings
              </Link>.
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

export default WelcomeNewMemberEmail;

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
  fontSize: '32px',
  margin: '0 0 12px 0',
  fontWeight: 'bold',
};

const celebration = {
  fontSize: '32px',
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

const planBox = {
  backgroundColor: '#faf5ff',
  border: '2px solid #9333ea',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const planLabel = {
  fontSize: '14px',
  color: '#6b21a8',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px 0',
};

const planName = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#581c87',
  margin: '0',
};

const featuresBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const featuresTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#166534',
  margin: '0 0 16px 0',
};

const featureItem = {
  color: '#166534',
  fontSize: '15px',
  margin: '0 0 10px 0',
  lineHeight: '1.5',
};

const tipsBox = {
  backgroundColor: '#e0f2fe',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const tipsTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#075985',
  margin: '0 0 16px 0',
};

const tipItem = {
  color: '#075985',
  fontSize: '15px',
  margin: '0 0 12px 0',
  lineHeight: '1.5',
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
  padding: '14px 32px',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '16px',
};

const supportNote = {
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '8px',
  color: '#6b7280',
  fontSize: '14px',
  margin: '24px 0',
  textAlign: 'center' as const,
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


