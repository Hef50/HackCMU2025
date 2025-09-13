# Group Accountability Features

This document describes the core accountability features implemented for group detail pages.

## Features Overview

### 1. Contract Management
- **Admin-only feature**: Only group admins can create contracts
- **Schedule Setup**: Select workout days and time
- **Location Setting**: Specify workout location
- **Rules Definition**: Optional rules and guidelines

### 2. Check-In System
- **Time-based Activation**: Check-in is only available during workout windows
- **Geolocation Verification**: Uses browser's geolocation API
- **Status Tracking**: Automatically determines OnTime, Late, or Missed status
- **Real-time Updates**: Button state updates every second

### 3. Activity Tracking
- **Today's Check-ins**: Shows all group member check-ins for today
- **Status Indicators**: Visual status with color coding
- **Member List**: Displays all group members with roles

## Implementation Details

### Files Created/Modified

1. **Server Actions** (`/app/dashboard/groups/[groupId]/actions.ts`)
   - `createContract()`: Creates workout contract with schedule and location
   - `performCheckIn()`: Records user check-in with location and status

2. **Main Page** (`/app/dashboard/groups/[groupId]/page.tsx`)
   - Server component that fetches all group data
   - Displays contract, members, and today's activity
   - Handles authentication and authorization

3. **Contract Manager** (`/components/groups/ContractManager.tsx`)
   - Client component for contract display and creation
   - Modal form for admin contract setup
   - Schedule visualization

4. **Check-In Button** (`/components/groups/CheckInButton.tsx`)
   - Client component with real-time state management
   - Geolocation API integration
   - Time window validation (15 min before/after)

5. **Type Definitions** (`/lib/types.ts`)
   - Added Contract, WorkoutInstance, and CheckIn interfaces
   - Updated Database interface with new tables

### Database Schema Updates

The implementation requires additional fields in the `check_ins` table:

```sql
-- Run this after initial schema setup
ALTER TABLE check_ins 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);
```

See `schema-update.sql` for the complete migration.

## Usage Flow

### For Group Admins

1. **Create Contract**:
   - Visit group detail page
   - Click "Create Contract" button
   - Select workout days and time
   - Enter location name and optional rules
   - Submit to create contract and generate workout instances

2. **Monitor Activity**:
   - View today's check-ins from all members
   - See member status (OnTime, Late, Missed)
   - Access member management features

### For Group Members

1. **Check-In Process**:
   - Visit group detail page during workout window
   - Check-in button becomes active 15 minutes before workout
   - Click button to request location permission
   - Location is captured and check-in is recorded
   - Status is automatically determined based on timing

2. **View Schedule**:
   - See next upcoming workout information
   - View contract details (schedule, location, rules)
   - Monitor other members' check-in activity

## Technical Features

### Real-time Updates
- Check-in button state updates every second
- Shows countdown to check-in window
- Displays time remaining in active window

### Location Verification
- Uses `navigator.geolocation.getCurrentPosition()`
- Handles permission requests and errors
- Stores coordinates for future verification features

### Time Window Logic
- Check-in available: 15 minutes before to 15 minutes after
- Status determination:
  - **OnTime**: Within 15 minutes after scheduled time
  - **Late**: 15-30 minutes after scheduled time
  - **Missed**: More than 30 minutes after scheduled time

### Error Handling
- Comprehensive form validation
- Geolocation error handling
- Network error management
- User-friendly error messages

## Security Features

### Row Level Security
- Users can only check-in for themselves
- Group members can view group check-ins
- Admins have additional contract management permissions

### Input Validation
- Server-side validation using Zod schemas
- Client-side form validation
- Geolocation coordinate validation

### Authentication
- Supabase session management
- Automatic redirects for unauthenticated users
- Role-based feature access

## Future Enhancements

1. **Location Verification**: Compare check-in location with contract location
2. **Push Notifications**: Remind users of upcoming workouts
3. **Streak Tracking**: Track consecutive check-ins
4. **Points System**: Award points for consistent check-ins
5. **Photo Verification**: Optional photo upload with check-ins
