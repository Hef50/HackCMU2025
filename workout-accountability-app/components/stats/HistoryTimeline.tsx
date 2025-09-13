'use client';

import { useState } from 'react';

interface HistoryEntry {
  id: string;
  checked_in_at: string;
  status: 'OnTime' | 'Late' | 'Missed';
  image_url?: string;
  latitude?: number;
  longitude?: number;
  user: {
    id: string;
    name: string;
    email: string;
    profile_image_url?: string;
  };
  workout_instance: {
    scheduled_at: string;
    group: {
      name: string;
    };
  };
  kudos: Array<{
    id: string;
    giver: {
      name: string;
    };
  }>;
}

interface HistoryTimelineProps {
  history: HistoryEntry[];
  currentUserId: string;
  groupId: string;
}

export default function HistoryTimeline({ history, currentUserId, groupId }: HistoryTimelineProps) {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else if (diffInMinutes < 10080) { // 7 days
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OnTime':
        return 'bg-green-500/10 text-green-300 border-green-500/20';
      case 'Late':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
      case 'Missed':
        return 'bg-red-500/10 text-red-300 border-red-500/20';
      default:
        return 'bg-slate-600/50 text-slate-300';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No History Yet</h3>
        <p className="text-slate-400 text-sm">
          Start checking in to build your group's memory lane!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {history.map((entry, index) => (
        <div key={entry.id} className="relative">
          {/* Timeline Line */}
          {index < history.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-16 bg-slate-600/30" />
          )}
          
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="relative">
              {entry.user.profile_image_url ? (
                <img
                  src={entry.user.profile_image_url}
                  alt={entry.user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                />
              ) : (
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center border-2 border-slate-600">
                  <span className="text-white font-semibold text-sm">
                    {getInitials(entry.user.name)}
                  </span>
                </div>
              )}
              
              {/* Status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-slate-800 flex items-center justify-center ${
                entry.status === 'OnTime' ? 'bg-green-500' :
                entry.status === 'Late' ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="glass rounded-2xl p-4 border border-slate-600/50">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-white">{entry.user.name}</h4>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">{formatTime(entry.checked_in_at)}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(entry.checked_in_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Photo */}
                {entry.image_url && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <img
                      src={entry.image_url}
                      alt={`${entry.user.name}'s workout`}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        Scheduled: {new Date(entry.workout_instance.scheduled_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    {entry.latitude && entry.longitude && (
                      <div className="flex items-center space-x-1 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs">Location verified</span>
                      </div>
                    )}
                  </div>

                  {/* Kudos */}
                  {entry.kudos.length > 0 && (
                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-600/30">
                      <span className="text-sm text-slate-400">🎉</span>
                      <div className="flex -space-x-1">
                        {entry.kudos.slice(0, 3).map((kudo) => (
                          <div
                            key={kudo.id}
                            className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-700 flex items-center justify-center"
                            title={kudo.giver.name}
                          >
                            <span className="text-xs text-slate-300">
                              {getInitials(kudo.giver.name)}
                            </span>
                          </div>
                        ))}
                        {entry.kudos.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-700 flex items-center justify-center">
                            <span className="text-xs text-slate-300">
                              +{entry.kudos.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-slate-400">
                        {entry.kudos.length} kudo{entry.kudos.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Load More Button */}
      {history.length >= 50 && (
        <div className="text-center pt-4">
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            Load More History
          </button>
        </div>
      )}
    </div>
  );
}
