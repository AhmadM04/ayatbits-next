/* Client component for admin grant form */
'use client';

import { useActionState } from 'react';

type GrantFormState = {
  message?: string;
  error?: string;
};

type Props = {
  action: (_prevState: GrantFormState, formData: FormData) => Promise<GrantFormState>;
};

export default function AdminForm({ action }: Props) {
  const [state, formAction] = useActionState(action, { message: '', error: '' });

  return (
    <form action={formAction} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          User Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="user@example.com"
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium mb-2">
          Access Duration
        </label>
        <select
          id="duration"
          name="duration"
          required
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="lifetime">Lifetime</option>
          <option value="1_year">1 Year</option>
          <option value="6_months">6 Months</option>
          <option value="3_months">3 Months</option>
          <option value="1_month">1 Month</option>
          <option value="revoke">Revoke Access</option>
        </select>
      </div>

      {state.error ? (
        <div className="text-sm text-red-400">{state.error}</div>
      ) : null}
      {state.message ? (
        <div className="text-sm text-green-400">{state.message}</div>
      ) : null}

      <button
        type="submit"
        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
      >
        Grant Access
      </button>
    </form>
  );
}

