import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Pre-written AI roast messages for penalties
const PENALTY_MESSAGES = [
  "🏋️‍♂️ Looks like someone skipped leg day... and every other day this week! Your couch is getting more exercise than you are.",
  "💪 Your gym membership is crying from neglect. Maybe it's time to actually use it instead of just paying for it?",
  "🚴‍♀️ The only thing that's been consistently working out is your excuse generator. Time to reboot that system!",
  "🏃‍♂️ Your fitness tracker is so confused it thinks you're a statue. Let's prove it wrong next week!",
  "🥗 Your vegetables are getting lonely in the fridge. They miss being part of a healthy lifestyle!",
  "💀 Your workout clothes are staging an intervention. They want to see the outside world again!",
  "🎯 Your goals are calling from a land far, far away... where people actually work out regularly.",
  "⚡ Your energy levels are so low they're considering early retirement. Time for a comeback!",
  "🌟 Your motivation is MIA (Missing In Action). Time to send out a search party!",
  "🔥 Your fire is so dim it's practically a candle. Let's turn it back into a bonfire!"
]

const WORKOUT_MISSED_MESSAGES = [
  "💪 Hey! We noticed you missed today's workout. Your group is counting on you!",
  "🏋️‍♂️ Your workout buddy is waiting for you. Don't let them down!",
  "🚴‍♀️ Time to get back on track! Your fitness journey is waiting.",
  "🏃‍♂️ Missing workouts is like missing puzzle pieces - you need all of them to complete the picture!",
  "💯 Your consistency is what makes the group strong. Let's keep it up!"
]

interface WeeklyJobResult {
  success: boolean
  message: string
  stats: {
    groupsProcessed: number
    penaltiesAssigned: number
    notificationsSent: number
    pointsArchived: number
  }
  errors: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current week boundaries
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay()) // Sunday
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // Saturday
    weekEnd.setHours(23, 59, 59, 999)

    console.log(`Processing weekly job for week: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`)

    const result: WeeklyJobResult = {
      success: true,
      message: 'Weekly job completed successfully',
      stats: {
        groupsProcessed: 0,
        penaltiesAssigned: 0,
        notificationsSent: 0,
        pointsArchived: 0
      },
      errors: []
    }

    // Fetch all groups with active contracts
    const { data: activeGroups, error: groupsError } = await supabase
      .from('contracts')
      .select(`
        id,
        group_id,
        status,
        groups!inner(
          id,
          name,
          group_members!inner(
            user_id,
            role,
            users!inner(id, name, email)
          )
        )
      `)
      .eq('status', 'Active')

    if (groupsError) {
      throw new Error(`Failed to fetch active groups: ${groupsError.message}`)
    }

    if (!activeGroups || activeGroups.length === 0) {
      console.log('No active groups found')
      return new Response(JSON.stringify({
        success: true,
        message: 'No active groups to process',
        stats: result.stats
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${activeGroups.length} active groups to process`)

    // Process each group
    for (const contract of activeGroups) {
      try {
        result.stats.groupsProcessed++
        const groupId = contract.group_id
        const groupName = contract.groups.name

        console.log(`Processing group: ${groupName} (${groupId})`)

        // Get all group members
        const members = contract.groups.group_members

        // Process each member
        for (const member of members) {
          const userId = member.user_id
          const userName = member.users.name

          // Calculate points for this week
          const { data: weeklyPoints, error: pointsError } = await supabase
            .from('point_transactions')
            .select('points')
            .eq('user_id', userId)
            .gte('created_at', weekStart.toISOString())
            .lte('created_at', weekEnd.toISOString())

          if (pointsError) {
            console.error(`Error fetching points for user ${userId}:`, pointsError)
            result.errors.push(`Failed to fetch points for user ${userName}`)
            continue
          }

          const totalPoints = weeklyPoints?.reduce((sum, transaction) => sum + transaction.points, 0) || 0
          const pointThreshold = 20 // Configurable threshold

          console.log(`User ${userName} earned ${totalPoints} points this week (threshold: ${pointThreshold})`)

          // Check if user earned enough points
          if (totalPoints < pointThreshold) {
            // Assign penalty
            const randomMessage = PENALTY_MESSAGES[Math.floor(Math.random() * PENALTY_MESSAGES.length)]
            
            const { error: penaltyError } = await supabase
              .from('penalties')
              .upsert({
                user_id: userId,
                group_id: groupId,
                week_start_date: weekStart.toISOString().split('T')[0],
                week_end_date: weekEnd.toISOString().split('T')[0],
                points_earned: totalPoints,
                point_threshold: pointThreshold,
                penalty_message: randomMessage,
                penalty_type: 'weekly_tally'
              }, {
                onConflict: 'user_id,group_id,week_start_date'
              })

            if (penaltyError) {
              console.error(`Error creating penalty for user ${userId}:`, penaltyError)
              result.errors.push(`Failed to create penalty for user ${userName}`)
            } else {
              result.stats.penaltiesAssigned++
              console.log(`Assigned penalty to user ${userName}`)
            }

            // Create notification for missed workout
            const randomNudgeMessage = WORKOUT_MISSED_MESSAGES[Math.floor(Math.random() * WORKOUT_MISSED_MESSAGES.length)]
            
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert({
                user_id: userId,
                group_id: groupId,
                title: 'Weekly Accountability Check',
                message: randomNudgeMessage,
                notification_type: 'workout_missed',
                related_event_type: 'penalty'
              })

            if (notificationError) {
              console.error(`Error creating notification for user ${userId}:`, notificationError)
              result.errors.push(`Failed to create notification for user ${userName}`)
            } else {
              result.stats.notificationsSent++
              console.log(`Sent notification to user ${userName}`)
            }
          }
        }

        // Archive old point transactions for this group
        const { data: archivedCount, error: archiveError } = await supabase
          .rpc('archive_weekly_points', {
            week_start_date: weekStart.toISOString().split('T')[0],
            week_end_date: weekEnd.toISOString().split('T')[0]
          })

        if (archiveError) {
          console.error(`Error archiving points for group ${groupId}:`, archiveError)
          result.errors.push(`Failed to archive points for group ${groupName}`)
        } else {
          result.stats.pointsArchived += archivedCount || 0
          console.log(`Archived ${archivedCount} point transactions for group ${groupName}`)
        }

      } catch (groupError) {
        console.error(`Error processing group ${contract.group_id}:`, groupError)
        result.errors.push(`Failed to process group ${contract.groups.name}: ${groupError.message}`)
      }
    }

    // Set success status based on errors
    if (result.errors.length > 0) {
      result.success = false
      result.message = `Weekly job completed with ${result.errors.length} errors`
    }

    console.log('Weekly job completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Weekly job failed:', error)
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Weekly job failed',
      error: error.message,
      stats: {
        groupsProcessed: 0,
        penaltiesAssigned: 0,
        notificationsSent: 0,
        pointsArchived: 0
      },
      errors: [error.message]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
