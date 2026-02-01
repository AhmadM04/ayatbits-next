import AdminForm from './AdminForm';
import WaitlistManagement from './WaitlistManagement';
import UserDebugTools from './UserDebugTools';
import VoucherManagement from './VoucherManagement';
import { grantPremiumAccess, type GrantDuration } from '@/app/actions/admin';
import { requireAdminUser } from '@/lib/dashboard-access';

// Force Node.js runtime for MongoDB/Mongoose support
export const runtime = 'nodejs';

type GrantFormState = {
  message?: string;
  error?: string;
  signUpUrl?: string;
};

async function grantAccessAction(_prevState: GrantFormState, formData: FormData): Promise<GrantFormState> {
  'use server';
  const email = formData.get('email')?.toString().trim();
  const duration = formData.get('duration') as GrantDuration | null;

  if (!email || !duration) {
    return { error: 'Email and duration are required.' };
  }

  const result = await grantPremiumAccess(email, duration);
  if (!result.success) {
    return { error: result.error || 'Failed to grant access.' };
  }

  return { 
    message: result.message || 'Access granted.',
    signUpUrl: result.signUpUrl 
  };
}

export default async function AdminPage() {
  await requireAdminUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage user access and waitlist signups</p>
        </div>

        {/* Grant Access Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Grant Premium Access</h2>
        <AdminForm action={grantAccessAction} />
        </section>

        {/* User Debug Tools Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">User Debug Tools</h2>
          <p className="text-gray-400 mb-4">Search for users and identify duplicate accounts</p>
          <UserDebugTools />
        </section>

        {/* Voucher Management Section */}
        <section>
          <VoucherManagement />
        </section>

        {/* Waitlist Management Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Waitlist Management</h2>
          <WaitlistManagement />
        </section>
      </div>
    </div>
  );
}
