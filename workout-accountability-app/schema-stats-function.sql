-- PostgreSQL function for calculating group statistics
-- This function performs all heavy calculations in the database for optimal performance

CREATE OR REPLACE FUNCTION get_group_stats(group_id_param uuid)
RETURNS TABLE (
    total_workouts_completed bigint,
    group_attendance_rate numeric,
    current_streak bigint,
    total_scheduled_workouts bigint,
    members_count bigint,
    photos_shared bigint,
    total_kudos_received bigint,
    most_active_member text,
    best_attendance_member text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    group_exists boolean;
    group_start_date timestamp with time zone;
BEGIN
    -- Check if group exists and get creation date
    SELECT EXISTS(SELECT 1 FROM groups WHERE id = group_id_param) INTO group_exists;
    
    IF NOT group_exists THEN
        RAISE EXCEPTION 'Group not found';
    END IF;
    
    -- Get group creation date for streak calculation
    SELECT created_at INTO group_start_date FROM groups WHERE id = group_id_param;
    
    RETURN QUERY
    WITH group_data AS (
        -- Get all workout instances for the group
        SELECT 
            wi.id as workout_id,
            wi.scheduled_at,
            COUNT(ci.id) as check_ins_count,
            COUNT(DISTINCT ci.user_id) as unique_check_ins,
            COUNT(DISTINCT gm.user_id) as total_members
        FROM workout_instances wi
        LEFT JOIN check_ins ci ON wi.id = ci.workout_instance_id
        LEFT JOIN group_members gm ON wi.group_id = gm.group_id
        WHERE wi.group_id = group_id_param
        GROUP BY wi.id, wi.scheduled_at
        ORDER BY wi.scheduled_at
    ),
    check_ins_data AS (
        -- Get detailed check-in information
        SELECT 
            ci.id,
            ci.user_id,
            ci.checked_in_at,
            ci.status,
            ci.image_url,
            wi.scheduled_at,
            u.name as user_name
        FROM check_ins ci
        JOIN workout_instances wi ON ci.workout_instance_id = wi.id
        JOIN users u ON ci.user_id = u.id
        WHERE wi.group_id = group_id_param
    ),
    attendance_calc AS (
        -- Calculate attendance metrics
        SELECT 
            COUNT(DISTINCT gd.workout_id) as total_scheduled,
            COUNT(DISTINCT CASE WHEN gd.check_ins_count > 0 THEN gd.workout_id END) as completed_workouts,
            MAX(gd.total_members) as members_count
        FROM group_data gd
    ),
    streak_calc AS (
        -- Calculate current streak (consecutive completed workouts)
        WITH workout_completion AS (
            SELECT 
                scheduled_at,
                CASE WHEN check_ins_count > 0 THEN 1 ELSE 0 END as is_completed,
                ROW_NUMBER() OVER (ORDER BY scheduled_at DESC) as rn
            FROM group_data
            WHERE scheduled_at <= NOW()
            ORDER BY scheduled_at DESC
        ),
        streak_groups AS (
            SELECT 
                *,
                SUM(CASE WHEN is_completed = 0 THEN 1 ELSE 0 END) 
                OVER (ORDER BY rn) as streak_group
            FROM workout_completion
        ),
        current_streak_data AS (
            SELECT COUNT(*) as streak_count
            FROM streak_groups
            WHERE streak_group = 0 AND is_completed = 1
        )
        SELECT COALESCE(streak_count, 0) FROM current_streak_data
    ),
    photo_stats AS (
        -- Count photos shared
        SELECT COUNT(*) as photos_count
        FROM check_ins_data
        WHERE image_url IS NOT NULL
    ),
    kudos_stats AS (
        -- Count total kudos received
        SELECT COUNT(*) as kudos_count
        FROM kudos k
        JOIN check_ins ci ON k.check_in_id = ci.id
        JOIN workout_instances wi ON ci.workout_instance_id = wi.id
        WHERE wi.group_id = group_id_param
    ),
    member_stats AS (
        -- Find most active member and best attendance member
        WITH member_activity AS (
            SELECT 
                cid.user_id,
                cid.user_name,
                COUNT(*) as check_in_count,
                COUNT(CASE WHEN cid.image_url IS NOT NULL THEN 1 END) as photo_count,
                COUNT(DISTINCT DATE(cid.scheduled_at)) as unique_workout_days
            FROM check_ins_data cid
            GROUP BY cid.user_id, cid.user_name
        ),
        member_attendance AS (
            SELECT 
                gm.user_id,
                u.name as user_name,
                COUNT(DISTINCT wi.id) as total_possible,
                COUNT(DISTINCT ci.workout_instance_id) as attended,
                ROUND(
                    (COUNT(DISTINCT ci.workout_instance_id)::numeric / 
                     NULLIF(COUNT(DISTINCT wi.id), 0)) * 100, 
                    2
                ) as attendance_rate
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            LEFT JOIN workout_instances wi ON gm.group_id = wi.group_id
            LEFT JOIN check_ins ci ON wi.id = ci.workout_instance_id AND ci.user_id = gm.user_id
            WHERE gm.group_id = group_id_param
            GROUP BY gm.user_id, u.name
            HAVING COUNT(DISTINCT wi.id) > 0
        )
        SELECT 
            (SELECT user_name FROM member_activity ORDER BY check_in_count DESC LIMIT 1) as most_active,
            (SELECT user_name FROM member_attendance ORDER BY attendance_rate DESC, attended DESC LIMIT 1) as best_attendance
    )
    SELECT 
        ac.completed_workouts as total_workouts_completed,
        CASE 
            WHEN ac.total_scheduled > 0 THEN 
                ROUND((ac.completed_workouts::numeric / ac.total_scheduled) * 100, 2)
            ELSE 0 
        END as group_attendance_rate,
        sc.streak_count as current_streak,
        ac.total_scheduled as total_scheduled_workouts,
        ac.members_count as members_count,
        ps.photos_count as photos_shared,
        ks.kudos_count as total_kudos_received,
        ms.most_active as most_active_member,
        ms.best_attendance as best_attendance_member
    FROM attendance_calc ac
    CROSS JOIN streak_calc sc
    CROSS JOIN photo_stats ps
    CROSS JOIN kudos_stats ks
    CROSS JOIN member_stats ms;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_group_stats(uuid) TO authenticated;

-- Create an index to improve performance for the stats calculation
CREATE INDEX IF NOT EXISTS idx_workout_instances_group_scheduled 
ON workout_instances(group_id, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_check_ins_workout_user 
ON check_ins(workout_instance_id, user_id);

CREATE INDEX IF NOT EXISTS idx_kudos_check_in 
ON kudos(check_in_id);

-- Add comment for documentation
COMMENT ON FUNCTION get_group_stats(uuid) IS 'Calculates comprehensive group statistics including attendance rates, streaks, and member activity metrics';
