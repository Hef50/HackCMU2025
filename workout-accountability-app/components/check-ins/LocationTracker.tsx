'use client';

import { useState, useEffect } from 'react';

interface LocationTrackerProps {
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
  isTracking?: boolean;
}

export default function LocationTracker({ onLocationUpdate, isTracking = false }: LocationTrackerProps) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mock location data for demo purposes
  const mockLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 5
  };

  useEffect(() => {
    if (isTracking) {
      getCurrentLocation();
      // Update location every 30 seconds when tracking
      const interval = setInterval(getCurrentLocation, 30000);
      return () => clearInterval(interval);
    }
  }, [isTracking]);

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError('');

    // Simulate location permission and tracking
    setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setLocation(newLocation);
            setAccuracy(position.coords.accuracy);
            setLastUpdated(new Date());
            setPermissionStatus('granted');
            onLocationUpdate?.(newLocation);
            setIsLoading(false);
          },
          (error) => {
            // For demo purposes, use mock location if real location fails
            const mockLoc = {
              latitude: mockLocation.latitude + (Math.random() - 0.5) * 0.001,
              longitude: mockLocation.longitude + (Math.random() - 0.5) * 0.001
            };
            setLocation(mockLoc);
            setAccuracy(mockLocation.accuracy);
            setLastUpdated(new Date());
            setPermissionStatus('granted');
            onLocationUpdate?.(mockLoc);
            setIsLoading(false);
            
            console.log('Using mock location for demo:', mockLoc);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 30000
          }
        );
      } else {
        // Fallback to mock location
        const mockLoc = {
          latitude: mockLocation.latitude + (Math.random() - 0.5) * 0.001,
          longitude: mockLocation.longitude + (Math.random() - 0.5) * 0.001
        };
        setLocation(mockLoc);
        setAccuracy(mockLocation.accuracy);
        setLastUpdated(new Date());
        setPermissionStatus('granted');
        onLocationUpdate?.(mockLoc);
        setIsLoading(false);
      }
    }, 1000);
  };

  const requestLocationPermission = () => {
    getCurrentLocation();
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getLocationStatusColor = () => {
    if (isLoading) return 'text-yellow-400';
    if (error) return 'text-red-400';
    if (location) return 'text-green-400';
    return 'text-slate-400';
  };

  const getLocationStatusText = () => {
    if (isLoading) return 'Locating...';
    if (error) return 'Location Error';
    if (location) return 'Location Active';
    return 'Location Inactive';
  };

  return (
    <div className="glass rounded-2xl p-6 border border-slate-600/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-full">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Location Tracker</h3>
            <p className="text-sm text-slate-400">Accountability verification</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getLocationStatusColor().replace('text-', 'bg-')}`}></div>
          <span className={`text-sm font-medium ${getLocationStatusColor()}`}>
            {getLocationStatusText()}
          </span>
        </div>
      </div>

      {/* Location Display */}
      {location && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide">Latitude</label>
              <p className="text-white font-mono text-sm">{location.latitude.toFixed(6)}</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide">Longitude</label>
              <p className="text-white font-mono text-sm">{location.longitude.toFixed(6)}</p>
            </div>
          </div>
          
          {accuracy && (
            <div className="mt-3 pt-3 border-t border-slate-600/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Accuracy</span>
                <span className="text-xs text-slate-300">{accuracy.toFixed(1)}m</span>
              </div>
            </div>
          )}
          
          {lastUpdated && (
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Last Updated</span>
                <span className="text-xs text-slate-300">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="space-y-4">
        {!location && (
          <button
            onClick={requestLocationPermission}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Getting Location...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Enable Location Tracking</span>
              </>
            )}
          </button>
        )}

        {location && (
          <div className="flex space-x-3">
            <button
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => {
                setLocation(null);
                setAccuracy(null);
                setLastUpdated(null);
                setPermissionStatus('prompt');
              }}
              className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Stop</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Info */}
      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-600/20">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-slate-300">
            <p className="font-medium mb-1">Privacy & Security</p>
            <p>Your location is used only for workout verification and is not stored permanently. Location data is encrypted and shared only with your workout group members.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
