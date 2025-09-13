'use client';

import { useState } from 'react';
import GroupChat from './GroupChat';
import MemberList from './MemberList';
import type { ChatMessage, GroupMember, User } from '@/lib/types';

interface GroupTabsProps {
  chatMessages: ChatMessage[];
  members: (GroupMember & { user: User })[];
  groupId: string;
  currentUserId: string;
  userRole?: 'Admin' | 'Member';
}

type TabType = 'chat' | 'members';

export default function GroupTabs({ chatMessages, members, groupId, currentUserId, userRole }: GroupTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  return (
    <div className="glass rounded-3xl border border-slate-600/50 overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-slate-600/50">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-6 py-4 font-semibold transition-all ${
            activeTab === 'chat'
              ? 'bg-blue-500/10 text-blue-300 border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Chat</span>
            {chatMessages.length > 0 && (
              <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                {chatMessages.length}
              </span>
            )}
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 px-6 py-4 font-semibold transition-all ${
            activeTab === 'members'
              ? 'bg-blue-500/10 text-blue-300 border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>Members</span>
            <span className="bg-slate-600/50 text-slate-300 text-xs px-2 py-1 rounded-full">
              {members.length}
            </span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="h-96">
        {activeTab === 'chat' ? (
          <GroupChat 
            initialMessages={chatMessages}
            groupId={groupId}
            currentUserId={currentUserId}
          />
        ) : (
          <MemberList 
            members={members}
            currentUserId={currentUserId}
            groupId={groupId}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
}
