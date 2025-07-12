'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Youtube
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface VideoURLInputProps {
  value: string
  onChange: (url: string) => void
  className?: string
  disabled?: boolean
}

interface VideoInfo {
  platform: 'youtube' | 'vimeo' | 'unknown'
  videoId: string | null
  thumbnailUrl: string | null
  embedUrl: string | null
  isValid: boolean
  error?: string
}

export default function VideoURLInput({
  value,
  onChange,
  className,
  disabled = false
}: VideoURLInputProps) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo>({
    platform: 'unknown',
    videoId: null,
    thumbnailUrl: null,
    embedUrl: null,
    isValid: false
  })
  const [isValidating, setIsValidating] = useState(false)

  // YouTube URL patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  // Vimeo URL patterns  
  const vimeoPatterns = [
    /(?:vimeo\.com\/)([0-9]+)/,
    /(?:player\.vimeo\.com\/video\/)([0-9]+)/
  ]

  // Extract video ID from YouTube URL
  const extractYouTubeId = (url: string): string | null => {
    for (const pattern of youtubePatterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  // Extract video ID from Vimeo URL
  const extractVimeoId = (url: string): string | null => {
    for (const pattern of vimeoPatterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  // Validate and extract video information
  const validateVideoURL = async (url: string): Promise<VideoInfo> => {
    if (!url.trim()) {
      return {
        platform: 'unknown',
        videoId: null,
        thumbnailUrl: null,
        embedUrl: null,
        isValid: false
      }
    }

    // Check YouTube
    const youtubeId = extractYouTubeId(url)
    if (youtubeId) {
      return {
        platform: 'youtube',
        videoId: youtubeId,
        thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
        isValid: true
      }
    }

    // Check Vimeo
    const vimeoId = extractVimeoId(url)
    if (vimeoId) {
      return {
        platform: 'vimeo',
        videoId: vimeoId,
        thumbnailUrl: null, // Vimeo thumbnails require API call
        embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
        isValid: true
      }
    }

    // Invalid URL
    return {
      platform: 'unknown',
      videoId: null,
      thumbnailUrl: null,
      embedUrl: null,
      isValid: false,
      error: 'Please enter a valid YouTube or Vimeo URL'
    }
  }

  // Handle URL change with validation
  const handleURLChange = async (newUrl: string) => {
    onChange(newUrl)
    
    if (!newUrl.trim()) {
      setVideoInfo({
        platform: 'unknown',
        videoId: null,
        thumbnailUrl: null,
        embedUrl: null,
        isValid: false
      })
      return
    }

    setIsValidating(true)
    try {
      const info = await validateVideoURL(newUrl)
      setVideoInfo(info)
      
      if (info.error) {
        toast.error(info.error)
      } else if (info.isValid) {
        toast.success(`Valid ${info.platform} video detected!`)
      }
    } catch (error) {
      console.error('Error validating video URL:', error)
      setVideoInfo({
        platform: 'unknown',
        videoId: null,
        thumbnailUrl: null,
        embedUrl: null,
        isValid: false,
        error: 'Error validating video URL'
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Open video in new tab
  const openVideo = () => {
    if (value) {
      window.open(value, '_blank')
    }
  }

  // Get platform icon
  const getPlatformIcon = () => {
    switch (videoInfo.platform) {
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-500" />
      case 'vimeo':
        return <Video className="h-5 w-5 text-blue-500" />
      default:
        return <Video className="h-5 w-5 text-gray-500" />
    }
  }

  // Get platform badge
  const getPlatformBadge = () => {
    if (!videoInfo.isValid) return null
    
    return (
      <Badge 
        variant="secondary"
        className={cn(
          'text-xs',
          videoInfo.platform === 'youtube' && 'bg-red-100 text-red-800',
          videoInfo.platform === 'vimeo' && 'bg-blue-100 text-blue-800'
        )}
      >
        {videoInfo.platform.charAt(0).toUpperCase() + videoInfo.platform.slice(1)}
      </Badge>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="video-url">Video URL</Label>
        <div className="relative">
          <Input
            id="video-url"
            type="url"
            value={value}
            onChange={(e) => handleURLChange(e.target.value)}
            placeholder="Enter YouTube or Vimeo URL..."
            disabled={disabled || isValidating}
            className={cn(
              'pr-10',
              videoInfo.isValid && 'border-green-500',
              videoInfo.error && 'border-red-500'
            )}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValidating ? (
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
            ) : videoInfo.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : videoInfo.error ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : null}
          </div>
        </div>
      </div>

      {/* Video Preview */}
      {videoInfo.isValid && videoInfo.embedUrl && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getPlatformIcon()}
                Video Preview
              </div>
              <div className="flex items-center gap-2">
                {getPlatformBadge()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openVideo}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={videoInfo.embedUrl}
                title="Video Preview"
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {videoInfo.videoId && (
              <p className="text-xs text-gray-500 mt-2">
                Video ID: {videoInfo.videoId}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {videoInfo.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Invalid Video URL</p>
                <p className="text-sm text-red-600">{videoInfo.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium">Supported platforms:</p>
        <div className="space-y-1 pl-3">
          <p>• YouTube: youtube.com/watch?v=... or youtu.be/...</p>
          <p>• Vimeo: vimeo.com/... or player.vimeo.com/video/...</p>
        </div>
        <p className="pt-2">The video will be embedded securely and accessible to enrolled students.</p>
      </div>
    </div>
  )
}