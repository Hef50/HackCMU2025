'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createGroup, getGoals } from '@/app/dashboard/groups/actions';
import type { Goal } from '@/lib/types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primaryGoalId: '',
    isPrivate: false,
  });

  // Fetch goals when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchGoals();
    }
  }, [isOpen]);

  const fetchGoals = async () => {
    try {
      const result = await getGoals();
      if (result.success) {
        setGoals(result.data);
      } else {
        setError(result.error || 'Failed to load goals');
      }
    } catch (err) {
      setError('Failed to load goals');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('primaryGoalId', formData.primaryGoalId);
      form.append('isPrivate', formData.isPrivate.toString());

      const result = await createGroup(form);
      
      if (result.success) {
        // Close modal and redirect to the new group
        onClose();
        router.push(`/dashboard/groups/${result.groupId}`);
      } else {
        setError(result.error || 'Failed to create group');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to create group');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      primaryGoalId: '',
      isPrivate: false,
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-600/50">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-600/30">
          <h2 className="text-2xl font-bold gradient-text">Create New Group</h2>
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

          {/* Group Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-white mb-3">
              Group Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth backdrop-blur-sm"
              placeholder="Enter group name"
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
              placeholder="Describe your group's purpose and goals"
              disabled={loading}
            />
          </div>

          {/* Primary Goal */}
          <div>
            <label htmlFor="primaryGoalId" className="block text-sm font-semibold text-white mb-3">
              Primary Goal
            </label>
            <select
              id="primaryGoalId"
              value={formData.primaryGoalId}
              onChange={(e) => setFormData({ ...formData, primaryGoalId: e.target.value })}
              className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all-smooth backdrop-blur-sm"
              disabled={loading}
            >
              <option value="" className="bg-slate-800 text-slate-400">Select a goal (optional)</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id} className="bg-slate-800 text-white">
                  {goal.name}
                </option>
              ))}
            </select>
          </div>

          {/* Private Toggle */}
          <div className="flex items-center justify-between p-4 glass rounded-2xl border border-slate-600/30">
            <div>
              <label htmlFor="isPrivate" className="block text-sm font-semibold text-white">
                Private Group
              </label>
              <p className="text-xs text-slate-400 mt-1">
                Private groups require approval to join
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all-smooth ${
                formData.isPrivate ? 'bg-blue-600' : 'bg-slate-600'
              }`}
              disabled={loading}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                  formData.isPrivate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Submit Button */}
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
              disabled={loading || !formData.name.trim()}
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
                'Create Group'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
