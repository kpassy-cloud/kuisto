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
          throw new Error('EMAIL_PASSWORD_REQUIRED')
        }

        // Find existing user
        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { subscription: true }
        })

        if (!user) {
          throw new Error('USER_NOT_FOUND')
        }

        if (!user.password) {
          throw new Error('PASSWORD_NOT_SET')
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isValid) {
          throw new Error('INVALID_PASSWORD')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          plan: user.subscription?.plan || 'free',
          role: user.role || 'user',
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.plan = (user as any).plan || 'free'
        token.role = (user as any).role || 'user'
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
  debug: false,
}
