# Events & Member Management Features

This document describes the implementation of group events scheduling and member management functionality for GroupGainz.

## Features Overview

### 1. Group Events System
- **Event Creation**: Any group member can schedule one-time events (hikes, social gatherings, etc.)
- **RSVP System**: Members can respond with "Going", "Maybe", or "Can't Go"
- **Event Details**: Title, description, date/time, location, and optional max attendees
- **Real-time Updates**: RSVP counts update instantly across all members

### 2. Member Management
- **Admin Controls**: Group admins can remove members from the group
- **Confirmation Dialogs**: Safe removal process with confirmation prompts
- **Self-Protection**: Admins cannot remove themselves from the group
- **Visual Indicators**: Clear admin badges and role-based UI elements

## Implementation Details

### Files Created/Modified

1. **Database Schema** (`/schema-events-update.sql`)
   - `group_events` table for storing event information
   - `event_rsvps` table for RSVP responses
   - Row Level Security policies for data protection
   - Proper indexing for performance optimization

2. **TypeScript Types** (`/lib/types.ts`)
   - `GroupEvent` interface for event data structure
   - `EventRSVP` interface for RSVP responses
   - Database type definitions for Supabase integration

3. **Server Actions** (`/app/dashboard/groups/[groupId]/actions.ts`)
   - `createEvent()`: Validates and creates new group events
   - `rsvpToEvent()`: Handles RSVP creation and updates
   - `removeGroupMember()`: Admin-only member removal functionality

4. **Events Page** (`/app/dashboard/groups/[groupId]/events/page.tsx`)
   - Client component for event management
   - Event creation modal with form validation
   - RSVP interface with real-time updates
   - Responsive design with mobile-first approach

5. **Member List Component** (`/components/groups/MemberList.tsx`)
   - Updated with admin remove functionality
   - Confirmation dialog for member removal
   - Role-based UI elements and permissions
   - Error handling and success feedback

6. **Group Tabs Component** (`/components/groups/GroupTabs.tsx`)
   - Updated to pass user role to MemberList
   - Maintains existing chat and member tab functionality

## Database Schema

### Group Events Table
```sql
CREATE TABLE group_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    created_by uuid REFERENCES users(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    description text,
    event_date timestamptz NOT NULL,
    location varchar(500),
    max_attendees integer,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

### Event RSVPs Table
```sql
CREATE TABLE event_rsvps (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id uuid REFERENCES group_events(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    status varchar(20) NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(event_id, user_id)
);
```

### Security Features
- **Row Level Security**: Users can only access events from their groups
- **Permission Checks**: Event creation limited to group members
- **Admin Verification**: Member removal restricted to group admins
- **Self-Protection**: Prevents admins from removing themselves

## Server Actions

### Create Event
```typescript
export async function createEvent(formData: FormData, groupId: string)
```
- **Validation**: Zod schema validation for all input fields
- **Date Validation**: Ensures event date is in the future
- **Membership Check**: Verifies user is a group member
- **Error Handling**: Comprehensive error messages and logging

### RSVP to Event
```typescript
export async function rsvpToEvent(eventId: string, rsvpStatus: string)
```
- **Status Validation**: Ensures valid RSVP status ('going', 'maybe', 'not_going')
- **Upsert Logic**: Creates new or updates existing RSVP
- **Group Verification**: Confirms user is member of event's group
- **Real-time Updates**: Immediate reflection of RSVP changes

### Remove Group Member
```typescript
export async function removeGroupMember(userIdToRemove: string, groupId: string)
```
- **Admin Verification**: Confirms current user is group admin
- **Self-Protection**: Prevents admin from removing themselves
- **Membership Validation**: Verifies target user is actually a member
- **Cascade Protection**: Handles related data cleanup

## User Interface

### Events Page Features
- **Event List**: Chronological display of upcoming events
- **Create Modal**: Full-featured event creation form
- **RSVP Interface**: Three-button RSVP system with visual feedback
- **Empty States**: Encouraging messages for new groups
- **Loading States**: Progress indicators during actions

### Member Management UI
- **Admin Indicators**: Crown icons and role badges for admins
- **Remove Buttons**: Red-styled buttons visible only to admins
- **Confirmation Dialogs**: Modal confirmation for member removal
- **Success/Error Feedback**: Clear messaging for all actions
- **Responsive Design**: Mobile-optimized touch interactions

### Visual Design Elements
- **Glass Morphism**: Consistent with app design language
- **Status Colors**: Green (going), Yellow (maybe), Red (not going/can't go)
- **Icon System**: Intuitive icons for all actions and states
- **Typography**: Clear hierarchy with proper contrast
- **Animations**: Smooth transitions and hover effects

## Security Implementation

### Authentication & Authorization
```typescript
// Verify user is authenticated
const user = await getCurrentUser(supabase);

// Check group membership
const { data: membership } = await supabase
  .from('group_members')
  .select('*')
  .eq('group_id', groupId)
  .eq('user_id', user.id)
  .single();

// Verify admin status for member removal
const { data: adminMembership } = await supabase
  .from('group_members')
  .select('*')
  .eq('group_id', groupId)
  .eq('user_id', user.id)
  .eq('role', 'Admin')
  .single();
```

### Row Level Security Policies
- **Event Access**: Users can only view events from their groups
- **RSVP Management**: Users can only manage their own RSVPs
- **Member Removal**: Only admins can remove group members
- **Event Creation**: Only group members can create events

## Performance Optimizations

### Database Indexing
```sql
-- Optimize event queries
CREATE INDEX idx_group_events_group_date ON group_events(group_id, event_date);
CREATE INDEX idx_event_rsvps_event_status ON event_rsvps(event_id, status);
```

### Client-Side Optimizations
- **Parallel Data Fetching**: Events and RSVPs loaded simultaneously
- **Optimistic Updates**: UI updates before server confirmation
- **Debounced Actions**: Prevents rapid-fire RSVP changes
- **Lazy Loading**: Components loaded only when needed

## Error Handling

### Server-Side Validation
- **Input Validation**: Zod schemas for all form data
- **Business Logic**: Date validation and membership checks
- **Database Errors**: Graceful handling of constraint violations
- **Logging**: Comprehensive error logging for debugging

### Client-Side Error States
- **Form Validation**: Real-time input validation feedback
- **Network Errors**: Retry mechanisms and fallback states
- **User Feedback**: Clear error messages and recovery options
- **Loading States**: Progress indicators for all async operations

## Usage Workflows

### Creating an Event
1. **Navigate**: Go to group page → "View Events"
2. **Create**: Click "Schedule Event" button
3. **Fill Form**: Enter title, description, date/time, location
4. **Submit**: Form validation and event creation
5. **Confirmation**: Success message and event appears in list

### RSVP to Event
1. **View Event**: See event card with RSVP buttons
2. **Choose Status**: Click "Going", "Maybe", or "Can't Go"
3. **Update**: RSVP status changes immediately
4. **Count Updates**: RSVP counts reflect new status

### Removing a Member (Admin Only)
1. **Access Members**: Go to group page → Members tab
2. **Identify Member**: Find member to remove (not yourself)
3. **Remove**: Click red "Remove" button
4. **Confirm**: Confirm removal in dialog
5. **Complete**: Member is removed and page refreshes

## Future Enhancements

### Event Features
1. **Event Categories**: Different types of events (workout, social, etc.)
2. **Recurring Events**: Support for repeating events
3. **Event Photos**: Upload photos to events
4. **Event Comments**: Discussion threads for events
5. **Event Reminders**: Push notifications before events

### Member Management
1. **Member Invitations**: Invite new members via email/link
2. **Role Management**: Promote members to admin
3. **Member Profiles**: Detailed member information and stats
4. **Activity Tracking**: Member participation analytics
5. **Bulk Actions**: Remove multiple members at once

### Advanced Features
1. **Event Templates**: Pre-defined event types
2. **Calendar Integration**: Sync with external calendars
3. **Location Services**: GPS-based event locations
4. **Event Polls**: Voting on event details
5. **Event Analytics**: Attendance and engagement metrics

## Dependencies

### New Dependencies
- No new external dependencies required
- Uses existing Supabase and React hooks

### Existing Dependencies Used
- `@supabase/auth-helpers-nextjs`: Authentication and client operations
- `@supabase/ssr`: Server-side Supabase client
- `react`: State management and component lifecycle
- `zod`: Input validation and type safety
- `next.js`: Server components and routing

## Database Migration

### Required Migration Steps
1. **Run Schema**: Execute `/schema-events-update.sql`
2. **Verify Tables**: Confirm `group_events` and `event_rsvps` tables exist
3. **Check RLS**: Verify Row Level Security policies are active
4. **Test Permissions**: Confirm proper access controls

### Migration Safety
- **Non-Destructive**: Only adds new tables and policies
- **Backward Compatible**: Existing functionality unchanged
- **Rollback Ready**: Can be safely reversed if needed
- **Data Integrity**: Proper foreign key constraints and cascading

The implementation provides a complete event scheduling and member management system that enhances group coordination while maintaining security and performance standards.
