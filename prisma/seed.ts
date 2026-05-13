import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORY_IMAGES: Record<string, string> = {
  recipe: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
  tip: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&auto=format&fit=crop&q=80',
  trending: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  news: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80',
}

async function main() {
  console.log('Seeding database...')

  // Create News Feed items
  const feedItems = [
    // Tips (Astuces)
    {
      id: 'tip-1',
      title: '5 astuces pour conserver vos tomates plus longtemps',
      content: 'Découvrez les secrets des chefs pour garder vos tomates juteuses et savoureuses pendant des semaines. Tip 1: Ne jamais les mettre au réfrigérateur ! Tip 2: Stockez-les tige vers le bas. Tip 3: Évitez de les laver avant stockage.',
      imageUrl: CATEGORY_IMAGES.tip,
      linkUrl: null,
      category: 'tip',
      active: true,
      featured: true,
      sticky: true,
      views: 15420,
      likes: 3250,
      publishAt: new Date(),
      targetTiers: 'all',
    },
    {
      id: 'tip-2',
      title: 'L\'huile d\'olive: comment choisir la meilleure qualité?',
      content: 'Tous les secrets pour reconnaître une huile d\'olive extra vierge authentique. Recherchez la date de récolte, vérifiez l\'origine et apprenez à déguster comme un professionnel.',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'tip',
      active: true,
      featured: false,
      sticky: false,
      views: 12340,
      likes: 2890,
      publishAt: new Date(Date.now() - 14400000),
      targetTiers: 'all',
    },
    {
      id: 'tip-3',
      title: 'Comment réussir ses œufs brouillés à la française',
      content: 'La technique secrète des chefs français pour des œufs brouillés onctueux et crémeux. La clé: une cuisson lente à feu doux et beaucoup de beurre.',
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'tip',
      active: true,
      featured: false,
      sticky: false,
      views: 8920,
      likes: 1870,
      publishAt: new Date(Date.now() - 28800000),
      targetTiers: 'all',
    },
    {
      id: 'tip-4',
      title: 'Les épices essentielles pour débuter en cuisine',
      content: 'Cumin, paprika, curcuma, cannelle... Découvrez les 10 épices indispensables pour sublimer vos plats et comment les utiliser correctement.',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'tip',
      active: true,
      featured: false,
      sticky: false,
      views: 7650,
      likes: 1420,
      publishAt: new Date(Date.now() - 43200000),
      targetTiers: 'all',
    },

    // Trending (Tendances)
    {
      id: 'trending-1',
      title: 'La tendance "Bowl Food" prend d\'assaut les réseaux sociaux',
      content: 'Les bols nutritifs et colorés sont devenus le plat préféré des millennials. Buddha bowls, poke bowls, açaí bowls... Explorez cette tendance healthy et Instagram-worthy.',
      imageUrl: CATEGORY_IMAGES.trending,
      linkUrl: null,
      category: 'trending',
      active: true,
      featured: true,
      sticky: false,
      views: 28930,
      likes: 5670,
      publishAt: new Date(Date.now() - 3600000),
      targetTiers: 'all',
    },
    {
      id: 'trending-2',
      title: 'Fermentation maison: le retour aux sources',
      content: 'Kombucha, kimchi, kéfir... La fermentation fait un comeback spectaculaire. Apprenez à créer vos propres probiotiques naturels chez vous.',
      imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'trending',
      active: true,
      featured: false,
      sticky: false,
      views: 18450,
      likes: 3210,
      publishAt: new Date(Date.now() - 7200000),
      targetTiers: 'all',
    },
    {
      id: 'trending-3',
      title: 'La cuisine zéro déchet gagne du terrain au Canada',
      content: 'De plus en plus de Canadiens adoptent une approche éco-responsable en cuisine. Découvrez comment réduire votre gaspillage alimentaire de 50%.',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'trending',
      active: true,
      featured: false,
      sticky: false,
      views: 12380,
      likes: 2450,
      publishAt: new Date(Date.now() - 18000000),
      targetTiers: 'all',
      targetCountries: '["CA"]',
    },

    // Recipes (Recettes)
    {
      id: 'recipe-1',
      title: 'Recette express: Salade méditerranéenne en 10 minutes',
      content: 'Une recette fraîche et légère parfaite pour les journées d\'été. Tomates cerises, concombre, feta, olives et une vinaigrette au citron.',
      imageUrl: CATEGORY_IMAGES.recipe,
      linkUrl: null,
      category: 'recipe',
      active: true,
      featured: false,
      sticky: false,
      views: 8750,
      likes: 1920,
      publishAt: new Date(Date.now() - 7200000),
      targetTiers: 'all',
    },
    {
      id: 'recipe-2',
      title: 'Pasta carbonara: la vraie recette romaine',
      content: 'Oubliez la crème fraîche ! Découvrez la recette authentique de la carbonara italienne avec guanciale, pecorino et œufs frais.',
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'recipe',
      active: true,
      featured: true,
      sticky: false,
      views: 22340,
      likes: 4560,
      publishAt: new Date(Date.now() - 10800000),
      targetTiers: 'all',
    },
    {
      id: 'recipe-3',
      title: 'Smoothie bowl énergisant au chocolat et banane',
      content: 'Commencez votre journée avec ce bowl crémeux au cacao, banane gelée et garnitures croquantes. Un petit-déjeuner healthy et gourmand !',
      imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'recipe',
      active: true,
      featured: false,
      sticky: false,
      views: 9870,
      likes: 2100,
      publishAt: new Date(Date.now() - 21600000),
      targetTiers: 'all',
    },

    // News (Actualités)
    {
      id: 'news-1',
      title: 'Rencontre avec Chef Marie: "La cuisine, c\'est de l\'amour"',
      content: 'Interview exclusive avec la cheffe étoilée qui révolutionne la cuisine française. Elle partage sa philosophie et ses conseils pour les cuisiniers amateurs.',
      imageUrl: CATEGORY_IMAGES.news,
      linkUrl: null,
      category: 'news',
      active: true,
      featured: false,
      sticky: false,
      views: 9870,
      likes: 2150,
      publishAt: new Date(Date.now() - 21600000),
      targetTiers: 'all',
    },
    {
      id: 'news-2',
      title: 'Ottawa accueille son premier festival du terroir canadien',
      content: 'Du 15 au 17 août, plus de 50 producteurs locaux se réunissent au parc Lansdowne pour célébrer les saveurs du Canada.',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'news',
      active: true,
      featured: false,
      sticky: false,
      views: 6540,
      likes: 1230,
      publishAt: new Date(Date.now() - 43200000),
      targetTiers: 'all',
      targetCountries: '["CA"]',
    },
    {
      id: 'news-3',
      title: 'Nouvelle étude: les bienfaits de la cuisine maison',
      content: 'Une recherche de l\'Université de Toronto révèle que cuisiner chez soi améliore la santé mentale et réduit le risque de maladies cardiovasculaires de 35%.',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&auto=format&fit=crop&q=80',
      linkUrl: null,
      category: 'news',
      active: true,
      featured: false,
      sticky: false,
      views: 11230,
      likes: 2890,
      publishAt: new Date(Date.now() - 86400000),
      targetTiers: 'all',
    },
  ]

  for (const item of feedItems) {
    await prisma.newsFeed.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }

  console.log(`Created ${feedItems.length} feed items`)

  // Create some ads for Canadian users
  const ads = [
    {
      id: 'ad-metro',
      title: 'Metro Ontario',
      description: 'Vos courses livrées en 2 heures ! Profitez de 15% de réduction sur votre première commande.',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
      linkUrl: 'https://www.metro.ca',
      buttonText: 'Commander',
      type: 'banner',
      targetTiers: '["free"]',
      targetCountries: '["CA"]',
      targetRegions: '["Ontario"]',
      active: true,
      priority: 10,
    },
    {
      id: 'ad-canadiantire',
      title: 'Canadian Tire',
      description: 'Tout pour votre cuisine ! Ustensiles, robots et accessoires à prix imbattables.',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80',
      linkUrl: 'https://www.canadiantire.ca',
      buttonText: 'Découvrir',
      type: 'sidebar',
      targetTiers: '["free", "premium"]',
      targetCountries: '["CA"]',
      active: true,
      priority: 8,
    },
    {
      id: 'ad-loblaws',
      title: 'Loblaws',
      description: 'PC Optimum: Gagnez des points à chaque achat. 20x les points ce weekend !',
      imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=80',
      linkUrl: 'https://www.loblaws.ca',
      buttonText: 'En savoir plus',
      type: 'inline',
      targetTiers: '["free"]',
      targetCountries: '["CA"]',
      active: true,
      priority: 7,
    },
    {
      id: 'ad-instacart',
      title: 'Instacart Canada',
      description: 'Livraison d\'épiceries en 1 heure. Essayez gratuitement !',
      imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&auto=format&fit=crop&q=80',
      linkUrl: 'https://www.instacart.ca',
      buttonText: 'Commencer',
      type: 'popup',
      targetTiers: '["free"]',
      targetCountries: '["CA"]',
      active: true,
      priority: 9,
    },
  ]

  for (const ad of ads) {
    await prisma.ad.upsert({
      where: { id: ad.id },
      update: ad,
      create: ad,
    })
  }

  console.log(`Created ${ads.length} ads`)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
