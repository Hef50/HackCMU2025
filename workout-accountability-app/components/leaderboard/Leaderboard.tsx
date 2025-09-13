'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  streak: number;
  checkIns: number;
  group: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  badges: string[];
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          id: 'user-1',
          name: 'Sarah Chen',
          avatar: 'SC',
          score: 2450,
          rank: 1,
          streak: 28,
          checkIns: 45,
          group: 'Morning Runners',
          level: 'diamond',
          badges: ['🔥', '💪', '🏆', '⭐']
        },
        {
          id: 'user-2',
          name: 'Mike Johnson',
          avatar: 'MJ',
          score: 2380,
          rank: 2,
          streak: 21,
          checkIns: 42,
          group: 'Power Lifters',
          level: 'platinum',
          badges: ['💪', '🏆', '⭐']
        },
        {
          id: 'user-3',
          name: 'Emma Davis',
          avatar: 'ED',
          score: 2290,
          rank: 3,
          streak: 18,
          checkIns: 38,
          group: 'Yoga Flow',
          level: 'platinum',
          badges: ['💪', '🏆']
        },
        {
          id: 'user-4',
          name: 'Alex Rodriguez',
          avatar: 'AR',
          score: 2150,
          rank: 4,
          streak: 15,
          checkIns: 35,
          group: 'Weekend Warriors',
          level: 'gold',
          badges: ['💪']
        },
        {
          id: 'user-5',
          name: 'Jordan Kim',
          avatar: 'JK',
          score: 2080,
          rank: 5,
          streak: 12,
          checkIns: 32,
          group: 'HIIT Squad',
          level: 'gold',
          badges: ['💪']
        },
        {
          id: 'user-6',
          name: 'You',
          avatar: 'YO',
          score: 1950,
          rank: 6,
          streak: 7,
          checkIns: 28,
          group: 'Morning Runners',
          level: 'silver',
          badges: ['💪']
        },
        {
          id: 'user-7',
          name: 'Taylor Swift',
          avatar: 'TS',
          score: 1820,
          rank: 7,
          streak: 9,
          checkIns: 25,
          group: 'Yoga Flow',
          level: 'silver',
          badges: []
        },
        {
          id: 'user-8',
          name: 'Chris Wilson',
          avatar: 'CW',
          score: 1750,
          rank: 8,
          streak: 6,
          checkIns: 22,
          group: 'Power Lifters',
          level: 'bronze',
          badges: []
        }
      ];

      setLeaderboard(mockLeaderboard);
      setLoading(false);
    }, 1000);
  }, [timeframe]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'diamond': return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
      case 'platinum': return 'text-gray-300 bg-gray-500/20 border-gray-500/30';
      case 'gold': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'silver': return 'text-slate-300 bg-slate-500/20 border-slate-500/30';
      case 'bronze': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 border border-slate-600/30">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-600/50 rounded-lg w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-600/50 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-600/50 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-slate-600/30 rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-slate-600/50 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 border border-slate-600/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/20 rounded-full">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
            <p className="text-sm text-slate-400">Most committed members</p>
          </div>
        </div>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'all')}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.slice(0, 3).length > 0 && (
        <div className="flex justify-center items-end space-x-4 mb-6 p-4 bg-slate-800/30 rounded-xl">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <div key={entry.id} className="text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                'bg-gradient-to-br from-orange-400 to-orange-600'
              }`}>
                {entry.avatar}
              </div>
              <div className="text-xs font-medium text-white mb-1">{entry.name}</div>
              <div className="text-xs text-slate-400">{entry.score} pts</div>
              <div className="text-2xl">{getRankIcon(entry.rank)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.map((entry) => (
          <div
            key={entry.id}
            className={`p-4 rounded-xl border transition-all ${
              entry.name === 'You' 
                ? 'bg-blue-500/10 border-blue-500/30' 
                : 'bg-slate-800/50 border-slate-600/30 hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(entry.rank)}`}>
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {entry.avatar}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={`font-semibold ${entry.name === 'You' ? 'text-blue-300' : 'text-white'}`}>
                    {entry.name}
                  </h4>
                  {entry.name === 'You' && (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                      You
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${getLevelColor(entry.level)}`}>
                    {entry.level}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span>{entry.group}</span>
                  <span>•</span>
                  <span>{entry.streak} day streak</span>
                  <span>•</span>
                  <span>{entry.checkIns} check-ins</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-lg font-bold text-white">{entry.score.toLocaleString()}</div>
                <div className="text-xs text-slate-400">points</div>
              </div>

              {/* Badges */}
              {entry.badges.length > 0 && (
                <div className="flex space-x-1">
                  {entry.badges.map((badge, index) => (
                    <span key={index} className="text-lg" title={`Badge ${index + 1}`}>
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Your Position Summary */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-300 mb-1">Your Position</h4>
            <p className="text-sm text-slate-300">
              You're ranked #{leaderboard.find(e => e.name === 'You')?.rank || 'N/A'} out of {leaderboard.length} members
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-300">
              {leaderboard.find(e => e.name === 'You')?.score.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-slate-400">your points</div>
          </div>
        </div>
      </div>
    </div>
  );
}
