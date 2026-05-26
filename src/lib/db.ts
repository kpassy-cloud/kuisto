import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Support both POSTGRES_URL (Vercel Postgres) and DATABASE_URL (Neon/other)
const getDatabaseUrl = () => {
  // Vercel Postgres provides POSTGRES_URL (pooled connection)
  if (process.env.POSTGRES_URL) {
    return process.env.POSTGRES_URL
  }
  // Fallback to DATABASE_URL for other providers
  return process.env.DATABASE_URL
}

// Configure Prisma for PostgreSQL
const prismaClientSingleton = () => {
  const dbUrl = getDatabaseUrl()
  
  if (!dbUrl) {
    console.error('No database URL found. Set POSTGRES_URL or DATABASE_URL')
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  })
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}