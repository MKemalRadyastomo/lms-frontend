'use client'

import { useState } from 'react'
import { RefreshCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface RefreshButtonProps {
  onRefresh: () => Promise<void>
  lastUpdated: Date | null
  isRefreshing: boolean
  fromCache: boolean
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function RefreshButton({ 
  onRefresh, 
  lastUpdated, 
  isRefreshing,
  fromCache,
  className,
  variant = 'outline',
  size = 'default'
}: RefreshButtonProps) {
  const [lastRefreshError, setLastRefreshError] = useState<string | null>(null)

  const handleRefresh = async () => {
    try {
      setLastRefreshError(null)
      await onRefresh()
      toast.success('Data berhasil diperbarui!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui data'
      setLastRefreshError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const getLastUpdatedText = () => {
    if (!lastUpdated) return 'Belum pernah diperbarui'
    
    const timeAgo = formatDistanceToNow(lastUpdated, { addSuffix: true })
    const source = fromCache ? '(dari cache)' : '(real-time)'
    return `Diperbarui ${timeAgo} ${source}`
  }

  const getCacheIndicatorColor = () => {
    if (!lastUpdated) return 'text-gray-500'
    
    const ageInMinutes = (Date.now() - lastUpdated.getTime()) / (1000 * 60)
    
    if (ageInMinutes < 5) return 'text-green-600'
    if (ageInMinutes < 15) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Last Updated Info */}
      <div className="hidden sm:flex items-center text-sm text-gray-600">
        <Clock className={`h-4 w-4 mr-1 ${getCacheIndicatorColor()}`} />
        <span className="truncate max-w-48">
          {getLastUpdatedText()}
        </span>
      </div>

      {/* Refresh Button */}
      <Button
        variant={variant}
        size={size}
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 min-w-max"
      >
        <RefreshCw 
          className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} 
        />
        <span className="hidden sm:inline">
          {isRefreshing ? 'Memperbarui...' : 'Refresh'}
        </span>
      </Button>

      {/* Error Message (if any) */}
      {lastRefreshError && (
        <div className="text-sm text-red-600 max-w-48 truncate" title={lastRefreshError}>
          Error: {lastRefreshError}
        </div>
      )}

      {/* Mobile: Show last updated on separate line */}
      <div className="sm:hidden w-full">
        <div className={`text-xs ${getCacheIndicatorColor()} flex items-center mt-1`}>
          <Clock className="h-3 w-3 mr-1" />
          {getLastUpdatedText()}
        </div>
      </div>
    </div>
  )
}

// Export a simpler version for basic use cases
export function SimpleRefreshButton({ 
  onRefresh, 
  isRefreshing 
}: { 
  onRefresh: () => Promise<void>
  isRefreshing: boolean 
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </Button>
  )
}
