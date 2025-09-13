// Types for AccountaBuddy app

export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Goal {
  id: string;
  name: string;
}

export interface UserAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  timeOfDay: string; // 'Morning', 'Afternoon', 'Evening'
}

export interface OnboardingData {
  fitnessLevel: FitnessLevel;
  goalIds: string[];
  availability: UserAvailability[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  profile_image_url?: string;
  age?: number;
  fitness_level?: FitnessLevel;
  has_completed_tutorial: boolean;
  created_at: string;
  updated_at: string;
}

// Database table types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Partial<User>;
        Update: Partial<User>;
      };
      goals: {
        Row: Goal;
        Insert: Partial<Goal>;
        Update: Partial<Goal>;
      };
      user_goals: {
        Row: {
          user_id: string;
          goal_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          goal_id: string;
          created_at?: string;
        };
        Update: Partial<{
          user_id: string;
          goal_id: string;
          created_at: string;
        }>;
      };
      user_availability: {
        Row: {
          id: string;
          user_id: string;
          day_of_week: number;
          time_of_day: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_of_week: number;
          time_of_day: string;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          user_id: string;
          day_of_week: number;
          time_of_day: string;
          created_at: string;
        }>;
      };
    };
  };
}
