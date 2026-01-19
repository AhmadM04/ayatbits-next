'use client';

import { useState } from 'react';

interface User {
  _id: string;
  email: string;
  clerkIds?: string[];
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  hasDirectAccess?: boolean;
  subscriptionEndDate?: string;
  trialEndsAt?: string;
  createdAt?: string;
}

interface SearchResult {
  success: boolean;
  query: string;
  exactMatch: User | null;
  similarUsers: User[];
}

interface DuplicateUser {
  id: string;
  email: string;
  clerkIds?: string[];
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  hasDirectAccess?: boolean;
  createdAt?: string;
}

interface DuplicatesResult {
  success: boolean;
  duplicateEmails: Array<{
    _id: string;
    count: number;
    users: DuplicateUser[];
  }>;
  usersWithoutClerkIds: User[];
}

export default function UserDebugTools() {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [duplicatesResult, setDuplicatesResult] = useState<DuplicatesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'duplicates'>('search');

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/search?email=${encodeURIComponent(searchEmail)}`);
      const data = await res.json();
      setSearchResult(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindDuplicates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/duplicates');
      const data = await res.json();
      setDuplicatesResult(data);
    } catch (error) {
      console.error('Duplicates error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Search Users
        </button>
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'duplicates'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Find Duplicates
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter email to search..."
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchEmail.trim()}
              className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResult && (
            <div className="space-y-4">
              {searchResult.exactMatch ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-green-400 mb-3">Exact Match Found</h3>
                  <UserCard user={searchResult.exactMatch} />
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-400">
                  No exact match found for &quot;{searchResult.query}&quot;
                </div>
              )}

              {searchResult.similarUsers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Similar Users ({searchResult.similarUsers.length})</h3>
                  <div className="space-y-3">
                    {searchResult.similarUsers.map((user) => (
                      <UserCard key={user._id} user={user} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Duplicates Tab */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <button
            onClick={handleFindDuplicates}
            disabled={loading}
            className="px-6 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Find Duplicate Users'}
          </button>

          {duplicatesResult && (
            <div className="space-y-6">
              {/* Duplicate Emails */}
              {duplicatesResult.duplicateEmails.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-red-400 mb-3">
                    Duplicate Emails ({duplicatesResult.duplicateEmails.length})
                  </h3>
                  <div className="space-y-4">
                    {duplicatesResult.duplicateEmails.map((dup) => (
                      <div key={dup._id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="font-medium text-red-400 mb-3">
                          Email: {dup._id} ({dup.count} users)
                        </div>
                        <div className="space-y-3">
                          {dup.users.map((user) => (
                            <UserCard key={user.id} user={{ ...user, _id: user.id }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400">
                  No duplicate emails found
                </div>
              )}

              {/* Users without Clerk IDs */}
              {duplicatesResult.usersWithoutClerkIds.length > 0 && (
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-3">
                    Users Without Clerk IDs ({duplicatesResult.usersWithoutClerkIds.length})
                  </h3>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-3 text-yellow-400 text-sm">
                    These users were likely created by admin grants before the user signed up. They won&apos;t be able to log in until they sign up and their account is merged.
                  </div>
                  <div className="space-y-3">
                    {duplicatesResult.usersWithoutClerkIds.map((user) => (
                      <UserCard key={user._id} user={user} highlight="warning" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UserCard({ user, highlight }: { user: User; highlight?: 'warning' }) {
  const borderColor = highlight === 'warning' ? 'border-yellow-500/30' : 'border-white/10';
  
  return (
    <div className={`bg-white/5 border ${borderColor} rounded-lg p-3 text-sm`}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-gray-400">Email:</span>{' '}
          <span className="text-white font-medium">{user.email}</span>
        </div>
        <div>
          <span className="text-gray-400">Status:</span>{' '}
          <span className={`font-medium ${
            user.subscriptionStatus === 'active' ? 'text-green-400' : 'text-gray-400'
          }`}>
            {user.subscriptionStatus || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Plan:</span>{' '}
          <span className="text-white">{user.subscriptionPlan || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-400">Direct Access:</span>{' '}
          <span className={user.hasDirectAccess ? 'text-green-400' : 'text-gray-400'}>
            {user.hasDirectAccess ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400">Clerk IDs:</span>{' '}
          <span className={`text-white ${!user.clerkIds || user.clerkIds.length === 0 ? 'text-yellow-400' : ''}`}>
            {user.clerkIds && user.clerkIds.length > 0 ? user.clerkIds.join(', ') : 'None'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Created:</span>{' '}
          <span className="text-white">{new Date(user.createdAt || '').toLocaleDateString()}</span>
        </div>
        <div>
          <span className="text-gray-400">ID:</span>{' '}
          <span className="text-gray-400 text-xs font-mono">{user._id}</span>
        </div>
      </div>
    </div>
  );
}

