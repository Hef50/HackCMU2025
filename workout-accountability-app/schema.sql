-- AccountaBuddy Database Schema
-- Complete SQL schema for Supabase with Row Level Security
-- Run this script in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they exist (for re-running script)
DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS fitness_level_enum CASCADE;
DROP TYPE IF EXISTS contract_status_enum CASCADE;
DROP TYPE IF EXISTS checkin_status_enum CASCADE;
DROP TYPE IF EXISTS message_type_enum CASCADE;
DROP TYPE IF EXISTS report_status_enum CASCADE;
DROP TYPE IF EXISTS join_request_status_enum CASCADE;
DROP TYPE IF EXISTS rsvp_status_enum CASCADE;

-- Create ENUM types
CREATE TYPE user_role_enum AS ENUM ('Admin', 'Member');
CREATE TYPE fitness_level_enum AS ENUM ('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE contract_status_enum AS ENUM ('Pending', 'Active', 'Paused');
CREATE TYPE checkin_status_enum AS ENUM ('OnTime', 'Late', 'Missed');
CREATE TYPE message_type_enum AS ENUM ('User', 'System');
CREATE TYPE report_status_enum AS ENUM ('Pending', 'Resolved');
CREATE TYPE join_request_status_enum AS ENUM ('Pending');
CREATE TYPE rsvp_status_enum AS ENUM ('Going', 'Maybe', 'NotGoing');

-- Drop existing tables if they exist (for re-running script)
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS event_rsvps CASCADE;
DROP TABLE IF EXISTS group_events CASCADE;
DROP TABLE IF EXISTS join_requests CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS point_transactions CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS check_ins CASCADE;
DROP TABLE IF EXISTS workout_instances CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS user_availability CASCADE;
DROP TABLE IF EXISTS user_goals CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Tables

-- Users Table (extends auth.users)
CREATE TABLE users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    profile_image_url text,
    age integer CHECK (age > 0 AND age < 150),
    fitness_level fitness_level_enum,
    has_completed_tutorial boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Goals Table
CREATE TABLE goals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- UserGoals Table (Join Table)
CREATE TABLE user_goals (
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, goal_id)
);

-- UserAvailability Table
CREATE TABLE user_availability (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
    time_of_day text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, day_of_week, time_of_day)
);

-- Groups Table
CREATE TABLE groups (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    primary_goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
    fitness_level fitness_level_enum,
    is_private boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- GroupMembers Table (Join Table)
CREATE TABLE group_members (
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role user_role_enum DEFAULT 'Member',
    joined_at timestamptz DEFAULT now(),
    PRIMARY KEY (group_id, user_id)
);

-- Contracts Table
CREATE TABLE contracts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    schedule jsonb NOT NULL,
    location_name text NOT NULL,
    rules text,
    status contract_status_enum DEFAULT 'Pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- WorkoutInstances Table
CREATE TABLE workout_instances (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    scheduled_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- CheckIns Table
CREATE TABLE check_ins (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_instance_id uuid REFERENCES workout_instances(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    checked_in_at timestamptz NOT NULL,
    status checkin_status_enum NOT NULL,
    image_url text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(workout_instance_id, user_id)
);

-- ChatMessages Table
CREATE TABLE chat_messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
    content text NOT NULL,
    message_type message_type_enum DEFAULT 'User',
    created_at timestamptz DEFAULT now()
);

-- PointTransactions Table
CREATE TABLE point_transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    points integer NOT NULL,
    description text NOT NULL,
    related_check_in_id uuid REFERENCES check_ins(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- Reports Table
CREATE TABLE reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id uuid REFERENCES users(id) ON DELETE CASCADE,
    reported_id uuid REFERENCES users(id) ON DELETE CASCADE,
    reason text NOT NULL,
    status report_status_enum DEFAULT 'Pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CHECK (reporter_id != reported_id)
);

-- JoinRequests Table
CREATE TABLE join_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    status join_request_status_enum DEFAULT 'Pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- GroupEvents Table
CREATE TABLE group_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    creator_id uuid REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    event_time timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- EventRSVPs Table (Join Table)
CREATE TABLE event_rsvps (
    event_id uuid REFERENCES group_events(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    status rsvp_status_enum NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (event_id, user_id)
);

-- Badges Table
CREATE TABLE badges (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    description text NOT NULL,
    image_url text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- UserBadges Table (Join Table)
CREATE TABLE user_badges (
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
    earned_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, badge_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_workout_instances_group_id ON workout_instances(group_id);
CREATE INDEX idx_workout_instances_scheduled_at ON workout_instances(scheduled_at);
CREATE INDEX idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX idx_check_ins_workout_instance_id ON check_ins(workout_instance_id);
CREATE INDEX idx_chat_messages_group_id ON chat_messages(group_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_join_requests_group_id ON join_requests(group_id);
CREATE INDEX idx_join_requests_user_id ON join_requests(user_id);
CREATE INDEX idx_group_events_group_id ON group_events(group_id);
CREATE INDEX idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Users: Users can only see and modify their own profile
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals: Everyone can read goals (they're reference data)
CREATE POLICY "Anyone can view goals" ON goals
    FOR SELECT USING (true);

-- UserGoals: Users can only manage their own goals
CREATE POLICY "Users can manage their own goals" ON user_goals
    FOR ALL USING (auth.uid() = user_id);

-- UserAvailability: Users can only manage their own availability
CREATE POLICY "Users can manage their own availability" ON user_availability
    FOR ALL USING (auth.uid() = user_id);

-- Groups: Users can see groups they're members of or public groups
CREATE POLICY "Users can view groups they're members of or public groups" ON groups
    FOR SELECT USING (
        NOT is_private OR 
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = groups.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create groups" ON groups
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Group admins can update groups" ON groups
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = groups.id AND user_id = auth.uid() AND role = 'Admin'
        )
    );

-- GroupMembers: Users can see members of groups they belong to
CREATE POLICY "Users can view members of their groups" ON group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members gm 
            WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join groups" ON group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups or admins can remove members" ON group_members
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = group_members.group_id AND user_id = auth.uid() AND role = 'Admin'
        )
    );

-- Contracts: Group members can view contracts
CREATE POLICY "Group members can view contracts" ON contracts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = contracts.group_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can manage contracts" ON contracts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = contracts.group_id AND user_id = auth.uid() AND role = 'Admin'
        )
    );

-- WorkoutInstances: Group members can view workout instances
CREATE POLICY "Group members can view workout instances" ON workout_instances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = workout_instances.group_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can manage workout instances" ON workout_instances
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = workout_instances.group_id AND user_id = auth.uid() AND role = 'Admin'
        )
    );

-- CheckIns: Users can manage their own check-ins, group members can view all check-ins
CREATE POLICY "Users can manage their own check-ins" ON check_ins
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Group members can view check-ins" ON check_ins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_instances wi
            JOIN group_members gm ON wi.group_id = gm.group_id
            WHERE wi.id = check_ins.workout_instance_id AND gm.user_id = auth.uid()
        )
    );

-- ChatMessages: Group members can view and send messages
CREATE POLICY "Group members can view chat messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = chat_messages.group_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can send messages" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = chat_messages.group_id AND user_id = auth.uid()
        )
    );

-- PointTransactions: Users can view their own transactions
CREATE POLICY "Users can view their own point transactions" ON point_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- System can insert point transactions (for automated point awards)
CREATE POLICY "System can insert point transactions" ON point_transactions
    FOR INSERT WITH CHECK (true);

-- Reports: Users can create reports and view their own reports
CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() = reported_id);

-- JoinRequests: Users can create and view their own join requests
CREATE POLICY "Users can create join requests" ON join_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own join requests" ON join_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Group admins can view and manage join requests" ON join_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = join_requests.group_id AND user_id = auth.uid() AND role = 'Admin'
        )
    );

-- GroupEvents: Group members can view events, creators and admins can manage
CREATE POLICY "Group members can view events" ON group_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = group_events.group_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create events" ON group_events
    FOR INSERT WITH CHECK (
        auth.uid() = creator_id AND
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = group_events.group_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Event creators and group admins can update events" ON group_events
    FOR UPDATE USING (
        auth.uid() = creator_id OR
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = group_events.group_id AND user_id = auth.uid() AND role = 'Admin'
        )
    );

-- EventRSVPs: Group members can manage their own RSVPs
CREATE POLICY "Group members can manage their own RSVPs" ON event_rsvps
    FOR ALL USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM group_events ge
            JOIN group_members gm ON ge.group_id = gm.group_id
            WHERE ge.id = event_rsvps.event_id AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can view RSVPs" ON event_rsvps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_events ge
            JOIN group_members gm ON ge.group_id = gm.group_id
            WHERE ge.id = event_rsvps.event_id AND gm.user_id = auth.uid()
        )
    );

-- Badges: Everyone can view badges (they're reference data)
CREATE POLICY "Anyone can view badges" ON badges
    FOR SELECT USING (true);

-- UserBadges: Users can view their own badges, others can view public badge achievements
CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

-- System can award badges
CREATE POLICY "System can award badges" ON user_badges
    FOR INSERT WITH CHECK (true);

-- Create function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, name, email)
    VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns (drop existing first)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_workout_instances_updated_at ON workout_instances;
CREATE TRIGGER update_workout_instances_updated_at BEFORE UPDATE ON workout_instances
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_join_requests_updated_at ON join_requests;
CREATE TRIGGER update_join_requests_updated_at BEFORE UPDATE ON join_requests
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_events_updated_at ON group_events;
CREATE TRIGGER update_group_events_updated_at BEFORE UPDATE ON group_events
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_rsvps_updated_at ON event_rsvps;
CREATE TRIGGER update_event_rsvps_updated_at BEFORE UPDATE ON event_rsvps
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert some basic goals (optional seed data)
INSERT INTO goals (name) VALUES
    ('Weight Loss'),
    ('Muscle Building'),
    ('Cardiovascular Health'),
    ('Flexibility'),
    ('General Fitness'),
    ('Strength Training'),
    ('Endurance'),
    ('Sports Performance')
ON CONFLICT (name) DO NOTHING;

-- Insert some basic badges (optional seed data)
INSERT INTO badges (name, description, image_url) VALUES
    ('First Check-in', 'Completed your first workout check-in', '/badges/first-checkin.png'),
    ('Consistency Champion', 'Checked in 7 days in a row', '/badges/consistency.png'),
    ('Early Bird', 'Checked in before 7 AM', '/badges/early-bird.png'),
    ('Team Player', 'Joined your first group', '/badges/team-player.png'),
    ('Milestone Master', 'Completed 30 workouts', '/badges/milestone.png')
ON CONFLICT (name) DO NOTHING;

-- Schema creation complete
SELECT 'AccountaBuddy database schema created successfully!' as result;
