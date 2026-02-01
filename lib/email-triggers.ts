/**
 * Email Trigger Utilities
 * 
 * This module contains functions to check conditions and trigger appropriate emails.
 * These can be called from cron jobs, webhooks, or background tasks.
 */

import { connectDB, User, UserProgress } from './db';
import {
  sendMembershipEndingSoonEmail,
  sendHighestStreakEverEmail,
  sendStreakWarningEmail,
  sendSurahCompletionEmail,
  sendJuzCompletionEmail,
  sendTrialEndingSoonEmail,
  sendWelcomeNewMemberEmail,
  sendMonthlyProgressEmail,
} from './aws-ses-service';
import { logger } from './logger';
import mongoose from 'mongoose';

/**
 * Check and send membership ending reminders
 * Run this daily to catch users whose memberships are ending soon
 */
export async function checkAndSendMembershipReminders() {
  try {
    await connectDB();
    
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find users whose subscriptions end in 1, 3, or 7 days
    const usersEndingSoon = await User.find({
      subscriptionStatus: 'active',
      subscriptionEndDate: {
        $gte: tomorrow,
        $lte: sevenDaysFromNow,
      },
      subscriptionPlan: { $in: ['monthly', 'yearly'] }, // Not lifetime
    });

    logger.info(`[Email Triggers] Found ${usersEndingSoon.length} users with memberships ending soon`);

    for (const user of usersEndingSoon) {
      if (!user.subscriptionEndDate || !user.email) continue;

      const daysRemaining = Math.ceil(
        (user.subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Send reminders at 7, 3, and 1 day marks
      if (daysRemaining === 7 || daysRemaining === 3 || daysRemaining === 1) {
        await sendMembershipEndingSoonEmail({
          email: user.email,
          firstName: user.firstName || 'there',
          daysRemaining,
          subscriptionEndDate: user.subscriptionEndDate,
        });
        
        logger.info(`[Email Triggers] Sent membership ending email to ${user.email} (${daysRemaining} days remaining)`);
      }
    }
  } catch (error) {
    logger.error('[Email Triggers] Error in checkAndSendMembershipReminders', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Check and send trial ending reminders
 * Run this daily
 */
export async function checkAndSendTrialReminders() {
  try {
    await connectDB();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Find users whose trials end soon
    const usersTrialEndingSoon = await User.find({
      subscriptionStatus: 'trialing',
      trialEndsAt: {
        $gte: tomorrow,
        $lte: threeDaysFromNow,
      },
    });

    logger.info(`[Email Triggers] Found ${usersTrialEndingSoon.length} users with trials ending soon`);

    for (const user of usersTrialEndingSoon) {
      if (!user.trialEndsAt || !user.email) continue;

      const daysRemaining = Math.ceil(
        (user.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Send reminders at 3 and 1 day marks
      if (daysRemaining === 3 || daysRemaining === 1) {
        await sendTrialEndingSoonEmail({
          email: user.email,
          firstName: user.firstName || 'there',
          daysRemaining,
          trialEndDate: user.trialEndsAt,
        });
        
        logger.info(`[Email Triggers] Sent trial ending email to ${user.email} (${daysRemaining} days remaining)`);
      }
    }
  } catch (error) {
    logger.error('[Email Triggers] Error in checkAndSendTrialReminders', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Check for users at risk of losing their streak and send warnings
 * Run this in the evening (e.g., 8 PM local time)
 */
export async function checkAndSendStreakWarnings() {
  try {
    await connectDB();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Find users with streaks >= 3 who haven't completed a puzzle today
    const users = await User.find({
      currentStreak: { $gte: 3 },
      lastActivityDate: { $lt: today }, // Last activity was before today
    });

    logger.info(`[Email Triggers] Found ${users.length} users at risk of losing their streak`);

    for (const user of users) {
      if (!user.email) continue;

      await sendStreakWarningEmail({
        email: user.email,
        firstName: user.firstName || 'there',
        streakCount: user.currentStreak || 0,
      });
      
      logger.info(`[Email Triggers] Sent streak warning to ${user.email} (${user.currentStreak} day streak)`);
    }
  } catch (error) {
    logger.error('[Email Triggers] Error in checkAndSendStreakWarnings', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Send highest streak celebration email when a user breaks their personal record
 * Call this after updating a user's streak
 */
export async function checkAndSendHighestStreakEmail(userId: mongoose.Types.ObjectId) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    // Only send if current streak equals longest streak (meaning it's a new record)
    if (user.currentStreak && user.longestStreak && user.currentStreak === user.longestStreak && user.currentStreak >= 3) {
      await sendHighestStreakEverEmail({
        email: user.email,
        firstName: user.firstName || 'there',
        streakCount: user.currentStreak,
      });
      
      logger.info(`[Email Triggers] Sent highest streak email to ${user.email} (${user.currentStreak} days)`);
    }
  } catch (error) {
    logger.error('[Email Triggers] Error in checkAndSendHighestStreakEmail', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Check if user completed a Surah and send celebration email
 * Call this after a puzzle is completed
 */
export async function checkAndSendSurahCompletionEmail(userId: mongoose.Types.ObjectId, surahNumber: number) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    // Count completed puzzles for this surah (need to know how many puzzles per surah)
    // This is a simplified version - you'd need to know the exact number of ayahs per surah
    const surahAyahCounts: { [key: number]: number } = {
      1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
      // ... add all 114 surahs
      // For brevity, showing first 10
    };

    const completedInSurah = await UserProgress.countDocuments({
      userId,
      status: 'COMPLETED',
      // Note: You'd need to add surahNumber to UserProgress or calculate from puzzleId
    });

    const requiredCount = surahAyahCounts[surahNumber] || 0;
    
    if (completedInSurah >= requiredCount && requiredCount > 0) {
      // Get total surahs completed
      const totalSurahsCompleted = await calculateTotalSurahsCompleted(userId);
      
      // Get surah name (you'd have a mapping or API call)
      const surahNames: { [key: number]: string } = {
        1: 'Al-Fatiha', 2: 'Al-Baqarah', 3: 'Ali \'Imran', 4: 'An-Nisa', 5: 'Al-Ma\'idah',
        // ... add all
      };
      
      const surahName = surahNames[surahNumber] || `Surah ${surahNumber}`;

      await sendSurahCompletionEmail({
        email: user.email,
        firstName: user.firstName || 'there',
        surahName,
        surahNumber,
        totalSurahsCompleted,
      });
      
      logger.info(`[Email Triggers] Sent surah completion email to ${user.email} (${surahName})`);
    }
  } catch (error) {
    logger.error('[Email Triggers] Error in checkAndSendSurahCompletionEmail', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Check if user completed a Juz and send celebration email
 */
export async function checkAndSendJuzCompletionEmail(userId: mongoose.Types.ObjectId, juzNumber: number) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    // Similar logic to Surah completion
    // You'd need to track Juz completion in your database
    
    const totalJuzCompleted = 1; // Calculate this based on your data

    await sendJuzCompletionEmail({
      email: user.email,
      firstName: user.firstName || 'there',
      juzNumber,
      totalJuzCompleted,
    });
    
    logger.info(`[Email Triggers] Sent juz completion email to ${user.email} (Juz ${juzNumber})`);
  } catch (error) {
    logger.error('[Email Triggers] Error in checkAndSendJuzCompletionEmail', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Send welcome email when a user subscribes
 * Call this from the Stripe webhook when subscription is created
 */
export async function sendWelcomeMemberEmail(userId: mongoose.Types.ObjectId) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    await sendWelcomeNewMemberEmail({
      email: user.email,
      firstName: user.firstName || 'there',
      subscriptionPlan: user.subscriptionPlan || 'monthly',
    });
    
    logger.info(`[Email Triggers] Sent welcome member email to ${user.email}`);
  } catch (error) {
    logger.error('[Email Triggers] Error in sendWelcomeMemberEmail', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Send monthly progress reports to all active users
 * Run this on the 1st of each month
 */
export async function sendMonthlyProgressReports() {
  try {
    await connectDB();
    
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Find all active users
    const activeUsers = await User.find({
      subscriptionStatus: { $in: ['active', 'trialing'] },
      lastActivityDate: { $gte: lastMonth }, // Active in the last month
    });

    logger.info(`[Email Triggers] Sending monthly reports to ${activeUsers.length} users`);

    for (const user of activeUsers) {
      if (!user.email) continue;

      // Calculate stats for last month
      const puzzlesCompleted = await UserProgress.countDocuments({
        userId: user._id,
        status: 'COMPLETED',
        completedAt: { $gte: lastMonth, $lt: thisMonth },
      });

      // Get other stats (simplified - you'd calculate these properly)
      const stats = {
        puzzlesCompleted,
        longestStreak: user.longestStreak || 0,
        surahsCompleted: 0, // Calculate based on your data
        juzCompleted: 0, // Calculate based on your data
        newAchievements: 0, // Track this in your UserAchievement model
      };

      await sendMonthlyProgressEmail({
        email: user.email,
        firstName: user.firstName || 'there',
        stats,
      });
      
      logger.info(`[Email Triggers] Sent monthly progress to ${user.email}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    logger.error('[Email Triggers] Error in sendMonthlyProgressReports', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Helper function to calculate total surahs completed
 */
async function calculateTotalSurahsCompleted(userId: mongoose.Types.ObjectId): Promise<number> {
  // This is a simplified version
  // You'd need to implement proper logic based on your data structure
  return 0;
}

export default {
  checkAndSendMembershipReminders,
  checkAndSendTrialReminders,
  checkAndSendStreakWarnings,
  checkAndSendHighestStreakEmail,
  checkAndSendSurahCompletionEmail,
  checkAndSendJuzCompletionEmail,
  sendWelcomeMemberEmail,
  sendMonthlyProgressReports,
};

