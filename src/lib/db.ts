import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure Prisma for Supabase connection pooling (pgBouncer)
// pgbouncer doesn't support prepared statements properly
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    // Disable prepared statements for pgBouncer compatibility
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}