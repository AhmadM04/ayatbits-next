'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BypassUser {
  email: string;
  name?: string;
  hasBypass: boolean;
  bypassReason?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<BypassUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/bypass');
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setUsers(data.users || []);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddBypass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason }),
      });
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        setEmail('');
        setReason('');
        fetchUsers();
      }
    } catch (err) {
      alert('Failed to add bypass');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveBypass = async (userEmail: string) => {
    if (!confirm(`Remove bypass for ${userEmail}?`)) return;

    try {
      const response = await fetch('/api/admin/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, action: 'remove' }),
      });
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        fetchUsers();
      }
    } catch (err) {
      alert('Failed to remove bypass');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <h1 className="text-lg font-semibold">Admin - Bypass Users</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Add Bypass Form */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Add Bypass User</h2>
          <form onSubmit={handleAddBypass} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Reason (optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Beta tester, Influencer, etc."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
              />
            </div>
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Bypass
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-3">
            Note: User must have signed up first before adding bypass.
          </p>
        </div>

        {/* Bypass Users List */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-lg font-semibold">Bypass Users ({users.length})</h2>
          </div>
          
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No bypass users yet
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {users.map((user) => (
                <div key={user.email} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    {user.name && <p className="text-sm text-gray-400">{user.name}</p>}
                    {user.bypassReason && (
                      <p className="text-xs text-green-500 mt-1">{user.bypassReason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveBypass(user.email)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

