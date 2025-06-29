import axios from 'axios';
import { AuthManager } from '@/lib/auth';
import {
  ProfileData,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  ProfilePictureUploadResponse,
  SettingsUpdateRequest,
  ProfileStats,
  ProfileActivity,
} from '@/types/profile';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with auth headers
const createApiClient = () => {
  const token = AuthManager.getToken();
  return axios.create({
    baseURL: `${API_BASE_URL}/v1`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
};

// Profile API functions
export const profileApi = {
  // Get current user profile
  getCurrentProfile: async (): Promise<ProfileData> => {
    const api = createApiClient();
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Get user profile by ID
  getProfile: async (userId: string): Promise<ProfileData> => {
    const api = createApiClient();
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId: string, data: ProfileUpdateRequest): Promise<ProfileData> => {
    const api = createApiClient();
    
    // Map frontend field names to backend field names
    const backendData = {
      email: data.email,
      full_name: data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : undefined,
      phone: data.phone,
      bio: data.bio,
      date_of_birth: data.date_of_birth
    };
    
    // Remove undefined fields
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === undefined) {
        delete backendData[key];
      }
    });
    
    const response = await api.put(`/users/${userId}`, backendData);
    return response.data;
  },

  // Change password
  changePassword: async (userId: string, data: PasswordChangeRequest): Promise<{ message: string }> => {
    const api = createApiClient();
    const response = await api.put(`/users/${userId}/password`, {
      current_password: data.current_password,
      new_password: data.new_password,
    });
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (
    userId: string, 
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ProfilePictureUploadResponse> => {
    const token = AuthManager.getToken();
    const formData = new FormData();
    formData.append('profile_picture', file);

    const response = await axios.post(
      `${API_BASE_URL}/v1/users/${userId}/profile-picture`,
      formData,
      {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(Math.round(progress));
          }
        },
      }
    );
    return response.data;
  },

  // Get user statistics
  getUserStats: async (userId: string): Promise<ProfileStats> => {
    const api = createApiClient();
    try {
      const response = await api.get(`/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      // If stats endpoint doesn't exist, return mock data
      console.warn('Stats endpoint not available, using mock data');
      return {
        coursesEnrolled: 0,
        assignmentsCompleted: 0,
        assignmentsPending: 0,
        totalSubmissions: 0,
        averageGrade: null,
        lastLoginAt: null,
        accountCreatedAt: new Date().toISOString(),
        completionRate: 0,
      };
    }
  },

  // Get user activities
  getUserActivities: async (userId: string, limit = 10): Promise<ProfileActivity[]> => {
    const api = createApiClient();
    try {
      const response = await api.get(`/users/${userId}/activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      // If activities endpoint doesn't exist, return empty array
      console.warn('Activities endpoint not available');
      return [];
    }
  },

  // Update user settings
  updateSettings: async (userId: string, settings: SettingsUpdateRequest): Promise<{ message: string }> => {
    const api = createApiClient();
    try {
      const response = await api.put(`/users/${userId}/settings`, settings);
      return response.data;
    } catch (error) {
      // If settings endpoint doesn't exist, save to localStorage as fallback
      console.warn('Settings endpoint not available, using localStorage');
      localStorage.setItem(`user_settings_${userId}`, JSON.stringify(settings));
      return { message: 'Pengaturan berhasil disimpan' };
    }
  },

  // Get user settings
  getSettings: async (userId: string): Promise<any> => {
    const api = createApiClient();
    try {
      const response = await api.get(`/users/${userId}/settings`);
      return response.data;
    } catch (error) {
      // If settings endpoint doesn't exist, load from localStorage
      console.warn('Settings endpoint not available, using localStorage');
      const stored = localStorage.getItem(`user_settings_${userId}`);
      return stored ? JSON.parse(stored) : {
        notifications: {
          email_notifications: true,
          push_notifications: true,
          assignment_reminders: true,
          course_updates: true,
          system_notifications: true,
        },
        appearance: {
          theme: 'light',
          language: 'id',
        },
        privacy: {
          profile_visibility: 'public',
          show_email: false,
          show_last_seen: true,
        },
      };
    }
  },
};

export default profileApi;
