'use client';

import { useState } from 'react';
import LocationTracker from '@/components/check-ins/LocationTracker';
import GroupGainzLogo from '@/components/ui/GroupGainzLogo';

export default function LocationTrackerPage() {
  const [isTracking, setIsTracking] = useState(false);
  const [trackedLocations, setTrackedLocations] = useState<Array<{
    latitude: number;
    longitude: number;
    timestamp: Date;
  }>>([]);

  const handleLocationUpdate = (location: { latitude: number; longitude: number }) => {
    setTrackedLocations(prev => [...prev, {
      ...location,
      timestamp: new Date()
    }]);
  };

  const clearHistory = () => {
    setTrackedLocations([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="gradient-surface border-b border-slate-600/50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center mb-6">
            <GroupGainzLogo size={48} showText={true} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-3">Location Tracker</h1>
            <p className="text-slate-300 text-lg">Accountability verification for workout check-ins</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Location Tracker */}
          <div>
            <LocationTracker 
              onLocationUpdate={handleLocationUpdate}
              isTracking={isTracking}
            />
          </div>

          {/* Tracking History */}
          <div className="glass rounded-2xl p-6 border border-slate-600/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Tracking History</h3>
                  <p className="text-sm text-slate-400">{trackedLocations.length} locations recorded</p>
                </div>
              </div>
              
              {trackedLocations.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-all"
                >
                  Clear
                </button>
              )}
            </div>

            {trackedLocations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-white mb-2">No locations tracked yet</h4>
                <p className="text-slate-400">Enable location tracking to see your workout locations here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trackedLocations.slice(-10).reverse().map((location, index) => (
                  <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        Location #{trackedLocations.length - index}
                      </span>
                      <span className="text-xs text-slate-400">
                        {location.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-400">Latitude</span>
                        <p className="text-white font-mono text-sm">{location.latitude.toFixed(6)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Longitude</span>
                        <p className="text-white font-mono text-sm">{location.longitude.toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-full">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Secure & Private</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Your location data is encrypted and only shared with your workout group members for verification purposes.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-full">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Real-time Verification</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Automatic location verification ensures workout accountability and prevents false check-ins.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-full">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Instant Updates</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Get instant location updates every 30 seconds when tracking is active for accurate workout verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
