import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// Sample Canadian food/cooking related partner ads
const SAMPLE_ADS = [
  {
    title: 'Metro - Livraison d\'épicerie',
    description: {
      fr: 'Votre épicerie de quartier, livrée chez vous. Faites vos courses en ligne et profitez de la livraison le jour même.',
      en: 'Your neighbourhood grocery, delivered to your door. Shop online and enjoy same-day delivery.'
    },
    imageUrl: null,
    linkUrl: 'https://www.metro.ca',
    buttonText: { fr: 'Commander', en: 'Order now' },
    type: 'banner',
    priority: 10,
    color: '#E31E24'
  },
  {
    title: 'Cook it - Kits repas',
    description: {
      fr: 'Des repas sains et savoureux prêts en 15 minutes. Tout est pré-préparé, il ne reste plus qu\'à cuisiner!',
      en: 'Healthy and delicious meals ready in 15 minutes. Everything is prepped, just cook and enjoy!'
    },
    imageUrl: null,
    linkUrl: 'https://www.cookit.ca',
    buttonText: { fr: 'Découvrir', en: 'Discover' },
    type: 'banner',
    priority: 9,
    color: '#FF6B35'
  },
  {
    title: 'HelloFresh Canada',
    description: {
      fr: 'Recevez des recettes personnalisées avec tous les ingrédients frais directement chez vous.',
      en: 'Get personalized recipes with all fresh ingredients delivered straight to your door.'
    },
    imageUrl: null,
    linkUrl: 'https://www.hellofresh.ca',
    buttonText: { fr: 'Essayer', en: 'Try now' },
    type: 'banner',
    priority: 8,
    color: '#99CC33'
  },
  {
    title: 'Loblaws - PC Express',
    description: {
      fr: 'Cliquez et ramassez ou faites-vous livrer. Simplifiez-vous la vie avec PC Express.',
      en: 'Click and collect or get it delivered. Make your life easier with PC Express.'
    },
    imageUrl: null,
    linkUrl: 'https://www.loblaws.ca',
    buttonText: { fr: 'Magasiner', en: 'Shop now' },
    type: 'inline',
    priority: 7,
    color: '#006649'
  },
  {
    title: 'Instacart Canada',
    description: {
      fr: 'Vos épiceries favorites livrées en aussi peu qu\'une heure. Metro, IGA, Walmart et plus!',
      en: 'Your favorite groceries delivered in as little as one hour. Metro, IGA, Walmart and more!'
    },
    imageUrl: null,
    linkUrl: 'https://www.instacart.ca',
    buttonText: { fr: 'Livrer', en: 'Get delivery' },
    type: 'sidebar',
    priority: 6,
    color: '#43B02A'
  },
  {
    title: 'IGA - Course en ligne',
    description: {
      fr: 'Des produits frais de qualité, des spécialités locales. Faites vos courses en ligne IGA.',
      en: 'Quality fresh products, local specialties. Shop IGA online today.'
    },
    imageUrl: null,
    linkUrl: 'https://www.iga.net',
    buttonText: { fr: 'Visiter', en: 'Visit' },
    type: 'sidebar',
    priority: 5,
    color: '#E31837'
  },
  {
    title: 'Goodfood - Prêt à cuisiner',
    description: {
      fr: 'Des kits repas frais livrés chaque semaine. Plus de 30 recettes à choisir.',
      en: 'Fresh meal kits delivered weekly. Over 30 recipes to choose from.'
    },
    imageUrl: null,
    linkUrl: 'https://www.makegoodfood.ca',
    buttonText: { fr: 'S\'abonner', en: 'Subscribe' },
    type: 'popup',
    priority: 8,
    color: '#F26522'
  },
  {
    title: 'SkipTheDishes - Restaurants',
    description: {
      fr: 'Envie de commander? Livraison de restaurants près de chez vous.',
      en: 'Craving something? Restaurant delivery near you.'
    },
    imageUrl: null,
    linkUrl: 'https://www.skipthedishes.com',
    buttonText: { fr: 'Commander', en: 'Order' },
    type: 'inline',
    priority: 4,
    color: '#EC008C'
  }
]

// POST - Seed sample ads (admin only or first-time setup)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin or if this is initial setup
    let isAdmin = false
    if (session?.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      })
      isAdmin = user?.role === 'admin'
    }

    // Check if ads already exist
    const existingAds = await db.ad.count()
    
    // If ads exist and user is not admin, deny access
    if (existingAds > 0 && !isAdmin) {
      return NextResponse.json({ 
        error: 'Ads already seeded. Admin access required to re-seed.',
        existingCount: existingAds 
      }, { status: 403, headers: corsHeaders })
    }

    // If admin and ads exist, clear them first
    if (existingAds > 0 && isAdmin) {
      await db.adImpression.deleteMany()
      await db.ad.deleteMany()
    }

    // Get language from request body
    const body = await request.json().catch(() => ({}))
    const lang = body.language || 'fr'

    // Seed new ads
    const createdAds = []
    for (const ad of SAMPLE_ADS) {
      const created = await db.ad.create({
        data: {
          title: ad.title,
          description: typeof ad.description === 'object' ? ad.description[lang as 'fr' | 'en'] || ad.description.fr : ad.description,
          imageUrl: ad.imageUrl,
          linkUrl: ad.linkUrl,
          buttonText: typeof ad.buttonText === 'object' ? ad.buttonText[lang as 'fr' | 'en'] || ad.buttonText.fr : ad.buttonText,
          type: ad.type,
          priority: ad.priority,
          targetTiers: '["free"]',
          targetCountries: '["CA"]',
          active: true
        }
      })
      createdAds.push(created)
    }

    // Log if admin
    if (session?.user?.email) {
      const adminUser = await db.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      
      if (adminUser) {
        await db.adminLog.create({
          data: {
            adminId: adminUser.id,
            action: 'ads_seeded',
            targetType: 'ad',
            details: JSON.stringify({ count: createdAds.length })
          }
        })
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Seeded ${createdAds.length} sample ads`,
      ads: createdAds
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error seeding ads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

// GET - Check if ads are seeded
export async function GET() {
  try {
    const count = await db.ad.count()
    return NextResponse.json({ 
      seeded: count > 0,
      count 
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error checking ads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}
