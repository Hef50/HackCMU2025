# Photo Check-ins & Kudos Feature

This document describes the complete photo check-ins and kudos feature implementation for GroupGainz.

## Features Overview

### 1. Photo Check-ins
- **Post-check-in upload**: Modal appears after successful check-in
- **Secure upload**: Direct browser-to-Cloudinary upload with signed signatures
- **Image validation**: File type and size validation (10MB max)
- **Progress tracking**: Visual upload progress with status indicators

### 2. Kudos System
- **Social interaction**: Members can give kudos to check-ins with photos
- **Point rewards**: Giver gets +1 point, receiver gets +2 points
- **Duplicate prevention**: Users can only give one kudo per check-in
- **Visual feedback**: Kudos counter and giver avatars

### 3. Group Feed
- **Photo display**: Show check-ins with photos in a social feed
- **User information**: Profile pictures, names, and check-in status
- **Time tracking**: Relative timestamps and workout schedule info
- **Interactive elements**: Kudos buttons with real-time updates

## Implementation Details

### Files Created/Modified

1. **Server Actions** (`/app/dashboard/groups/[groupId]/actions.ts`)
   - `getCloudinarySignature()`: Generates secure upload signatures
   - `updateCheckInWithImage()`: Updates check-in with photo URL
   - `giveKudosToCheckIn()`: Handles kudos creation and point awards

2. **Upload Modal** (`/components/check-ins/UploadPhotoModal.tsx`)
   - File selection with drag-and-drop UI
   - Image preview and validation
   - Direct Cloudinary upload with progress tracking
   - Error handling and success feedback

3. **Group Feed** (`/components/groups/GroupFeed.tsx`)
   - Social feed display for check-ins with photos
   - Kudos interaction with point system
   - User profile integration
   - Time formatting and status indicators

4. **Enhanced Check-in Button** (`/components/groups/CheckInButton.tsx`)
   - Integrated upload modal trigger
   - Success callback handling
   - State management for photo upload flow

5. **Main Page Integration** (`/app/dashboard/groups/[groupId]/page.tsx`)
   - Group feed data fetching
   - Check-in with photos and kudos queries
   - Real-time refresh callbacks

6. **Database Schema** (`/schema-kudos-update.sql`)
   - Kudos table creation
   - Row Level Security policies
   - Indexing for performance

7. **Type Definitions** (`/lib/types.ts`)
   - Kudos interface and database types
   - Enhanced check-in types with user data

## Environment Variables

Add these to your `.env.local` file:

```env
# Existing Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Cloudinary Configuration (NEW)
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
```

### Cloudinary Setup

1. **Create Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)
2. **Get Credentials**: Find your API key, secret, and cloud name in the dashboard
3. **Security Note**: The API secret should never be exposed to the client

## Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Create Kudos table
CREATE TABLE kudos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id uuid REFERENCES check_ins(id) ON DELETE CASCADE,
    giver_id uuid REFERENCES users(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(check_in_id, giver_id)
);

-- Add indexes
CREATE INDEX idx_kudos_check_in_id ON kudos(check_in_id);
CREATE INDEX idx_kudos_giver_id ON kudos(giver_id);
CREATE INDEX idx_kudos_receiver_id ON kudos(receiver_id);

-- Enable RLS
ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies
CREATE POLICY "Group members can view kudos" ON kudos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM check_ins ci
            JOIN workout_instances wi ON ci.workout_instance_id = wi.id
            JOIN group_members gm ON wi.group_id = gm.group_id
            WHERE ci.id = kudos.check_in_id AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can give kudos" ON kudos
    FOR INSERT WITH CHECK (
        auth.uid() = giver_id AND
        auth.uid() != receiver_id AND
        EXISTS (
            SELECT 1 FROM check_ins ci
            JOIN workout_instances wi ON ci.workout_instance_id = wi.id
            JOIN group_members gm ON wi.group_id = gm.group_id
            WHERE ci.id = kudos.check_in_id AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove their own kudos" ON kudos
    FOR DELETE USING (auth.uid() = giver_id);
```

## Security Features

### Cloudinary Security
- **Signed uploads**: Server generates secure signatures for direct uploads
- **File validation**: Type and size restrictions enforced
- **User-specific folders**: Photos organized by user ID
- **No server storage**: Direct browser-to-Cloudinary upload

### Database Security
- **Row Level Security**: Users can only access kudos from their groups
- **Duplicate prevention**: Database constraints prevent multiple kudos
- **Self-kudos prevention**: Server-side validation blocks self-kudos
- **Group membership verification**: All actions require group membership

### Input Validation
- **File type validation**: Only image files allowed
- **File size limits**: 10MB maximum file size
- **URL validation**: Secure URL verification for updates
- **Zod schemas**: Server-side validation for all inputs

## User Flow

### Photo Upload Flow
1. **User checks in** → Location verification
2. **Check-in success** → Upload modal appears
3. **File selection** → Drag-and-drop or click to select
4. **Image preview** → Validation and preview display
5. **Upload to Cloudinary** → Direct browser upload with progress
6. **Update database** → Link photo URL to check-in
7. **Success feedback** → Modal closes, feed refreshes

### Kudos Flow
1. **View feed** → See check-ins with photos
2. **Click kudos button** → 🎉 emoji interaction
3. **Server validation** → Check group membership and duplicates
4. **Database update** → Create kudos record
5. **Points awarded** → Giver (+1), Receiver (+2)
6. **UI update** → Kudos counter and visual feedback

## Performance Optimizations

### Client-side
- **Image previews**: Object URLs for instant previews
- **Progress tracking**: Real-time upload progress
- **Optimistic updates**: Immediate UI feedback
- **Memory management**: Proper cleanup of object URLs

### Server-side
- **Efficient queries**: Optimized database queries with joins
- **Indexing**: Proper database indexes for performance
- **Connection pooling**: Supabase connection optimization
- **Error handling**: Comprehensive error recovery

### Cloudinary
- **Direct uploads**: No server bandwidth usage
- **CDN delivery**: Fast global image delivery
- **Automatic optimization**: Cloudinary handles image optimization
- **Secure URLs**: HTTPS delivery with expiration

## UI/UX Features

### Visual Design
- **Consistent theming**: Matches existing dark mode design
- **Glass morphism**: Modern glassmorphism effects
- **Smooth animations**: CSS transitions and hover effects
- **Mobile-first**: Responsive design for all devices

### User Experience
- **Intuitive flow**: Clear step-by-step process
- **Visual feedback**: Loading states and progress indicators
- **Error handling**: Clear error messages and recovery options
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Social Features
- **Profile integration**: User avatars and names
- **Status indicators**: Check-in status with color coding
- **Time formatting**: Smart relative timestamps
- **Kudos visualization**: Counter and giver avatars

## Future Enhancements

1. **Photo Editing**: Basic filters and crop functionality
2. **Multiple Photos**: Support for multiple photos per check-in
3. **Photo Comments**: Comment system for photos
4. **Photo Reactions**: More emoji reactions beyond kudos
5. **Photo Sharing**: Share photos to external platforms
6. **Photo Privacy**: Private/public photo settings
7. **Photo Search**: Search through group photos
8. **Photo Analytics**: View counts and engagement metrics

## Troubleshooting

### Common Issues

1. **Upload fails**: Check Cloudinary credentials and network connection
2. **Photos not showing**: Verify image_url column exists in check_ins table
3. **Kudos not working**: Check RLS policies and group membership
4. **Points not awarded**: Verify point_transactions table exists

### Debug Steps

1. Check browser console for client-side errors
2. Check server logs for server action errors
3. Verify database permissions and RLS policies
4. Test Cloudinary credentials with direct API calls

## Dependencies

### New Packages Added
- `cloudinary`: For secure image upload signatures

### Existing Dependencies Used
- `@supabase/supabase-js`: Database operations
- `@supabase/ssr`: Server-side Supabase client
- `zod`: Input validation
- `react`: UI components and hooks

The implementation provides a complete social photo sharing experience that enhances the group accountability features while maintaining security, performance, and user experience standards.
