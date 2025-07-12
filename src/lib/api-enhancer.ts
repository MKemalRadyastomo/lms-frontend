import { AxiosError, AxiosResponse } from 'axios'
import { useUIStore } from './store'

export interface RetryConfig {
  retries: number
  retryDelay: number
  retryCondition?: (error: AxiosError) => boolean
}

export interface ApiError extends Error {
  status?: number
  code?: string
  details?: any
}

export class ApiEnhancer {
  private static defaultRetryConfig: RetryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error: AxiosError) => {
      return (
        !error.response ||
        error.response.status >= 500 ||
        error.response.status === 408
      )
    }
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const { retries, retryDelay, retryCondition } = {
      ...this.defaultRetryConfig,
      ...config
    }

    let lastError: any

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (
          attempt === retries ||
          (error instanceof Error && 
           error.name === 'AxiosError' && 
           retryCondition && 
           !retryCondition(error as AxiosError))
        ) {
          break
        }

        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  static createApiError(error: AxiosError): ApiError {
    const apiError = new Error() as ApiError
    
    if (error.response) {
      const responseData = error.response.data as any
      apiError.message = responseData?.message || 'An error occurred'
      apiError.status = error.response.status
      apiError.code = responseData?.code
      apiError.details = responseData
    } else if (error.request) {
      apiError.message = 'Network error - please check your connection'
      apiError.code = 'NETWORK_ERROR'
    } else {
      apiError.message = error.message || 'An unexpected error occurred'
      apiError.code = 'UNKNOWN_ERROR'
    }

    return apiError
  }

  static handleApiError(error: AxiosError) {
    const apiError = this.createApiError(error)
    const { addToast } = useUIStore.getState()

    // Don't show toast for auth errors (handled by interceptor)
    if (apiError.status !== 401) {
      addToast({
        type: 'error',
        title: 'Error',
        description: apiError.message
      })
    }

    throw apiError
  }

  static async optimisticUpdate<T>(
    operation: () => Promise<T>,
    optimisticFn: () => void,
    rollbackFn: () => void
  ): Promise<T> {
    // Apply optimistic update
    optimisticFn()

    try {
      const result = await operation()
      return result
    } catch (error) {
      // Rollback on error
      rollbackFn()
      throw error
    }
  }
}

// Enhanced response cache
export class ResponseCache {
  private static cache = new Map<string, {
    data: any
    timestamp: number
    ttl: number
  }>()

  static set(key: string, data: any, ttl: number = 300000) { // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  static get(key: string): any | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  static invalidate(pattern: string) {
    Array.from(this.cache.keys()).forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    })
  }

  static clear() {
    this.cache.clear()
  }
}