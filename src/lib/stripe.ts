import Stripe from 'stripe'

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
})

// Stripe Price IDs for each plan (CAD pricing)
// These will be created in Stripe Dashboard
export const STRIPE_PRICES = {
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '',
  premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || '',
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
}

// Plan features for display
// Pricing calculation: Monthly * 12 * 0.80 = Yearly price (20% discount)
export const PLAN_FEATURES = {
  free: {
    name: 'Gratuit',
    price: 0,
    features: [
      '5 recettes par jour',
      'Plan de repas basique',
      'Publicités incluses',
      'Support communautaire'
    ],
    limitations: {
      recipesPerDay: 5,
      mealPlansPerWeek: 1,
      hasAds: true,
      advancedFilters: false,
      customIngredients: false,
      nutritionInfo: false
    }
  },
  premium: {
    name: 'Premium',
    priceMonthly: 6.99,
    priceYearly: 67.10, // 6.99 * 12 * 0.80 = 67.10 (20% discount)
    features: [
      '25 recettes par jour',
      'Plans de repas illimités',
      'Sans publicités',
      'Filtres avancés',
      'Ingrédients personnalisés',
      'Infos nutritionnelles',
      'Support prioritaire'
    ],
    limitations: {
      recipesPerDay: 25,
      mealPlansPerWeek: -1, // unlimited
      hasAds: false,
      advancedFilters: true,
      customIngredients: true,
      nutritionInfo: true
    }
  },
  pro: {
    name: 'Pro',
    priceMonthly: 14.99,
    priceYearly: 143.90, // 14.99 * 12 * 0.80 = 143.90 (20% discount)
    features: [
      'Recettes illimitées',
      'Plans de repas illimités',
      'Sans publicités',
      'Tous les filtres avancés',
      'Export PDF des recettes',
      'Liste de courses intelligente',
      'Historique complet',
      'API access',
      'Support VIP'
    ],
    limitations: {
      recipesPerDay: -1, // unlimited
      mealPlansPerWeek: -1, // unlimited
      hasAds: false,
      advancedFilters: true,
      customIngredients: true,
      nutritionInfo: true,
      exportPdf: true,
      apiAccess: true
    }
  }
}

// Helper to get Stripe customer ID for a user
export async function getOrCreateStripeCustomerId(userId: string, email: string): Promise<string> {
  const { db } = await import('@/lib/db')
  
  const subscription = await db.subscription.findUnique({
    where: { userId }
  })
  
  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId
  }
  
  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId
    }
  })
  
  // Update subscription with customer ID
  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customer.id,
      plan: 'free',
      status: 'active'
    },
    update: {
      stripeCustomerId: customer.id
    }
  })
  
  return customer.id
}

// Helper to get price ID from plan and interval
export function getPriceId(plan: 'premium' | 'pro', interval: 'monthly' | 'yearly'): string {
  const key = `${plan}_${interval}` as keyof typeof STRIPE_PRICES
  return STRIPE_PRICES[key]
}
