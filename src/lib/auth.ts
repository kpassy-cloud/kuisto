import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      plan?: string
      role?: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'vous@exemple.com' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Normalize email
        const email = credentials.email.toLowerCase().trim()
        const password = credentials.password

        try {
          // Find existing user with retry logic for DB replication delay
          let user = null
          let attempts = 0
          const maxAttempts = 5
          const retryDelay = 300 // ms

          while (!user && attempts < maxAttempts) {
            user = await db.user.findUnique({
              where: { email },
              include: { subscription: true }
            })
            
            if (!user) {
              attempts++
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempts))
              }
            }
          }

          if (!user) {
            // User not found - return null to trigger CredentialsSignin error
            return null
          }

          if (!user.password) {
            return null
          }

          // Verify password
          const isValid = await bcrypt.compare(password, user.password)
          
          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            plan: user.subscription?.plan || 'free',
            role: user.role || 'user',
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        console.log(`[AUTH] New login - setting role: ${(user as any).role}`)
        token.id = user.id
        token.email = user.email
        token.plan = (user as any).plan || 'free'
        token.role = (user as any).role || 'user'
      }

      // On session update, fetch fresh plan and role from database
      if (trigger === 'update' && token.id) {
        console.log(`[AUTH] Session update triggered for user: ${token.email}`)
        const [subscription, dbUser] = await Promise.all([
          db.subscription.findUnique({
            where: { userId: token.id as string }
          }),
          db.user.findUnique({
            where: { id: token.id as string },
            select: { role: true }
          })
        ])
        token.plan = subscription?.plan || 'free'
        token.role = dbUser?.role || 'user'
        console.log(`[AUTH] Refreshed role from DB: ${dbUser?.role}`)
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.plan = token.plan as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`)
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
