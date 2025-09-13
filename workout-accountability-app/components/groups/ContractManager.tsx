'use client';

import { useState, useTransition } from 'react';
import { createContract } from '@/app/dashboard/groups/[groupId]/actions';
import type { Contract } from '@/lib/types';

interface ContractManagerProps {
  contract?: Contract;
  groupId: string;
  isAdmin: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
];

export default function ContractManager({ contract, groupId, isAdmin }: ContractManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [time, setTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [rules, setRules] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedDays.length === 0) {
      setError('Please select at least one day');
      return;
    }

    if (!time || !locationName) {
      setError('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    selectedDays.forEach(day => formData.append('days', day.toString()));
    formData.append('time', time);
    formData.append('location_name', locationName);
    if (rules) formData.append('rules', rules);

    startTransition(async () => {
      const result = await createContract(formData, groupId);
      
      if (result.success) {
        setShowModal(false);
        setSelectedDays([]);
        setTime('');
        setLocationName('');
        setRules('');
        // Refresh the page to show the new contract
        window.location.reload();
      } else {
        setError(result.error || 'Failed to create contract');
      }
    });
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const formatSchedule = (schedule: Contract['schedule']) => {
    const dayNames = schedule.days
      .sort()
      .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.short)
      .join(', ');
    
    const timeFormatted = new Date(`2000-01-01T${schedule.time}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
    
    return `${dayNames} at ${timeFormatted}`;
  };

  // If contract exists, display it
  if (contract) {
    return (
      <div className="glass rounded-3xl p-6 border border-slate-600/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Workout Contract</h2>
          <div className="px-3 py-1 bg-green-500/10 text-green-300 rounded-lg text-sm font-semibold">
            Active
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Schedule</h3>
            <p className="text-white">{formatSchedule(contract.schedule)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Location</h3>
            <p className="text-white">{contract.location_name}</p>
          </div>
          
          {contract.rules && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-1">Rules</h3>
              <p className="text-white text-sm leading-relaxed">{contract.rules}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If no contract and user is not admin, show message
  if (!isAdmin) {
    return (
      <div className="glass rounded-3xl p-6 border border-slate-600/50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No Contract Yet</h2>
          <p className="text-slate-400 text-sm">
            Your group admin needs to create a workout contract to get started with check-ins.
          </p>
        </div>
      </div>
    );
  }

  // If no contract and user is admin, show create contract button
  return (
    <>
      <div className="glass rounded-3xl p-6 border border-slate-600/50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Create Workout Contract</h2>
          <p className="text-slate-400 text-sm mb-6">
            Set up your group's workout schedule and location to enable check-ins.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            Create Contract
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-3xl p-6 border border-slate-600/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Contract</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Days Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Workout Days *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`p-3 rounded-xl font-medium transition-all ${
                        selectedDays.includes(day.value)
                          ? 'gradient-primary text-white shadow-lg'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Workout Time *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                />
              </div>

              {/* Location Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g., Campus Gym, Central Park"
                  required
                  className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                />
              </div>

              {/* Rules Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rules (Optional)
                </label>
                <textarea
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="Any specific rules or guidelines for the workout..."
                  rows={3}
                  className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 p-3 bg-slate-800/50 text-slate-300 rounded-xl font-medium hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 gradient-primary text-white p-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Creating...' : 'Create Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
