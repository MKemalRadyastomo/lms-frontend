import { apiClient } from '@/lib/api'
import { 
  StudentAnalytics, 
  InstructorAnalytics, 
  AdminAnalytics,
  AnalyticsApiResponse,
  UserRole,
  AnalyticsRequest
} from '@/types/analytics'

const ANALYTICS_CACHE_KEY = 'lms_analytics_cache'
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds

class AnalyticsApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  // Generic method to fetch analytics data
  private async fetchAnalytics<T>(endpoint: string, params?: Record<string, any>): Promise<AnalyticsApiResponse<T>> {
    const url = new URL(`${this.baseUrl}/api/analytics/${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value.toString())
        }
      })
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.statusText}`)
    }

    return response.json()
  }

  // Cache management
  private getCachedData<T>(cacheKey: string): T | null {
    try {
      const cached = localStorage.getItem(`${ANALYTICS_CACHE_KEY}_${cacheKey}`)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - new Date(timestamp).getTime()

      if (age > CACHE_DURATION) {
        this.clearCache(cacheKey)
        return null
      }

      return data
    } catch (error) {
      console.warn('Error reading analytics cache:', error)
      return null
    }
  }

  private setCachedData<T>(cacheKey: string, data: T): void {
    try {
      const cacheData = {
        data,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(`${ANALYTICS_CACHE_KEY}_${cacheKey}`, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Error writing analytics cache:', error)
    }
  }

  private clearCache(cacheKey?: string): void {
    if (cacheKey) {
      localStorage.removeItem(`${ANALYTICS_CACHE_KEY}_${cacheKey}`)
    } else {
      // Clear all analytics cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(ANALYTICS_CACHE_KEY)) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  // Get analytics data with caching
  async getAnalytics<T>(
    role: UserRole, 
    userId?: number, 
    options: { useCache?: boolean; timeRange?: string } = {}
  ): Promise<{ data: T; lastUpdated: Date; fromCache: boolean }> {
    const { useCache = true, timeRange = 'month' } = options
    const cacheKey = `${role}_${userId || 'all'}_${timeRange}`

    // Try to get cached data first
    if (useCache) {
      const cachedData = this.getCachedData<T>(cacheKey)
      if (cachedData) {
        const cached = localStorage.getItem(`${ANALYTICS_CACHE_KEY}_${cacheKey}`)
        const { timestamp } = JSON.parse(cached!)
        return {
          data: cachedData,
          lastUpdated: new Date(timestamp),
          fromCache: true
        }
      }
    }

    // Fetch fresh data
    const endpoint = this.getEndpointForRole(role)
    const params: AnalyticsRequest = { 
      role, 
      userId, 
      timeRange: timeRange as any,
      includeCache: false 
    }

    const response = await this.fetchAnalytics<T>(endpoint, params)
    
    // Cache the fresh data
    this.setCachedData(cacheKey, response.data)

    return {
      data: response.data,
      lastUpdated: new Date(response.timestamp),
      fromCache: false
    }
  }

  private getEndpointForRole(role: UserRole): string {
    switch (role) {
      case 'student':
        return 'student'
      case 'instructor':
        return 'instructor'
      case 'admin':
        return 'admin'
      default:
        throw new Error(`Unknown role: ${role}`)
    }
  }

  // Student Analytics
  async getStudentAnalytics(
    userId: number, 
    options: { useCache?: boolean; timeRange?: string } = {}
  ): Promise<{ data: StudentAnalytics; lastUpdated: Date; fromCache: boolean }> {
    return this.getAnalytics<StudentAnalytics>('student', userId, options)
  }

  // Instructor Analytics
  async getInstructorAnalytics(
    userId: number,
    options: { useCache?: boolean; timeRange?: string } = {}
  ): Promise<{ data: InstructorAnalytics; lastUpdated: Date; fromCache: boolean }> {
    return this.getAnalytics<InstructorAnalytics>('instructor', userId, options)
  }

  // Admin Analytics
  async getAdminAnalytics(
    options: { useCache?: boolean; timeRange?: string } = {}
  ): Promise<{ data: AdminAnalytics; lastUpdated: Date; fromCache: boolean }> {
    return this.getAnalytics<AdminAnalytics>('admin', undefined, options)
  }

  // Refresh analytics (bypass cache)
  async refreshAnalytics<T>(role: UserRole, userId?: number, timeRange: string = 'month'): Promise<{ data: T; lastUpdated: Date }> {
    const cacheKey = `${role}_${userId || 'all'}_${timeRange}`
    this.clearCache(cacheKey)
    
    const result = await this.getAnalytics<T>(role, userId, { useCache: false, timeRange })
    return {
      data: result.data,
      lastUpdated: result.lastUpdated
    }
  }

  // Get cache status
  getCacheStatus(role: UserRole, userId?: number, timeRange: string = 'month'): { 
    hasCachedData: boolean; 
    lastUpdated: Date | null; 
    isExpired: boolean 
  } {
    const cacheKey = `${role}_${userId || 'all'}_${timeRange}`
    
    try {
      const cached = localStorage.getItem(`${ANALYTICS_CACHE_KEY}_${cacheKey}`)
      if (!cached) {
        return { hasCachedData: false, lastUpdated: null, isExpired: false }
      }

      const { timestamp } = JSON.parse(cached)
      const lastUpdated = new Date(timestamp)
      const age = Date.now() - lastUpdated.getTime()
      const isExpired = age > CACHE_DURATION

      return {
        hasCachedData: true,
        lastUpdated,
        isExpired
      }
    } catch (error) {
      return { hasCachedData: false, lastUpdated: null, isExpired: false }
    }
  }

  // Clear all analytics cache
  clearAllCache(): void {
    this.clearCache()
  }
}

export const analyticsApi = new AnalyticsApiClient()

// For backward compatibility and easy access
export const {
  getStudentAnalytics,
  getInstructorAnalytics,
  getAdminAnalytics,
  refreshAnalytics,
  getCacheStatus,
  clearAllCache
} = analyticsApi
