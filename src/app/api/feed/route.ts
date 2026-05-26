import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Demo feed data for when database is empty
const CATEGORY_IMAGES: Record<string, string> = {
  recipe: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
  tip: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&auto=format&fit=crop&q=80',
  trending: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  news: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80',
}

const getDemoFeed = (category: string | null, language: string = 'fr') => {
  const allItems = [
    {
      id: 'demo-1',
      title: language === 'fr' ? '5 astuces pour conserver vos tomates plus longtemps' : '5 tips to keep your tomatoes fresh longer',
      content: language === 'fr' 
        ? 'Découvrez les secrets des chefs pour garder vos tomates juteuses et savoureuses pendant des semaines. Stockez-les à température ambiante, loin du soleil direct, et ne les réfrigérez jamais avant qu\'elles ne soient parfaitement mûres!'
        : 'Discover chef secrets to keep your tomatoes juicy and flavorful for weeks. Store them at room temperature, away from direct sunlight, and never refrigerate them until they are perfectly ripe!',
      imageUrl: CATEGORY_IMAGES.tip,
      linkUrl: null,
      category: 'tip',
      active: true,
      featured: true,
      sticky: true,
      views: 15420,
      likes: 3250,
      publishAt: new Date().toISOString()
    },
    {
      id: 'demo-2',
      title: language === 'fr' ? 'La tendance "Bowl Food" prend d\'assaut les réseaux sociaux' : '"Bowl Food" trend taking over social media',
      content: language === 'fr'
        ? 'Les bols nutritifs et colorés sont devenus le plat préféré des millennials. Buddha bowls, poké bowls, açaí bowls... découvrez pourquoi cette tendance continue de gagner en popularité et comment créer le vôtre!'
        : 'Nutritious and colorful bowls have become millennials\' favorite dish. Buddha bowls, poke bowls, acai bowls... discover why this trend continues to gain popularity and how to create your own!',
      imageUrl: CATEGORY_IMAGES.trending,
      linkUrl: null,
      category: 'trending',
      active: true,
      featured: true,
      sticky: false,
      views: 28930,
      likes: 5670,
      publishAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'demo-3',
      title: language === 'fr' ? 'Recette express: Salade méditerranéenne en 10 minutes' : 'Express recipe: Mediterranean salad in 10 minutes',
      content: language === 'fr'
        ? 'Une recette fraîche et légère parfaite pour les journées d\'été. Tomates cerises, concombre, feta, olives et un filet d\'huile d\'olive... simple mais délicieux!'
        : 'A fresh and light recipe perfect for summer days. Cherry tomatoes, cucumber, feta, olives and a drizzle of olive oil... simple but delicious!',
      imageUrl: CATEGORY_IMAGES.recipe,
      linkUrl: null,
      category: 'recipe',
      active: true,
      featured: false,
      sticky: false,
      views: 8750,
      likes: 1920,
      publishAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'demo-4',
      title: language === 'fr' ? 'L\'huile d\'olive: comment choisir la meilleure qualité?' : 'Olive oil: how to choose the best quality?',
      content: language === 'fr'
        ? 'Tous les secrets pour reconnaître une huile d\'olive extra vierge authentique. Recherchez "première pression à froid", une acidité inférieure à 0.8%, et préférez les bouteilles foncées.'
        : 'All the secrets to recognize an authentic extra virgin olive oil. Look for "first cold press", acidity below 0.8%, and prefer dark bottles.',
      imageUrl: CATEGORY_IMAGES.tip,
      linkUrl: null,
      category: 'tip',
      active: true,
      featured: false,
      sticky: false,
      views: 12340,
      likes: 2890,
      publishAt: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: 'demo-5',
      title: language === 'fr' ? 'Les bienfaits de la cuisine maison sur votre santé' : 'The benefits of home cooking on your health',
      content: language === 'fr'
        ? 'Des études montrent que cuisiner à la maison réduit la consommation de sel, de sucre et de gras saturés. Prenez le contrôle de ce que vous mangez!'
        : 'Studies show that cooking at home reduces salt, sugar and saturated fat consumption. Take control of what you eat!',
      imageUrl: CATEGORY_IMAGES.news,
      linkUrl: 'https://www.healthline.com/nutrition/benefits-of-home-cooking',
      category: 'news',
      active: true,
      featured: false,
      sticky: false,
      views: 9870,
      likes: 2150,
      publishAt: new Date(Date.now() - 21600000).toISOString()
    },
    {
      id: 'demo-6',
      title: language === 'fr' ? 'Pasta alla Carbonara: la vraie recette italienne' : 'Pasta alla Carbonara: the real Italian recipe',
      content: language === 'fr'
        ? 'Pas de crème! La vraie carbonara se fait avec des œufs, du pecorino romano, de la guanciale et beaucoup de poivre noir. Découvrez les secrets de cette recette romaine authentique.'
        : 'No cream! The real carbonara is made with eggs, pecorino romano, guanciale and lots of black pepper. Discover the secrets of this authentic Roman recipe.',
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'recipe',
      active: true,
      featured: true,
      sticky: false,
      views: 45230,
      likes: 8920,
      publishAt: new Date(Date.now() - 28800000).toISOString()
    },
    {
      id: 'demo-7',
      title: language === 'fr' ? 'Les légumes de saison à cuisiner en ce moment' : 'Seasonal vegetables to cook right now',
      content: language === 'fr'
        ? 'Mangez de saison! Les légumes frais sont plus savoureux, nutritifs et écologiques. Découvrez notre sélection de recettes mettant en valeur les produits du moment.'
        : 'Eat seasonally! Fresh vegetables are tastier, more nutritious and ecological. Discover our selection of recipes featuring seasonal produce.',
      imageUrl: CATEGORY_IMAGES.trending,
      linkUrl: null,
      category: 'trending',
      active: true,
      featured: false,
      sticky: false,
      views: 18760,
      likes: 4230,
      publishAt: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 'demo-8',
      title: language === 'fr' ? 'Le guide complet des épices: conservation et utilisation' : 'Complete spice guide: storage and usage',
      content: language === 'fr'
        ? 'Les épices perdent leur saveur avec le temps. Apprenez à les conserver correctement et comment les utiliser pour sublimer vos plats.'
        : 'Spices lose their flavor over time. Learn how to store them properly and how to use them to enhance your dishes.',
      imageUrl: CATEGORY_IMAGES.tip,
      linkUrl: null,
      category: 'tip',
      active: true,
      featured: false,
      sticky: false,
      views: 6540,
      likes: 1890,
      publishAt: new Date(Date.now() - 57600000).toISOString()
    }
  ]

  if (category) {
    return allItems.filter(item => item.category === category)
  }
  return allItems
}

// GET - Get feed items for current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    // Try to get from database first
    try {
      const session = await getServerSession(authOptions)
      const country = searchParams.get('country')
      const limit = parseInt(searchParams.get('limit') || '10')

      // Determine user tier
      let userTier = 'free'
      if (session?.user?.email) {
        const user = await db.user.findUnique({
          where: { email: session.user.email },
          include: { subscription: true }
        })
        userTier = user?.subscription?.plan || 'free'
      }

      const now = new Date()
      
      const where: Record<string, unknown> = {
        active: true,
        publishAt: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } }
        ]
      }

      if (category) {
        where.category = category
      }

      const feed = await db.newsFeed.findMany({
        where,
        orderBy: [
          { sticky: 'desc' },
          { featured: 'desc' },
          { publishAt: 'desc' }
        ],
        take: limit
      })

      // Filter by tier and country
      const filteredFeed = feed.filter(item => {
        try {
          // Check tier targeting
          if (item.targetTiers !== 'all') {
            const targetTiers = JSON.parse(item.targetTiers)
            if (!targetTiers.includes(userTier)) {
              return false
            }
          }
          
          // Check country targeting
          if (item.targetCountries && country) {
            const targetCountries = JSON.parse(item.targetCountries)
            if (targetCountries.length > 0 && !targetCountries.includes(country)) {
              return false
            }
          }
          
          return true
        } catch {
          return true
        }
      })

      // If database has items, return them
      if (filteredFeed.length > 0) {
        return NextResponse.json({ feed: filteredFeed })
      }
      
      // Otherwise return demo feed
      const lang = session?.user?.email ? 'fr' : 'fr' // Could extract from user prefs
      return NextResponse.json({ feed: getDemoFeed(category, lang) })
      
    } catch (dbError) {
      console.log('Database not available, using demo feed')
      return NextResponse.json({ feed: getDemoFeed(category, 'fr') })
    }
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ feed: getDemoFeed(null, 'fr') })
  }
}

// POST - Record feed view or like
export async function POST(request: NextRequest) {
  try {
    // Check if newsFeed model is available
    if (!db.newsFeed) {
      return NextResponse.json({ success: true })
    }
    
    const { feedId, action } = await request.json()

    if (action === 'view') {
      await db.newsFeed.update({
        where: { id: feedId },
        data: { views: { increment: 1 } }
      })
    } else if (action === 'like') {
      await db.newsFeed.update({
        where: { id: feedId },
        data: { likes: { increment: 1 } }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating feed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
