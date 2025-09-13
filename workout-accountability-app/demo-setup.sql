-- Demo Setup Script for GroupGainz 1-Minute Demo
-- Run this in your Supabase SQL editor before the demo

-- 1. Create demo users (replace with actual user IDs from your auth system)
INSERT INTO users (id, name, email, profile_image_url) VALUES 
  ('demo-admin-123', 'Demo Admin', 'admin@demogroup.com', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
  ('demo-member-456', 'Demo Member', 'member@demogroup.com', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
  ('demo-member-789', 'John Smith', 'john@demogroup.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  profile_image_url = EXCLUDED.profile_image_url;

-- 2. Create demo group
INSERT INTO groups (id, name, description) VALUES 
  ('demo-group-abc', 'Demo Fitness Group', 'Testing accountability features with real workout schedules')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 3. Add group members
INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES 
  ('demo-group-abc', 'demo-admin-123', 'Admin', NOW()),
  ('demo-group-abc', 'demo-member-456', 'Member', NOW() - INTERVAL '7 days'),
  ('demo-group-abc', 'demo-member-789', 'Member', NOW() - INTERVAL '5 days')
ON CONFLICT (group_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;

-- 4. Create active contract
INSERT INTO contracts (group_id, schedule, location, rules, status) VALUES 
  ('demo-group-abc', 'Mon,Wed,Fri at 7:00 AM', 'Central Gym - Downtown', 'Be on time, no phones during workout, help each other stay motivated', 'Active')
ON CONFLICT (group_id) DO UPDATE SET
  schedule = EXCLUDED.schedule,
  location = EXCLUDED.location,
  rules = EXCLUDED.rules,
  status = EXCLUDED.status;

-- 5. Create some workout instances for this week
INSERT INTO workout_instances (group_id, scheduled_at, status) VALUES 
  ('demo-group-abc', NOW() - INTERVAL '2 days', 'Completed'),
  ('demo-group-abc', NOW() - INTERVAL '1 day', 'Completed'),
  ('demo-group-abc', NOW() + INTERVAL '1 day', 'Scheduled'),
  ('demo-group-abc', NOW() + INTERVAL '3 days', 'Scheduled')
ON CONFLICT DO NOTHING;

-- 6. Add point transactions for the current week
INSERT INTO point_transactions (user_id, points, description, created_at) VALUES 
  -- Demo Member 1 - Good performer (25 points)
  ('demo-member-456', 5, 'Workout check-in', NOW() - INTERVAL '2 days'),
  ('demo-member-456', 3, 'Photo upload', NOW() - INTERVAL '2 days'),
  ('demo-member-456', 2, 'Kudos received', NOW() - INTERVAL '2 days'),
  ('demo-member-456', 5, 'Workout check-in', NOW() - INTERVAL '1 day'),
  ('demo-member-456', 3, 'Photo upload', NOW() - INTERVAL '1 day'),
  ('demo-member-456', 2, 'Kudos received', NOW() - INTERVAL '1 day'),
  ('demo-member-456', 5, 'Workout check-in', NOW()),
  
  -- Demo Member 2 - Poor performer (12 points - below threshold)
  ('demo-member-789', 5, 'Workout check-in', NOW() - INTERVAL '2 days'),
  ('demo-member-789', 2, 'Kudos received', NOW() - INTERVAL '2 days'),
  ('demo-member-789', 5, 'Workout check-in', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- 7. Create some check-ins with photos
INSERT INTO check_ins (workout_instance_id, user_id, checked_in_at, status, latitude, longitude, image_url) VALUES 
  (
    (SELECT id FROM workout_instances WHERE group_id = 'demo-group-abc' AND scheduled_at::date = (NOW() - INTERVAL '2 days')::date LIMIT 1),
    'demo-member-456',
    NOW() - INTERVAL '2 days' + INTERVAL '5 minutes',
    'OnTime',
    40.7128,
    -74.0060,
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
  ),
  (
    (SELECT id FROM workout_instances WHERE group_id = 'demo-group-abc' AND scheduled_at::date = (NOW() - INTERVAL '1 day')::date LIMIT 1),
    'demo-member-456',
    NOW() - INTERVAL '1 day' + INTERVAL '3 minutes',
    'OnTime',
    40.7128,
    -74.0060,
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'
  )
ON CONFLICT DO NOTHING;

-- 8. Add some kudos
INSERT INTO kudos (check_in_id, giver_id, receiver_id) VALUES 
  (
    (SELECT id FROM check_ins WHERE user_id = 'demo-member-456' LIMIT 1),
    'demo-member-789',
    'demo-member-456'
  ),
  (
    (SELECT id FROM check_ins WHERE user_id = 'demo-member-456' ORDER BY created_at DESC LIMIT 1),
    'demo-admin-123',
    'demo-member-456'
  )
ON CONFLICT DO NOTHING;

-- 9. Create a penalty for the poor performer (demo purposes)
INSERT INTO penalties (user_id, group_id, week_start_date, week_end_date, points_earned, point_threshold, penalty_message, penalty_type) VALUES 
  ('demo-member-789', 'demo-group-abc', 
   DATE_TRUNC('week', NOW())::date, 
   (DATE_TRUNC('week', NOW()) + INTERVAL '6 days')::date,
   12, 20, 
   '🏋️‍♂️ Looks like someone skipped leg day... and every other day this week! Your couch is getting more exercise than you are.',
   'weekly_tally')
ON CONFLICT (user_id, group_id, week_start_date) DO UPDATE SET
  penalty_message = EXCLUDED.penalty_message;

-- 10. Create some notifications
INSERT INTO notifications (user_id, group_id, title, message, notification_type) VALUES 
  ('demo-member-789', 'demo-group-abc', 'Weekly Accountability Check', '💪 Hey! We noticed you missed today''s workout. Your group is counting on you!', 'workout_missed'),
  ('demo-member-456', 'demo-group-abc', 'Kudos Received!', '🎉 You received kudos from John Smith!', 'kudos_received'),
  ('demo-admin-123', 'demo-group-abc', 'Group Update', 'New member John Smith joined the group!', 'group_update')
ON CONFLICT DO NOTHING;

-- 11. Create a demo event
INSERT INTO group_events (group_id, created_by, title, description, event_date, location, max_attendees) VALUES 
  ('demo-group-abc', 'demo-admin-123', 'Weekend Hike', 'Join us for a scenic hike at Central Park! Bring water and snacks.', NOW() + INTERVAL '2 days', 'Central Park - Meeting at 9 AM', 10)
ON CONFLICT DO NOTHING;

-- 12. Add some RSVPs for the event
INSERT INTO event_rsvps (event_id, user_id, status) VALUES 
  (
    (SELECT id FROM group_events WHERE group_id = 'demo-group-abc' LIMIT 1),
    'demo-member-456',
    'going'
  ),
  (
    (SELECT id FROM group_events WHERE group_id = 'demo-group-abc' LIMIT 1),
    'demo-member-789',
    'maybe'
  )
ON CONFLICT (event_id, user_id) DO UPDATE SET
  status = EXCLUDED.status;

-- 13. Add some chat messages
INSERT INTO chat_messages (group_id, sender_id, content, message_type) VALUES 
  ('demo-group-abc', 'demo-admin-123', 'Great workout today everyone! 💪', 'User'),
  ('demo-group-abc', 'demo-member-456', 'Thanks for the motivation! 🏋️‍♂️', 'User'),
  ('demo-group-abc', 'demo-member-789', 'See you all tomorrow!', 'User'),
  ('demo-group-abc', 'demo-admin-123', 'Don''t forget about the weekend hike! 🥾', 'User')
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 
  'Setup Complete!' as status,
  (SELECT COUNT(*) FROM users WHERE id LIKE 'demo-%') as demo_users,
  (SELECT COUNT(*) FROM groups WHERE id = 'demo-group-abc') as demo_groups,
  (SELECT COUNT(*) FROM group_members WHERE group_id = 'demo-group-abc') as group_members,
  (SELECT COUNT(*) FROM penalties WHERE group_id = 'demo-group-abc') as penalties,
  (SELECT COUNT(*) FROM notifications WHERE group_id = 'demo-group-abc') as notifications;
