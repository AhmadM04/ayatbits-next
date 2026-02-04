import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { checkProAccess, findUserRobust } from '@/lib/subscription';
import { generateAiTafsir } from '@/lib/ai-tafsir-generator';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 10; // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Debug logging
    console.log('=== AI Tafsir API Called ===');
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    
    // 1. Check if Gemini is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('AI not initialized - API key missing');
      return NextResponse.json(
        { error: 'AI service not configured - API key missing' },
        { status: 503 }
      );
    }

    // 2. Authenticate user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 3. Check subscription (Pro only - AI Tafsir requires Pro tier)
    await connectDB();
    
    // Use robust user lookup that handles admin-granted access by email
    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    const dbUser = await findUserRobust(user.id, userEmail);
    
    if (!dbUser) {
      console.error('User not found in database', {
        clerkId: user.id,
        email: userEmail,
      });
      return NextResponse.json(
        { error: 'User not found. Please try signing out and back in.' },
        { status: 404 }
      );
    }

    const hasPro = checkProAccess(dbUser);
    if (!hasPro) {
      console.log('Pro access denied for user', {
        clerkId: user.id,
        email: dbUser.email,
        hasDirectAccess: dbUser.hasDirectAccess,
        subscriptionTier: dbUser.subscriptionTier,
        subscriptionStatus: dbUser.subscriptionStatus,
        subscriptionPlan: dbUser.subscriptionPlan,
      });
      return NextResponse.json(
        { 
          error: 'AI Tafsir is only available for Pro subscribers. Upgrade to Pro to access this feature.',
          requiresPro: true,
          featureName: 'AI Tafsir'
        },
        { status: 403 }
      );
    }

    // 4. Rate limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in an hour (10 requests/hour limit).' },
        { status: 429 }
      );
    }

    // 5. Parse and validate request
    const body = await req.json();
    const { surahNumber, ayahNumber, ayahText, translation, translationCode, targetLanguage } = body;

    if (!surahNumber || !ayahNumber || !ayahText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the reusable generator function
    const targetLang = targetLanguage || translationCode || 'en';
    const result = await generateAiTafsir({
      surahNumber,
      ayahNumber,
      ayahText,
      translation,
      targetLanguage: targetLang,
    });

    // Get language name for response
    const languageNames: Record<string, string> = {
      'en': 'English', 'en.sahih': 'English', 'en.pickthall': 'English', 'en.yusufali': 'English',
      'ar': 'Arabic', 'ar.jalalayn': 'Arabic', 'ar.tafseer': 'Arabic',
      'ru': 'Russian', 'ru.kuliev': 'Russian',
      'tr': 'Turkish', 'tr.yazir': 'Turkish',
      'ur': 'Urdu', 'ur.maududi': 'Urdu',
      'id': 'Indonesian', 'id.muntakhab': 'Indonesian',
      'ms': 'Malay', 'ms.basmeih': 'Malay',
      'bn': 'Bengali', 'bn.hoque': 'Bengali',
      'hi': 'Hindi', 'hi.hindi': 'Hindi',
      'fr': 'French', 'fr.hamidullah': 'French',
      'de': 'German', 'de.bubenheim': 'German',
      'es': 'Spanish', 'es.cortes': 'Spanish',
      'zh': 'Chinese', 'zh.chinese': 'Chinese',
      'ja': 'Japanese', 'ja.japanese': 'Japanese',
      'nl': 'Dutch', 'nl.dutch': 'Dutch',
    };
    const targetLanguageName = languageNames[targetLang] || 'English';

    // Return tafsir
    return NextResponse.json({
      tafsir: result.tafsirText,
      source: result.source,
      disclaimer: result.source.includes('Ibn Kathir')
        ? `This is an AI translation of Tafsir Ibn Kathir. Please consult traditional scholars for authoritative guidance.`
        : 'This is AI-generated content. Please consult traditional scholars for authoritative guidance.',
      originalSource: result.source.includes('Ibn Kathir') ? 'Tafsir Ibn Kathir (Arabic)' : null,
      translatedTo: targetLanguageName,
      surahNumber,
      ayahNumber,
      cached: result.cached,
      model: result.model,
    });

  } catch (error: any) {
    console.error('AI Tafsir Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      statusText: error.statusText,
    });
    
    // Handle Gemini-specific errors
    if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'AI service configuration error. Please check API key.' },
        { status: 503 }
      );
    }

    if (error.message?.includes('billing') || error.message?.includes('BILLING')) {
      return NextResponse.json(
        { error: 'Gemini API billing not enabled. Please enable billing in Google Cloud Console.' },
        { status: 503 }
      );
    }

    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Failed to generate tafsir: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

