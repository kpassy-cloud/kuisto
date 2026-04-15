'use client'

import { SessionProvider, useSession as nextAuthUseSession, signIn, signOut } from 'next-auth/react'
import { ReactNode } from 'react'

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

export function useAuth() {
  const { data: session, status } = nextAuthUseSession()

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

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login,
    logout,
    plan: session?.user?.plan || 'free',
  }
}
