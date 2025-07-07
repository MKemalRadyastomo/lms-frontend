'use client'

import { UserList } from '@/components/users/user-list'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function UsersPage() {
  return (
    <ErrorBoundary>
      <div className="container mx-auto">
        <UserList />
      </div>
    </ErrorBoundary>
  )
}
