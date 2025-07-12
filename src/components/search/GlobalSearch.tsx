'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search,
  Filter,
  Clock,
  TrendingUp,
  FileText,
  BookOpen,
  Users,
  Calendar,
  SortAsc,
  SortDesc,
  X,
  Loader2,
  History,
  Star,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchService, SearchFilters, SearchResult } from '@/lib/search'
import SearchResults from './SearchResults'

interface GlobalSearchProps {
  placeholder?: string
  showFilters?: boolean
  showHistory?: boolean
  defaultFilters?: SearchFilters
  onResultClick?: (result: SearchResult) => void
  className?: string
}

export default function GlobalSearch({
  placeholder = "Search courses, materials, and assignments...",
  showFilters = true,
  showHistory = true,
  defaultFilters = {},
  onResultClick,
  className
}: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters)
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTime, setSearchTime] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Load search history on mount
  useEffect(() => {
    setRecentSearches(searchService.getRecentSearches(5))
    setPopularSearches(searchService.getPopularSearches().slice(0, 5))
  }, [])

  // Handle search with debouncing
  useEffect(() => {
    if (query.length >= 2) {
      handleSearch()
      if (showSuggestions) {
        handleSuggestions()
      }
    } else if (query.length === 0) {
      setResults([])
      setTotalCount(0)
      setSuggestions([])
    }
  }, [query, filters])

  // Handle search
  const handleSearch = async () => {
    if (query.length < 2) return

    setIsLoading(true)
    try {
      const response = await searchService.searchWithDebounce(query, filters)
      setResults(response.results)
      setTotalCount(response.total_count)
      setSearchTime(response.search_time_ms)
      
      // Update recent searches
      setRecentSearches(searchService.getRecentSearches(5))
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle suggestions
  const handleSuggestions = async () => {
    if (query.length < 2) return

    setIsLoadingSuggestions(true)
    try {
      const suggestions = await searchService.getSuggestionsWithDebounce(query)
      setSuggestions(suggestions)
    } catch (error) {
      console.error('Suggestions error:', error)
      setSuggestions([])
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value)
    if (value.length >= 2) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    searchInputRef.current?.focus()
  }

  // Handle filter change
  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Handle type filter toggle
  const toggleTypeFilter = (type: 'course' | 'material' | 'assignment') => {
    const currentTypes = filters.types || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    
    updateFilter('types', newTypes.length > 0 ? newTypes : undefined)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  // Clear search
  const clearSearch = () => {
    setQuery('')
    setResults([])
    setTotalCount(0)
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.types && filters.types.length > 0) count++
    if (filters.category_id) count++
    if (filters.instructor_id) count++
    if (filters.date_range) count++
    if (filters.difficulty) count++
    if (filters.status) count++
    return count
  }, [filters])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
          <Card 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto"
          >
            <CardContent className="p-0">
              {suggestions.length > 0 && (
                <div className="p-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Suggestions
                    {isLoadingSuggestions && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </h4>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {recentSearches.length > 0 && showHistory && (
                <>
                  {suggestions.length > 0 && <Separator />}
                  <div className="p-3">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Recent Searches
                    </h4>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded text-gray-600"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  Advanced
                </Button>
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Filters */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleTypeFilter('course')}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors",
                    filters.types?.includes('course')
                      ? "bg-blue-100 border-blue-200 text-blue-800"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <BookOpen className="h-3 w-3" />
                  Courses
                </button>
                <button
                  onClick={() => toggleTypeFilter('material')}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors",
                    filters.types?.includes('material')
                      ? "bg-green-100 border-green-200 text-green-800"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <FileText className="h-3 w-3" />
                  Materials
                </button>
                <button
                  onClick={() => toggleTypeFilter('assignment')}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors",
                    filters.types?.includes('assignment')
                      ? "bg-purple-100 border-purple-200 text-purple-800"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Users className="h-3 w-3" />
                  Assignments
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select
                    value={filters.sort_by || 'relevance'}
                    onValueChange={(value) => updateFilter('sort_by', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={filters.difficulty || ''}
                    onValueChange={(value) => updateFilter('difficulty', value as any || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any difficulty</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) => updateFilter('status', value as any || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Results Info */}
      {(query.length >= 2 || results.length > 0) && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </span>
            ) : (
              <span>
                {totalCount > 0 ? (
                  <>
                    Found {totalCount.toLocaleString()} result{totalCount !== 1 ? 's' : ''} 
                    {query && ` for "${query}"`}
                    {searchTime > 0 && ` in ${searchTime}ms`}
                  </>
                ) : query.length >= 2 ? (
                  `No results found${query ? ` for "${query}"` : ''}`
                ) : (
                  'Enter at least 2 characters to search'
                )}
              </span>
            )}
          </div>
          
          {results.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('sort_order', filters.sort_order === 'asc' ? 'desc' : 'asc')}
                className="h-8"
              >
                {filters.sort_order === 'desc' ? (
                  <SortDesc className="h-4 w-4" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <SearchResults
          results={results}
          query={query}
          onResultClick={onResultClick}
          isLoading={isLoading}
        />
      )}

      {/* Popular Searches */}
      {query.length === 0 && popularSearches.length > 0 && showHistory && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Popular Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(search)}
                  className="text-xs"
                >
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}