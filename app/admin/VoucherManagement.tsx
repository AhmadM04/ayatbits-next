'use client';

import { useState, useEffect } from 'react';
import { Loader2, Gift, Plus, X } from 'lucide-react';

interface Voucher {
  _id: string;
  code: string;
  type: string;
  tier: 'basic' | 'pro';
  duration: number;
  maxRedemptions: number;
  redemptionCount: number;
  expiresAt: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [type, setType] = useState<'ramadan' | 'promo' | 'special'>('promo');
  const [tier, setTier] = useState<'basic' | 'pro'>('pro');
  const [duration, setDuration] = useState(1);
  const [maxRedemptions, setMaxRedemptions] = useState(100);
  const [expiresIn, setExpiresIn] = useState(30); // days
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/vouchers');
      if (response.ok) {
        const data = await response.json();
        setVouchers(data.vouchers || []);
      }
    } catch (error) {
      console.error('Failed to load vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      alert('Voucher code is required');
      return;
    }

    setCreating(true);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);

      const response = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          type,
          tier,
          duration,
          maxRedemptions,
          expiresAt: expiresAt.toISOString(),
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Voucher created successfully!');
        setShowCreateForm(false);
        resetForm();
        loadVouchers();
      } else {
        alert(data.error || 'Failed to create voucher');
      }
    } catch (error) {
      alert('Failed to create voucher');
    } finally {
      setCreating(false);
    }
  };

  const toggleVoucher = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/admin/vouchers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      });

      if (response.ok) {
        loadVouchers();
      } else {
        alert('Failed to update voucher');
      }
    } catch (error) {
      alert('Failed to update voucher');
    }
  };

  const resetForm = () => {
    setCode('');
    setType('promo');
    setTier('pro');
    setDuration(1);
    setMaxRedemptions(100);
    setExpiresIn(30);
    setDescription('');
  };

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Voucher Management</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors"
        >
          {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreateForm ? 'Cancel' : 'Create Voucher'}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={createVoucher} className="mb-6 p-6 bg-white/5 rounded-lg border border-purple-500/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Voucher Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="RAMADAN2026"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="promo">Promo</option>
                <option value="ramadan">Ramadan</option>
                <option value="special">Special</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as 'basic' | 'pro')}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (months)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min="1"
                max="12"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Redemptions
              </label>
              <input
                type="number"
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(parseInt(e.target.value))}
                min="1"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expires in (days)
              </label>
              <input
                type="number"
                value={expiresIn}
                onChange={(e) => setExpiresIn(parseInt(e.target.value))}
                min="1"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Special Ramadan offer"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Voucher
              </>
            )}
          </button>
        </form>
      )}

      {/* Vouchers List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        </div>
      ) : vouchers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No vouchers created yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vouchers.map((voucher) => (
            <div
              key={voucher._id}
              className={`p-4 rounded-lg border ${
                voucher.isActive
                  ? 'bg-white/5 border-white/10'
                  : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg font-mono font-bold">
                      {voucher.code}
                    </code>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      voucher.tier === 'pro'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {voucher.tier.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {voucher.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{voucher.duration} month(s)</span>
                    <span>
                      {voucher.redemptionCount} / {voucher.maxRedemptions} used
                    </span>
                    <span>Expires: {new Date(voucher.expiresAt).toLocaleDateString()}</span>
                  </div>
                  {voucher.description && (
                    <p className="text-sm text-gray-500 mt-1">{voucher.description}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleVoucher(voucher._id, voucher.isActive)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    voucher.isActive
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-green-600 hover:bg-green-500 text-white'
                  }`}
                >
                  {voucher.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


