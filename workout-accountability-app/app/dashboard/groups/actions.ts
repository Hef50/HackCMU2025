'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import type { Database, Group } from '@/lib/types';

// Validation schema for group creation
const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  primaryGoalId: z.string().uuid('Please select a valid goal').optional(),
  isPrivate: z.boolean().default(false),
});

// Create Supabase client helper
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

// Get current user helper
async function getCurrentUser() {
  const supabase = createSupabaseClient();
  
  // Check for backdoor testing mode
  const cookieStore = cookies();
  const backdoorCookie = cookieStore.get('backdoor_test');
  const isBackdoorMode = backdoorCookie?.value === 'true';
  
  if (isBackdoorMode) {
    return 'backdoor-test-user-id';
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('Failed to get user session. Please log in again.');
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Failed to get current user. Please log in again.');
  }
  
  return user.id;
}

export async function searchGroups(searchTerm: string = ''): Promise<{ success: boolean; data: Group[]; error?: string }> {
  try {
    const supabase = createSupabaseClient();
    
    // Check for backdoor testing mode
    const cookieStore = cookies();
    const backdoorCookie = cookieStore.get('backdoor_test');
    const isBackdoorMode = backdoorCookie?.value === 'true';
    
    if (isBackdoorMode) {
      console.log('Backdoor mode: Returning mock groups');
      // Return mock data for testing
      return {
        success: true,
        data: [
          {
            id: 'mock-group-1',
            name: 'Morning Runners',
            description: 'Early morning running group for all fitness levels. We meet at 6 AM every weekday for a 5K run around the park.',
            fitness_level: 'Beginner' as const,
            is_private: false,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            goal: {
              id: 'mock-goal-1',
              name: 'Weight Loss'
            },
            group_members: [
              {
                group_id: 'mock-group-1',
                user_id: 'mock-user-1',
                role: 'Admin' as const,
                joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-1',
                  name: 'Sarah Chen',
                  email: 'sarah@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              },
              {
                group_id: 'mock-group-1',
                user_id: 'mock-user-2',
                role: 'Member' as const,
                joined_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-2',
                  name: 'Mike Johnson',
                  email: 'mike@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              },
              {
                group_id: 'mock-group-1',
                user_id: 'mock-user-3',
                role: 'Member' as const,
                joined_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-3',
                  name: 'Emma Davis',
                  email: 'emma@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          {
            id: 'mock-group-2',
            name: 'Power Lifters United',
            description: 'Serious strength training group focused on progressive overload and proper form. All levels welcome!',
            fitness_level: 'Advanced' as const,
            is_private: false,
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            goal: {
              id: 'mock-goal-2',
              name: 'Muscle Building'
            },
            group_members: [
              {
                group_id: 'mock-group-2',
                user_id: 'mock-user-4',
                role: 'Admin' as const,
                joined_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-4',
                  name: 'Alex Rodriguez',
                  email: 'alex@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              },
              {
                group_id: 'mock-group-2',
                user_id: 'mock-user-5',
                role: 'Member' as const,
                joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-5',
                  name: 'Jordan Kim',
                  email: 'jordan@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          {
            id: 'mock-group-3',
            name: 'Yoga Flow Warriors',
            description: 'Daily yoga practice for flexibility, strength, and mindfulness. Perfect for stress relief and recovery.',
            fitness_level: 'Intermediate' as const,
            is_private: false,
            created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            goal: {
              id: 'mock-goal-4',
              name: 'Flexibility'
            },
            group_members: [
              {
                group_id: 'mock-group-3',
                user_id: 'mock-user-6',
                role: 'Admin' as const,
                joined_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-6',
                  name: 'Luna Patel',
                  email: 'luna@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              },
              {
                group_id: 'mock-group-3',
                user_id: 'mock-user-7',
                role: 'Member' as const,
                joined_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-7',
                  name: 'Chris Taylor',
                  email: 'chris@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              },
              {
                group_id: 'mock-group-3',
                user_id: 'mock-user-8',
                role: 'Member' as const,
                joined_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-8',
                  name: 'Zoe Martinez',
                  email: 'zoe@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              },
              {
                group_id: 'mock-group-3',
                user_id: 'mock-user-9',
                role: 'Member' as const,
                joined_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-9',
                  name: 'Ryan O\'Connor',
                  email: 'ryan@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          {
            id: 'mock-group-4',
            name: 'HIIT Challenge Squad',
            description: 'High-intensity interval training sessions that push your limits. 30-minute sessions, maximum results!',
            fitness_level: 'Advanced' as const,
            is_private: false,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            goal: {
              id: 'mock-goal-3',
              name: 'Cardio Fitness'
            },
            group_members: [
              {
                group_id: 'mock-group-4',
                user_id: 'mock-user-10',
                role: 'Admin' as const,
                joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-10',
                  name: 'Tyler Brooks',
                  email: 'tyler@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              },
              {
                group_id: 'mock-group-4',
                user_id: 'mock-user-11',
                role: 'Member' as const,
                joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-11',
                  name: 'Maya Singh',
                  email: 'maya@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          {
            id: 'mock-group-5',
            name: 'Weekend Warriors',
            description: 'Saturday morning outdoor adventures and Sunday recovery sessions. Hiking, cycling, and more!',
            fitness_level: 'Intermediate' as const,
            is_private: false,
            created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            goal: {
              id: 'mock-goal-1',
              name: 'Weight Loss'
            },
            group_members: [
              {
                group_id: 'mock-group-5',
                user_id: 'mock-user-12',
                role: 'Admin' as const,
                joined_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-12',
                  name: 'Sam Wilson',
                  email: 'sam@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              },
              {
                group_id: 'mock-group-5',
                user_id: 'mock-user-13',
                role: 'Member' as const,
                joined_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-13',
                  name: 'Nina Zhang',
                  email: 'nina@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              },
              {
                group_id: 'mock-group-5',
                user_id: 'mock-user-14',
                role: 'Member' as const,
                joined_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-14',
                  name: 'David Lee',
                  email: 'david@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              },
              {
                group_id: 'mock-group-5',
                user_id: 'mock-user-15',
                role: 'Member' as const,
                joined_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-15',
                  name: 'Anna Thompson',
                  email: 'anna@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              },
              {
                group_id: 'mock-group-5',
                user_id: 'mock-user-16',
                role: 'Member' as const,
                joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: 'mock-user-16',
                  name: 'James Brown',
                  email: 'james@example.com',
                  has_completed_tutorial: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          }
        ]
      };
    }
    
    let query = supabase
      .from('groups')
      .select(`
        id,
        name,
        description,
        primary_goal_id,
        fitness_level,
        is_private,
        created_at,
        updated_at,
        goal:goals(id, name),
        group_members(
          user_id,
          role,
          joined_at,
          user:users(id, name, profile_image_url)
        )
      `)
      .eq('is_private', false)
      .order('created_at', { ascending: false });

    // Apply search filter if provided
    if (searchTerm.trim()) {
      query = query.ilike('name', `%${searchTerm.trim()}%`);
    }

    const { data: groups, error } = await query;

    if (error) {
      console.error('Error fetching groups:', error);
      throw new Error('Failed to fetch groups');
    }

    console.log('Groups fetched successfully:', groups?.length || 0);
    return { success: true, data: groups || [] };
  } catch (error) {
    console.error('Error in searchGroups:', error);
    return { 
      success: false, 
      data: [],
      error: error instanceof Error ? error.message : 'Failed to search groups'
    };
  }
}

export async function createGroup(formData: FormData): Promise<{ success: boolean; groupId?: string; error?: string }> {
  try {
    // Extract and validate form data
    const rawData = {
      name: formData.get('name')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      primaryGoalId: formData.get('primaryGoalId')?.toString() || undefined,
      isPrivate: formData.get('isPrivate') === 'true',
    };

    // Remove empty description
    if (rawData.description === '') {
      rawData.description = undefined;
    }

    // Remove empty primaryGoalId
    if (rawData.primaryGoalId === '') {
      rawData.primaryGoalId = undefined;
    }

    const validatedData = createGroupSchema.parse(rawData);
    
    const supabase = createSupabaseClient();
    const userId = await getCurrentUser();

    // Check for backdoor mode and skip database operations
    const cookieStore = cookies();
    const backdoorCookie = cookieStore.get('backdoor_test');
    const isBackdoorMode = backdoorCookie?.value === 'true';
    
    if (isBackdoorMode) {
      console.log('Backdoor mode: Skipping group creation');
      // Return success with mock group ID for client-side redirect
      return { 
        success: true, 
        groupId: 'backdoor-test-group' 
      };
    }

    // Insert the new group
    const { data: newGroup, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        primary_goal_id: validatedData.primaryGoalId,
        is_private: validatedData.isPrivate,
      })
      .select('id')
      .single();

    if (groupError || !newGroup) {
      console.error('Error creating group:', groupError);
      throw new Error('Failed to create group');
    }

    // Add the creator as an admin to the group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: newGroup.id,
        user_id: userId,
        role: 'Admin',
      });

    if (memberError) {
      console.error('Error adding user to group:', memberError);
      // Try to clean up the created group
      await supabase.from('groups').delete().eq('id', newGroup.id);
      throw new Error('Failed to add you as group admin');
    }

    // Return success with group ID for client-side redirect
    return { 
      success: true, 
      groupId: newGroup.id 
    };

  } catch (error) {
    console.error('Error in createGroup:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Invalid input data' 
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

export async function getGoals() {
  try {
    const supabase = createSupabaseClient();
    
    // Check for backdoor testing mode
    const cookieStore = cookies();
    const backdoorCookie = cookieStore.get('backdoor_test');
    const isBackdoorMode = backdoorCookie?.value === 'true';
    
    if (isBackdoorMode) {
      console.log('Backdoor mode: Returning mock goals');
      return {
        success: true,
        data: [
          { id: 'mock-goal-1', name: 'Weight Loss' },
          { id: 'mock-goal-2', name: 'Muscle Building' },
          { id: 'mock-goal-3', name: 'Cardio Fitness' },
          { id: 'mock-goal-4', name: 'Flexibility' },
          { id: 'mock-goal-5', name: 'Strength Training' }
        ]
      };
    }

    const { data: goals, error } = await supabase
      .from('goals')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching goals:', error);
      throw new Error('Failed to fetch goals');
    }

    return { success: true, data: goals || [] };
  } catch (error) {
    console.error('Error in getGoals:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch goals',
      data: []
    };
  }
}
