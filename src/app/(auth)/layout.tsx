import { BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-center items-center text-white">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <BookOpen className="h-12 w-12" />
            <span className="text-3xl font-bold">LMS</span>
          </div>
          <h1 className="text-4xl font-bold mb-6">
            Welcome to Your Learning Journey
          </h1>
          <p className="text-xl text-blue-100">
            Join thousands of students and instructors in our modern learning management system.
          </p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LMS</span>
          </div>
          
          {children}
          
          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
