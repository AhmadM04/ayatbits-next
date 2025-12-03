'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, UserPlus, Trash2, Loader2, Shield, AlertCircle, Crown } from 'lucide-react';
import Link from 'next/link';

interface BypassUser {
  email: string;
  name?: string;
  hasBypass: boolean;
  bypassReason?: string;
  createdAt: string;
}

interface AdminUser {
  email: string;
  name?: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [bypassUsers, setBypassUsers] = useState<BypassUser[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isLoaded) {
      checkAdminStatus();
    }
  }, [isLoaded]);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/admin/check');
      const data = await res.json();
      setIsAdmin(data.isAdmin);
      if (data.isAdmin) {
        fetchBypassUsers();
        fetchAdmins();
      }
      setIsFetching(false);
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsFetching(false);
    }
  };

  const fetchBypassUsers = async () => {
    try {
      const res = await fetch('/api/admin/bypass');
      const data = await res.json();
      if (data.success) {
        setBypassUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch bypass users:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/manage');
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  };

  const handleAddBypass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), reason: reason.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setEmail('');
        setReason('');
        fetchBypassUsers();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add bypass' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBypass = async (userEmail: string) => {
    if (!confirm(`Remove bypass for ${userEmail}?`)) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, action: 'remove' }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchBypassUsers();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove bypass' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim(), action: 'grant' }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setAdminEmail('');
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to grant admin access' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAdmin = async (userEmail: string) => {
    if (!confirm(`Revoke admin access for ${userEmail}?`)) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, action: 'revoke' }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to revoke admin access' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isFetching) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">You don't have admin privileges.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <h1 className="text-lg font-semibold">Admin Panel</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Grant Admin Access Form */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Grant Admin Access
          </h2>
          
          <form onSubmit={handleGrantAdmin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                required
              />
              <p className="text-xs text-gray-500 mt-1">User must have signed up first</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !adminEmail.trim()}
              className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Grant Admin Access
                </>
              )}
            </button>
          </form>
        </div>

        {/* Admins List */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Admins ({admins.length})
          </h2>
          
          {admins.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No admins found</p>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.email}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <p className="font-medium">{admin.email}</p>
                  </div>
                  <button
                    onClick={() => handleRevokeAdmin(admin.email)}
                    disabled={isLoading}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Revoke admin access"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Bypass Form */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-500" />
            Grant Bypass Access
          </h2>
          
          <form onSubmit={handleAddBypass} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                required
              />
              <p className="text-xs text-gray-500 mt-1">User must have signed up first</p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Reason (optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Family member, Beta tester"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Grant Access
                </>
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Bypass Users List */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Users with Bypass ({bypassUsers.length})
          </h2>
          
          {bypassUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bypass users yet</p>
          ) : (
            <div className="space-y-3">
              {bypassUsers.map((user) => (
                <div
                  key={user.email}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                >
                  <div>
                    <p className="font-medium">{user.email}</p>
                    {user.bypassReason && (
                      <p className="text-sm text-gray-500">{user.bypassReason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveBypass(user.email)}
                    disabled={isLoading}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove bypass"
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
