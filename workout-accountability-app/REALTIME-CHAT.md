# Real-time Chat Implementation

This document describes the real-time chat and member list features added to the group detail page using Supabase Realtime.

## Features Overview

### 1. Real-time Chat
- **Live messaging**: Messages appear instantly without page refresh
- **Message history**: Loads last 50 messages on page load
- **User identification**: Shows sender names and timestamps
- **Message alignment**: Current user's messages align right, others align left
- **Auto-scroll**: Automatically scrolls to newest messages

### 2. Member List
- **Profile display**: Shows member names, emails, and profile pictures
- **Role indicators**: Visual badges for Admin vs Member roles
- **Join dates**: Shows when each member joined the group
- **Fitness levels**: Displays member fitness levels
- **Sorted display**: Admins first, then by join date

### 3. Tabbed Interface
- **Two tabs**: "Chat" and "Members" with smooth transitions
- **Message counter**: Shows number of messages in chat tab
- **Member counter**: Shows number of group members
- **Responsive design**: Mobile-first design with proper touch targets

## Implementation Details

### Files Created/Modified

1. **Supabase Client** (`/lib/supabase/client.ts`)
   - Configured for real-time subscriptions
   - Set up with proper TypeScript types
   - Optimized for performance with event rate limiting

2. **Server Action** (`/app/dashboard/groups/[groupId]/actions.ts`)
   - `postChatMessage()`: Validates and inserts new chat messages
   - Proper authentication and authorization checks
   - Input validation with Zod schemas

3. **Chat Component** (`/components/groups/GroupChat.tsx`)
   - Real-time subscription to chat_messages table
   - Message form with optimistic UI updates
   - Automatic cleanup of subscriptions
   - Error handling and loading states

4. **Member List** (`/components/groups/MemberList.tsx`)
   - Server component for optimal performance
   - Profile picture fallbacks with initials
   - Admin crown indicators
   - Responsive member cards

5. **Tab Container** (`/components/groups/GroupTabs.tsx`)
   - Client component for tab state management
   - Smooth transitions between chat and members
   - Message and member counters in tabs

6. **Main Page** (`/app/dashboard/groups/[groupId]/page.tsx`)
   - Fetches initial chat messages and member data
   - Passes current user ID for message alignment
   - Integrated with existing group functionality

7. **Type Definitions** (`/lib/types.ts`)
   - Added ChatMessage interface
   - Updated Database types for chat_messages table
   - MessageType enum for User vs System messages

## Real-time Functionality

### Supabase Realtime Setup

```typescript
// Client configuration with realtime enabled
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

### Real-time Subscription

```typescript
// Subscribe to new messages for the current group
const channel = supabase
  .channel(`chat-${groupId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `group_id=eq.${groupId}`,
    },
    async (payload) => {
      // Fetch complete message with sender info
      // Update component state
    }
  )
  .subscribe();
```

### Message Flow

1. **User types message** → Form validation
2. **Submit message** → Server action validates and inserts
3. **Database insert** → Triggers real-time event
4. **All clients receive** → Update UI instantly
5. **Auto-scroll** → Show new message

## Security Features

### Row Level Security
- Users can only send messages to groups they're members of
- Users can only view messages from their groups
- Proper authentication required for all operations

### Input Validation
- Message length limits (1-1000 characters)
- XSS prevention through proper escaping
- Server-side validation with Zod schemas

### Real-time Security
- Subscriptions filtered by group membership
- Authentication required for all real-time events
- Automatic cleanup prevents memory leaks

## Database Schema

The chat functionality uses the existing `chat_messages` table:

```sql
CREATE TABLE chat_messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
    content text NOT NULL,
    message_type message_type_enum DEFAULT 'User',
    created_at timestamptz DEFAULT now()
);
```

## Performance Optimizations

### Client-side
- **Subscription cleanup**: Prevents memory leaks
- **Message deduplication**: Prevents duplicate messages
- **Optimistic updates**: Clear input immediately
- **Auto-scroll debouncing**: Smooth scrolling experience

### Server-side
- **Limited message history**: Only loads last 50 messages
- **Efficient queries**: Proper indexing on group_id and created_at
- **Row level security**: Database-level filtering

### Real-time
- **Event rate limiting**: Max 10 events per second
- **Targeted subscriptions**: Filter by group_id
- **Connection pooling**: Reuse connections efficiently

## User Experience Features

### Visual Indicators
- **Message alignment**: Own messages on right, others on left
- **Typing indicators**: Visual feedback during send
- **Online status**: Offline indicator for members (ready for enhancement)
- **Admin badges**: Crown icons for group admins

### Responsive Design
- **Mobile-first**: Optimized for mobile screens
- **Touch-friendly**: Large tap targets for tabs
- **Scrollable content**: Proper overflow handling
- **Keyboard support**: Tab navigation support

### Error Handling
- **Network errors**: Graceful error messages
- **Permission errors**: Clear feedback for unauthorized actions
- **Validation errors**: Inline form validation
- **Connection issues**: Retry mechanisms

## Future Enhancements

1. **Message Reactions**: Add emoji reactions to messages
2. **File Sharing**: Upload and share images/files
3. **Message Threading**: Reply to specific messages
4. **Push Notifications**: Notify users of new messages
5. **Online Status**: Real-time presence indicators
6. **Message Search**: Search through message history
7. **Message Editing**: Edit/delete own messages
8. **Typing Indicators**: Show when someone is typing

## Usage

### For Users
1. **Send Messages**: Type in input field and press Enter or click Send
2. **View History**: Scroll up to see previous messages
3. **Switch Tabs**: Click "Chat" or "Members" tabs
4. **View Members**: See all group members with their roles

### For Developers
1. **Real-time Events**: Messages appear instantly via WebSocket
2. **State Management**: Automatic UI updates on new messages
3. **Error Handling**: Comprehensive error states and recovery
4. **Performance**: Optimized for smooth real-time experience

The implementation provides a complete real-time chat experience that integrates seamlessly with the existing group functionality while maintaining security, performance, and user experience standards.
