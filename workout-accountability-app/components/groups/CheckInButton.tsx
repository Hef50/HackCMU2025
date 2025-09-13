'use client';

import { useState, useEffect, useTransition } from 'react';
import { performCheckIn } from '@/app/dashboard/groups/[groupId]/actions';
import UploadPhotoModal from '@/components/check-ins/UploadPhotoModal';
import type { Contract, WorkoutInstance } from '@/lib/types';

interface CheckInButtonProps {
  groupId: string;
  contract: Contract;
  upcomingWorkout?: WorkoutInstance;
  onCheckInSuccess?: () => void;
}

interface CheckInState {
  isActive: boolean;
  timeUntilActive?: number;
  timeUntilInactive?: number;
  currentWorkout?: WorkoutInstance;
}

export default function CheckInButton({ groupId, contract, upcomingWorkout, onCheckInSuccess }: CheckInButtonProps) {
  const [checkInState, setCheckInState] = useState<CheckInState>({ isActive: false });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [lastCheckInId, setLastCheckInId] = useState<string | null>(null);

  // Calculate check-in availability
  useEffect(() => {
    const calculateState = () => {
      if (!upcomingWorkout) {
        setCheckInState({ isActive: false });
        return;
      }

      const now = new Date();
      const workoutTime = new Date(upcomingWorkout.scheduled_at);
      const timeDiff = workoutTime.getTime() - now.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // Check-in is active from 15 minutes before to 15 minutes after
      const isActive = minutesDiff >= -15 && minutesDiff <= 15;

      if (isActive) {
        const timeUntilInactive = Math.max(0, 15 + minutesDiff);
        setCheckInState({
          isActive: true,
          timeUntilInactive: timeUntilInactive,
          currentWorkout: upcomingWorkout
        });
      } else if (minutesDiff > 15) {
        // Too early - show time until active
        const timeUntilActive = minutesDiff - 15;
        setCheckInState({
          isActive: false,
          timeUntilActive: timeUntilActive
        });
      } else {
        // Too late
        setCheckInState({ isActive: false });
      }
    };

    calculateState();
    const interval = setInterval(calculateState, 1000); // Update every second

    return () => clearInterval(interval);
  }, [upcomingWorkout]);

  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 1) {
      return 'Less than 1 minute';
    } else if (minutes < 60) {
      return `${Math.floor(minutes)} minute${Math.floor(minutes) !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.floor(minutes % 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
  };

  const requestLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          let message = 'Unable to get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied. Please enable location permissions and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const handleCheckIn = async () => {
    setError('');
    setSuccess('');
    setIsGettingLocation(true);

    try {
      const location = await requestLocation();
      setIsGettingLocation(false);

      startTransition(async () => {
        const result = await performCheckIn(location, groupId);
        
        if (result.success) {
          setSuccess(`Check-in successful! Status: ${result.status}`);
          // Disable the button by updating state
          setCheckInState(prev => ({ ...prev, isActive: false }));
          
          // Store the check-in ID and show upload modal
          if (result.data?.id) {
            setLastCheckInId(result.data.id);
            setShowUploadModal(true);
          }
          
          // Trigger parent callback
          onCheckInSuccess?.();
        } else {
          setError(result.error || 'Failed to check in');
        }
      });
    } catch (err) {
      setIsGettingLocation(false);
      setError(err instanceof Error ? err.message : 'Failed to get location');
    }
  };

  const getNextWorkoutInfo = () => {
    if (!upcomingWorkout) return null;

    const workoutDate = new Date(upcomingWorkout.scheduled_at);
    const isToday = workoutDate.toDateString() === new Date().toDateString();
    const isTomorrow = workoutDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

    let dayText = '';
    if (isToday) {
      dayText = 'Today';
    } else if (isTomorrow) {
      dayText = 'Tomorrow';
    } else {
      dayText = workoutDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }

    const timeText = workoutDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    
    return `${dayText} at ${timeText}`;
  };

  if (!upcomingWorkout) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Upcoming Workouts</h3>
        <p className="text-slate-400 text-sm">
          Check back during your scheduled workout times to check in.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Workout Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Next Workout</h3>
        <p className="text-slate-300">{getNextWorkoutInfo()}</p>
        <p className="text-slate-400 text-sm mt-1">{contract.location_name}</p>
      </div>

      {/* Check-in Status */}
      {checkInState.isActive ? (
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 font-medium">Check-in Available</span>
          </div>
          {checkInState.timeUntilInactive !== undefined && checkInState.timeUntilInactive > 0 && (
            <p className="text-slate-400 text-sm">
              Available for {formatTimeRemaining(checkInState.timeUntilInactive)}
            </p>
          )}
        </div>
      ) : checkInState.timeUntilActive !== undefined ? (
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-yellow-400 font-medium">Check-in Opens Soon</span>
          </div>
          <p className="text-slate-400 text-sm">
            Available in {formatTimeRemaining(checkInState.timeUntilActive)}
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-slate-500 rounded-full" />
            <span className="text-slate-400 font-medium">Check-in Unavailable</span>
          </div>
          <p className="text-slate-400 text-sm">
            Check-in is only available 15 minutes before and after workout time
          </p>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Check-in Button */}
      <button
        onClick={handleCheckIn}
        disabled={!checkInState.isActive || isGettingLocation || isPending || success !== ''}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
          checkInState.isActive && !success
            ? 'gradient-primary text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105'
            : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isGettingLocation ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Getting Location...</span>
          </div>
        ) : isPending ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Checking In...</span>
          </div>
        ) : success ? (
          <div className="flex items-center justify-center space-x-3">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-400">Checked In!</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Check In</span>
          </div>
        )}
      </button>

      {/* Location Permission Info */}
      {checkInState.isActive && !success && (
        <p className="text-slate-400 text-xs mt-3">
          Location access required for check-in verification
        </p>
      )}

      {/* Upload Photo Modal */}
      {lastCheckInId && (
        <UploadPhotoModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          checkInId={lastCheckInId}
          onSuccess={() => {
            setShowUploadModal(false);
            // Could trigger a refresh of the feed here
            onCheckInSuccess?.();
          }}
        />
      )}
    </div>
  );
}
