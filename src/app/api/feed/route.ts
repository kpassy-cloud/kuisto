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
    // ========== ACTUALITÉS (News) avec liens cliquables ==========
    {
      id: 'news-1',
      title: language === 'fr' ? 'Michelin dévoile son guide 2024 : les nouvelles étoiles du Canada' : 'Michelin reveals its 2024 guide: Canada\'s new stars',
      content: language === 'fr'
        ? 'Le guide Michelin annonce les nouvelles étoiles pour les restaurants canadiens. Montréal et Toronto brillent avec plusieurs nouvelles distinctions. Découvrez les établissements qui font rayonner la gastronomie canadienne sur la scène internationale.'
        : 'The Michelin Guide announces new stars for Canadian restaurants. Montreal and Toronto shine with several new distinctions. Discover the establishments making Canadian gastronomy shine on the international stage.',
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80',
      linkUrl: 'https://guide.michelin.com/ca/en',
      category: 'news',
      active: true,
      featured: true,
      sticky: true,
      views: 45230,
      likes: 8920,
      publishAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'news-2',
      title: language === 'fr' ? 'Prixillage au Québec : la fermeture des restaurants emblématiques' : 'Quebec restaurant closures: iconic establishments closing',
      content: language === 'fr'
        ? 'Plusieurs restaurants historiques du Québec doivent fermer leurs portes en raison de la hausse des coûts et de la pénurie de main-d\'œuvre. Une réflexion sur l\'avenir de la restauration au Canada.'
        : 'Several historic Quebec restaurants are closing due to rising costs and labor shortages. A reflection on the future of dining in Canada.',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      linkUrl: 'https://www.lapresse.ca/arts/gastronomie',
      category: 'news',
      active: true,
      featured: false,
      sticky: false,
      views: 28450,
      likes: 5670,
      publishAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'news-3',
      title: language === 'fr' ? 'L\'impact des changements climatiques sur le vin canadien' : 'Climate change impact on Canadian wine',
      content: language === 'fr'
        ? 'Les vignobles canadiens s\'adaptent aux nouvelles conditions climatiques. De nouvelles variétés de raisin émergent dans les régions traditionnellement plus froides. Une révolution silencieuse dans le monde du vin.'
        : 'Canadian vineyards are adapting to new climate conditions. New grape varieties are emerging in traditionally colder regions. A silent revolution in the wine world.',
      imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop&q=80',
      linkUrl: 'https://www.winealign.com/articles/',
      category: 'news',
      active: true,
      featured: false,
      sticky: false,
      views: 18920,
      likes: 4230,
      publishAt: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: 'news-4',
      title: language === 'fr' ? 'Foodora quitte le Canada : impacts sur la livraison de repas' : 'Foodora exits Canada: impacts on meal delivery',
      content: language === 'fr'
        ? 'Le géant de la livraison Foodora a annoncé son retrait du marché canadien. Quelles conséquences pour les restaurateurs et les consommateurs ? Analyse d\'un marché en pleine mutation.'
        : 'Delivery giant Foodora announced its withdrawal from the Canadian market. What are the consequences for restaurateurs and consumers? Analysis of a changing market.',
      imageUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&auto=format&fit=crop&q=80',
      linkUrl: 'https://www.cbc.ca/news/business/foodora-canada-1.5798245',
      category: 'news',
      active: true,
      featured: true,
      sticky: false,
      views: 34560,
      likes: 7890,
      publishAt: new Date(Date.now() - 21600000).toISOString()
    },
    {
      id: 'news-5',
      title: language === 'fr' ? 'Le mouvement "Farm to Table" gagne du terrain au Canada' : '"Farm to Table" movement gains ground in Canada',
      content: language === 'fr'
        ? 'De plus en plus de restaurants canadiens adoptent l\'approche "du producteur à l\'assiette". Rencontre avec ces chefs qui réinventent la chaîne alimentaire locale.'
        : 'More and more Canadian restaurants are adopting the "farm to table" approach. Meet these chefs who are reinventing the local food chain.',
      imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&auto=format&fit=crop&q=80',
      linkUrl: 'https://www.foodnetwork.ca/farm-to-table/',
      category: 'news',
      active: true,
      featured: false,
      sticky: false,
      views: 21340,
      likes: 5670,
      publishAt: new Date(Date.now() - 28800000).toISOString()
    },

    // ========== ASTUCES (Tips) ==========
    {
      id: 'tip-1',
      title: language === 'fr' ? '5 astuces pour conserver vos tomates plus longtemps' : '5 tips to keep your tomatoes fresh longer',
      content: language === 'fr'
        ? 'Découvrez les secrets des chefs pour garder vos tomates juteuses et savoureuses pendant des semaines. Stockez-les à température ambiante, loin du soleil direct, et ne les réfrigérez jamais avant qu\'elles ne soient parfaitement mûres!'
        : 'Discover chef secrets to keep your tomatoes juicy and flavorful for weeks. Store them at room temperature, away from direct sunlight, and never refrigerate them until they are perfectly ripe!',
      imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0b0e?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'tip',
      active: true,
      featured: true,
      sticky: false,
      views: 15420,
      likes: 3250,
      publishAt: new Date().toISOString()
    },
    {
      id: 'tip-2',
      title: language === 'fr' ? 'L\'huile d\'olive: comment choisir la meilleure qualité?' : 'Olive oil: how to choose the best quality?',
      content: language === 'fr'
        ? 'Tous les secrets pour reconnaître une huile d\'olive extra vierge authentique. Recherchez "première pression à froid", une acidité inférieure à 0.8%, et préférez les bouteilles foncées.'
        : 'All the secrets to recognize an authentic extra virgin olive oil. Look for "first cold press", acidity below 0.8%, and prefer dark bottles.',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'tip',
      active: true,
      featured: false,
      sticky: false,
      views: 12340,
      likes: 2890,
      publishAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'tip-3',
      title: language === 'fr' ? 'Le guide complet des épices: conservation et utilisation' : 'Complete spice guide: storage and usage',
      content: language === 'fr'
        ? 'Les épices perdent leur saveur avec le temps. Apprenez à les conserver correctement et comment les utiliser pour sublimer vos plats. Stockez-les à l\'abri de la lumière et de l\'humidité.'
        : 'Spices lose their flavor over time. Learn how to store them properly and how to use them to enhance your dishes. Store them away from light and moisture.',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'tip',
      active: true,
      featured: false,
      sticky: false,
      views: 6540,
      likes: 1890,
      publishAt: new Date(Date.now() - 57600000).toISOString()
    },
    {
      id: 'tip-4',
      title: language === 'fr' ? 'Comment cuisiner les légumes sans perdre leurs vitamines' : 'How to cook vegetables without losing vitamins',
      content: language === 'fr'
        ? 'La vapeur, le wok et la cuisson rapide sont vos alliés. Découvrez les meilleures méthodes pour préserver la valeur nutritionnelle de vos légumes favoris.'
        : 'Steaming, wok cooking and quick cooking are your allies. Discover the best methods to preserve the nutritional value of your favorite vegetables.',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'tip',
      active: true,
      featured: false,
      sticky: false,
      views: 9870,
      likes: 2340,
      publishAt: new Date(Date.now() - 72000000).toISOString()
    },

    // ========== RECETTES (Recipes) ==========
    {
      id: 'recipe-1',
      title: language === 'fr' ? 'Recette express: Salade méditerranéenne en 10 minutes' : 'Express recipe: Mediterranean salad in 10 minutes',
      content: language === 'fr'
        ? 'Une recette fraîche et légère parfaite pour les journées d\'été. Tomates cerises, concombre, feta, olives et un filet d\'huile d\'olive... simple mais délicieux!'
        : 'A fresh and light recipe perfect for summer days. Cherry tomatoes, cucumber, feta, olives and a drizzle of olive oil... simple but delicious!',
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'recipe',
      active: true,
      featured: true,
      sticky: false,
      views: 8750,
      likes: 1920,
      publishAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'recipe-2',
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
      id: 'recipe-3',
      title: language === 'fr' ? 'Bowl poke saumon avocat maison' : 'Homemade salmon avocado poke bowl',
      content: language === 'fr'
        ? 'Le poke bowl tendance et healthy à préparer chez soi. Riz vinaigré, saumon frais, avocat, edamame et sauce soja-sésame. Un voyage à Hawaï dans votre assiette!'
        : 'The trendy and healthy poke bowl to make at home. Seasoned rice, fresh salmon, avocado, edamame and soy-sesame sauce. A trip to Hawaii on your plate!',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'recipe',
      active: true,
      featured: false,
      sticky: false,
      views: 23450,
      likes: 5670,
      publishAt: new Date(Date.now() - 43200000).toISOString()
    },

    // ========== TENDANCES (Trending) ==========
    {
      id: 'trend-1',
      title: language === 'fr' ? 'La tendance "Bowl Food" prend d\'assaut les réseaux sociaux' : '"Bowl Food" trend taking over social media',
      content: language === 'fr'
        ? 'Les bols nutritifs et colorés sont devenus le plat préféré des millennials. Buddha bowls, poké bowls, açaí bowls... découvrez pourquoi cette tendance continue de gagner en popularité!'
        : 'Nutritious and colorful bowls have become millennials\' favorite dish. Buddha bowls, poke bowls, acai bowls... discover why this trend continues to gain popularity!',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'trending',
      active: true,
      featured: true,
      sticky: false,
      views: 28930,
      likes: 5670,
      publishAt: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 'trend-2',
      title: language === 'fr' ? 'Les légumes de saison à cuisiner en ce moment' : 'Seasonal vegetables to cook right now',
      content: language === 'fr'
        ? 'Mangez de saison! Les légumes frais sont plus savoureux, nutritifs et écologiques. Découvrez notre sélection de recettes mettant en valeur les produits du moment.'
        : 'Eat seasonally! Fresh vegetables are tastier, more nutritious and ecological. Discover our selection of recipes featuring seasonal produce.',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'trending',
      active: true,
      featured: false,
      sticky: false,
      views: 18760,
      likes: 4230,
      publishAt: new Date(Date.now() - 54000000).toISOString()
    },
    {
      id: 'trend-3',
      title: language === 'fr' ? 'Fermentation : l\'art de préserver les aliments revient à la mode' : 'Fermentation: the art of food preservation is back in style',
      content: language === 'fr'
        ? 'Kombucha, kimchi, kéfir... La fermentation fait un retour en force. Découvrez les bienfaits pour votre microbiote et comment fermenter chez vous.'
        : 'Kombucha, kimchi, kefir... Fermentation is making a strong comeback. Discover the benefits for your microbiome and how to ferment at home.',
      imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'trending',
      active: true,
      featured: false,
      sticky: false,
      views: 21540,
      likes: 4890,
      publishAt: new Date(Date.now() - 68000000).toISOString()
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
