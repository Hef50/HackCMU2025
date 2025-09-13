-- Schema update to add Kudos table and update check_ins table
-- Run this after the initial schema creation

-- Create Kudos table for photo check-ins and social features
CREATE TABLE kudos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id uuid REFERENCES check_ins(id) ON DELETE CASCADE,
    giver_id uuid REFERENCES users(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(check_in_id, giver_id) -- Prevent duplicate kudos from same user
);

-- Add indexes for better performance
CREATE INDEX idx_kudos_check_in_id ON kudos(check_in_id);
CREATE INDEX idx_kudos_giver_id ON kudos(giver_id);
CREATE INDEX idx_kudos_receiver_id ON kudos(receiver_id);

-- Enable Row Level Security on kudos table
ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies for kudos

-- Users can view kudos for check-ins in their groups
CREATE POLICY "Group members can view kudos" ON kudos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM check_ins ci
            JOIN workout_instances wi ON ci.workout_instance_id = wi.id
            JOIN group_members gm ON wi.group_id = gm.group_id
            WHERE ci.id = kudos.check_in_id AND gm.user_id = auth.uid()
        )
    );

-- Users can give kudos to check-ins in their groups (but not to themselves)
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

-- Users can remove their own kudos
CREATE POLICY "Users can remove their own kudos" ON kudos
    FOR DELETE USING (auth.uid() = giver_id);

-- Update completed successfully
SELECT 'Kudos table and policies created successfully!' as result;
