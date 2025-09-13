import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import GroupGainzLogo from '@/components/ui/GroupGainzLogo';
import ContractManager from '@/components/groups/ContractManager';
import CheckInButton from '@/components/groups/CheckInButton';
import GroupTabs from '@/components/groups/GroupTabs';
import GroupFeed from '@/components/groups/GroupFeed';
import type { Database, Group, GroupMember, Contract, CheckIn, WorkoutInstance, ChatMessage, User, Kudos } from '@/lib/types';

interface GroupDetailPageProps {
  params: { groupId: string };
}

interface CheckInWithDetails extends CheckIn {
  user: User;
  workout_instance: {
    scheduled_at: string;
  };
  kudos: (Kudos & { giver: User })[];
}

interface GroupData extends Group {
  group_members: (GroupMember & { user: User })[];
  contract?: Contract;
  todayCheckIns?: CheckIn[];
  upcomingWorkout?: WorkoutInstance;
  chatMessages?: ChatMessage[];
  checkInsWithPhotos?: CheckInWithDetails[];
  userRole?: 'Admin' | 'Member';
  currentUserId?: string;
}

async function getGroupData(groupId: string): Promise<GroupData | null> {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    redirect('/auth');
  }

  // Check if user is a member of this group
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', session.user.id)
    .single();

  if (!membership) {
    notFound();
  }

  // Fetch group data with members
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select(`
      *,
      goal:goals(name),
      group_members!inner(
        group_id,
        user_id,
        role,
        joined_at,
        user:users(id, name, email, profile_image_url, fitness_level)
      )
    `)
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    console.error('Error fetching group:', groupError);
    notFound();
  }

  // Fetch contract if it exists
  const { data: contract } = await supabase
    .from('contracts')
    .select('*')
    .eq('group_id', groupId)
    .eq('status', 'Active')
    .single();

  // Get today's check-ins for this group
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: todayWorkouts } = await supabase
    .from('workout_instances')
    .select(`
      id,
      scheduled_at,
      check_ins(
        id,
        user_id,
        checked_in_at,
        status,
        user:users(name)
      )
    `)
    .eq('group_id', groupId)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString());

  // Get upcoming workout (next scheduled workout)
  const { data: upcomingWorkout } = await supabase
    .from('workout_instances')
    .select('*')
    .eq('group_id', groupId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single();

  // Flatten today's check-ins
  const todayCheckIns = todayWorkouts?.flatMap(workout => workout.check_ins || []) || [];

  // Fetch recent chat messages (last 50 messages)
  const { data: chatMessages } = await supabase
    .from('chat_messages')
    .select(`
      *,
      sender:users(id, name, email, profile_image_url)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(50);

  // Fetch check-ins with photos and kudos (last 20)
  const { data: checkInsWithPhotos } = await supabase
    .from('check_ins')
    .select(`
      *,
      user:users(id, name, email, profile_image_url),
      workout_instance:workout_instances(scheduled_at),
      kudos:kudos(
        id,
        giver_id,
        receiver_id,
        created_at,
        giver:users(id, name)
      )
    `)
    .not('image_url', 'is', null)
    .order('checked_in_at', { ascending: false })
    .limit(20);

  return {
    ...group,
    contract: contract || undefined,
    todayCheckIns,
    upcomingWorkout: upcomingWorkout || undefined,
    chatMessages: chatMessages || [],
    checkInsWithPhotos: checkInsWithPhotos || [],
    userRole: membership.role,
    currentUserId: session.user.id
  };
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const groupData = await getGroupData(params.groupId);

  if (!groupData) {
    notFound();
  }

  const isAdmin = groupData.userRole === 'Admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="gradient-surface border-b border-slate-600/50">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <a 
              href="/dashboard/groups" 
              className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <GroupGainzLogo size={40} showText={false} />
            <div className="w-10 h-10" /> {/* Spacer for centering */}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold gradient-text mb-2">{groupData.name}</h1>
            <p className="text-slate-300 text-sm">
              {groupData.group_members.length} member{groupData.group_members.length !== 1 ? 's' : ''}
            </p>
            {groupData.description && (
              <p className="text-slate-400 text-sm mt-2">{groupData.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Contract Management */}
        <ContractManager 
          contract={groupData.contract}
          groupId={params.groupId}
          isAdmin={isAdmin}
        />

        {/* Check-In Section */}
        {groupData.contract && (
          <div className="glass rounded-3xl p-6 border border-slate-600/50">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Workout Check-In</h2>
              <p className="text-slate-400 text-sm">
                Check in during your scheduled workout time
              </p>
            </div>

            <CheckInButton 
              groupId={params.groupId}
              contract={groupData.contract}
              upcomingWorkout={groupData.upcomingWorkout}
              onCheckInSuccess={() => {
                // This will trigger a page refresh to show new check-ins
                window.location.reload();
              }}
            />
          </div>
        )}

        {/* Today's Activity */}
        {groupData.todayCheckIns && groupData.todayCheckIns.length > 0 && (
          <div className="glass rounded-3xl p-6 border border-slate-600/50">
            <h3 className="text-lg font-bold text-white mb-4">Today's Check-Ins</h3>
            <div className="space-y-3">
              {groupData.todayCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      checkIn.status === 'OnTime' ? 'bg-green-500' :
                      checkIn.status === 'Late' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-white font-medium">
                      {groupData.group_members.find(m => m.user_id === checkIn.user_id)?.user.name || 'Unknown'}
              </span>
            </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      checkIn.status === 'OnTime' ? 'text-green-400' :
                      checkIn.status === 'Late' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {checkIn.status}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(checkIn.checked_in_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group Feed */}
        {groupData.checkInsWithPhotos && groupData.checkInsWithPhotos.length > 0 && (
          <div className="glass rounded-3xl p-6 border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Group Feed</h2>
              <div className="flex items-center space-x-2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{groupData.checkInsWithPhotos.length} photos</span>
              </div>
            </div>
            
            <GroupFeed 
              checkIns={groupData.checkInsWithPhotos}
              currentUserId={groupData.currentUserId || ''}
              onKudosUpdate={() => {
                // This will trigger a page refresh to show updated kudos
                window.location.reload();
              }}
            />
          </div>
        )}

        {/* Stats Link */}
        <div className="glass rounded-3xl p-6 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Group Analytics</h3>
              <p className="text-slate-400 text-sm">View detailed stats and history</p>
            </div>
            <a 
              href={`/dashboard/groups/${params.groupId}/stats`}
              className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>View Stats</span>
              </div>
            </a>
          </div>
        </div>

        {/* Events Link */}
        <div className="glass rounded-3xl p-6 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Group Events</h3>
              <p className="text-slate-400 text-sm">Schedule activities and social gatherings</p>
            </div>
            <a 
              href={`/dashboard/groups/${params.groupId}/events`}
              className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>View Events</span>
              </div>
            </a>
          </div>
        </div>

        {/* Chat and Members Tabs */}
        <GroupTabs 
          chatMessages={groupData.chatMessages || []}
          members={groupData.group_members}
          groupId={params.groupId}
          currentUserId={groupData.currentUserId || ''}
          userRole={groupData.userRole}
        />
      </div>
    </div>
  );
}
