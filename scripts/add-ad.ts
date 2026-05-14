import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const ad = await prisma.ad.create({
    data: {
      title: 'WorryBee',
      description: 'Your AI-powered anxiety companion - Get personalized support for mental wellness',
      imageUrl: 'https://worrybee.com/logo.png',
      linkUrl: 'https://worrybee.com',
      buttonText: 'Try WorryBee',
      type: 'banner',
      targetTiers: '["free"]',
      active: true,
      priority: 10
    }
  })
  console.log('Ad created:', ad)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
