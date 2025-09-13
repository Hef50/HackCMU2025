'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GroupGainzLogo from '@/components/ui/GroupGainzLogo';
import MiniNotificationSystem from '@/components/notifications/MiniNotificationSystem';
import type { Group } from '@/lib/types';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.groupId as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Mock group data
  const mockGroups: Group[] = [
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
          role: 'Admin' as const,
          joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'mock-user-1',
            name: 'Sarah Chen',
            email: 'sarah@example.com',
            has_completed_tutorial: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        },
        {
          group_id: 'mock-group-1',
          user_id: 'mock-user-2',
          role: 'Member' as const,
          joined_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'mock-user-2',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            has_completed_tutorial: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        },
        {
          group_id: 'mock-group-1',
          user_id: 'mock-user-3',
          role: 'Member' as const,
          joined_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'mock-user-3',
            name: 'Emma Davis',
            email: 'emma@example.com',
            has_completed_tutorial: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      ]
    },
    {
      id: 'mock-group-2',
      name: 'Power Lifters United',
      description: 'Serious strength training group focused on progressive overload and proper form. All levels welcome!',
      fitness_level: 'Advanced' as const,
      is_private: false,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      goal: {
        id: 'mock-goal-2',
        name: 'Muscle Building'
      },
      group_members: [
        {
          group_id: 'mock-group-2',
          user_id: 'mock-user-4',
          role: 'Admin' as const,
          joined_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'mock-user-4',
            name: 'Alex Rodriguez',
            email: 'alex@example.com',
            has_completed_tutorial: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        },
        {
          group_id: 'mock-group-2',
          user_id: 'mock-user-5',
          role: 'Member' as const,
          joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'mock-user-5',
            name: 'Jordan Kim',
            email: 'jordan@example.com',
            has_completed_tutorial: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate loading and find the group
    setTimeout(() => {
      const foundGroup = mockGroups.find(g => g.id === groupId);
      if (foundGroup) {
        setGroup(foundGroup);
        setIsJoined(Math.random() > 0.5); // Randomly join some groups
      }
      setLoading(false);
    }, 1000);
  }, [groupId]);

  const handleJoinGroup = () => {
    setIsJoined(true);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleLeaveGroup = () => {
    setIsJoined(false);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleCheckIn = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-full flex items-center justify-center animate-pulse">
            <GroupGainzLogo size={32} showText={false} />
          </div>
          <p className="text-slate-300">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Group Not Found</h2>
          <p className="text-slate-300 mb-6">The group you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard/groups')}
            className="px-6 py-3 gradient-primary text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/25 transition-all"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mini Notifications */}
      <MiniNotificationSystem 
        show={showNotification}
        message={isJoined ? "Successfully joined group!" : "Left group successfully!"}
        type="success"
      />

      {/* Header */}
      <div className="gradient-surface border-b border-slate-600/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/dashboard/groups')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Groups</span>
            </button>
            <GroupGainzLogo size={32} showText={false} />
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-4xl font-bold gradient-text">{group.name}</h1>
                {group.fitness_level && (
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {group.fitness_level}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-lg mb-4">{group.description}</p>
              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{group.group_members?.length || 0} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                </div>
                {group.goal && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{group.goal.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              {isJoined ? (
                <>
                  <button
                    onClick={handleCheckIn}
                    className="px-6 py-3 gradient-primary text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/25 transition-all-smooth"
                  >
                    Check In
                  </button>
                  <button
                    onClick={handleLeaveGroup}
                    className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl font-semibold transition-all"
                  >
                    Leave Group
                  </button>
                </>
              ) : (
                <button
                  onClick={handleJoinGroup}
                  className="px-6 py-3 gradient-primary text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/25 transition-all-smooth"
                >
                  Join Group
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="glass rounded-2xl p-6 border border-slate-600/30">
              <h2 className="text-xl font-bold text-white mb-4">Group Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="text-2xl font-bold text-blue-400">5</div>
                  <div className="text-xs text-blue-300">Active Members</div>
                </div>
                <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="text-2xl font-bold text-green-400">12</div>
                  <div className="text-xs text-green-300">Workouts This Week</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <div className="text-2xl font-bold text-purple-400">85%</div>
                  <div className="text-xs text-purple-300">Attendance Rate</div>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">7</div>
                  <div className="text-xs text-yellow-300">Day Streak</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6 border border-slate-600/30">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { user: 'Sarah Chen', action: 'checked in', time: '2 hours ago', type: 'checkin' },
                  { user: 'Mike Johnson', action: 'joined the group', time: '1 day ago', type: 'join' },
                  { user: 'Emma Davis', action: 'completed workout', time: '2 days ago', type: 'workout' },
                  { user: 'Alex Rodriguez', action: 'shared a photo', time: '3 days ago', type: 'photo' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-slate-400 text-xs">{activity.time}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'checkin' ? 'bg-green-400' :
                      activity.type === 'join' ? 'bg-blue-400' :
                      activity.type === 'workout' ? 'bg-purple-400' : 'bg-yellow-400'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <div className="glass rounded-2xl p-6 border border-slate-600/30">
              <h3 className="text-lg font-bold text-white mb-4">Members</h3>
              <div className="space-y-3">
                {group.group_members?.map((member) => (
                  <div key={member.user_id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {member.user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{member.user?.name}</p>
                      <p className="text-slate-400 text-xs">{member.role}</p>
                    </div>
                    {member.role === 'Admin' && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6 border border-slate-600/30">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 rounded-xl transition-all text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="text-white">Group Chat</span>
                  </div>
                </button>
                
                <button className="w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 rounded-xl transition-all text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-white">Create Contract</span>
                  </div>
                </button>
                
                <button className="w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 rounded-xl transition-all text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-white">View Stats</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}