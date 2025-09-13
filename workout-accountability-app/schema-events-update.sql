-- Database schema updates for events and member management features

-- Create GroupEvents table
CREATE TABLE IF NOT EXISTS group_events (
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

-- Create EventRSVPs table
CREATE TABLE IF NOT EXISTS event_rsvps (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id uuid REFERENCES group_events(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    status varchar(20) NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(event_id, user_id) -- One RSVP per user per event
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_events_group_date ON group_events(group_id, event_date);
CREATE INDEX IF NOT EXISTS idx_group_events_created_by ON group_events(created_by);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_status ON event_rsvps(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id);

-- Enable Row Level Security
ALTER TABLE group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_events
CREATE POLICY "Group members can view events" ON group_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = group_events.group_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create events" ON group_events
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = group_events.group_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Event creators can update their events" ON group_events
    FOR UPDATE USING (
        auth.uid() = created_by
    );

CREATE POLICY "Event creators can delete their events" ON group_events
    FOR DELETE USING (
        auth.uid() = created_by
    );

-- RLS Policies for event_rsvps
CREATE POLICY "Group members can view RSVPs" ON event_rsvps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_events ge
            JOIN group_members gm ON ge.group_id = gm.group_id
            WHERE ge.id = event_rsvps.event_id AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create RSVPs" ON event_rsvps
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM group_events ge
            JOIN group_members gm ON ge.group_id = gm.group_id
            WHERE ge.id = event_rsvps.event_id AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own RSVPs" ON event_rsvps
    FOR UPDATE USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can delete their own RSVPs" ON event_rsvps
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Add updated_at trigger for group_events
CREATE OR REPLACE FUNCTION update_group_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_events_updated_at
    BEFORE UPDATE ON group_events
    FOR EACH ROW
    EXECUTE FUNCTION update_group_events_updated_at();

-- Add updated_at trigger for event_rsvps
CREATE OR REPLACE FUNCTION update_event_rsvps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_event_rsvps_updated_at
    BEFORE UPDATE ON event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_event_rsvps_updated_at();

-- Add comment for documentation
COMMENT ON TABLE group_events IS 'One-time events created by group members (hikes, social gatherings, etc.)';
COMMENT ON TABLE event_rsvps IS 'RSVP responses for group events';
COMMENT ON COLUMN event_rsvps.status IS 'RSVP status: going, maybe, not_going';
