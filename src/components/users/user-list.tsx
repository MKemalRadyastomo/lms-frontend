'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserPlus,
  Mail,
  Calendar,
  Shield
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select' // Added import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { UserForm } from './user-form'
import { apiClient } from '@/lib/api'
import { AuthManager } from '@/lib/auth'
import { User, UserFilters } from '@/types'
import { useTranslation } from 'react-i18next' // Added import

interface UserListProps {
  showCreateForm?: boolean
  onUserSelect?: (user: User) => void
}

export function UserList({ showCreateForm = false, onUserSelect }: UserListProps) {
  const [showForm, setShowForm] = useState(showCreateForm)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const { t } = useTranslation() // Added useTranslation hook
  const { toast } = useToast()

  const filters: UserFilters & { page: number; limit: number } = {
    page,
    limit: 20,
    ...(searchTerm && { search: searchTerm }),
    ...(roleFilter && { role: roleFilter }),
  }

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => apiClient.getUsers(filters),
    enabled: AuthManager.hasRole('admin') || AuthManager.hasRole('instructor') || AuthManager.hasRole('guru'),
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => apiClient.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete the user. Please try again.',
        variant: 'destructive'
      })
    },
  })

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.username}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user.id)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  const getRoleBadgeColor = (roleId: number) => {
    switch (roleId) {
      case 3:
        return 'bg-purple-100 text-purple-800'
      case 2:
        return 'bg-green-100 text-green-800'
      case 1:
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 3:
        return 'Administrator'
      case 2:
        return 'Guru'
      case 1:
      default:
        return 'Siswa'
    }
  }

  if (!AuthManager.hasRole('admin') && !AuthManager.hasRole('instructor') && !AuthManager.hasRole('guru')) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            You don&apos;t have permission to view users.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (showForm) {
    return (
      <UserForm
        user={editingUser || undefined}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    )
  }

  return (
    <div className="space-y-6">

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari pengguna berdasarkan nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('all_roles')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_roles')}</SelectItem> {/* Changed value to "all" */}
                  <SelectItem value="siswa">{t('student')}</SelectItem>
                  <SelectItem value="guru">{t('teacher')}</SelectItem>
                  <SelectItem value="admin">{t('administrator')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {usersData ? `${usersData.pagination.total_items} total users` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load users. Please try again.</p>
            </div>
          ) : !usersData?.data.length ? (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || roleFilter ? 'Try adjusting your filters.' : 'Get started by creating a new user.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {usersData.data.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => onUserSelect?.(user)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.profile_picture_url ? (
                        <img
                          src={user.profile_picture_url}
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.first_name?.[0] || user.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.username
                          }
                        </h3>
                        <span className={`
                          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${getRoleBadgeColor(user.role_id)}
                        `}>
                          {getRoleName(user.role_id)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="mr-1 h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1 h-3 w-3" />
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {AuthManager.hasRole('admin') && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditUser(user)
                        }}
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteUser(user)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {usersData && usersData.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-500">
                Showing {usersData.pagination.current_page} of {usersData.pagination.total_pages} pages
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(usersData.pagination.total_pages, page + 1))}
                  disabled={page === usersData.pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
