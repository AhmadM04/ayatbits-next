'use client';

import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();

  const handleReload = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-600/30 to-gray-700/30 flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">
          You're Offline
        </h1>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          It looks like you've lost your internet connection. 
          Please check your network and try again.
        </p>
        
        <Button
          onClick={handleReload}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-3"
        >
          Try Again
        </Button>
        
        <p className="text-gray-500 text-sm mt-6">
          Previously visited pages may still be available
        </p>
      </div>
    </div>
  );
}

