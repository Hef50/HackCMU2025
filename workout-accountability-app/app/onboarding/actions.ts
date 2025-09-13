'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import type { Database, FitnessLevel, UserAvailability } from '@/lib/types';

// Validation schema
const onboardingSchema = z.object({
  fitnessLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  goalIds: z.array(z.string().uuid()).min(1, 'Please select at least one goal'),
  availability: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    timeOfDay: z.enum(['Morning', 'Afternoon', 'Evening'])
  })).min(1, 'Please select at least one availability slot')
});

export async function updateUserProfileOnboarding(data: {
  fitnessLevel: FitnessLevel;
  goalIds: string[];
  availability: UserAvailability[];
}) {
  try {
    // Validate input data
    const validatedData = onboardingSchema.parse(data);
    
    // Create Supabase client for server-side operations
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Failed to get current user');
    }

    const userId = user.id;

    // Start transaction by updating user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({
        fitness_level: validatedData.fitnessLevel,
        has_completed_tutorial: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      throw new Error('Failed to update user profile');
    }

    // Delete existing user goals to replace with new ones
    const { error: deleteGoalsError } = await supabase
      .from('user_goals')
      .delete()
      .eq('user_id', userId);

    if (deleteGoalsError) {
      console.error('Error deleting existing goals:', deleteGoalsError);
      throw new Error('Failed to update goals');
    }

    // Insert new user goals
    const userGoalsData = validatedData.goalIds.map(goalId => ({
      user_id: userId,
      goal_id: goalId
    }));

    const { error: insertGoalsError } = await supabase
      .from('user_goals')
      .insert(userGoalsData);

    if (insertGoalsError) {
      console.error('Error inserting user goals:', insertGoalsError);
      throw new Error('Failed to save goals');
    }

    // Delete existing availability to replace with new ones
    const { error: deleteAvailabilityError } = await supabase
      .from('user_availability')
      .delete()
      .eq('user_id', userId);

    if (deleteAvailabilityError) {
      console.error('Error deleting existing availability:', deleteAvailabilityError);
      throw new Error('Failed to update availability');
    }

    // Insert new availability data
    const availabilityData = validatedData.availability.map(slot => ({
      user_id: userId,
      day_of_week: slot.dayOfWeek,
      time_of_day: slot.timeOfDay
    }));

    const { error: insertAvailabilityError } = await supabase
      .from('user_availability')
      .insert(availabilityData);

    if (insertAvailabilityError) {
      console.error('Error inserting availability:', insertAvailabilityError);
      throw new Error('Failed to save availability');
    }

    return { success: true };

  } catch (error) {
    console.error('Onboarding error:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Invalid input data' 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

export async function getGoals() {
  try {
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

    const { data: goals, error } = await supabase
      .from('goals')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching goals:', error);
      throw new Error('Failed to fetch goals');
    }

    return { success: true, data: goals };
  } catch (error) {
    console.error('Error in getGoals:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch goals',
      data: []
    };
  }
}
