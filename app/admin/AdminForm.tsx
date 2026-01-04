/* Client component for admin grant form */
'use client';

import { useActionState, useState } from 'react';
import { Copy, Check } from 'lucide-react';

type GrantFormState = {
  message?: string;
  error?: string;
  signUpUrl?: string;
};

type Props = {
  action: (_prevState: GrantFormState, formData: FormData) => Promise<GrantFormState>;
};

export default function AdminForm({ action }: Props) {
  const [state, formAction] = useActionState(action, { message: '', error: '' });
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <div className="space-y-3">
          <div className="text-sm text-green-400">{state.message}</div>
          
          {state.signUpUrl && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <label className="block text-xs text-gray-400 mb-2">
                Sign-up Link (send this to the user):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={state.signUpUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(state.signUpUrl!)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors flex items-center gap-2"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                The user must sign up using this email. If they use Google/OAuth, make sure they select the correct email address.
              </p>
            </div>
          )}
        </div>
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

