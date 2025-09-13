'use client';

import { useState, useEffect } from 'react';

interface Payment {
  id: string;
  type: 'stake' | 'penalty' | 'reward';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  dueDate?: Date;
  contractId: string;
  userId: string;
  createdAt: Date;
}

interface PaymentStats {
  totalStakes: number;
  totalPenalties: number;
  totalRewards: number;
  pendingAmount: number;
  completedAmount: number;
}

export default function PaymentTracker() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalStakes: 0,
    totalPenalties: 0,
    totalRewards: 0,
    pendingAmount: 0,
    completedAmount: 0
  });

  // Generate mock payment data
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: 'payment-1',
        type: 'stake',
        amount: 25,
        description: 'Initial stake for 5-day workout challenge',
        status: 'completed',
        contractId: 'contract-1',
        userId: 'user-1',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'payment-2',
        type: 'penalty',
        amount: 10,
        description: 'Missed Monday workout - $10 penalty',
        status: 'pending',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        contractId: 'contract-1',
        userId: 'user-1',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'payment-3',
        type: 'penalty',
        amount: 10,
        description: 'Missed Wednesday workout - $10 penalty',
        status: 'completed',
        contractId: 'contract-1',
        userId: 'user-1',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'payment-4',
        type: 'reward',
        amount: 15,
        description: 'Perfect week bonus - earned back penalty + reward',
        status: 'completed',
        contractId: 'contract-1',
        userId: 'user-1',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'payment-5',
        type: 'stake',
        amount: 20,
        description: 'Additional stake for HIIT challenge',
        status: 'pending',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        contractId: 'contract-2',
        userId: 'user-1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    setPayments(mockPayments);

    // Calculate stats
    const newStats = mockPayments.reduce((acc, payment) => {
      if (payment.type === 'stake') acc.totalStakes += payment.amount;
      if (payment.type === 'penalty') acc.totalPenalties += payment.amount;
      if (payment.type === 'reward') acc.totalRewards += payment.amount;
      if (payment.status === 'pending') acc.pendingAmount += payment.amount;
      if (payment.status === 'completed') acc.completedAmount += payment.amount;
      return acc;
    }, { totalStakes: 0, totalPenalties: 0, totalRewards: 0, pendingAmount: 0, completedAmount: 0 });

    setStats(newStats);
  }, []);

  const markPaymentComplete = (paymentId: string) => {
    setPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: 'completed' as const }
          : payment
      )
    );
  };

  const getPaymentIcon = (type: Payment['type']) => {
    switch (type) {
      case 'stake': return '💰';
      case 'penalty': return '💸';
      case 'reward': return '🎁';
      default: return '💳';
    }
  };

  const getPaymentColor = (type: Payment['type']) => {
    switch (type) {
      case 'stake': return 'text-blue-400';
      case 'penalty': return 'text-red-400';
      case 'reward': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="glass rounded-2xl p-6 border border-slate-600/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-full">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Payment Tracker</h3>
            <p className="text-sm text-slate-400">Stakes, penalties & rewards</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-white">${stats.completedAmount}</div>
          <div className="text-xs text-slate-400">Total Processed</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="text-2xl font-bold text-blue-400">${stats.totalStakes}</div>
          <div className="text-xs text-blue-300">Total Stakes</div>
        </div>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="text-2xl font-bold text-red-400">${stats.totalPenalties}</div>
          <div className="text-xs text-red-300">Penalties</div>
        </div>
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="text-2xl font-bold text-green-400">${stats.totalRewards}</div>
          <div className="text-xs text-green-300">Rewards</div>
        </div>
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="text-2xl font-bold text-yellow-400">${stats.pendingAmount}</div>
          <div className="text-xs text-yellow-300">Pending</div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
        <h4 className="text-white font-semibold mb-3">Payment Methods</h4>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-sm font-bold">V</span>
            </div>
            <span className="text-slate-300 text-sm">Visa •••• 4242</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-sm font-bold">P</span>
            </div>
            <span className="text-slate-300 text-sm">PayPal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 text-sm font-bold">V</span>
            </div>
            <span className="text-slate-300 text-sm">Venmo</span>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-white mb-2">No payments yet</h4>
            <p className="text-slate-400">Payments will appear here once contracts are active</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-2xl">{getPaymentIcon(payment.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-semibold ${getPaymentColor(payment.type)}`}>
                        ${payment.amount}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{payment.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {formatDate(payment.createdAt)}
                      </span>
                      {payment.dueDate && payment.status === 'pending' && (
                        <span className="text-xs text-yellow-400">
                          Due: {formatDate(payment.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {payment.status === 'pending' && (
                  <button
                    onClick={() => markPaymentComplete(payment.id)}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg text-sm font-medium transition-all"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-slate-600/30">
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 rounded-xl transition-all">
            <div className="text-2xl mb-2">💳</div>
            <h4 className="text-sm font-medium text-white mb-1">Add Payment Method</h4>
            <p className="text-xs text-slate-400">Link bank account or card</p>
          </button>
          <button className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 rounded-xl transition-all">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="text-sm font-medium text-white mb-1">View Reports</h4>
            <p className="text-xs text-slate-400">Payment history & analytics</p>
          </button>
        </div>
      </div>
    </div>
  );
}
