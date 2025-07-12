'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen,
  FileText,
  Users,
  ExternalLink,
  Calendar,
  User,
  Star,
  Download,
  Eye,
  Clock,
  Target,
  Bookmark,
  Share2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchResult } from '@/lib/search'

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  onResultClick?: (result: SearchResult) => void
  isLoading?: boolean
  showTypeFilter?: boolean
}

export default function SearchResults({
  results,
  query,
  onResultClick,
  isLoading = false,
  showTypeFilter = true
}: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState('all')

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups = {
      all: results,
      course: results.filter(r => r.type === 'course'),
      material: results.filter(r => r.type === 'material'),
      assignment: results.filter(r => r.type === 'assignment')
    }
    return groups
  }, [results])

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />
      case 'material':
        return <FileText className="h-4 w-4" />
      case 'assignment':
        return <Users className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'material':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'assignment':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Highlight search terms in text
  const highlightText = (text: string, highlights: string[] = []) => {
    if (!query && highlights.length === 0) return text

    let highlightedText = text
    const terms = query ? [query, ...highlights] : highlights
    
    terms.forEach(term => {
      if (term) {
        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>')
      }
    })

    return highlightedText
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result)
    } else {
      // Default navigation
      window.open(result.url, '_blank')
    }
  }

  // Render individual result
  const renderResult = (result: SearchResult) => (
    <Card 
      key={`${result.type}-${result.id}`}
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleResultClick(result)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn('text-xs', getTypeColor(result.type))}>
                  <span className="flex items-center gap-1">
                    {getTypeIcon(result.type)}
                    {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                  </span>
                </Badge>
                {result.relevance_score && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="h-3 w-3" />
                    {Math.round(result.relevance_score * 100)}%
                  </div>
                )}
              </div>
              
              <h3 
                className="font-semibold text-lg leading-tight mb-1 hover:text-blue-600"
                dangerouslySetInnerHTML={{ 
                  __html: highlightText(result.title, result.highlights) 
                }}
              />
              
              {result.course_name && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {result.course_name}
                  {result.instructor_name && (
                    <>
                      <span className="mx-1">•</span>
                      <User className="h-3 w-3" />
                      {result.instructor_name}
                    </>
                  )}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Description/Content */}
          {(result.description || result.content_snippet) && (
            <div className="space-y-2">
              {result.description && (
                <p 
                  className="text-gray-700 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(result.description, result.highlights) 
                  }}
                />
              )}
              
              {result.content_snippet && result.content_snippet !== result.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p 
                    className="text-sm text-gray-600 italic"
                    dangerouslySetInnerHTML={{ 
                      __html: `"${highlightText(result.content_snippet, result.highlights)}"` 
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(result.created_at)}
              </span>
              
              {result.metadata?.due_date && (
                <span className="flex items-center gap-1 text-orange-600">
                  <Clock className="h-3 w-3" />
                  Due {formatDate(result.metadata.due_date)}
                </span>
              )}
              
              {result.metadata?.file_type && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {result.metadata.file_type.toUpperCase()}
                  {result.metadata.file_size && (
                    <span className="ml-1">
                      ({(result.metadata.file_size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  )}
                </span>
              )}
              
              {result.metadata?.assignment_type && (
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {result.metadata.assignment_type}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <Bookmark className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-12 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search terms or filters
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Suggestions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your spelling</li>
              <li>Use fewer or different keywords</li>
              <li>Remove filters to see more results</li>
              <li>Try more general terms</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Type Filter Tabs */}
      {showTypeFilter && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-1">
              All ({results.length})
            </TabsTrigger>
            <TabsTrigger value="course" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Courses ({groupedResults.course.length})
            </TabsTrigger>
            <TabsTrigger value="material" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Materials ({groupedResults.material.length})
            </TabsTrigger>
            <TabsTrigger value="assignment" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Assignments ({groupedResults.assignment.length})
            </TabsTrigger>
          </TabsList>

          {/* Results for each tab */}
          {Object.entries(groupedResults).map(([type, typeResults]) => (
            <TabsContent key={type} value={type} className="space-y-4 mt-4">
              {typeResults.length > 0 ? (
                typeResults.map(renderResult)
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <div className="text-gray-500">
                      No {type === 'all' ? '' : type} results found
                      {query && ` for "${query}"`}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Simple list view without tabs */}
      {!showTypeFilter && (
        <div className="space-y-4">
          {results.map(renderResult)}
        </div>
      )}
    </div>
  )
}