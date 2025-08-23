/**
 * Consultant Authentication System
 * Simple localStorage-based authentication for consultant-only pages
 */

export interface ConsultantSession {
  isAuthenticated: boolean
  consultantId: string
  loginTime: Date
  expiresAt: Date
}

const STORAGE_KEY = 'consultant-auth-session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const CONSULTANT_PASSWORD = 'INBOUND2025' // Simple password for MVP

export class ConsultantAuth {
  /**
   * Attempt to login with provided password
   */
  static login(password: string): boolean {
    if (password !== CONSULTANT_PASSWORD) {
      return false
    }

    const now = new Date()
    const session: ConsultantSession = {
      isAuthenticated: true,
      consultantId: 'consultant@inbound.com',
      loginTime: now,
      expiresAt: new Date(now.getTime() + SESSION_DURATION)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    return true
  }

  /**
   * Logout and clear session
   */
  static logout(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    try {
      const sessionData = localStorage.getItem(STORAGE_KEY)
      if (!sessionData) return false

      const session: ConsultantSession = JSON.parse(sessionData)
      const now = new Date()
      const expiresAt = new Date(session.expiresAt)

      // Check if session is expired
      if (now > expiresAt) {
        this.logout()
        return false
      }

      return session.isAuthenticated
    } catch (error) {
      // Clear corrupted session data
      this.logout()
      return false
    }
  }

  /**
   * Get current session information
   */
  static getSession(): ConsultantSession | null {
    try {
      const sessionData = localStorage.getItem(STORAGE_KEY)
      if (!sessionData) return null

      const session: ConsultantSession = JSON.parse(sessionData)
      
      // Check if session is still valid
      if (!this.isAuthenticated()) {
        return null
      }

      return session
    } catch (error) {
      return null
    }
  }

  /**
   * Extend current session (reset expiration)
   */
  static extendSession(): boolean {
    const currentSession = this.getSession()
    if (!currentSession) return false

    const now = new Date()
    const extendedSession: ConsultantSession = {
      ...currentSession,
      expiresAt: new Date(now.getTime() + SESSION_DURATION)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(extendedSession))
    return true
  }
}