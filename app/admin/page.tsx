import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // TODO: Add admin role check here
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-gray-400">
          Admin functionality coming soon.
        </p>
      </div>
    </div>
  );
}
