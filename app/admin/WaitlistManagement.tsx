'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Users, Mail, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WaitlistEntry {
  _id: string;
  email: string;
  source: string;
  interests: string[];
  status: string;
  createdAt: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
  };
}

interface WaitlistStats {
  total: number;
  pending: number;
  contacted: number;
  converted: number;
}

export default function WaitlistManagement() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats>({ total: 0, pending: 0, contacted: 0, converted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'converted'>('all');

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const fetchWaitlistData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/waitlist');
      
      if (!response.ok) {
        throw new Error('Failed to fetch waitlist data');
      }

      const data = await response.json();
      setEntries(data.entries || []);
      setStats(data.stats || { total: 0, pending: 0, contacted: 0, converted: 0 });
    } catch (err) {
      console.error('Error fetching waitlist:', err);
      setError('Failed to load waitlist data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/waitlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh data
      await fetchWaitlistData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ['Email', 'Source', 'Status', 'Interests', 'Signed Up At'],
      ...entries.map(entry => [
        entry.email,
        entry.source,
        entry.status,
        entry.interests.join('; '),
        new Date(entry.createdAt).toLocaleDateString(),
      ]),
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ayatbits-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredEntries = entries.filter(entry => 
    filter === 'all' ? true : entry.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading waitlist data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/5 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-400">Total Signups</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/5 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-400">Pending</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.pending}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/5 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-400">Contacted</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.contacted}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] border border-white/5 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-400">Converted</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.converted}</div>
        </motion.div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex gap-2">
          {['all', 'pending', 'contacted', 'converted'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <Button
          onClick={exportToCSV}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Entries Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Source</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No entries found
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{entry.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{entry.source}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        entry.status === 'contacted' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={entry.status}
                        onChange={(e) => updateStatus(entry._id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


