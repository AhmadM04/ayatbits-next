import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function MushafNotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-gray-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">
          The Quran page you're looking for doesn't exist. 
          Valid pages are 1-604.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/mushaf/page/1"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Go to Page 1
          </Link>
          
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}


