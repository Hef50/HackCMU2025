'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database, Penalty, Notification } from '@/lib/types';

interface WeeklySummaryProps {
  groupId: string;
  currentUserId: string;
}

interface WeeklyData {
  penalties: (Penalty & { user: { name: string; profile_image_url?: string } })[];
  notifications: (Notification & { user: { name: string; profile_image_url?: string } })[];
  weeklyStats: {
    totalMembers: number;
    membersWithPenalties: number;
    averagePoints: number;
    weekStart: string;
    weekEnd: string;
  };
}

export default function WeeklySummary({ groupId, currentUserId }: WeeklySummaryProps) {
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchWeeklyData();
  }, [groupId]);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      
      // Get current week boundaries
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Sunday
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Saturday
      weekEnd.setHours(23, 59, 59, 999);

      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      // Fetch penalties for this week
      const { data: penalties, error: penaltiesError } = await supabase
        .from('penalties')
        .select(`
          *,
          user:users(name, profile_image_url)
        `)
        .eq('group_id', groupId)
        .eq('week_start_date', weekStartStr);

      if (penaltiesError) {
        console.error('Error fetching penalties:', penaltiesError);
        setError('Failed to load penalties');
        return;
      }

      // Fetch notifications for this week
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select(`
          *,
          user:users(name, profile_image_url)
        `)
        .eq('group_id', groupId)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())
        .order('created_at', { ascending: false });

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
        setError('Failed to load notifications');
        return;
      }

      // Calculate weekly stats
      const { data: groupMembers } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      const totalMembers = groupMembers?.length || 0;
      const membersWithPenalties = penalties?.length || 0;

      // Calculate average points for the week
      const { data: weeklyPoints } = await supabase
        .from('point_transactions')
        .select('user_id, points')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      const userPoints = new Map<string, number>();
      weeklyPoints?.forEach(transaction => {
        const current = userPoints.get(transaction.user_id) || 0;
        userPoints.set(transaction.user_id, current + transaction.points);
      });

      const totalPoints = Array.from(userPoints.values()).reduce((sum, points) => sum + points, 0);
      const averagePoints = totalMembers > 0 ? Math.round(totalPoints / totalMembers) : 0;

      setData({
        penalties: penalties || [],
        notifications: notifications || [],
        weeklyStats: {
          totalMembers,
          membersWithPenalties,
          averagePoints,
          weekStart: weekStartStr,
          weekEnd: weekEndStr
        }
      });

    } catch (err) {
      console.error('Fetch weekly data error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatWeekRange = (weekStart: string, weekEnd: string) => {
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    
    const startStr = start.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="glass rounded-3xl p-6 border border-slate-600/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700/50 rounded-xl mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700/30 rounded-lg w-full"></div>
            <div className="h-4 bg-slate-700/30 rounded-lg w-3/4"></div>
            <div className="h-4 bg-slate-700/30 rounded-lg w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-3xl p-6 border border-red-500/20">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Unable to Load Summary</h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="glass rounded-3xl p-6 border border-slate-600/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Weekly Summary</h3>
          <p className="text-slate-400 text-sm">
            Week of {formatWeekRange(data.weeklyStats.weekStart, data.weeklyStats.weekEnd)}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{data.weeklyStats.totalMembers}</div>
          <div className="text-xs text-slate-400">Total Members</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{data.weeklyStats.averagePoints}</div>
          <div className="text-xs text-slate-400">Avg Points</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-300">{data.weeklyStats.membersWithPenalties}</div>
          <div className="text-xs text-slate-400">Penalties</div>
        </div>
      </div>

      {/* Penalties Section */}
      {data.penalties.length > 0 ? (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>Weekly Penalties</span>
          </h4>
          <div className="space-y-3">
            {data.penalties.map((penalty) => (
              <div key={penalty.id} className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {penalty.user.profile_image_url ? (
                      <img
                        src={penalty.user.profile_image_url}
                        alt={penalty.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {getInitials(penalty.user.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-white">{penalty.user.name}</h5>
                      <div className="text-sm text-red-300">
                        {penalty.points_earned}/{penalty.point_threshold} pts
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm italic">"{penalty.penalty_message}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-500/5 border border-green-500/20 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white">No Penalties This Week!</h4>
              <p className="text-slate-400 text-sm">Everyone met their point threshold. Great job!</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      {data.notifications.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-white mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v2H4a2 2 0 01-2-2V7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v6" />
            </svg>
            <span>Recent Notifications</span>
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="p-3 bg-slate-800/30 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v2H4a2 2 0 01-2-2V7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-white text-sm">{notification.title}</h5>
                    <p className="text-slate-400 text-xs mt-1">{notification.message}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(notification.created_at).toLocaleDateString([], { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
