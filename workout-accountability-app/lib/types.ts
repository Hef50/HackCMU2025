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

export type UserRole = 'Admin' | 'Member';

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  user?: User;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  primary_goal_id?: string;
  fitness_level?: FitnessLevel;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  goal?: Goal;
  group_members?: GroupMember[];
}

export type ContractStatus = 'Pending' | 'Active' | 'Paused';
export type CheckInStatus = 'OnTime' | 'Late' | 'Missed';

export interface Contract {
  id: string;
  group_id: string;
  schedule: {
    days: number[]; // Array of day numbers (0-6, Sunday-Saturday)
    time: string; // Time in HH:MM format
  };
  location_name: string;
  rules?: string;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

export interface WorkoutInstance {
  id: string;
  group_id: string;
  scheduled_at: string;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  workout_instance_id: string;
  user_id: string;
  checked_in_at: string;
  status: CheckInStatus;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  created_at: string;
}

export type MessageType = 'User' | 'System';

export interface ChatMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  created_at: string;
  sender?: User;
}

export interface Kudos {
  id: string;
  check_in_id: string;
  giver_id: string;
  receiver_id: string;
  created_at: string;
  giver?: User;
  receiver?: User;
}

export interface GroupEvent {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  max_attendees?: number;
  created_at: string;
  updated_at: string;
  created_by_user?: User;
  rsvps?: EventRSVP[];
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Penalty {
  id: string;
  user_id: string;
  group_id: string;
  week_start_date: string;
  week_end_date: string;
  points_earned: number;
  point_threshold: number;
  penalty_message: string;
  penalty_type: string;
  created_at: string;
  user?: User;
  group?: Group;
}

export interface Notification {
  id: string;
  user_id: string;
  group_id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  related_event_id?: string;
  related_event_type?: string;
  created_at: string;
  read_at?: string;
  user?: User;
  group?: Group;
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
      groups: {
        Row: Group;
        Insert: Omit<Group, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Group, 'id' | 'created_at' | 'updated_at'>>;
      };
      group_members: {
        Row: GroupMember;
        Insert: Omit<GroupMember, 'joined_at'> & {
          joined_at?: string;
        };
        Update: Partial<Omit<GroupMember, 'group_id' | 'user_id'>>;
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
      contracts: {
        Row: Contract & { status?: 'Active' | 'Paused' };
        Insert: Omit<Contract, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?: 'Active' | 'Paused';
        };
        Update: Partial<Omit<Contract, 'id' | 'created_at' | 'updated_at'>> & {
          status?: 'Active' | 'Paused';
        };
      };
      workout_instances: {
        Row: WorkoutInstance;
        Insert: Omit<WorkoutInstance, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<WorkoutInstance, 'id' | 'created_at' | 'updated_at'>>;
      };
      check_ins: {
        Row: CheckIn;
        Insert: Omit<CheckIn, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CheckIn, 'id' | 'created_at'>>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at' | 'sender'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ChatMessage, 'id' | 'created_at' | 'sender'>>;
      };
      kudos: {
        Row: Kudos;
        Insert: Omit<Kudos, 'id' | 'created_at' | 'giver' | 'receiver'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Kudos, 'id' | 'created_at' | 'giver' | 'receiver'>>;
      };
      group_events: {
        Row: GroupEvent;
        Insert: Omit<GroupEvent, 'id' | 'created_at' | 'updated_at' | 'created_by_user' | 'rsvps'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<GroupEvent, 'id' | 'created_at' | 'updated_at' | 'created_by_user' | 'rsvps'>>;
      };
      event_rsvps: {
        Row: EventRSVP;
        Insert: Omit<EventRSVP, 'id' | 'created_at' | 'updated_at' | 'user'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<EventRSVP, 'id' | 'created_at' | 'updated_at' | 'user'>>;
      };
      penalties: {
        Row: Penalty;
        Insert: Omit<Penalty, 'id' | 'created_at' | 'user' | 'group'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Penalty, 'id' | 'created_at' | 'user' | 'group'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'read_at' | 'user' | 'group'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Notification, 'id' | 'created_at' | 'read_at' | 'user' | 'group'>>;
      };
    };
  };
}
