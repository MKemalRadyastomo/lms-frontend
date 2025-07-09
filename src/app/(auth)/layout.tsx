'use client'

import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Branding } from '@/components/layout/Branding'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex" data-testid="auth-layout">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-center items-center text-white">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <Branding size="lg" />
          </div>
          <h1 className="text-4xl font-bold mb-6">
            {t('welcome_to_learning_journey')}
          </h1>
          <p className="text-xl text-blue-100">
            {t('join_lms_description')}
          </p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden mb-8">
            <Branding size="sm" />
          </div>
          
          {children}
          
          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              data-testid="auth-back-to-home-link"
            >
              {t('back_to_home')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
