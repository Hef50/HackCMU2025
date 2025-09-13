import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import GroupGainzLogo from '@/components/ui/GroupGainzLogo';
import StatsGrid from '@/components/stats/StatsGrid';
import HistoryTimeline from '@/components/stats/HistoryTimeline';
import { getStatsForGroup, getGroupHistory } from './actions';
import type { Database } from '@/lib/types';

interface GroupStatsPageProps {
  params: { groupId: string };
}

async function getGroupData(groupId: string) {
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
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', session.user.id)
    .single();

  if (!membership) {
    notFound();
  }

  // Get group basic info
  const { data: group } = await supabase
    .from('groups')
    .select('id, name, description')
    .eq('id', groupId)
    .single();

  if (!group) {
    notFound();
  }

  return {
    group,
    currentUserId: session.user.id
  };
}

export default async function GroupStatsPage({ params }: GroupStatsPageProps) {
  try {
    // Get group data and verify access
    const { group, currentUserId } = await getGroupData(params.groupId);
    
    // Fetch stats and history data in parallel
    const [stats, history] = await Promise.all([
      getStatsForGroup(params.groupId),
      getGroupHistory(params.groupId, 50, 0)
    ]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <div className="gradient-surface border-b border-slate-600/50">
          <div className="max-w-md mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <a 
                href={`/dashboard/groups/${params.groupId}`} 
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
              <h1 className="text-2xl font-bold gradient-text mb-2">Stats & History</h1>
              <p className="text-slate-300 text-sm">{group.name}</p>
              {group.description && (
                <p className="text-slate-400 text-xs mt-1">{group.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto px-6 py-6 space-y-6">
          {/* Stats Grid */}
          <StatsGrid stats={stats} />

          {/* History Timeline */}
          <div className="glass rounded-3xl p-6 border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Memory Lane</h2>
              <div className="flex items-center space-x-2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{history.length} entries</span>
              </div>
            </div>
            
            <HistoryTimeline 
              history={history}
              currentUserId={currentUserId}
              groupId={params.groupId}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Stats page error:', error);
    
    // Handle different error types
    if (error instanceof Error) {
      if (error.message.includes('not a member')) {
        notFound();
      }
    }
    
    // Generic error fallback
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="glass rounded-3xl p-8 border border-slate-600/50 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Unable to Load Stats</h2>
          <p className="text-slate-400 text-sm mb-6">
            There was an error loading the group statistics. Please try again later.
          </p>
          <a 
            href={`/dashboard/groups/${params.groupId}`} 
            className="inline-flex items-center space-x-2 gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Group</span>
          </a>
        </div>
      </div>
    );
  }
}
