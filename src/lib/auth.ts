import Cookies from 'js-cookie'
import { User } from '@/types'

const AUTH_TOKEN_KEY = 'auth_token'
const USER_ID_KEY = 'user_id'
const USER_DATA_KEY = 'user_data'

export interface AuthTokens {
  token: string
  userId: number
}

export class AuthManager {
  static setAuthTokens(tokens: AuthTokens): void {
    Cookies.set(AUTH_TOKEN_KEY, tokens.token, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
    Cookies.set(USER_ID_KEY, tokens.userId.toString(), { 
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  }

  static getAuthToken(): string | null {
    return Cookies.get(AUTH_TOKEN_KEY) || null
  }

  static getUserId(): number | null {
    const userId = Cookies.get(USER_ID_KEY)
    return userId ? parseInt(userId, 10) : null
  }

  static setUserData(user: User): void {
    Cookies.set(USER_DATA_KEY, JSON.stringify(user), {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  }

  static getUserData(): User | null {
    const userData = Cookies.get(USER_DATA_KEY)
    return userData ? JSON.parse(userData) : null
  }

  static clearAuth(): void {
    Cookies.remove(AUTH_TOKEN_KEY)
    Cookies.remove(USER_ID_KEY)
    Cookies.remove(USER_DATA_KEY)
  }

  static isAuthenticated(): boolean {
    return !!this.getAuthToken() && !!this.getUserId()
  }

  static hasRole(requiredRole: string): boolean {
    const user = this.getUserData()
    if (!user) return false
    
    // This is a simplified role check - in a real app, you'd check permissions
    // For now, we'll assume role names match the role_id
    const roleMap: { [key: number]: string } = {
      1: 'student',
      2: 'instructor',
      3: 'admin'
    }
    
    const userRole = roleMap[user.role_id]
    return userRole === requiredRole
  }

  static hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role))
  }

  static canAccessRoute(route: string): boolean {
    if (!this.isAuthenticated()) return false

    // Define route permissions
    const routePermissions: { [key: string]: string[] } = {
      '/dashboard': ['student', 'instructor', 'admin'],
      '/courses': ['student', 'instructor', 'admin'],
      '/assignments': ['student', 'instructor', 'admin'],
      '/admin': ['admin'],
      '/profile': ['student', 'instructor', 'admin'],
    }

    const requiredRoles = routePermissions[route]
    if (!requiredRoles) return true // Public route

    return this.hasAnyRole(requiredRoles)
  }
}

export default AuthManager
