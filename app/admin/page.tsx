import AdminForm from './AdminForm';
import { grantPremiumAccess, type GrantDuration } from '@/app/actions/admin';
import { requireAdminUser } from '@/lib/dashboard-access';

type GrantFormState = {
  message?: string;
  error?: string;
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

  return { message: result.message || 'Access granted.' };
}

export default async function AdminPage() {
  await requireAdminUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        <AdminForm action={grantAccessAction} />
      </div>
    </div>
  );
}
