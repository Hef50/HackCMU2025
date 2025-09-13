'use client';

import { useState, useTransition } from 'react';
import { updateContractStatus } from '@/app/dashboard/groups/[groupId]/actions';

interface AdminControlsProps {
  groupId: string;
  contractStatus: 'Active' | 'Paused';
  onStatusUpdate?: () => void;
}

export default function AdminControls({ groupId, contractStatus, onStatusUpdate }: AdminControlsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    isOpen: boolean;
    action: 'pause' | 'resume';
  }>({
    isOpen: false,
    action: 'pause'
  });

  const handleStatusChange = (newStatus: 'Active' | 'Paused') => {
    setShowConfirmDialog({
      isOpen: true,
      action: newStatus === 'Paused' ? 'pause' : 'resume'
    });
  };

  const confirmStatusChange = () => {
    setError(null);
    setSuccess(null);

    const newStatus = showConfirmDialog.action === 'pause' ? 'Paused' : 'Active';

    startTransition(async () => {
      const result = await updateContractStatus(groupId, newStatus);

      if (result.success) {
        setSuccess(result.message || `Contract ${newStatus.toLowerCase()} successfully`);
        setShowConfirmDialog({ isOpen: false, action: 'pause' });
        onStatusUpdate?.(); // Trigger parent callback to refresh data
      } else {
        setError(result.error || 'Failed to update contract status');
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/10 text-green-300 border-green-500/20';
      case 'Paused':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
      default:
        return 'bg-slate-600/50 text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Paused':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass rounded-3xl p-6 border border-slate-600/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Admin Controls</h3>
          <p className="text-slate-400 text-sm">Manage group contract status</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${getStatusColor(contractStatus)}`}>
          {getStatusIcon(contractStatus)}
          <span className="text-sm font-medium capitalize">{contractStatus}</span>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Contract Status Information */}
      <div className="mb-6 p-4 bg-slate-800/30 rounded-2xl">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">Contract Status</h4>
            <p className="text-slate-400 text-sm">
              {contractStatus === 'Active' 
                ? 'Your group contract is currently active. Workouts are being tracked and weekly tallies will include this group.'
                : 'Your group contract is paused. Workouts will not be tracked and this group will be excluded from weekly accountability checks.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {contractStatus === 'Active' ? (
          <button
            onClick={() => handleStatusChange('Paused')}
            disabled={pending}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 rounded-xl font-medium hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{pending ? 'Pausing...' : 'Pause Contract'}</span>
          </button>
        ) : (
          <button
            onClick={() => handleStatusChange('Active')}
            disabled={pending}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-500/10 text-green-300 border border-green-500/20 rounded-xl font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
            </svg>
            <span>{pending ? 'Resuming...' : 'Resume Contract'}</span>
          </button>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-3xl p-6 border border-slate-600/50 w-full max-w-md">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                showConfirmDialog.action === 'pause' 
                  ? 'bg-yellow-500/10' 
                  : 'bg-green-500/10'
              }`}>
                {showConfirmDialog.action === 'pause' ? (
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">
                {showConfirmDialog.action === 'pause' ? 'Pause Contract' : 'Resume Contract'}
              </h3>
              <p className="text-slate-300 text-sm mb-6">
                {showConfirmDialog.action === 'pause' 
                  ? 'Are you sure you want to pause the group contract? This will exclude the group from weekly accountability checks until resumed.'
                  : 'Are you sure you want to resume the group contract? This will re-enable workout tracking and include the group in weekly accountability checks.'
                }
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmDialog({ isOpen: false, action: 'pause' })}
                  className="flex-1 py-3 px-4 bg-slate-700/50 text-slate-300 rounded-xl font-medium hover:bg-slate-600/50 transition-colors"
                  disabled={pending}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  disabled={pending}
                  className={`flex-1 py-3 px-4 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                    showConfirmDialog.action === 'pause'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {pending ? 'Processing...' : (showConfirmDialog.action === 'pause' ? 'Pause' : 'Resume')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
