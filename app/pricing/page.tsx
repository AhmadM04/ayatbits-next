import { Suspense } from 'react';
import PricingContent from './PricingContent';
import PricingRedirect from './PricingRedirect';
import { Loader2 } from 'lucide-react';

function PricingLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-green-500" />
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <PricingRedirect />
      <Suspense fallback={<PricingLoading />}>
        <PricingContent />
      </Suspense>
    </>
  );
}
