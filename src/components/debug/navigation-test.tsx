'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, User } from 'lucide-react'

export function NavigationTest() {
  const pathname = usePathname()

  const testItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const handleLinkClick = (href: string) => {
    console.log('Navigation Test - Link clicked:', href)
    console.log('Current pathname:', pathname)
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-yellow-800 mb-3">
        🧪 Navigation Debug Test
      </h3>
      <div className="flex flex-wrap gap-2">
        {testItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => handleLinkClick(item.href)}
            className={`
              inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${pathname === item.href 
                ? 'bg-yellow-200 text-yellow-900' 
                : 'bg-white text-yellow-700 hover:bg-yellow-100'
              }
              border border-yellow-300
            `}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </div>
      <div className="mt-2 text-xs text-yellow-700">
        Current page: {pathname} | Click links to test navigation
      </div>
    </div>
  )
}
