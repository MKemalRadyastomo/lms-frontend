import { apiClient } from './api'

export interface SearchFilters {
  types?: ('course' | 'material' | 'assignment')[]
  category_id?: number
  instructor_id?: number
  date_range?: {
    start: string
    end: string
  }
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  status?: 'active' | 'draft' | 'archived'
  sort_by?: 'relevance' | 'date' | 'title' | 'popularity'
  sort_order?: 'asc' | 'desc'
}

export interface SearchResult {
  id: number
  type: 'course' | 'material' | 'assignment'
  title: string
  description?: string
  content_snippet?: string
  course_name?: string
  instructor_name?: string
  created_at: string
  updated_at?: string
  relevance_score: number
  highlights: string[]
  url: string
  metadata?: {
    file_type?: string
    file_size?: number
    due_date?: string
    assignment_type?: string
    course_id?: number
  }
}

export interface SearchResponse {
  results: SearchResult[]
  total_count: number
  search_time_ms: number
  suggestions?: string[]
  facets?: {
    types: { type: string; count: number }[]
    categories: { id: number; name: string; count: number }[]
    instructors: { id: number; name: string; count: number }[]
  }
}

export interface SearchHistory {
  id: string
  query: string
  filters: SearchFilters
  timestamp: string
  result_count: number
}

class SearchService {
  private static instance: SearchService
  private searchHistory: SearchHistory[] = []
  private searchCache = new Map<string, { data: SearchResponse; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_HISTORY = 50

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  // Debounced search function
  private debounceMap = new Map<string, NodeJS.Timeout>()
  
  private debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    key: string
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve, reject) => {
        // Clear existing timeout
        const existingTimeout = this.debounceMap.get(key)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
        }

        // Set new timeout
        const timeout = setTimeout(async () => {
          try {
            const result = await func(...args)
            resolve(result)
          } catch (error) {
            reject(error)
          }
          this.debounceMap.delete(key)
        }, delay)

        this.debounceMap.set(key, timeout)
      })
    }
  }

  // Main search function
  async search(
    query: string,
    filters: SearchFilters = {},
    options: { useCache?: boolean; saveToHistory?: boolean } = {}
  ): Promise<SearchResponse> {
    const { useCache = true, saveToHistory = true } = options

    // Normalize query
    const normalizedQuery = query.trim().toLowerCase()
    if (normalizedQuery.length < 2) {
      return {
        results: [],
        total_count: 0,
        search_time_ms: 0,
        suggestions: []
      }
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(normalizedQuery, filters)

    // Check cache first
    if (useCache) {
      const cached = this.getCachedResult(cacheKey)
      if (cached) {
        return cached
      }
    }

    const startTime = Date.now()

    try {
      // Prepare search request
      const searchRequest = {
        query: normalizedQuery,
        ...filters,
        limit: 20,
        offset: 0
      }

      // Make API call
      const response = await (apiClient as any).searchContent(searchRequest)
      
      const searchTime = Date.now() - startTime
      const searchResponse: SearchResponse = {
        ...response,
        search_time_ms: searchTime
      }

      // Cache result
      if (useCache) {
        this.setCachedResult(cacheKey, searchResponse)
      }

      // Save to history
      if (saveToHistory && normalizedQuery.length >= 3) {
        this.addToHistory(normalizedQuery, filters, searchResponse.total_count)
      }

      return searchResponse
    } catch (error) {
      console.error('Search error:', error)
      throw new Error('Search request failed')
    }
  }

  // Debounced search for real-time search
  searchWithDebounce = this.debounce(
    (query: string, filters: SearchFilters = {}) => this.search(query, filters),
    300,
    'main-search'
  )

  // Get search suggestions
  async getSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return []

    try {
      const response = await (apiClient as any).getSearchSuggestions(query)
      return response.suggestions || []
    } catch (error) {
      console.error('Suggestions error:', error)
      return []
    }
  }

  // Get search suggestions with debounce
  getSuggestionsWithDebounce = this.debounce(
    (query: string) => this.getSuggestions(query),
    200,
    'suggestions'
  )

  // Advanced search with faceted results
  async advancedSearch(
    query: string,
    filters: SearchFilters,
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<SearchResponse> {
    const offset = (pagination.page - 1) * pagination.limit

    try {
      const searchRequest = {
        query: query.trim(),
        ...filters,
        limit: pagination.limit,
        offset,
        include_facets: true
      }

      const response = await (apiClient as any).advancedSearch(searchRequest)
      return response
    } catch (error) {
      console.error('Advanced search error:', error)
      throw new Error('Advanced search request failed')
    }
  }

  // Search within a specific course
  async searchInCourse(
    courseId: number,
    query: string,
    types?: ('material' | 'assignment')[]
  ): Promise<SearchResult[]> {
    try {
      const response = await this.search(query, {
        types: types || ['material', 'assignment'],
        // Add course-specific filter when API supports it
      })

      // Filter by course_id on frontend for now
      return response.results.filter(result => 
        result.metadata?.course_id === courseId
      )
    } catch (error) {
      console.error('Course search error:', error)
      return []
    }
  }

  // Quick search for autocomplete
  async quickSearch(query: string): Promise<SearchResult[]> {
    if (query.length < 2) return []

    try {
      const response = await this.search(query, {
        types: ['course', 'material', 'assignment']
      }, { useCache: true, saveToHistory: false })

      return response.results.slice(0, 8) // Return top 8 results
    } catch (error) {
      console.error('Quick search error:', error)
      return []
    }
  }

  // Search history management
  addToHistory(query: string, filters: SearchFilters, resultCount: number): void {
    const historyItem: SearchHistory = {
      id: Date.now().toString(),
      query,
      filters,
      timestamp: new Date().toISOString(),
      result_count: resultCount
    }

    // Remove duplicate queries
    this.searchHistory = this.searchHistory.filter(item => 
      item.query.toLowerCase() !== query.toLowerCase()
    )

    // Add to beginning
    this.searchHistory.unshift(historyItem)

    // Limit history size
    if (this.searchHistory.length > this.MAX_HISTORY) {
      this.searchHistory = this.searchHistory.slice(0, this.MAX_HISTORY)
    }

    // Save to localStorage
    this.saveHistoryToStorage()
  }

  getSearchHistory(): SearchHistory[] {
    return [...this.searchHistory]
  }

  clearSearchHistory(): void {
    this.searchHistory = []
    localStorage.removeItem('search_history')
  }

  removeFromHistory(id: string): void {
    this.searchHistory = this.searchHistory.filter(item => item.id !== id)
    this.saveHistoryToStorage()
  }

  // Cache management
  private generateCacheKey(query: string, filters: SearchFilters): string {
    return btoa(JSON.stringify({ query, filters }))
  }

  private getCachedResult(key: string): SearchResponse | null {
    const cached = this.searchCache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION
    if (isExpired) {
      this.searchCache.delete(key)
      return null
    }

    return cached.data
  }

  private setCachedResult(key: string, data: SearchResponse): void {
    this.searchCache.set(key, {
      data,
      timestamp: Date.now()
    })

    // Limit cache size
    if (this.searchCache.size > 100) {
      const oldestKey = this.searchCache.keys().next().value
      if (oldestKey) {
        this.searchCache.delete(oldestKey)
      }
    }
  }

  clearCache(): void {
    this.searchCache.clear()
  }

  // Popular searches
  getPopularSearches(): string[] {
    const queryFrequency = new Map<string, number>()
    
    this.searchHistory.forEach(item => {
      const count = queryFrequency.get(item.query) || 0
      queryFrequency.set(item.query, count + 1)
    })

    return Array.from(queryFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query]) => query)
  }

  // Recent searches
  getRecentSearches(limit: number = 5): string[] {
    return this.searchHistory
      .slice(0, limit)
      .map(item => item.query)
  }

  // Initialize service
  init(): void {
    this.loadHistoryFromStorage()
  }

  private saveHistoryToStorage(): void {
    try {
      localStorage.setItem('search_history', JSON.stringify(this.searchHistory))
    } catch (error) {
      console.error('Failed to save search history:', error)
    }
  }

  private loadHistoryFromStorage(): void {
    try {
      const stored = localStorage.getItem('search_history')
      if (stored) {
        this.searchHistory = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
      this.searchHistory = []
    }
  }
}

// Types for API methods
interface SearchApiMethods {
  searchContent(params: any): Promise<SearchResponse>
  getSearchSuggestions(query: string): Promise<{ suggestions: string[] }>
  advancedSearch(params: any): Promise<SearchResponse>
}

// Extend API client with search methods
const originalApiClient = apiClient as any
originalApiClient.searchContent = async function(params: any): Promise<SearchResponse> {
  // Simulate search API - replace with actual implementation
  const response = await this.client.get('/search', { params })
  return response.data
}

originalApiClient.getSearchSuggestions = async function(query: string): Promise<{ suggestions: string[] }> {
  // Simulate suggestions API - replace with actual implementation
  const response = await this.client.get('/search/suggestions', { params: { q: query } })
  return response.data
}

originalApiClient.advancedSearch = async function(params: any): Promise<SearchResponse> {
  // Simulate advanced search API - replace with actual implementation
  const response = await this.client.get('/search/advanced', { params })
  return response.data
}

// Export search service instance
export const searchService = SearchService.getInstance()

// Initialize search service
if (typeof window !== 'undefined') {
  searchService.init()
}

export default searchService