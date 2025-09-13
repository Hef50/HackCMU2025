'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import type { Database, PunishmentType } from '@/lib/types';

// Validation schema for contract creation
const createContractSchema = z.object({
  name: z.string().min(1, 'Contract name is required').max(100, 'Contract name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  frequency: z.string().min(1, 'Frequency is required'),
  timeOfDay: z.enum(['Morning', 'Afternoon', 'Evening']),
  daysOfWeek: z.array(z.number().min(0).max(6)).min(1, 'Please select at least one day'),
  punishmentType: z.enum(['monetary', 'challenge', 'social', 'service', 'diet']),
  punishmentAmount: z.string().min(1, 'Punishment amount is required'),
  punishmentDescription: z.string().max(200, 'Punishment description must be less than 200 characters').optional(),
  contractDuration: z.string().min(1, 'Contract duration is required'),
  stakeAmount: z.string().min(1, 'Stake amount is required'),
  groupId: z.string().uuid('Invalid group ID')
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

export async function createContract(data: {
  name: string;
  description?: string;
  frequency: string;
  timeOfDay: string;
  daysOfWeek: number[];
  punishmentType: PunishmentType;
  punishmentAmount: string;
  punishmentDescription?: string;
  contractDuration: string;
  stakeAmount: string;
  groupId: string;
}): Promise<{ success: boolean; contractId?: string; error?: string }> {
  try {
    // Validate input data
    const validatedData = createContractSchema.parse(data);
    
    const supabase = createSupabaseClient();
    const userId = await getCurrentUser();

    // Check for backdoor mode and skip database operations
    const cookieStore = cookies();
    const backdoorCookie = cookieStore.get('backdoor_test');
    const isBackdoorMode = backdoorCookie?.value === 'true';
    
    if (isBackdoorMode) {
      console.log('Backdoor mode: Skipping contract creation');
      // Return success with mock contract ID
      return { 
        success: true, 
        contractId: 'backdoor-test-contract' 
      };
    }

    // Create the contract schedule
    const schedule = {
      frequency: parseInt(validatedData.frequency),
      timeOfDay: validatedData.timeOfDay,
      daysOfWeek: validatedData.daysOfWeek
    };

    // Insert the new contract
    const { data: newContract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        group_id: validatedData.groupId,
        schedule: schedule,
        location_name: 'TBD', // Will be set later
        rules: `${validatedData.description || ''}\n\nContract Duration: ${validatedData.contractDuration} weeks\nStake Amount: $${validatedData.stakeAmount}\nPunishment: ${validatedData.punishmentType} - ${validatedData.punishmentAmount}${validatedData.punishmentDescription ? ` (${validatedData.punishmentDescription})` : ''}`,
        status: 'Pending'
      })
      .select('id')
      .single();

    if (contractError || !newContract) {
      console.error('Error creating contract:', contractError);
      throw new Error('Failed to create contract');
    }

    // Return success with contract ID for client-side redirect
    return { 
      success: true, 
      contractId: newContract.id 
    };

  } catch (error) {
    console.error('Error in createContract:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Invalid input data' 
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create contract';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

export async function getContracts(groupId: string): Promise<{ success: boolean; data: any[]; error?: string }> {
  try {
    const supabase = createSupabaseClient();
    
    // Check for backdoor testing mode
    const cookieStore = cookies();
    const backdoorCookie = cookieStore.get('backdoor_test');
    const isBackdoorMode = backdoorCookie?.value === 'true';
    
    if (isBackdoorMode) {
      console.log('Backdoor mode: Returning mock contracts');
      // Return mock data for testing
      return {
        success: true,
        data: [
          {
            id: 'mock-contract-1',
            group_id: groupId,
            schedule: {
              frequency: 5,
              timeOfDay: 'Morning',
              daysOfWeek: [1, 2, 3, 4, 5]
            },
            location_name: 'Local Gym',
            rules: '5-day workout challenge with $10 penalty for missed sessions. Ice bucket challenge for 2+ misses in a week.',
            status: 'Active',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'mock-contract-2',
            group_id: groupId,
            schedule: {
              frequency: 3,
              timeOfDay: 'Evening',
              daysOfWeek: [2, 4, 6]
            },
            location_name: 'Home Workouts',
            rules: '3x weekly strength training. $15 penalty for missed workouts. Must post workout selfie on social media.',
            status: 'Pending',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
    }

    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      throw new Error('Failed to fetch contracts');
    }

    return { success: true, data: contracts || [] };
  } catch (error) {
    console.error('Error in getContracts:', error);
    return { 
      success: false, 
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch contracts'
    };
  }
}

export async function activateContract(contractId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient();
    const userId = await getCurrentUser();

    // Check for backdoor testing mode
    const cookieStore = cookies();
    const backdoorCookie = cookieStore.get('backdoor_test');
    const isBackdoorMode = backdoorCookie?.value === 'true';
    
    if (isBackdoorMode) {
      console.log('Backdoor mode: Skipping contract activation');
      return { success: true };
    }

    const { error } = await supabase
      .from('contracts')
      .update({ status: 'Active' })
      .eq('id', contractId);

    if (error) {
      console.error('Error activating contract:', error);
      throw new Error('Failed to activate contract');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in activateContract:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to activate contract'
    };
  }
}
