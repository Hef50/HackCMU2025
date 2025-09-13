'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Database } from '@/lib/types';

// Helper function to create Supabase client
function createSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
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
}

// Helper function to get current user
async function getCurrentUser(supabase: ReturnType<typeof createSupabaseClient>) {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Auth error:', error);
    throw new Error('Authentication failed');
  }
  
  if (!session?.user) {
    throw new Error('User not authenticated');
  }
  
  return session.user;
}

// Helper function to check if user is member of the group
async function checkUserIsMember(supabase: ReturnType<typeof createSupabaseClient>, userId: string, groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    throw new Error('User is not a member of this group');
  }
  
  return true;
}

export interface GroupStats {
  total_workouts_completed: number;
  group_attendance_rate: number;
  current_streak: number;
  total_scheduled_workouts: number;
  members_count: number;
  photos_shared: number;
  total_kudos_received: number;
  most_active_member: string | null;
  best_attendance_member: string | null;
}

export async function getStatsForGroup(groupId: string): Promise<GroupStats> {
  try {
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);
    
    // Check if user is a member of the group
    await checkUserIsMember(supabase, user.id, groupId);
    
    // Call the PostgreSQL function to get stats
    const { data, error } = await supabase
      .rpc('get_group_stats', { group_id_param: groupId });
    
    if (error) {
      console.error('Error calling get_group_stats:', error);
      throw new Error('Failed to fetch group statistics');
    }
    
    if (!data || data.length === 0) {
      throw new Error('No statistics data found for this group');
    }
    
    const stats = data[0];
    
    return {
      total_workouts_completed: Number(stats.total_workouts_completed) || 0,
      group_attendance_rate: Number(stats.group_attendance_rate) || 0,
      current_streak: Number(stats.current_streak) || 0,
      total_scheduled_workouts: Number(stats.total_scheduled_workouts) || 0,
      members_count: Number(stats.members_count) || 0,
      photos_shared: Number(stats.photos_shared) || 0,
      total_kudos_received: Number(stats.total_kudos_received) || 0,
      most_active_member: stats.most_active_member || null,
      best_attendance_member: stats.best_attendance_member || null,
    };
    
  } catch (error) {
    console.error('Get stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    throw new Error(errorMessage);
  }
}

export async function getGroupHistory(groupId: string, limit: number = 50, offset: number = 0) {
  try {
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);
    
    // Check if user is a member of the group
    await checkUserIsMember(supabase, user.id, groupId);
    
    // Fetch check-ins with related data
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        id,
        checked_in_at,
        status,
        image_url,
        latitude,
        longitude,
        user:users(id, name, email, profile_image_url),
        workout_instance:workout_instances(
          scheduled_at,
          group:groups(name)
        ),
        kudos:kudos(
          id,
          giver:users(name)
        )
      `)
      .eq('workout_instance.group_id', groupId)
      .order('checked_in_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching group history:', error);
      throw new Error('Failed to fetch group history');
    }
    
    return data || [];
    
  } catch (error) {
    console.error('Get history error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    throw new Error(errorMessage);
  }
}
