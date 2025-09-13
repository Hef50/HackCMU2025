'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import type { Database, Contract, CheckIn, WorkoutInstance, ChatMessage, Kudos } from '@/lib/types';

// Validation schemas
const contractSchema = z.object({
  schedule: z.object({
    days: z.array(z.number().min(0).max(6)).min(1, 'Please select at least one day'),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)')
  }),
  location_name: z.string().min(1, 'Location name is required'),
  rules: z.string().optional()
});

const checkInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long')
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// Helper function to check if user is admin of the group
async function checkUserIsAdmin(supabase: ReturnType<typeof createSupabaseClient>, userId: string, groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    throw new Error('User is not a member of this group');
  }
  
  if (data.role !== 'Admin') {
    throw new Error('Only group admins can perform this action');
  }
  
  return true;
}

export async function createContract(formData: FormData, groupId: string) {
  try {
    // Extract form data
    const rawData = {
      schedule: {
        days: formData.getAll('days').map(day => parseInt(day.toString())),
        time: formData.get('time')?.toString() || ''
      },
      location_name: formData.get('location_name')?.toString() || '',
      rules: formData.get('rules')?.toString() || ''
    };

    // Validate input data
    const validatedData = contractSchema.parse(rawData);
    
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);
    
    // Check if user is admin of the group
    await checkUserIsAdmin(supabase, user.id, groupId);
    
    // Check if contract already exists for this group
    const { data: existingContract } = await supabase
      .from('contracts')
      .select('id')
      .eq('group_id', groupId)
      .single();
    
    if (existingContract) {
      return {
        success: false,
        error: 'A contract already exists for this group'
      };
    }
    
    // Create the contract
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        group_id: groupId,
        schedule: validatedData.schedule,
        location_name: validatedData.location_name,
        rules: validatedData.rules || null,
        status: 'Active' as const
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating contract:', error);
      throw new Error('Failed to create contract');
    }
    
    // Create workout instances for the next 30 days based on the schedule
    await createWorkoutInstances(supabase, groupId, validatedData.schedule);
    
    return { success: true, data };
    
  } catch (error) {
    console.error('Create contract error:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Invalid input data' 
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

export async function performCheckIn(location: { latitude: number, longitude: number }, groupId: string) {
  try {
    // Validate location data
    const validatedLocation = checkInSchema.parse(location);
    
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);
    
    // Check if user is member of the group
    const { data: membership } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();
    
    if (!membership) {
      return {
        success: false,
        error: 'You are not a member of this group'
      };
    }
    
    // Find the current scheduled workout instance
    const now = new Date();
    const currentWorkoutInstance = await getCurrentWorkoutInstance(supabase, groupId, now);
    
    if (!currentWorkoutInstance) {
      return {
        success: false,
        error: 'No workout is currently scheduled for check-in'
      };
    }
    
    // Check if user has already checked in for this workout
    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('id')
      .eq('workout_instance_id', currentWorkoutInstance.id)
      .eq('user_id', user.id)
      .single();
    
    if (existingCheckIn) {
      return {
        success: false,
        error: 'You have already checked in for this workout'
      };
    }
    
    // Determine check-in status based on timing
    const scheduledTime = new Date(currentWorkoutInstance.scheduled_at);
    const timeDiff = now.getTime() - scheduledTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    let status: 'OnTime' | 'Late' | 'Missed';
    if (minutesDiff <= 15) { // Within 15 minutes after scheduled time
      status = 'OnTime';
    } else if (minutesDiff <= 30) { // Within 30 minutes after scheduled time
      status = 'Late';
    } else {
      status = 'Missed';
    }
    
    // Create the check-in record
    const { data, error } = await supabase
      .from('check_ins')
      .insert({
        workout_instance_id: currentWorkoutInstance.id,
        user_id: user.id,
        checked_in_at: now.toISOString(),
        status,
        latitude: validatedLocation.latitude,
        longitude: validatedLocation.longitude
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating check-in:', error);
      throw new Error('Failed to record check-in');
    }
    
    return { success: true, data, status };
    
  } catch (error) {
    console.error('Check-in error:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Invalid location data' 
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// Helper function to create workout instances based on schedule
async function createWorkoutInstances(
  supabase: ReturnType<typeof createSupabaseClient>, 
  groupId: string, 
  schedule: { days: number[], time: string }
) {
  const instances: Array<{ group_id: string, scheduled_at: string }> = [];
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30); // Create instances for next 30 days
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    
    if (schedule.days.includes(dayOfWeek)) {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      const scheduledAt = new Date(date);
      scheduledAt.setHours(hours, minutes, 0, 0);
      
      // Only create instances for future times
      if (scheduledAt > new Date()) {
        instances.push({
          group_id: groupId,
          scheduled_at: scheduledAt.toISOString()
        });
      }
    }
  }
  
  if (instances.length > 0) {
    const { error } = await supabase
      .from('workout_instances')
      .insert(instances);
    
    if (error) {
      console.error('Error creating workout instances:', error);
      // Don't throw here as the contract was already created successfully
    }
  }
}

// Helper function to get current workout instance
async function getCurrentWorkoutInstance(
  supabase: ReturnType<typeof createSupabaseClient>, 
  groupId: string, 
  currentTime: Date
): Promise<WorkoutInstance | null> {
  const timeWindow = 15 * 60 * 1000; // 15 minutes in milliseconds
  const earliestTime = new Date(currentTime.getTime() - timeWindow);
  const latestTime = new Date(currentTime.getTime() + timeWindow);
  
  const { data, error } = await supabase
    .from('workout_instances')
    .select('*')
    .eq('group_id', groupId)
    .gte('scheduled_at', earliestTime.toISOString())
    .lte('scheduled_at', latestTime.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data;
}

export async function postChatMessage(message: string, groupId: string) {
  try {
    // Validate input data
    const validatedData = chatMessageSchema.parse({ message });
    
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);
    
    // Check if user is member of the group
    const { data: membership } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();
    
    if (!membership) {
      return {
        success: false,
        error: 'You are not a member of this group'
      };
    }
    
    // Insert the chat message
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        group_id: groupId,
        sender_id: user.id,
        content: validatedData.message,
        message_type: 'User' as const
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error posting message:', error);
      throw new Error('Failed to post message');
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error('Post message error:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Invalid message data' 
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

export async function getCloudinarySignature() {
  try {
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);
    
    // Generate a unique folder path for this user
    const folder = `workout-checkins/${user.id}`;
    
    // Generate signature for direct browser upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        resource_type: 'image',
        allowed_formats: 'jpg,jpeg,png,webp',
        max_file_size: 10485760, // 10MB
      },
      process.env.CLOUDINARY_API_SECRET!
    );
    
    return {
      success: true,
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder
    };
    
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    return {
      success: false,
      error: 'Failed to generate upload signature'
    };
  }
}

export async function updateCheckInWithImage(checkInId: string, imageUrl: string) {
  try {
    // Validate image URL
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return {
        success: false,
        error: 'Invalid image URL'
      };
    }
    
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);
    
    // Verify the check-in belongs to the current user
    const { data: checkIn } = await supabase
      .from('check_ins')
      .select('user_id')
      .eq('id', checkInId)
      .single();
    
    if (!checkIn || checkIn.user_id !== user.id) {
      return {
        success: false,
        error: 'Check-in not found or access denied'
      };
    }
    
    // Update the check-in with image URL
    const { data, error } = await supabase
      .from('check_ins')
      .update({ image_url: imageUrl })
      .eq('id', checkInId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating check-in:', error);
      throw new Error('Failed to update check-in');
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error('Update check-in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

export async function giveKudosToCheckIn(checkInId: string, receiverId: string) {
  try {
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);
    
    // Prevent self-kudos
    if (user.id === receiverId) {
      return {
        success: false,
        error: 'You cannot give kudos to yourself'
      };
    }
    
    // Verify the check-in exists and get workout instance info
    const { data: checkIn } = await supabase
      .from('check_ins')
      .select(`
        id,
        user_id,
        workout_instance_id,
        workout_instances!inner(
          group_id,
          group_members!inner(user_id, role)
        )
      `)
      .eq('id', checkInId)
      .single();
    
    if (!checkIn) {
      return {
        success: false,
        error: 'Check-in not found'
      };
    }
    
    // Verify the current user is a member of the same group
    const isGroupMember = checkIn.workout_instances.group_members.some(
      (member: any) => member.user_id === user.id
    );
    
    if (!isGroupMember) {
      return {
        success: false,
        error: 'You must be a member of this group to give kudos'
      };
    }
    
    // Check if user has already given kudos to this check-in
    const { data: existingKudos } = await supabase
      .from('kudos')
      .select('id')
      .eq('check_in_id', checkInId)
      .eq('giver_id', user.id)
      .single();
    
    if (existingKudos) {
      return {
        success: false,
        error: 'You have already given kudos to this check-in'
      };
    }
    
    // Insert the kudos record
    const { data: kudosData, error: kudosError } = await supabase
      .from('kudos')
      .insert({
        check_in_id: checkInId,
        giver_id: user.id,
        receiver_id: receiverId
      })
      .select()
      .single();
    
    if (kudosError) {
      console.error('Error creating kudos:', kudosError);
      throw new Error('Failed to create kudos');
    }
    
    // Award points to both giver and receiver
    const pointTransactions = [
      {
        user_id: user.id,
        points: 1,
        description: 'Gave kudos to a group member',
        related_check_in_id: checkInId
      },
      {
        user_id: receiverId,
        points: 2,
        description: 'Received kudos from a group member',
        related_check_in_id: checkInId
      }
    ];
    
    const { error: pointsError } = await supabase
      .from('point_transactions')
      .insert(pointTransactions);
    
    if (pointsError) {
      console.error('Error creating point transactions:', pointsError);
      // Don't fail the kudos creation if points fail
    }
    
    return { success: true, data: kudosData };
    
  } catch (error) {
    console.error('Give kudos error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// Event Management Actions

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  event_date: z.string().min(1, 'Event date is required'),
  location: z.string().max(500, 'Location too long').optional(),
  max_attendees: z.coerce.number().min(1, 'Max attendees must be at least 1').optional()
});

const rsvpSchema = z.object({
  status: z.enum(['going', 'maybe', 'not_going'], {
    required_error: 'RSVP status is required'
  })
});

export async function createEvent(formData: FormData, groupId: string) {
  try {
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);

    // Verify user is a member of the group
    const { data: membership } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return {
        success: false,
        error: 'You are not a member of this group'
      };
    }

    // Parse and validate form data
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      event_date: formData.get('event_date'),
      location: formData.get('location'),
      max_attendees: formData.get('max_attendees')
    };

    const validatedData = eventSchema.parse(rawData);

    // Validate event date is in the future
    const eventDate = new Date(validatedData.event_date);
    const now = new Date();
    if (eventDate <= now) {
      return {
        success: false,
        error: 'Event date must be in the future'
      };
    }

    // Create the event
    const { data, error } = await supabase
      .from('group_events')
      .insert({
        group_id: groupId,
        created_by: user.id,
        title: validatedData.title,
        description: validatedData.description || null,
        event_date: eventDate.toISOString(),
        location: validatedData.location || null,
        max_attendees: validatedData.max_attendees || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: 'Failed to create event'
      };
    }

    return { success: true, data };

  } catch (error) {
    console.error('Create event error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

export async function rsvpToEvent(eventId: string, rsvpStatus: string) {
  try {
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);

    // Validate RSVP status
    const validatedStatus = rsvpSchema.parse({ status: rsvpStatus }).status;

    // Verify user is a member of the group that owns this event
    const { data: event } = await supabase
      .from('group_events')
      .select(`
        id,
        group_id,
        group:groups!inner(
          id,
          group_members!inner(user_id)
        )
      `)
      .eq('id', eventId)
      .single();

    if (!event) {
      return {
        success: false,
        error: 'Event not found'
      };
    }

    const isGroupMember = event.group.group_members.some((member: any) => member.user_id === user.id);
    if (!isGroupMember) {
      return {
        success: false,
        error: 'You are not a member of this group'
      };
    }

    // Create or update RSVP
    const { data, error } = await supabase
      .from('event_rsvps')
      .upsert({
        event_id: eventId,
        user_id: user.id,
        status: validatedStatus
      }, {
        onConflict: 'event_id,user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating RSVP:', error);
      return {
        success: false,
        error: 'Failed to update RSVP'
      };
    }

    return { success: true, data };

  } catch (error) {
    console.error('RSVP error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

export async function removeGroupMember(userIdToRemove: string, groupId: string) {
  try {
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);

    // Verify the current user is an admin of the group
    const { data: adminMembership } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('role', 'Admin')
      .single();

    if (!adminMembership) {
      return {
        success: false,
        error: 'Only group admins can remove members'
      };
    }

    // Prevent admin from removing themselves
    if (userIdToRemove === user.id) {
      return {
        success: false,
        error: 'You cannot remove yourself from the group'
      };
    }

    // Verify the user to remove is actually a member
    const { data: memberToRemove } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userIdToRemove)
      .single();

    if (!memberToRemove) {
      return {
        success: false,
        error: 'User is not a member of this group'
      };
    }

    // Remove the member from the group
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userIdToRemove);

    if (error) {
      console.error('Error removing group member:', error);
      return {
        success: false,
        error: 'Failed to remove member from group'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Remove member error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// Contract Management Actions

export async function updateContractStatus(groupId: string, newStatus: 'Active' | 'Paused') {
  try {
    const supabase = createSupabaseClient();
    const user = await getCurrentUser(supabase);

    // Verify the current user is an admin of the group
    const { data: adminMembership } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('role', 'Admin')
      .single();

    if (!adminMembership) {
      return {
        success: false,
        error: 'Only group admins can update contract status'
      };
    }

    // Verify the group has a contract
    const { data: contract } = await supabase
      .from('contracts')
      .select('*')
      .eq('group_id', groupId)
      .single();

    if (!contract) {
      return {
        success: false,
        error: 'No contract found for this group'
      };
    }

    // Update the contract status
    const { error } = await supabase
      .from('contracts')
      .update({ status: newStatus })
      .eq('group_id', groupId);

    if (error) {
      console.error('Error updating contract status:', error);
      return {
        success: false,
        error: 'Failed to update contract status'
      };
    }

    // Create a notification for all group members about the status change
    const { data: groupMembers } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (groupMembers && groupMembers.length > 0) {
      const notifications = groupMembers.map(member => ({
        user_id: member.user_id,
        group_id: groupId,
        title: `Contract ${newStatus.toLowerCase()}`,
        message: newStatus === 'Active' 
          ? 'Your group contract has been resumed. Workouts will now be tracked again!'
          : 'Your group contract has been paused. Workouts will not be tracked until resumed.',
        notification_type: 'contract_status_change'
      }));

      await supabase
        .from('notifications')
        .insert(notifications);
    }

    return { 
      success: true,
      message: `Contract ${newStatus.toLowerCase()} successfully`
    };

  } catch (error) {
    console.error('Update contract status error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}
