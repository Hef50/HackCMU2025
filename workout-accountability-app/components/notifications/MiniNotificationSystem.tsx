'use client';

import { useState, useEffect } from 'react';

interface MiniNotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export default function MiniNotificationSystem({ 
  show, 
  message, 
  type, 
  duration = 3000 
}: MiniNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => setIsVisible(false), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!isVisible) return null;

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'error':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'info':
      default:
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`glass rounded-xl p-4 border backdrop-blur-sm shadow-lg transition-all duration-300 ${
          isAnimating 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        } ${getNotificationStyle()}`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <p className="font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Global notification system for app-wide notifications
export function useGlobalNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    timestamp: number;
  }>>([]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification = {
      id,
      message,
      type,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification
  };
}

// Global notification container component
export function GlobalNotificationContainer() {
  const { notifications, removeNotification } = useGlobalNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <MiniNotificationSystem
          key={notification.id}
          show={true}
          message={notification.message}
          type={notification.type}
          duration={4000}
        />
      ))}
    </div>
  );
}
