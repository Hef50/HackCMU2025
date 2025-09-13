'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GroupGainzLogo from '@/components/ui/GroupGainzLogo';
import MiniNotificationSystem from '@/components/notifications/MiniNotificationSystem';
import type { Group } from '@/lib/types';

export default function MyGroupsPage() {
  const router = useRouter();
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // Mock joined groups data
  const mockJoinedGroups: Group[] = [
    {
      id: 'mock-group-1',
      name: 'Morning Runners',
      description: 'Early morning running group for all fitness levels. We meet at 6 AM every weekday for a 5K run around the park.',
      fitness_level: 'Beginner' as const,
      is_private: false,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      goal: {
        id: 'mock-goal-1',
        name: 'Weight Loss'
      },
      group_members: [
        {
          group_id: 'mock-group-1',
          user_id: 'mock-user-1',
          role: 'Member' as const,
          joined_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'mock-user-1',
            name: 'You',
            email: 'you@example.com',
            has_completed_tutorial: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      ]
    },
    {
      id: 'mock-group-3',
      name: 'Yoga Flow Warriors',
      description: 'Daily yoga practice for flexibility, strength, and mindfulness. Perfect for stress relief and recovery.',
      fitness_level: 'Intermediate' as const,
      is_private: false,
      created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      goal: {
        id: 'mock-goal-4',
        name: 'Flexibility'
      },
      group_members: [
        {
          group_id: 'mock-group-3',
          user_id: 'mock-user-1',
          role: 'Member' as const,
          joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'mock-user-1',
            name: 'You',
            email: 'you@example.com',
            has_completed_tutorial: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      ]
    },
    {
      id: 'mock-group-5',
      name: 'Weekend Warriors',
      description: 'Saturday morning outdoor adventures and Sunday recovery sessions. Hiking, cycling, and more!',
      fitness_level: 'Intermediate' as const,
      is_private: false,
      created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      goal: {
        id: 'mock-goal-1',
        name: 'Weight Loss'
      },
      group_members: [
        {
          group_id: 'mock-group-5',
          user_id: 'mock-user-1',
          role: 'Admin' as const,
          joined_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'mock-user-1',
            name: 'You',
            email: 'you@example.com',
            has_completed_tutorial: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setJoinedGroups(mockJoinedGroups);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCheckIn = (groupId: string, groupName: string) => {
    setNotificationMessage(`Checked in to ${groupName}!`);
    setNotificationType('success');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleLeaveGroup = (groupId: string, groupName: string) => {
    setJoinedGroups(prev => prev.filter(g => g.id !== groupId));
    setNotificationMessage(`Left ${groupName}`);
    setNotificationType('info');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const getMemberCount = (group: Group): number => {
    return group.group_members?.length || 0;
  };

  const getGoalName = (group: Group): string => {
    return group.goal?.name || 'No specific goal';
  };

  const getMyRole = (group: Group): string => {
    const myMember = group.group_members?.find(m => m.user?.name === 'You');
    return myMember?.role || 'Member';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mini Notifications */}
      <MiniNotificationSystem 
        show={showNotification}
        message={notificationMessage}
        type={notificationType}
      />

      {/* Header */}
      <div className="gradient-surface border-b border-slate-600/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center mb-6">
            <GroupGainzLogo size={48} showText={true} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-3">My Groups</h1>
            <p className="text-slate-300 text-lg">Your fitness communities and accountability partners</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-slate-600/30 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{joinedGroups.length}</div>
            <div className="text-slate-300">Groups Joined</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-slate-600/30 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">12</div>
            <div className="text-slate-300">Check-ins This Week</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-slate-600/30 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">85%</div>
            <div className="text-slate-300">Attendance Rate</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-slate-600/30 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">7</div>
            <div className="text-slate-300">Day Streak</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Your Groups</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/dashboard/groups')}
              className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl font-semibold transition-all"
            >
              Discover More
            </button>
            <button
              onClick={() => router.push('/dashboard/groups/actions')}
              className="px-6 py-3 gradient-primary text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/25 transition-all-smooth"
            >
              Create Group
            </button>
          </div>
        </div>

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
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && joinedGroups.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 gradient-surface rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No groups joined yet</h3>
            <p className="text-slate-300 mb-6 text-lg">
              Join your first fitness group to start your accountability journey!
            </p>
            <button
              onClick={() => router.push('/dashboard/groups')}
              className="px-6 py-3 gradient-primary text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/25 transition-all-smooth"
            >
              Explore Groups
            </button>
          </div>
        )}

        {/* Groups List */}
        {!loading && joinedGroups.length > 0 && (
          <div className="space-y-6">
            {joinedGroups.map((group) => (
              <div
                key={group.id}
                className="glass rounded-2xl p-6 border border-slate-600/30"
              >
                {/* Group Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-white text-xl leading-tight">
                        {group.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        getMyRole(group) === 'Admin' 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}>
                        {getMyRole(group)}
                      </span>
                    </div>
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
                        Joined {new Date(group.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-600/30">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => router.push(`/dashboard/groups/${group.id}`)}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-all"
                    >
                      View Group
                    </button>
                    <button
                      onClick={() => handleCheckIn(group.id, group.name)}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg text-sm font-medium transition-all"
                    >
                      Check In
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 rounded-lg text-sm transition-all">
                      Chat
                    </button>
                    <button
                      onClick={() => handleLeaveGroup(group.id, group.name)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-sm transition-all"
                    >
                      Leave
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
