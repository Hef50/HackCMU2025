'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { supabase } from '@/lib/supabase/client';
import { postChatMessage } from '@/app/dashboard/groups/[groupId]/actions';
import type { ChatMessage } from '@/lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface GroupChatProps {
  initialMessages: ChatMessage[];
  groupId: string;
  currentUserId: string;
}

export default function GroupChat({ initialMessages, groupId, currentUserId }: GroupChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Fetch the complete message with sender info
          const { data: messageWithSender } = await supabase
            .from('chat_messages')
            .select(`
              *,
              sender:users(id, name, email)
            `)
            .eq('id', payload.new.id)
            .single();

          if (messageWithSender) {
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(msg => msg.id === messageWithSender.id);
              if (exists) return prev;
              
              return [...prev, messageWithSender];
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [groupId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    setError('');
    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    startTransition(async () => {
      const result = await postChatMessage(messageToSend, groupId);
      
      if (!result.success) {
        setError(result.error || 'Failed to send message');
        setNewMessage(messageToSend); // Restore message on error
      }
      // On success, the message will appear via real-time subscription
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const isOwnMessage = (message: ChatMessage) => message.sender_id === currentUserId;

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Messages Yet</h3>
            <p className="text-slate-400 text-sm">Start the conversation with your group!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isOwnMessage(message)
                    ? 'gradient-primary text-white'
                    : 'bg-slate-700/50 text-white'
                }`}
              >
                {/* Sender name for other users' messages */}
                {!isOwnMessage(message) && (
                  <div className="text-xs text-slate-300 mb-1 font-medium">
                    {message.sender?.name || 'Unknown User'}
                  </div>
                )}
                
                {/* Message content */}
                <div className="text-sm leading-relaxed">{message.content}</div>
                
                {/* Timestamp */}
                <div className={`text-xs mt-1 ${
                  isOwnMessage(message) ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  {formatTime(message.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-slate-600/50">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isPending}
            className="flex-1 p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={isPending || !newMessage.trim()}
            className="px-4 py-3 gradient-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
