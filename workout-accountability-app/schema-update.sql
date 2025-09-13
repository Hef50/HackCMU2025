-- Schema update to add location fields to check_ins table
-- Run this after the initial schema creation

-- Add latitude and longitude columns to check_ins table
ALTER TABLE check_ins 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add comment for clarity
COMMENT ON COLUMN check_ins.latitude IS 'Latitude coordinate of check-in location (-90 to 90)';
COMMENT ON COLUMN check_ins.longitude IS 'Longitude coordinate of check-in location (-180 to 180)';

-- Add index for location-based queries (optional, for future features)
CREATE INDEX idx_check_ins_location ON check_ins(latitude, longitude);

-- Update completed successfully
SELECT 'Check-ins table updated with location fields!' as result;
