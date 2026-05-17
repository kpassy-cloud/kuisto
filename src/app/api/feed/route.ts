import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Demo feed content (used when database is empty or not configured)
function getDemoFeed(category: string | null, language: string = 'fr') {
  const CATEGORY_IMAGES: Record<string, string> = {
    recipe: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    tip: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&auto=format&fit=crop&q=80',
    trending: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    news: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80',
  }

  const allItems = [
    {
      id: '1',
      title: language === 'fr' ? '5 astuces pour conserver vos tomates plus longtemps' : '5 tips to keep your tomatoes fresh longer',
      content: language === 'fr' 
        ? 'Découvrez les secrets des chefs pour garder vos tomates juteuses et savoureuses pendant des semaines. Stockez-les à température ambiante, tige vers le bas, et évitez le réfrigérateur.'
        : 'Discover chef secrets to keep your tomatoes juicy and flavorful for weeks. Store at room temperature, stem side down, and avoid the refrigerator.',
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
      id: '2',
      title: language === 'fr' ? 'La tendance "Bowl Food" prend d\'assaut les réseaux sociaux' : '"Bowl Food" trend taking over social media',
      content: language === 'fr'
        ? 'Les bols nutritifs et colorés sont devenus le plat préféré des millennials. Faciles à préparer et photogéniques, ils représentent l\'avenir de la cuisine décontractée.'
        : 'Nutritious and colorful bowls have become millennials\' favorite dish. Easy to prepare and photogenic, they represent the future of casual cooking.',
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
      id: '3',
      title: language === 'fr' ? 'Recette express: Salade méditerranéenne en 10 minutes' : 'Express recipe: Mediterranean salad in 10 minutes',
      content: language === 'fr'
        ? 'Une recette fraîche et légère parfaite pour les journées d\'été. Mélangez concombre, tomates, feta, olives et un filet d\'huile d\'olive.'
        : 'A fresh and light recipe perfect for summer days. Mix cucumber, tomatoes, feta, olives and a drizzle of olive oil.',
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
      id: '4',
      title: language === 'fr' ? 'L\'huile d\'olive: comment choisir la meilleure qualité?' : 'Olive oil: how to choose the best quality?',
      content: language === 'fr'
        ? 'Tous les secrets pour reconnaître une huile d\'olive extra vierge authentique. Recherchez "première pression à froid" et une date de récolte récente.'
        : 'All the secrets to recognize an authentic extra virgin olive oil. Look for "first cold press" and a recent harvest date.',
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
      id: '5',
      title: language === 'fr' ? 'Les fermentés: la nouvelle tendance santé' : 'Fermented foods: the new health trend',
      content: language === 'fr'
        ? 'Kombucha, kimchi, kéfir... Les aliments fermentés sont riches en probiotiques et excellent pour votre microbiome intestinal.'
        : 'Kombucha, kimchi, kefir... Fermented foods are rich in probiotics and excellent for your gut microbiome.',
      imageUrl: CATEGORY_IMAGES.trending,
      linkUrl: null,
      category: 'trending',
      active: true,
      featured: false,
      sticky: false,
      views: 18200,
      likes: 3450,
      publishAt: new Date(Date.now() - 18000000).toISOString()
    },
    {
      id: '6',
      title: language === 'fr' ? 'Pasta perfetta: les 5 règles d\'or' : 'Pasta perfetta: the 5 golden rules',
      content: language === 'fr'
        ? 'Eau abondante salée comme la mer, jamais d\'huile, remuer constamment... Maîtrisez l\'art des pâtes parfaites.'
        : 'Abundant water salted like the sea, never add oil, stir constantly... Master the art of perfect pasta.',
      imageUrl: CATEGORY_IMAGES.recipe,
      linkUrl: null,
      category: 'recipe',
      active: true,
      featured: false,
      sticky: false,
      views: 22100,
      likes: 4120,
      publishAt: new Date(Date.now() - 21600000).toISOString()
    },
    {
      id: '7',
      title: language === 'fr' ? 'Nouvelle étude: manger ensemble améliore la santé mentale' : 'New study: eating together improves mental health',
      content: language === 'fr'
        ? 'Une récente étude démontre que les repas partagés en famille ou entre amis réduisent le stress et renforcent les liens sociaux.'
        : 'A recent study shows that shared meals with family or friends reduce stress and strengthen social bonds.',
      imageUrl: CATEGORY_IMAGES.news,
      linkUrl: null,
      category: 'news',
      active: true,
      featured: false,
      sticky: false,
      views: 9870,
      likes: 2150,
      publishAt: new Date(Date.now() - 28800000).toISOString()
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
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Check if newsFeed model is available
    let dbFeed: unknown[] = []
    
    try {
      if (db.newsFeed) {
        const session = await getServerSession(authOptions)
        const country = searchParams.get('country')

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

        dbFeed = await db.newsFeed.findMany({
          where,
          orderBy: [
            { sticky: 'desc' },
            { featured: 'desc' },
            { publishAt: 'desc' }
          ],
          take: limit
        })

        // Filter by tier and country
        dbFeed = dbFeed.filter((item: Record<string, unknown>) => {
          try {
            // Check tier targeting
            if (item.targetTiers !== 'all') {
              const targetTiers = JSON.parse(item.targetTiers as string)
              if (!targetTiers.includes(userTier)) {
                return false
              }
            }
            
            // Check country targeting
            if (item.targetCountries && country) {
              const targetCountries = JSON.parse(item.targetCountries as string)
              if (targetCountries.length > 0 && !targetCountries.includes(country)) {
                return false
              }
            }
            
            return true
          } catch {
            return true
          }
        })
      }
    } catch (dbError) {
      console.log('Database not available, using demo feed')
    }

    // If database has content, return it; otherwise return demo feed
    if (dbFeed && dbFeed.length > 0) {
      return NextResponse.json({ feed: dbFeed })
    }

    // Return demo feed with French content (detect from accept-language header)
    const acceptLanguage = request.headers.get('accept-language') || ''
    const language = acceptLanguage.includes('fr') ? 'fr' : 'en'
    const demoFeed = getDemoFeed(category, language)
    
    return NextResponse.json({ feed: demoFeed })
  } catch (error) {
    console.error('Error fetching feed:', error)
    // Even on error, return demo feed
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const demoFeed = getDemoFeed(category, 'fr')
    return NextResponse.json({ feed: demoFeed })
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
