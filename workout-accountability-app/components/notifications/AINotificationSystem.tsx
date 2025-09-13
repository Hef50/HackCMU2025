'use client';

import { useState, useEffect } from 'react';

interface AINotification {
  id: string;
  type: 'motivation' | 'warning' | 'success' | 'punishment';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
  contractId?: string;
}

interface AINotificationSystemProps {
  groupId: string;
  userId: string;
}

export default function AINotificationSystem({ groupId, userId }: AINotificationSystemProps) {
  const [notifications, setNotifications] = useState<AINotification[]>([]);
  const [isActive, setIsActive] = useState(true); // Enabled by default

  // Mock notification templates
  const notificationTemplates = {
    motivation: [
      "💪 Your workout streak is impressive! Keep pushing forward!",
      "🔥 Consistency is your superpower. You've got this!",
      "⭐ Every workout counts. You're building unstoppable momentum!",
      "🚀 Your future self will thank you for today's effort!",
      "💎 Hard work pays off. You're becoming stronger every day!"
    ],
    warning: [
      "⚠️ Don't break your streak! Your workout is waiting for you.",
      "⏰ Time to get moving! Your accountability partners are counting on you.",
      "🎯 Stay focused on your goals. One workout at a time!",
      "💪 Remember your commitment. The gym is calling your name!",
      "🔥 Don't let today become a missed opportunity for growth!"
    ],
    success: [
      "🎉 Amazing work! You crushed your workout today!",
      "🏆 Another day, another victory! You're unstoppable!",
      "✨ Your dedication is inspiring others in your group!",
      "🌟 Perfect execution! You're making progress every day!",
      "💯 Outstanding effort! You're setting the standard!"
    ],
    punishment: [
      "💰 Payment reminder: $10 penalty for missed workout",
      "🧊 Time for your ice bucket challenge! You earned it!",
      "📱 Don't forget to post your punishment video to social media",
      "🤝 Schedule your community service hours this week",
      "🍕 No pizza for you this week! Stay committed!"
    ]
  };

  const generateMockNotification = (type: AINotification['type']): AINotification => {
    const templates = notificationTemplates[type];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: `ai-notification-${Date.now()}-${Math.random()}`,
      type,
      title: type === 'motivation' ? 'AI Motivation' : 
             type === 'warning' ? 'AI Warning' :
             type === 'success' ? 'AI Success' : 'AI Punishment',
      message: randomTemplate,
      timestamp: new Date(),
      priority: type === 'punishment' ? 'high' : type === 'warning' ? 'medium' : 'low',
      actionRequired: type === 'punishment',
      contractId: 'mock-contract-1'
    };
  };

  useEffect(() => {
    if (!isActive) return;

    // Generate notifications at random intervals
    const intervals: NodeJS.Timeout[] = [];

    // Motivation notifications every 2-4 hours
    const motivationInterval = setInterval(() => {
      const notification = generateMockNotification('motivation');
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only last 10
    }, Math.random() * 7200000 + 7200000); // 2-4 hours

    // Warning notifications every 30-60 minutes during workout times
    const warningInterval = setInterval(() => {
      const currentHour = new Date().getHours();
      if ((currentHour >= 6 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 20)) {
        const notification = generateMockNotification('warning');
        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      }
    }, Math.random() * 1800000 + 1800000); // 30-60 minutes

    // Success notifications after workout completion (simulated)
    const successInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        const notification = generateMockNotification('success');
        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      }
    }, Math.random() * 3600000 + 3600000); // 1-2 hours

    // Punishment notifications (less frequent)
    const punishmentInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance
        const notification = generateMockNotification('punishment');
        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      }
    }, Math.random() * 7200000 + 7200000); // 2-4 hours

    intervals.push(motivationInterval, warningInterval, successInterval, punishmentInterval);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [isActive]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: AINotification['type']) => {
    switch (type) {
      case 'motivation': return '💪';
      case 'warning': return '⚠️';
      case 'success': return '🎉';
      case 'punishment': return '💰';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: AINotification['type']) => {
    switch (type) {
      case 'motivation': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'punishment': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getNotificationBg = (type: AINotification['type']) => {
    switch (type) {
      case 'motivation': return 'bg-blue-500/10 border-blue-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'punishment': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="glass rounded-2xl p-6 border border-slate-600/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-full">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Accountability Assistant</h3>
            <p className="text-sm text-slate-400">Smart notifications & motivation</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            isActive 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-600/50'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      {/* AI Status */}
      <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">AI Assistant Status</span>
          </div>
          <span className="text-sm text-slate-300">
            {isActive ? 'Monitoring & Learning' : 'Standby Mode'}
          </span>
        </div>
        {isActive && (
          <div className="mt-3 text-sm text-slate-400">
            <p>• Analyzing workout patterns and behavior</p>
            <p>• Sending personalized motivation messages</p>
            <p>• Tracking accountability and penalties</p>
            <p>• Learning from group dynamics</p>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-white mb-2">No notifications yet</h4>
            <p className="text-slate-400">
              {isActive ? 'AI will start sending notifications soon...' : 'Activate AI assistant to receive notifications'}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border transition-all ${getNotificationBg(notification.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-semibold ${getNotificationColor(notification.type)}`}>
                        {notification.title}
                      </h4>
                      {notification.actionRequired && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                          Action Required
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                          notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="p-1 hover:bg-slate-600/50 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Settings */}
      <div className="mt-6 pt-6 border-t border-slate-600/30">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🤖</div>
            <h4 className="text-sm font-medium text-white mb-1">AI Learning</h4>
            <p className="text-xs text-slate-400">Adapts to your patterns</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="text-sm font-medium text-white mb-1">Smart Analytics</h4>
            <p className="text-xs text-slate-400">Tracks progress & behavior</p>
          </div>
        </div>
      </div>
    </div>
  );
}
