import { BookOpen } from 'lucide-react'

interface BrandingProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Branding({ size = 'md', showText = true }: BrandingProps) {
  const iconSize = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }[size]

  const textSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size]

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm ${iconSize}`}>
        <BookOpen className={`text-white ${iconSize === 'h-12 w-12' ? 'h-8 w-8' : 'h-6 w-6'}`} />
      </div>
      {showText && <span className={`font-bold text-gray-900 ${textSize}`}>LMS</span>}
    </div>
  )
}
