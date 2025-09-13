'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getContracts } from './actions';
import CreateContractModal from '@/components/contracts/CreateContractModal';
import AINotificationSystem from '@/components/notifications/AINotificationSystem';
import PaymentTracker from '@/components/payments/PaymentTracker';
import GroupGainzLogo from '@/components/ui/GroupGainzLogo';
import type { Contract } from '@/lib/types';

export default function ContractsPage() {
  const params = useParams();
  const groupId = params?.groupId as string || 'mock-group-1';
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'contracts' | 'notifications' | 'payments'>('contracts');

  // Fetch contracts on mount
  useEffect(() => {
    fetchContracts();
  }, [groupId]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const result = await getContracts(groupId);
      
      if (result.success) {
        setContracts(result.data);
        setError('');
      } else {
        setError(result.error || 'Failed to load contracts');
      }
    } catch (err) {
      setError('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const getContractIcon = (status: string) => {
    switch (status) {
      case 'Active': return '🟢';
      case 'Pending': return '🟡';
      case 'Paused': return '🔴';
      default: return '📋';
    }
  };

  const getContractColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Paused': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const formatSchedule = (schedule: any) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const selectedDays = schedule.daysOfWeek?.map((day: number) => days[day]).join(', ') || 'TBD';
    return `${schedule.frequency || 0}x/week • ${schedule.timeOfDay || 'TBD'} • ${selectedDays}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="gradient-surface border-b border-slate-600/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center mb-6">
            <GroupGainzLogo size={48} showText={true} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-3">Accountability Contracts</h1>
            <p className="text-slate-300 text-lg">Set stakes and consequences for your fitness goals</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex space-x-1 mb-8 bg-slate-800/50 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'contracts'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            📋 Contracts
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            🤖 AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            💰 Payments
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            {/* Create Contract Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Active Contracts</h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 gradient-primary text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/25 transition-all-smooth flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Contract</span>
              </button>
            </div>

            {/* Error State */}
            {error && (
              <div className="glass border border-red-500/30 rounded-2xl p-6 bg-red-900/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-red-500/20 rounded-full">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-red-300">Something went wrong</h3>
                </div>
                <p className="text-sm text-red-200 mb-4">{error}</p>
                <button
                  onClick={fetchContracts}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-6 bg-slate-600/50 rounded-lg w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-600/30 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 w-16 bg-slate-600/50 rounded-full"></div>
                    </div>
                    <div className="h-4 bg-slate-600/30 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-600/30 rounded w-2/3 mb-4"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && contracts.length === 0 && !error && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 gradient-surface rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No contracts yet</h3>
                <p className="text-slate-300 mb-6 text-lg">
                  Create your first accountability contract to start tracking your fitness commitments!
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 gradient-primary text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/25 transition-all-smooth"
                >
                  Create Your First Contract
                </button>
              </div>
            )}

            {/* Contracts List */}
            {!loading && contracts.length > 0 && (
              <div className="space-y-6">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="glass rounded-2xl p-6 border border-slate-600/30"
                  >
                    {/* Contract Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getContractIcon(contract.status)}</span>
                          <h3 className="text-xl font-bold text-white">
                            {contract.rules?.split('\n')[0] || 'Workout Contract'}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span>Created {new Date(contract.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>ID: {contract.id.slice(-8)}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getContractColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </div>

                    {/* Contract Details */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Schedule</h4>
                        <p className="text-slate-300 text-sm">{formatSchedule(contract.schedule)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Location</h4>
                        <p className="text-slate-300 text-sm">{contract.location_name || 'TBD'}</p>
                      </div>
                    </div>

                    {/* Contract Rules */}
                    {contract.rules && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-white mb-2">Contract Terms</h4>
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
                          <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans">
                            {contract.rules}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Contract Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-600/30">
                      <div className="flex items-center space-x-4">
                        <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-all">
                          View Details
                        </button>
                        {contract.status === 'Pending' && (
                          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg text-sm font-medium transition-all">
                            Activate
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Last updated {new Date(contract.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-4xl mx-auto">
            <AINotificationSystem groupId={groupId} userId="mock-user-1" />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="max-w-4xl mx-auto">
            <PaymentTracker />
          </div>
        )}
      </div>

      {/* Create Contract Modal */}
      <CreateContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        groupId={groupId}
      />
    </div>
  );
}
