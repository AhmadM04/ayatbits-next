import { UserProgress } from '@/lib/db';
import DashboardContent from './DashboardContent';
import DashboardI18nProvider from './DashboardI18nProvider';
import { getTrialDaysRemaining } from '@/lib/subscription';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { getMessages, getLocaleFromTranslationCode } from '@/lib/i18n-server';

export default async function DashboardPage() {
  const user = await requireDashboardAccess();
  
  // Fetch progress
  const progress = await UserProgress.find({ userId: user._id });
  
  // Calculate stats
  const stats = {
    surahsCompleted: progress.filter(p => p.progress === 100).length,
    totalAyahs: progress.reduce((acc, curr) => acc + (curr.completedAyahs?.length || 0), 0),
    currentStreak: 0, // Implement streak logic if needed
  };

  const trialDaysLeft = getTrialDaysRemaining(user);

  // Fetch juzs data - adjust this based on your Juz model
  // const juzs = await Juz.find({}).lean(); 
  const juzs: Array<{
    _id: string;
    number: number;
    name: string;
    _count: { puzzles: number };
    progress: number;
    completedPuzzles: number;
  }> = []; // Replace with actual fetch

  const translationCode = user.selectedTranslation || 'en.sahih';
  const locale = getLocaleFromTranslationCode(translationCode);
  const messages = await getMessages(locale);

  return (
    <DashboardI18nProvider translationCode={translationCode} messages={messages}>
      <DashboardContent 
        userFirstName={user.firstName?.split(' ')[0] || null}
        currentStreak={stats.currentStreak}
        completedPuzzles={stats.surahsCompleted}
        juzsExplored={new Set(progress.map(p => p.juzNumber)).size}
        selectedTranslation={translationCode}
        trialDaysLeft={trialDaysLeft}
        subscriptionStatus={user.subscriptionStatus}
        juzs={juzs}
        stats={stats}
      />
    </DashboardI18nProvider>
  );
}
