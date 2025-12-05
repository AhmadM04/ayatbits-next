'use client';

import { useState } from 'react';
import { grantPremiumAccess, revokePremiumAccess } from '@/app/actions/admin';
import { currentUser } from '@clerk/nextjs/server';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'grant' | 'revoke'>('grant');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const result = action === 'grant' 
      ? await grantPremiumAccess(email)
      : await revokePremiumAccess(email);

    if (result.success) {
      setStatus({ msg: result.message!, type: 'success' });
      setEmail('');
    } else {
      setStatus({ msg: result.error!, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-xl mx-auto border border-white/10 rounded-xl p-6 bg-[#111]">
        <h1 className="text-2xl font-bold mb-2">👑 Admin: Grant/Revoke Access</h1>
        <p className="text-sm text-gray-400 mb-6">
          Grant or revoke premium access to users by email
        </p>
        
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setAction('grant')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              action === 'grant'
                ? 'bg-green-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Grant Access
          </button>
          <button
            type="button"
            onClick={() => setAction('revoke')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              action === 'revoke'
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Revoke Access
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">User Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-green-500 outline-none"
              placeholder="user@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3 rounded-lg disabled:opacity-50 transition-colors ${
              action === 'grant'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {loading ? 'Processing...' : action === 'grant' ? 'Grant Lifetime Premium' : 'Revoke Premium Access'}
          </button>
        </form>

        {status && (
          <div className={`mt-4 p-4 rounded-lg ${
            status.type === 'success' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {status.msg}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500">
            Note: Only users with admin email configured in ADMIN_EMAILS environment variable can use this page.
          </p>
        </div>
      </div>
    </div>
  );
}
