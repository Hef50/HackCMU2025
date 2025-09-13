'use client';

import { useState, useTransition } from 'react';
import { removeGroupMember } from '@/app/dashboard/groups/[groupId]/actions';
import type { GroupMember, User } from '@/lib/types';

interface MemberListProps {
  members: (GroupMember & { user: User })[];
  currentUserId: string;
  groupId: string;
  userRole?: 'Admin' | 'Member';
}

export default function MemberList({ members, currentUserId, groupId, userRole }: MemberListProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    isOpen: boolean;
    memberName: string;
    memberId: string;
  }>({
    isOpen: false,
    memberName: '',
    memberId: ''
  });
  const handleRemoveMember = (memberId: string, memberName: string) => {
    setShowConfirmDialog({
      isOpen: true,
      memberName,
      memberId
    });
  };

  const confirmRemoveMember = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await removeGroupMember(showConfirmDialog.memberId, groupId);

      if (result.success) {
        setSuccess(`${showConfirmDialog.memberName} has been removed from the group`);
        setShowConfirmDialog({ isOpen: false, memberName: '', memberId: '' });
        // Refresh the page to update the member list
        window.location.reload();
      } else {
        setError(result.error || 'Failed to remove member');
      }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const formatJoinDate = (joinDate: string) => {
    const date = new Date(joinDate);
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Sort members: Admins first, then by join date
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'Admin' && b.role !== 'Admin') return -1;
    if (b.role === 'Admin' && a.role !== 'Admin') return 1;
    return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
  });

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Members</h2>
        <p className="text-slate-400 text-sm">
          {members.length} member{members.length !== 1 ? 's' : ''} in this group
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="glass rounded-2xl p-4 border border-red-500/20 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="glass rounded-2xl p-4 border border-green-500/20 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Members</h3>
          <p className="text-slate-400 text-sm">This group has no members yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMembers.map((member) => (
            <div
              key={member.user_id}
              className="flex items-center space-x-4 p-4 bg-slate-800/30 rounded-2xl hover:bg-slate-800/50 transition-colors"
            >
              {/* Profile Picture or Initials */}
              <div className="relative">
                {member.user.profile_image_url ? (
                  <img
                    src={member.user.profile_image_url}
                    alt={member.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(member.user.name)}
                    </span>
                  </div>
                )}
                
                {/* Admin Crown Icon */}
                {member.role === 'Admin' && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Member Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-white truncate">
                    {member.user.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    member.role === 'Admin'
                      ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                      : 'bg-slate-600/50 text-slate-300'
                  }`}>
                    {member.role}
                  </span>
                </div>
                <p className="text-slate-400 text-sm truncate mb-1">
                  {member.user.email}
                </p>
                <p className="text-slate-500 text-xs">
                  Joined {formatJoinDate(member.joined_at)}
                </p>
              </div>

              {/* Member Actions */}
              <div className="flex flex-col items-end space-y-2">
                {member.user.fitness_level && (
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded-lg text-xs">
                    {member.user.fitness_level}
                  </span>
                )}
                
                {/* Remove Button (Admin only) */}
                {userRole === 'Admin' && member.user_id !== currentUserId && (
                  <button
                    onClick={() => handleRemoveMember(member.user_id, member.user.name)}
                    className="px-3 py-1 bg-red-500/10 text-red-300 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
                    disabled={pending}
                  >
                    Remove
                  </button>
                )}
                
                {/* Online Status Indicator (Future Enhancement) */}
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span className="text-xs text-slate-500">Offline</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Actions */}
      <div className="mt-6 pt-4 border-t border-slate-600/30">
        <button className="w-full p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl text-slate-300 text-sm font-medium transition-colors border border-slate-600/30">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Invite Members</span>
          </div>
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-3xl p-6 border border-slate-600/50 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">Remove Member</h3>
              <p className="text-slate-300 text-sm mb-6">
                Are you sure you want to remove <strong>{showConfirmDialog.memberName}</strong> from this group? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmDialog({ isOpen: false, memberName: '', memberId: '' })}
                  className="flex-1 py-3 px-4 bg-slate-700/50 text-slate-300 rounded-xl font-medium hover:bg-slate-600/50 transition-colors"
                  disabled={pending}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveMember}
                  disabled={pending}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {pending ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
