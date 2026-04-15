import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

// For routes that need a user but work with demo mode
export async function getOrCreateUser() {
  const session = await getServerSession(authOptions)
  
  if (session?.user) {
    return session.user
  }
  
  // For demo mode / development, create a demo user
  // In production, this should throw an error instead
  let demoUser = await db.user.findUnique({
    where: { email: 'demo@akanut.app' }
  })
  
  if (!demoUser) {
    demoUser = await db.user.create({
      data: {
        email: 'demo@akanut.app',
        name: 'Demo User',
      }
    })
    await db.userPreferences.create({
      data: { userId: demoUser.id }
    })
    await db.subscription.create({
      data: { 
        userId: demoUser.id,
        plan: 'free',
        status: 'active'
      }
    })
  }
  
  return {
    id: demoUser.id,
    email: demoUser.email,
    name: demoUser.name,
    image: demoUser.image,
    plan: 'free',
  }
}
