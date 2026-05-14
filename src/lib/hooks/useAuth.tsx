'use client'

import { SessionProvider, useSession as nextAuthUseSession, signIn, signOut } from 'next-auth/react'
import { ReactNode, useCallback } from 'react'

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

export function useAuth() {
  const { data: session, status, update } = nextAuthUseSession()

  const login = async (email: string, password?: string) => {
    const result = await signIn('credentials', {
      email,
      password: password || '',
      redirect: false,
    })
    return result
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  const refreshUser = useCallback(async () => {
    // Force refresh the session by calling update
    // This will trigger the session callback in NextAuth
    try {
      await update()
    } catch (error) {
      console.error('Failed to refresh session:', error)
    }
  }, [update])

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login,
    logout,
    plan: session?.user?.plan || 'free',
    refreshUser,
  }
}
