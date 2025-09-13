'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchGroups } from './actions';
import CreateGroupModal from '@/components/groups/CreateGroupModal';
import GroupGainzLogo from '@/components/ui/GroupGainzLogo';
import type { Group } from '@/lib/types';

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch groups on mount and when search term changes
  useEffect(() => {
    fetchGroups();
  }, [searchTerm]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const result = await searchGroups(searchTerm);
      
      if (result.success) {
        setGroups(result.data);
        setError('');
      } else {
        setError(result.error || 'Failed to load groups');
      }
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getMemberCount = (group: Group): number => {
    return group.group_members?.length || 0;
  };

  const getGoalName = (group: Group): string => {
    return group.goal?.name || 'No specific goal';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Logo */}
      <div className="gradient-surface border-b border-slate-600/50">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="flex items-center justify-center mb-6">
            <GroupGainzLogo size={48} showText={true} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-3">Discover Groups</h1>
            <p className="text-slate-300 text-lg">Find your fitness tribe and achieve more together</p>
          </div>
        </div>
      </div>

      {/* Search and Create */}
      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search groups by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth backdrop-blur-sm"
          />
        </div>

        {/* Create Group Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full gradient-primary text-white py-5 px-8 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all-smooth flex items-center justify-center space-x-3 group"
        >
          <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span>Create New Group</span>
        </button>
      </div>

      {/* Groups List */}
      <div className="max-w-md mx-auto px-6 pb-8">
        {/* Error State */}
        {error && (
          <div className="glass border border-red-500/30 rounded-2xl p-6 mb-6 bg-red-900/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-red-500/20 rounded-full">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-red-300">Something went wrong</h3>
            </div>
            <p className="text-sm text-red-200 mb-4">{error}</p>
            <button
              onClick={fetchGroups}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl text-sm font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-slate-600/50 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-600/30 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-16 bg-slate-600/50 rounded-full"></div>
                </div>
                <div className="h-4 bg-slate-600/30 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-600/30 rounded w-2/3 mb-4"></div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <div className="h-4 bg-slate-600/30 rounded w-16"></div>
                    <div className="h-4 bg-slate-600/30 rounded w-20"></div>
                  </div>
                  <div className="h-4 w-4 bg-slate-600/50 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && groups.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 gradient-surface rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No groups found</h3>
            <p className="text-slate-300 mb-6 text-lg">
              {searchTerm ? `No groups match "${searchTerm}"` : 'Be the first to create a group and start your fitness journey!'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl font-medium transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Groups Grid */}
        {!loading && groups.length > 0 && (
          <div className="space-y-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="glass rounded-2xl p-6 card-hover cursor-pointer group border border-slate-600/30"
                onClick={() => {
                  // Navigate to group detail page
                  router.push(`/dashboard/groups/${group.id}`);
                }}
              >
                {/* Group Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-xl leading-tight group-hover:gradient-text transition-all">
                      {group.name}
                    </h3>
                    <p className="text-sm text-blue-300 mt-2 font-medium">
                      {getGoalName(group)}
                    </p>
                  </div>
                  {group.fitness_level && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {group.fitness_level}
                    </span>
                  )}
                </div>

                {/* Description */}
                {group.description && (
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {group.description}
                  </p>
                )}

                {/* Group Stats */}
                <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-slate-600/50 rounded">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">{getMemberCount(group)} members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-slate-600/50 rounded">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">
                        {new Date(group.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-1 bg-blue-500/20 rounded group-hover:bg-blue-500/30 transition-colors">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Member Avatars Preview */}
                {group.group_members && group.group_members.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {group.group_members.slice(0, 4).map((member, index) => (
                        <div
                          key={member.user_id}
                          className="w-8 h-8 gradient-primary rounded-full border-2 border-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-lg"
                          title={member.user?.name}
                        >
                          {member.user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      ))}
                      {group.group_members.length > 4 && (
                        <div className="w-8 h-8 bg-slate-600/50 rounded-full border-2 border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                          +{group.group_members.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      Join the team →
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
