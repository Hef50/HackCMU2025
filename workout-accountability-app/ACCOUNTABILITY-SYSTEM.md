# Accountability System Implementation

This document describes the complete accountability system implementation for GroupGainz, featuring weekly points tally, penalty system, group pause functionality, and AI nudges using Supabase Edge Functions.

## Features Overview

### 1. Weekly Accountability System
- **Automated Weekly Job**: Runs every Sunday night via Supabase Edge Function
- **Points Calculation**: Tracks member points over the past 7 days
- **Penalty Assignment**: AI-generated "roast" messages for members below threshold
- **Points Reset**: Archives old point transactions for clean weekly cycles

### 2. Group Contract Management
- **Pause/Resume**: Admins can pause contracts for vacations or breaks
- **Status Tracking**: Visual indicators for contract status
- **Notification System**: Members notified of contract status changes
- **Weekly Job Exclusion**: Paused groups excluded from accountability checks

### 3. AI Nudges & Notifications
- **Missed Workout Alerts**: Automated notifications for low-performing members
- **Motivational Messages**: Pre-written encouraging messages
- **Penalty Roasts**: Funny, motivating "roast" messages for accountability
- **Real-time Updates**: Instant notification delivery

## Implementation Details

### Files Created/Modified

1. **Database Schema** (`/schema-accountability-tables.sql`)
   - `penalties` table for weekly accountability records
   - `notifications` table for user alerts and nudges
   - Contract status column and RLS policies
   - Helper functions for week boundaries and point archiving

2. **Edge Function** (`/supabase/functions/weekly-job/index.ts`)
   - Automated weekly processing with cron scheduling
   - Points calculation and penalty assignment
   - Notification generation and delivery
   - Point transaction archiving for clean cycles

3. **Server Actions** (`/app/dashboard/groups/[groupId]/actions.ts`)
   - `updateContractStatus()`: Admin-only contract pause/resume
   - Group member notification creation
   - Permission validation and error handling

4. **Admin Controls** (`/components/groups/AdminControls.tsx`)
   - Contract status management interface
   - Confirmation dialogs for status changes
   - Visual status indicators and feedback

5. **Weekly Summary** (`/components/groups/WeeklySummary.tsx`)
   - Display of weekly penalties and notifications
   - Statistical overview of group performance
   - Member accountability visualization

6. **TypeScript Types** (`/lib/types.ts`)
   - `Penalty` and `Notification` interfaces
   - Database type definitions for new tables
   - Contract status type updates

## Database Schema

### Penalties Table
```sql
CREATE TABLE penalties (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    week_start_date date NOT NULL,
    week_end_date date NOT NULL,
    points_earned integer NOT NULL DEFAULT 0,
    point_threshold integer NOT NULL DEFAULT 20,
    penalty_message text NOT NULL,
    penalty_type varchar(50) NOT NULL DEFAULT 'weekly_tally',
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, group_id, week_start_date)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    message text NOT NULL,
    notification_type varchar(50) NOT NULL DEFAULT 'general',
    is_read boolean DEFAULT false,
    related_event_id uuid,
    related_event_type varchar(50),
    created_at timestamptz DEFAULT now(),
    read_at timestamptz
);
```

### Contract Status Update
```sql
ALTER TABLE contracts ADD COLUMN status varchar(20) DEFAULT 'Active' 
CHECK (status IN ('Active', 'Paused'));
```

## Edge Function Implementation

### Weekly Job Process
```typescript
// 1. Get current week boundaries (Sunday to Saturday)
const weekStart = new Date(today);
weekStart.setDate(today.getDate() - today.getDay());

// 2. Fetch all groups with active contracts
const activeGroups = await supabase
  .from('contracts')
  .select('*, groups!inner(*)')
  .eq('status', 'Active');

// 3. Process each group member
for (const member of groupMembers) {
  // Calculate weekly points
  const weeklyPoints = await calculateMemberPoints(member.id, weekStart, weekEnd);
  
  // Check against threshold (default: 20 points)
  if (weeklyPoints < pointThreshold) {
    // Assign penalty with random roast message
    await assignPenalty(member.id, weeklyPoints, pointThreshold);
    
    // Send motivational notification
    await sendNotification(member.id, 'workout_missed');
  }
}

// 4. Archive old point transactions
await archiveWeeklyPoints(weekStart, weekEnd);
```

### AI Roast Messages
The system includes 10 pre-written "roast" messages that are randomly selected:
- "🏋️‍♂️ Looks like someone skipped leg day... and every other day this week!"
- "💪 Your gym membership is crying from neglect. Maybe it's time to actually use it?"
- "🚴‍♀️ The only thing that's been consistently working out is your excuse generator."
- And 7 more motivational roasts...

### Notification Types
- `workout_missed`: Motivational nudges for low performance
- `penalty_assigned`: Notification when penalty is applied
- `contract_status_change`: Contract pause/resume notifications

## Security Implementation

### Row Level Security Policies
```sql
-- Users can only view their own penalties
CREATE POLICY "Users can view their own penalties" ON penalties
    FOR SELECT USING (auth.uid() = user_id);

-- Group members can view penalties in their groups
CREATE POLICY "Group members can view penalties in their groups" ON penalties
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = penalties.group_id AND user_id = auth.uid()
        )
    );

-- Only admins can update contract status
CREATE POLICY "Admins can update contract status" ON contracts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = contracts.group_id 
            AND user_id = auth.uid() 
            AND role = 'Admin'
        )
    );
```

### Server-Side Validation
- Admin role verification for contract status changes
- Group membership validation for all operations
- Input sanitization and error handling
- Secure Edge Function with service role key

## User Interface Features

### Admin Controls Component
- **Status Display**: Visual indicators for Active/Paused contracts
- **Action Buttons**: Pause/Resume with confirmation dialogs
- **Feedback System**: Success/error messages with clear actions
- **Permission Checks**: Only visible to group admins

### Weekly Summary Component
- **Statistical Overview**: Total members, average points, penalty count
- **Penalty Display**: Individual penalty cards with roast messages
- **Notification Feed**: Recent notifications with timestamps
- **Visual Design**: Consistent with app's dark theme and glass morphism

### Visual Design Elements
- **Status Colors**: Green (Active), Yellow (Paused), Red (Penalties)
- **Icon System**: Intuitive icons for all status types and actions
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: Clear error messages with recovery options

## Performance Optimizations

### Database Performance
- **Indexed Queries**: Optimized indexes for penalties and notifications
- **Efficient Joins**: Proper foreign key relationships
- **Batch Operations**: Bulk notification creation
- **Archival System**: Clean separation of current and historical data

### Edge Function Efficiency
- **Parallel Processing**: Multiple groups processed simultaneously
- **Error Isolation**: Group processing failures don't affect others
- **Logging**: Comprehensive logging for debugging and monitoring
- **Resource Management**: Efficient memory usage and cleanup

## Deployment & Configuration

### Edge Function Setup
1. **Deploy Function**: Deploy to Supabase Edge Functions
2. **Set Environment Variables**: Configure service role key
3. **Schedule Cron Job**: Set up weekly execution (Sundays at 11 PM)
4. **Monitor Execution**: Set up logging and error alerts

### Database Migration
1. **Run Schema**: Execute accountability tables SQL
2. **Verify RLS**: Confirm Row Level Security policies
3. **Test Functions**: Validate helper functions work correctly
4. **Backup Data**: Ensure proper backup before migration

### Cron Job Configuration
```bash
# Weekly job - runs every Sunday at 11 PM
0 23 * * 0 curl -X POST https://your-project.supabase.co/functions/v1/weekly-job
```

## Usage Workflows

### Weekly Accountability Process
1. **Sunday Night**: Edge function triggers automatically
2. **Group Processing**: Each active group is processed
3. **Point Calculation**: Member points calculated for past week
4. **Penalty Assignment**: Low performers receive roast messages
5. **Notification Delivery**: Motivational nudges sent to members
6. **Data Cleanup**: Old point transactions archived

### Admin Contract Management
1. **Access Controls**: Navigate to group page as admin
2. **View Status**: See current contract status (Active/Paused)
3. **Change Status**: Click Pause/Resume button
4. **Confirm Action**: Confirm status change in dialog
5. **Notification**: All members notified of status change

### Member Experience
1. **Weekly Check**: Members see weekly summary on group page
2. **Penalty View**: View any penalties assigned with roast messages
3. **Notifications**: Receive motivational nudges for missed workouts
4. **Progress Tracking**: Monitor points and accountability status

## Monitoring & Analytics

### Weekly Job Metrics
- Groups processed successfully
- Penalties assigned
- Notifications sent
- Points archived
- Processing errors and failures

### User Engagement
- Penalty response rates
- Notification read rates
- Contract status change frequency
- Member retention after penalties

### Performance Monitoring
- Edge function execution time
- Database query performance
- Error rates and types
- Resource utilization

## Future Enhancements

### Advanced Accountability
1. **Custom Thresholds**: Per-group point thresholds
2. **Graduated Penalties**: Escalating penalties for repeat offenders
3. **Reward System**: Positive reinforcement for high performers
4. **Personalized Messages**: AI-generated custom roasts

### Enhanced Notifications
1. **Push Notifications**: Real-time mobile notifications
2. **Email Integration**: Email delivery for important alerts
3. **SMS Notifications**: Text message nudges
4. **Custom Timing**: Personalized notification schedules

### Analytics & Reporting
1. **Performance Dashboards**: Detailed analytics for admins
2. **Member Reports**: Individual progress reports
3. **Trend Analysis**: Long-term performance trends
4. **Predictive Insights**: ML-based performance predictions

### Gamification
1. **Achievement Badges**: Recognition for milestones
2. **Leaderboards**: Competitive rankings
3. **Streak Tracking**: Consistency rewards
4. **Social Features**: Peer recognition and support

## Dependencies

### New Dependencies
- No new external dependencies required
- Uses existing Supabase and React ecosystem

### Existing Dependencies Used
- `@supabase/auth-helpers-nextjs`: Authentication and client operations
- `@supabase/supabase-js`: Edge function Supabase client
- `react`: State management and component lifecycle
- `zod`: Input validation and type safety
- `next.js`: Server components and routing

## Error Handling

### Edge Function Error Handling
- Comprehensive try-catch blocks for all operations
- Group-level error isolation (one group failure doesn't stop others)
- Detailed error logging with context
- Graceful degradation for partial failures

### Client-Side Error States
- Loading states with skeleton screens
- Error boundaries for component failures
- User-friendly error messages
- Retry mechanisms for failed operations

### Database Error Handling
- Constraint violation handling
- Connection error recovery
- Transaction rollback for failed operations
- Data integrity protection

The implementation provides a complete accountability system that motivates group members through gamification, automated nudges, and social pressure while maintaining performance, security, and user experience standards.
