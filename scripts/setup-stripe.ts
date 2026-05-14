/**
 * Script pour créer les produits et prix Stripe pour Kuisto
 * 
 * Utilisation:
 * 1. Assurez-vous d'avoir STRIPE_SECRET_KEY dans votre .env
 * 2. Exécutez: bun run scripts/setup-stripe.ts
 * 
 * Ce script va créer:
 * - Produit "Kuisto Premium" avec prix mensuel et annuel
 * - Produit "Kuisto Pro" avec prix mensuel et annuel
 */

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
})

async function main() {
  console.log('🚀 Configuration des produits Stripe pour Kuisto...\n')

  // Créer le produit Premium
  console.log('📦 Création du produit Premium...')
  const premiumProduct = await stripe.products.create({
    name: 'Kuisto Premium',
    description: 'Accès premium à Kuisto - 25 recettes par jour, sans publicités, filtres avancés',
    metadata: {
      plan: 'premium',
      features: '25_recipes_per_day,ad_free,advanced_filters,pdf_export,priority_support'
    }
  })
  console.log(`✅ Produit Premium créé: ${premiumProduct.id}\n`)

  // Créer les prix Premium
  console.log('💰 Création des prix Premium...')
  const premiumMonthly = await stripe.prices.create({
    product: premiumProduct.id,
    unit_amount: 699, // $6.99 CAD en cents
    currency: 'cad',
    recurring: { interval: 'month' },
    nickname: 'Premium Mensuel',
    metadata: { plan: 'premium', interval: 'monthly' }
  })
  console.log(`✅ Prix Premium Mensuel créé: ${premiumMonthly.id}`)

  const premiumYearly = await stripe.prices.create({
    product: premiumProduct.id,
    unit_amount: 6999, // $69.99 CAD en cents (environ 20% de réduction)
    currency: 'cad',
    recurring: { interval: 'year' },
    nickname: 'Premium Annuel',
    metadata: { plan: 'premium', interval: 'yearly' }
  })
  console.log(`✅ Prix Premium Annuel créé: ${premiumYearly.id}\n`)

  // Créer le produit Pro
  console.log('📦 Création du produit Pro...')
  const proProduct = await stripe.products.create({
    name: 'Kuisto Pro',
    description: 'Accès Pro à Kuisto - Recettes illimitées, API access, support VIP',
    metadata: {
      plan: 'pro',
      features: 'unlimited_recipes,ad_free,advanced_filters,pdf_export,api_access,vip_support'
    }
  })
  console.log(`✅ Produit Pro créé: ${proProduct.id}\n`)

  // Créer les prix Pro
  console.log('💰 Création des prix Pro...')
  const proMonthly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 1499, // $14.99 CAD en cents
    currency: 'cad',
    recurring: { interval: 'month' },
    nickname: 'Pro Mensuel',
    metadata: { plan: 'pro', interval: 'monthly' }
  })
  console.log(`✅ Prix Pro Mensuel créé: ${proMonthly.id}`)

  const proYearly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 14999, // $149.99 CAD en cents (environ 17% de réduction)
    currency: 'cad',
    recurring: { interval: 'year' },
    nickname: 'Pro Annuel',
    metadata: { plan: 'pro', interval: 'yearly' }
  })
  console.log(`✅ Prix Pro Annuel créé: ${proYearly.id}\n`)

  // Afficher le résumé
  console.log('═'.repeat(60))
  console.log('📝 RÉSUMÉ - Ajoutez ces valeurs à votre fichier .env:\n')
  console.log(`STRIPE_PRICE_PREMIUM_MONTHLY=${premiumMonthly.id}`)
  console.log(`STRIPE_PRICE_PREMIUM_YEARLY=${premiumYearly.id}`)
  console.log(`STRIPE_PRICE_PRO_MONTHLY=${proMonthly.id}`)
  console.log(`STRIPE_PRICE_PRO_YEARLY=${proYearly.id}`)
  console.log('═'.repeat(60))
  console.log('\n✨ Configuration terminée avec succès!')
}

main().catch((error) => {
  console.error('❌ Erreur:', error)
  process.exit(1)
})
