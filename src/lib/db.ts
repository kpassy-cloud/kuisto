import { PrismaClient } from '@prisma/client'

// Singleton pattern for Prisma Client
// Force version increment to trigger hot reload
const DB_VERSION = '2'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  __dbVersion?: string
}

// Always create a new client in development to pick up schema changes
// In production, use the cached client
export const db = (() => {
  if (process.env.NODE_ENV === 'production') {
    return globalForPrisma.prisma ?? new PrismaClient()
  }
  
  // In development, force new client if version changed or models are missing
  const needsNewClient = !globalForPrisma.prisma 
    || globalForPrisma.__dbVersion !== DB_VERSION
    || !('user' in globalForPrisma.prisma)
  
  if (needsNewClient) {
    console.log('📦 Creating new Prisma client (version:', DB_VERSION, ')')
    const client = new PrismaClient({
      log: ['error'],
    })
    globalForPrisma.prisma = client
    globalForPrisma.__dbVersion = DB_VERSION
    return client
  }
  
  return globalForPrisma.prisma
})()