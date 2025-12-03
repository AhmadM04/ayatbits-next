import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, Surah, Puzzle, UserProgress, User } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function SurahPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const surahNumber = parseInt(number);
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  await connectDB();

  // Find or create user
  let dbUser = await User.findOne({ clerkId: user.id });
  if (!dbUser) {
    dbUser = await User.create({
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.fullName,
      imageUrl: user.imageUrl,
    });
  }

  const surah = await Surah.findOne({ number: surahNumber }).lean() as any;

  if (!surah) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Surah not found</h1>
          <Link href="/dashboard" className="text-green-600 hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const puzzles = await Puzzle.find({ surahId: surah._id }).lean();

  // Get user progress for puzzles in this surah
  const puzzleIds = puzzles.map((p: any) => p._id);
  const userProgress = await UserProgress.find({
    userId: dbUser._id,
    puzzleId: { $in: puzzleIds },
  }).lean();

  const progressMap = new Map(
    userProgress.map((p: any) => [p.puzzleId.toString(), p.status === 'COMPLETED'])
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{surah.nameEnglish}</h1>
              <p className="text-lg text-gray-700">{surah.nameArabic}</p>
              <p className="text-sm text-gray-600">{puzzles.length} puzzles available</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {puzzles.map((puzzle: any) => {
            const isCompleted = progressMap.get(puzzle._id.toString()) || false;
            const content = puzzle.content as { ayahText?: string };
            const preview = content.ayahText?.substring(0, 50) || '';

            return (
              <Link
                key={puzzle._id.toString()}
                href={`/puzzle/${puzzle._id.toString()}`}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Puzzle {puzzle._id.toString().slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{preview}...</p>
                  </div>
                  {isCompleted && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {puzzle.difficulty || 'Medium'} • {isCompleted ? 'Completed' : 'Not started'}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

