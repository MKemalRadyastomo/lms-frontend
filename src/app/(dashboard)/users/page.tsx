'use client'

import { UserList } from '@/components/users/user-list'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'

export default function UsersPage() {
  const { t } = useTranslation();

  return (
    <ErrorBoundary>
      <PageWrapper
        title={t('users')}
        description="Manage users, roles, and permissions across the platform"
        icon={Users}
        iconColor="purple"
        actions={
          <Link href="/users/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </Link>
        }
      >
        <UserList />
      </PageWrapper>
    </ErrorBoundary>
  )
}
