export interface ProfileStats {
  coursesEnrolled: number;
  assignmentsCompleted: number;
  assignmentsPending: number;
  totalSubmissions: number;
  averageGrade: number | null;
  lastLoginAt: string | null;
  accountCreatedAt: string;
  completionRate: number;
}

export interface ProfileActivity {
  id: string;
  type: 'course_enrolled' | 'assignment_submitted' | 'assignment_graded' | 'login';
  title: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ProfileSettings {
  notifications: {
    email_notifications: boolean;
    push_notifications: boolean;
    assignment_reminders: boolean;
    course_updates: boolean;
    system_notifications: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: 'id' | 'en';
    timezone?: string;
  };
  privacy: {
    profile_visibility: 'public' | 'private';
    show_email: boolean;
    show_last_seen: boolean;
  };
}

export interface ProfileData {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  date_of_birth?: string;
  profile_picture_url?: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  email_verified_at?: string;
  stats: ProfileStats;
  settings: ProfileSettings;
  recent_activities: ProfileActivity[];
}

export interface ProfileUpdateRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
  date_of_birth?: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfilePictureUploadResponse {
  profile_picture_url: string;
  message: string;
}

export interface SettingsUpdateRequest {
  notifications?: Partial<ProfileSettings['notifications']>;
  appearance?: Partial<ProfileSettings['appearance']>;
  privacy?: Partial<ProfileSettings['privacy']>;
}
