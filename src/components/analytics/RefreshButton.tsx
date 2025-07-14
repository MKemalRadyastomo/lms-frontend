'use client'

import { useState, useEffect, useRef } from 'react'
import { RefreshCw, Clock, Play, Pause, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
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
  enableAutoRefresh?: boolean
  defaultRefreshInterval?: number // in seconds
}

export function RefreshButton({ 
  onRefresh, 
  lastUpdated, 
  isRefreshing,
  fromCache,
  className,
  variant = 'outline',
  size = 'default',
  enableAutoRefresh = false,
  defaultRefreshInterval = 30
}: RefreshButtonProps) {
  const [lastRefreshError, setLastRefreshError] = useState<string | null>(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(enableAutoRefresh)
  const [refreshInterval, setRefreshInterval] = useState(defaultRefreshInterval)
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefreshEnabled && !isRefreshing) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }
    
    return () => {
      stopAutoRefresh()
    }
  }, [autoRefreshEnabled, refreshInterval, isRefreshing])

  const startAutoRefresh = () => {
    stopAutoRefresh() // Clear any existing intervals
    
    setTimeUntilRefresh(refreshInterval)
    
    // Start countdown
    countdownRef.current = setInterval(() => {
      setTimeUntilRefresh(prev => {
        if (prev === null || prev <= 1) {
          return refreshInterval // Reset countdown
        }
        return prev - 1
      })
    }, 1000)
    
    // Start auto-refresh
    intervalRef.current = setInterval(async () => {
      if (!isRefreshing) {
        await handleRefresh()
      }
    }, refreshInterval * 1000)
  }

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setTimeUntilRefresh(null)
  }

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled)
  }

  const changeRefreshInterval = (newInterval: number) => {
    setRefreshInterval(newInterval)
    if (autoRefreshEnabled) {
      // Restart with new interval
      startAutoRefresh()
    }
  }

  const handleRefresh = async () => {
    try {
      setLastRefreshError(null)
      await onRefresh()
      toast.success('Data berhasil diperbarui!')
      
      // Reset countdown if auto-refresh is enabled
      if (autoRefreshEnabled) {
        setTimeUntilRefresh(refreshInterval)
      }
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
        {/* Auto-refresh countdown */}
        {autoRefreshEnabled && timeUntilRefresh !== null && (
          <span className="ml-2 text-xs text-blue-600">
            (auto-refresh in {timeUntilRefresh}s)
          </span>
        )}
      </div>

      {/* Auto-refresh Toggle */}
      <Button
        variant={autoRefreshEnabled ? 'default' : 'outline'}
        size="sm"
        onClick={toggleAutoRefresh}
        className="flex items-center gap-2"
        title={autoRefreshEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
      >
        {autoRefreshEnabled ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        <span className="hidden md:inline">
          {autoRefreshEnabled ? 'Auto ON' : 'Auto OFF'}
        </span>
      </Button>

      {/* Refresh Interval Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">{refreshInterval}s</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => changeRefreshInterval(10)}>
            10 seconds
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => changeRefreshInterval(30)}>
            30 seconds
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => changeRefreshInterval(60)}>
            1 minute
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => changeRefreshInterval(300)}>
            5 minutes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => changeRefreshInterval(5)}>
            5 seconds (dev)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Manual Refresh Button */}
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
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </span>
      </Button>

      {/* Error Message (if any) */}
      {lastRefreshError && (
        <div className="text-sm text-red-600 max-w-48 truncate" title={lastRefreshError}>
          Error: {lastRefreshError}
        </div>
      )}

      {/* Mobile: Show status on separate line */}
      <div className="sm:hidden w-full">
        <div className={`text-xs ${getCacheIndicatorColor()} flex items-center mt-1`}>
          <Clock className="h-3 w-3 mr-1" />
          {getLastUpdatedText()}
          {autoRefreshEnabled && timeUntilRefresh !== null && (
            <span className="ml-2 text-blue-600">
              (auto: {timeUntilRefresh}s)
            </span>
          )}
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
