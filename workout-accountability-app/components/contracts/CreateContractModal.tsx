'use client';

import { useState, useEffect } from 'react';
import { createContract } from '@/app/dashboard/contracts/actions';
import type { Contract, PunishmentType } from '@/lib/types';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export default function CreateContractModal({ isOpen, onClose, groupId }: CreateContractModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: '5', // workouts per week
    timeOfDay: 'Morning',
    daysOfWeek: [] as number[],
    punishmentType: 'monetary' as PunishmentType,
    punishmentAmount: '10',
    punishmentDescription: '',
    contractDuration: '4', // weeks
    stakeAmount: '25'
  });

  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const daysOfWeek = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
  ];

  const punishmentTypes = [
    { value: 'monetary', label: 'Monetary Penalty', icon: '💰', description: 'Pay a fine for missed workouts' },
    { value: 'challenge', label: 'Physical Challenge', icon: '🧊', description: 'Complete a physical challenge' },
    { value: 'social', label: 'Social Media', icon: '📱', description: 'Post embarrassing content' },
    { value: 'service', label: 'Community Service', icon: '🤝', description: 'Volunteer for a good cause' },
    { value: 'diet', label: 'Dietary Restriction', icon: '🍕', description: 'Give up favorite food/drink' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const contractData = {
        ...formData,
        daysOfWeek: selectedDays,
        groupId
      };

      const result = await createContract(contractData);
      
      if (result.success) {
        onClose();
        // Reset form
        setFormData({
          name: '',
          description: '',
          frequency: '5',
          timeOfDay: 'Morning',
          daysOfWeek: [],
          punishmentType: 'monetary',
          punishmentAmount: '10',
          punishmentDescription: '',
          contractDuration: '4',
          stakeAmount: '25'
        });
        setSelectedDays([]);
      } else {
        setError(result.error || 'Failed to create contract');
      }
    } catch (err) {
      setError('Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(day => day !== dayValue)
        : [...prev, dayValue]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frequency: '5',
      timeOfDay: 'Morning',
      daysOfWeek: [],
      punishmentType: 'monetary',
      punishmentAmount: '10',
      punishmentDescription: '',
      contractDuration: '4',
      stakeAmount: '25'
    });
    setSelectedDays([]);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-600/50">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-600/30">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Create Accountability Contract</h2>
            <p className="text-slate-400 mt-1">Set stakes and consequences for your fitness goals</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-600/50 rounded-full transition-colors"
            disabled={loading}
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Error message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Contract Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-white mb-3">
              Contract Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth backdrop-blur-sm"
              placeholder="e.g., 5-Day Workout Challenge"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-white mb-3">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth resize-none backdrop-blur-sm"
              placeholder="Describe your fitness commitment and goals"
              disabled={loading}
            />
          </div>

          {/* Workout Schedule */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="frequency" className="block text-sm font-semibold text-white mb-3">
                Workouts Per Week *
              </label>
              <select
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth backdrop-blur-sm"
                disabled={loading}
              >
                <option value="1">1 workout</option>
                <option value="2">2 workouts</option>
                <option value="3">3 workouts</option>
                <option value="4">4 workouts</option>
                <option value="5">5 workouts</option>
                <option value="6">6 workouts</option>
                <option value="7">7 workouts</option>
              </select>
            </div>

            <div>
              <label htmlFor="timeOfDay" className="block text-sm font-semibold text-white mb-3">
                Preferred Time *
              </label>
              <select
                id="timeOfDay"
                value={formData.timeOfDay}
                onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth backdrop-blur-sm"
                disabled={loading}
              >
                <option value="Morning">Morning (6-9 AM)</option>
                <option value="Afternoon">Afternoon (12-3 PM)</option>
                <option value="Evening">Evening (6-9 PM)</option>
              </select>
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Workout Days *
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedDays.includes(day.value)
                      ? 'bg-blue-600 text-white border border-blue-500'
                      : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-600/50'
                  }`}
                  disabled={loading}
                >
                  {day.short}
                </button>
              ))}
            </div>
            {selectedDays.length === 0 && (
              <p className="text-red-400 text-sm mt-2">Please select at least one day</p>
            )}
          </div>

          {/* Contract Duration & Stake */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contractDuration" className="block text-sm font-semibold text-white mb-3">
                Contract Duration (weeks) *
              </label>
              <select
                id="contractDuration"
                value={formData.contractDuration}
                onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
                className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth backdrop-blur-sm"
                disabled={loading}
              >
                <option value="1">1 week</option>
                <option value="2">2 weeks</option>
                <option value="4">4 weeks</option>
                <option value="8">8 weeks</option>
                <option value="12">12 weeks</option>
              </select>
            </div>

            <div>
              <label htmlFor="stakeAmount" className="block text-sm font-semibold text-white mb-3">
                Initial Stake Amount ($) *
              </label>
              <input
                type="number"
                id="stakeAmount"
                value={formData.stakeAmount}
                onChange={(e) => setFormData({ ...formData, stakeAmount: e.target.value })}
                className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth backdrop-blur-sm"
                placeholder="25"
                min="1"
                max="1000"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Punishment Type */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Punishment Type *
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              {punishmentTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, punishmentType: type.value as PunishmentType })}
                  className={`p-4 rounded-2xl border transition-all text-left ${
                    formData.punishmentType === type.value
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                  disabled={loading}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{type.icon}</span>
                    <span className="font-semibold">{type.label}</span>
                  </div>
                  <p className="text-sm opacity-75">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Punishment Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="punishmentAmount" className="block text-sm font-semibold text-white mb-3">
                {formData.punishmentType === 'monetary' ? 'Penalty Amount ($)' : 'Penalty Level'}
              </label>
              {formData.punishmentType === 'monetary' ? (
                <input
                  type="number"
                  id="punishmentAmount"
                  value={formData.punishmentAmount}
                  onChange={(e) => setFormData({ ...formData, punishmentAmount: e.target.value })}
                  className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth backdrop-blur-sm"
                  placeholder="10"
                  min="1"
                  max="100"
                  required
                  disabled={loading}
                />
              ) : (
                <select
                  id="punishmentAmount"
                  value={formData.punishmentAmount}
                  onChange={(e) => setFormData({ ...formData, punishmentAmount: e.target.value })}
                  className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth backdrop-blur-sm"
                  disabled={loading}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="extreme">Extreme</option>
                </select>
              )}
            </div>

            <div>
              <label htmlFor="punishmentDescription" className="block text-sm font-semibold text-white mb-3">
                Custom Punishment Description
              </label>
              <input
                type="text"
                id="punishmentDescription"
                value={formData.punishmentDescription}
                onChange={(e) => setFormData({ ...formData, punishmentDescription: e.target.value })}
                className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth backdrop-blur-sm"
                placeholder="e.g., Ice bucket challenge, No social media for 24h"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-4 border border-slate-600/50 text-slate-300 rounded-2xl hover:bg-slate-700/50 transition-all-smooth font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || selectedDays.length === 0}
              className="flex-1 px-6 py-4 gradient-primary text-white rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all-smooth font-bold flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Contract'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
