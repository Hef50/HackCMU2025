-- Database schema for accountability system (penalties, notifications, contract status)

-- Create Penalties table for weekly accountability
CREATE TABLE IF NOT EXISTS penalties (
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
    UNIQUE(user_id, group_id, week_start_date) -- One penalty per user per group per week
);

-- Create Notifications table for user nudges and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    message text NOT NULL,
    notification_type varchar(50) NOT NULL DEFAULT 'general',
    is_read boolean DEFAULT false,
    related_event_id uuid, -- Optional: link to specific event (workout, penalty, etc.)
    related_event_type varchar(50), -- Type of related event
    created_at timestamptz DEFAULT now(),
    read_at timestamptz
);

-- Add status column to contracts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'status'
    ) THEN
        ALTER TABLE contracts ADD COLUMN status varchar(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Paused'));
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_penalties_user_week ON penalties(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_penalties_group_week ON penalties(group_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_group_type ON notifications(group_id, notification_type);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- Enable Row Level Security
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for penalties
CREATE POLICY "Users can view their own penalties" ON penalties
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Group members can view penalties in their groups" ON penalties
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = penalties.group_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for contract status updates (admin only)
CREATE POLICY "Admins can update contract status" ON contracts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = contracts.group_id 
            AND user_id = auth.uid() 
            AND role = 'Admin'
        )
    );

-- Create function to get current week boundaries
CREATE OR REPLACE FUNCTION get_week_boundaries(input_date date DEFAULT CURRENT_DATE)
RETURNS TABLE (week_start date, week_end date) 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Get the start of the week (Sunday)
    week_start := input_date - EXTRACT(dow FROM input_date)::integer;
    
    -- Get the end of the week (Saturday)
    week_end := week_start + 6;
    
    RETURN NEXT;
END;
$$;

-- Create function to archive old point transactions
CREATE OR REPLACE FUNCTION archive_weekly_points(week_start_date date, week_end_date date)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    archived_count integer;
BEGIN
    -- Create archive table if it doesn't exist
    CREATE TABLE IF NOT EXISTS point_transactions_archive (
        LIKE point_transactions INCLUDING ALL
    );
    
    -- Move old transactions to archive
    INSERT INTO point_transactions_archive
    SELECT * FROM point_transactions
    WHERE created_at::date BETWEEN week_start_date AND week_end_date;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- Delete the archived transactions
    DELETE FROM point_transactions
    WHERE created_at::date BETWEEN week_start_date AND week_end_date;
    
    RETURN archived_count;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_week_boundaries(date) TO authenticated;
GRANT EXECUTE ON FUNCTION archive_weekly_points(date, date) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE penalties IS 'Weekly accountability penalties for users below point threshold';
COMMENT ON TABLE notifications IS 'User notifications for nudges, alerts, and updates';
COMMENT ON COLUMN penalties.penalty_message IS 'AI-generated or pre-written roast message';
COMMENT ON COLUMN notifications.notification_type IS 'Type of notification: workout_missed, penalty_assigned, group_update, etc.';
COMMENT ON FUNCTION archive_weekly_points(date, date) IS 'Archives and deletes point transactions for a specific week';
