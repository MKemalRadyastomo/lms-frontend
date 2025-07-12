import Cookies from 'js-cookie'
import { User } from '@/types'

const AUTH_TOKEN_KEY = 'auth_token'
const USER_ID_KEY = 'user_id'
const USER_DATA_KEY = 'user_data'
const LAST_ACTIVITY_KEY = 'last_activity'
const FAILED_ATTEMPTS_KEY = 'failed_attempts'
const ACCOUNT_LOCKOUT_KEY = 'account_lockout'

// Security constants
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes

export interface AuthTokens {
  token: string
  userId: number
}

export interface AccountLockout {
  attempts: number
  locked_until?: number
  locked_at?: number
}

export interface SessionInfo {
  last_activity: number
  expires_at: number
  user_id: number
}

export interface SecurityValidation {
  isValid: boolean
  error?: string
  action?: 'lockout' | 'timeout' | 'unauthorized'
}

export class AuthManager {
  // Session Management Methods
  static initializeSession(tokens: AuthTokens): void {
    this.setAuthTokens(tokens)
    this.updateLastActivity()
    this.clearFailedAttempts() // Clear failed attempts on successful login
  }

  static updateLastActivity(): void {
    const currentTime = Date.now()
    Cookies.set(LAST_ACTIVITY_KEY, currentTime.toString(), {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  }

  static isSessionExpired(): boolean {
    const lastActivity = Cookies.get(LAST_ACTIVITY_KEY)
    if (!lastActivity) return true

    const lastActivityTime = parseInt(lastActivity)
    const currentTime = Date.now()
    return (currentTime - lastActivityTime) > SESSION_TIMEOUT_MS
  }

  static getSessionInfo(): SessionInfo | null {
    const lastActivity = Cookies.get(LAST_ACTIVITY_KEY)
    const userId = this.getUserId()

    if (!lastActivity || !userId) return null

    const lastActivityTime = parseInt(lastActivity)
    return {
      last_activity: lastActivityTime,
      expires_at: lastActivityTime + SESSION_TIMEOUT_MS,
      user_id: userId
    }
  }

  // Account Lockout Methods
  static recordFailedAttempt(identifier: string = 'default'): AccountLockout {
    const key = `${FAILED_ATTEMPTS_KEY}_${identifier}`
    const existing = this.getFailedAttempts(identifier)
    const newAttempts = existing.attempts + 1

    const lockoutData: AccountLockout = {
      attempts: newAttempts,
    }

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS
      lockoutData.locked_until = lockoutUntil
      lockoutData.locked_at = Date.now()

      // Set lockout cookie
      Cookies.set(`${ACCOUNT_LOCKOUT_KEY}_${identifier}`, JSON.stringify({
        locked_until: lockoutUntil,
        locked_at: Date.now()
      }), {
        expires: new Date(lockoutUntil),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
    }

    // Store failed attempts
    Cookies.set(key, JSON.stringify(lockoutData), {
      expires: 1, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return lockoutData
  }

  static getFailedAttempts(identifier: string = 'default'): AccountLockout {
    const key = `${FAILED_ATTEMPTS_KEY}_${identifier}`
    const data = Cookies.get(key)
    
    if (!data) return { attempts: 0 }
    
    try {
      return JSON.parse(data)
    } catch {
      return { attempts: 0 }
    }
  }

  static clearFailedAttempts(identifier: string = 'default'): void {
    const key = `${FAILED_ATTEMPTS_KEY}_${identifier}`
    Cookies.remove(key)
    Cookies.remove(`${ACCOUNT_LOCKOUT_KEY}_${identifier}`)
  }

  static isAccountLocked(identifier: string = 'default'): boolean {
    const lockoutKey = `${ACCOUNT_LOCKOUT_KEY}_${identifier}`
    const lockoutData = Cookies.get(lockoutKey)
    
    if (!lockoutData) return false
    
    try {
      const lockout = JSON.parse(lockoutData)
      const isLocked = Date.now() < lockout.locked_until
      
      // Clean up expired lockouts
      if (!isLocked) {
        this.clearFailedAttempts(identifier)
      }
      
      return isLocked
    } catch {
      return false
    }
  }

  static getLockoutTimeRemaining(identifier: string = 'default'): number {
    const lockoutKey = `${ACCOUNT_LOCKOUT_KEY}_${identifier}`
    const lockoutData = Cookies.get(lockoutKey)
    
    if (!lockoutData) return 0
    
    try {
      const lockout = JSON.parse(lockoutData)
      const remaining = lockout.locked_until - Date.now()
      return Math.max(0, remaining)
    } catch {
      return 0
    }
  }

  // Security Validation Methods
  static validateSession(): SecurityValidation {
    if (!this.isAuthenticated()) {
      return {
        isValid: false,
        error: 'Not authenticated',
        action: 'unauthorized'
      }
    }

    if (this.isSessionExpired()) {
      this.clearAuth()
      return {
        isValid: false,
        error: 'Session expired',
        action: 'timeout'
      }
    }

    // Update last activity on successful validation
    this.updateLastActivity()

    return { isValid: true }
  }

  static validatePassword(password: string): SecurityValidation {
    if (password.length < 8) {
      return {
        isValid: false,
        error: 'Password must be at least 8 characters long'
      }
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one lowercase letter'
      }
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter'
      }
    }

    if (!/(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one number'
      }
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one special character (@$!%*?&)'
      }
    }

    return { isValid: true }
  }

  // Enhanced Authentication Methods
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

  static updateUserData(user: User): void {
    // Update the stored user data with new information
    this.setUserData(user)
  }

  static clearAuth(): void {
    Cookies.remove(AUTH_TOKEN_KEY)
    Cookies.remove(USER_ID_KEY)
    Cookies.remove(USER_DATA_KEY)
    Cookies.remove(LAST_ACTIVITY_KEY)
    // Note: Don't clear failed attempts and lockout data on logout
    // They should persist to prevent bypass attempts
  }

  static isAuthenticated(): boolean {
    // Basic authentication check
    const hasTokens = !!this.getAuthToken() && !!this.getUserId()
    if (!hasTokens) return false

    // Enhanced security check - validate session timeout
    if (this.isSessionExpired()) {
      this.clearAuth() // Auto-logout on session expiry
      return false
    }

    return true
  }

  // Enhanced authentication with full security validation
  static isAuthenticatedWithSecurity(): SecurityValidation {
    return this.validateSession()
  }

  static hasRole(requiredRole: string): boolean {
    const user = this.getUserData()
    if (!user) {
      console.log('No user data found for role check') // Debug
      return false
    }
    
    console.log('Checking role:', requiredRole, 'User role_id:', user.role_id) // Debug
    
    // Map role_id to both English and Indonesian role names for compatibility
    const roleMap: { [key: number]: string[] } = {
      1: ['student', 'siswa'],     // Student
      2: ['instructor', 'guru'],   // Teacher/Instructor
      3: ['admin']                 // Admin
    }
    
    const userRoles = roleMap[user.role_id] || []
    const hasRole = userRoles.includes(requiredRole)
    
    console.log('User roles:', userRoles, 'Has role:', hasRole) // Debug
    
    return hasRole
  }

  static hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role))
  }

  static canAccessRoute(route: string): boolean {
    if (!this.isAuthenticated()) return false

    // Define route permissions
    const routePermissions: { [key: string]: string[] } = {
      '/dashboard': ['student', 'siswa', 'instructor', 'guru', 'admin'],
      '/courses': ['student', 'siswa', 'instructor', 'guru', 'admin'],
      '/assignments': ['student', 'siswa', 'instructor', 'guru', 'admin'],
      '/users': ['instructor', 'guru', 'admin'],
      '/admin': ['admin'],
      '/profile': ['student', 'siswa', 'instructor', 'guru', 'admin'],
    }

    const requiredRoles = routePermissions[route]
    if (!requiredRoles) return true // Public route

    return this.hasAnyRole(requiredRoles)
  }
}

export default AuthManager
