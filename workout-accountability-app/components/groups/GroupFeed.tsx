'use client';

import { useState, useTransition } from 'react';
import { giveKudosToCheckIn } from '@/app/dashboard/groups/[groupId]/actions';
import type { CheckIn, Kudos, User } from '@/lib/types';

interface CheckInWithDetails extends CheckIn {
  user: User;
  workout_instance: {
    scheduled_at: string;
  };
  kudos: (Kudos & { giver: User })[];
}

interface GroupFeedProps {
  checkIns: CheckInWithDetails[];
  currentUserId: string;
  onKudosUpdate?: () => void;
}

export default function GroupFeed({ checkIns, currentUserId, onKudosUpdate }: GroupFeedProps) {
  const [isPending, startTransition] = useTransition();

  const handleGiveKudos = async (checkInId: string, receiverId: string) => {
    startTransition(async () => {
      const result = await giveKudosToCheckIn(checkInId, receiverId);
      
      if (result.success) {
        // Trigger a refresh of the feed data
        onKudosUpdate?.();
      } else {
        console.error('Failed to give kudos:', result.error);
        // You could show a toast notification here
      }
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime())) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
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

  const hasUserGivenKudos = (checkIn: CheckInWithDetails) => {
    return checkIn.kudos.some(kudo => kudo.giver_id === currentUserId);
  };

  if (checkIns.length === 0) {
    return (
      <div className="glass rounded-3xl p-8 border border-slate-600/50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Check-ins Yet</h3>
          <p className="text-slate-400 text-sm">
            Be the first to check in and share your workout with the group!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checkIns.map((checkIn) => (
        <div key={checkIn.id} className="glass rounded-3xl p-6 border border-slate-600/50">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* Profile Picture */}
              {checkIn.user.profile_image_url ? (
                <img
                  src={checkIn.user.profile_image_url}
                  alt={checkIn.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {checkIn.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-white">{checkIn.user.name}</h3>
                <p className="text-slate-400 text-sm">{formatTime(checkIn.checked_in_at)}</p>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(checkIn.status)}`}>
              {checkIn.status}
            </div>
          </div>

          {/* Photo */}
          {checkIn.image_url && (
            <div className="mb-4 rounded-2xl overflow-hidden">
              <img
                src={checkIn.image_url}
                alt={`${checkIn.user.name}'s workout`}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Workout Info */}
          <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Scheduled: {new Date(checkIn.workout_instance.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Checked in at {new Date(checkIn.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Kudos Section */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-600/30">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleGiveKudos(checkIn.id, checkIn.user_id)}
                disabled={isPending || hasUserGivenKudos(checkIn) || checkIn.user_id === currentUserId}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  hasUserGivenKudos(checkIn)
                    ? 'bg-blue-500/20 text-blue-300 cursor-not-allowed'
                    : checkIn.user_id === currentUserId
                    ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-blue-500/10 hover:text-blue-300'
                }`}
              >
                <span className="text-lg">🎉</span>
                <span>
                  {hasUserGivenKudos(checkIn) ? 'Kudos Given!' : 'Give Kudos'}
                </span>
              </button>
              
              {checkIn.kudos.length > 0 && (
                <div className="flex items-center space-x-1 text-slate-400">
                  <span className="text-sm">{checkIn.kudos.length}</span>
                  <span className="text-xs">
                    {checkIn.kudos.length === 1 ? 'kudo' : 'kudos'}
                  </span>
                </div>
              )}
            </div>

            {/* Kudos Givers */}
            {checkIn.kudos.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex -space-x-2">
                  {checkIn.kudos.slice(0, 3).map((kudo) => (
                    <div
                      key={kudo.id}
                      className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-700 flex items-center justify-center"
                      title={kudo.giver.name}
                    >
                      <span className="text-xs text-slate-300">
                        {kudo.giver.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {checkIn.kudos.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-700 flex items-center justify-center">
                      <span className="text-xs text-slate-300">
                        +{checkIn.kudos.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
