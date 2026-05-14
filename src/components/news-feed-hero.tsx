'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Clock, Heart, Eye, TrendingUp, Flame, Sparkles, 
  ChefHat, Utensils, Globe, Share2, Play,
  ChevronRight, ArrowRight, BookOpen, X, Calendar, ExternalLink,
  AlertCircle, ArrowRightCircle
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { toast } from '@/hooks/use-toast'

interface NewsItem {
  id: string
  title: string
  content: string
  imageUrl: string | null
  linkUrl: string | null
  category: string
  active: boolean
  featured: boolean
  sticky: boolean
  views: number
  likes: number
  publishAt: string
}

interface NewsFeedHeroProps {
  onSignUpClick: () => void
  isAuthenticated: boolean
  onGoToCooking: () => void
}

// High-quality food images from Unsplash
const CATEGORY_IMAGES: Record<string, string> = {
  recipe: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
  tip: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&auto=format&fit=crop&q=80',
  trending: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  news: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80',
  hero: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1400&auto=format&fit=crop&q=80',
}

const categoryLabels: Record<string, { fr: string; en: string }> = {
  tip: { fr: 'Astuce', en: 'Tip' },
  news: { fr: 'Actualité', en: 'News' },
  recipe: { fr: 'Recette', en: 'Recipe' },
  trending: { fr: 'Tendance', en: 'Trending' },
  promotion: { fr: 'Promotion', en: 'Promotion' }
}

export function NewsFeedHero({ onSignUpClick, isAuthenticated, onGoToCooking }: NewsFeedHeroProps) {
  const { language } = useI18n()
  const [feed, setFeed] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [visibleItems, setVisibleItems] = useState(5)
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null)

  const categories = [
    { id: null, label: language === 'fr' ? 'Tous' : 'All', icon: Sparkles },
    { id: 'tip', label: language === 'fr' ? 'Astuces' : 'Tips', icon: ChefHat },
    { id: 'news', label: language === 'fr' ? 'Actualités' : 'News', icon: Globe },
    { id: 'recipe', label: language === 'fr' ? 'Recettes' : 'Recipes', icon: Utensils },
    { id: 'trending', label: language === 'fr' ? 'Tendances' : 'Trending', icon: TrendingUp },
  ]

  useEffect(() => {
    fetchFeed()
  }, [selectedCategory])

  const fetchFeed = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', '20')
      if (selectedCategory) params.set('category', selectedCategory)
      
      const res = await fetch(`/api/feed?${params}`)
      const data = await res.json()
      setFeed(data.feed || [])
    } catch (err) {
      console.error('Failed to fetch feed:', err)
      setFeed(getDemoFeed())
    } finally {
      setLoading(false)
    }
  }

  const getDemoFeed = (): NewsItem[] => [
    {
      id: '1',
      title: language === 'fr' ? '5 astuces pour conserver vos tomates plus longtemps' : '5 tips to keep your tomatoes fresh longer',
      content: language === 'fr' 
        ? 'Découvrez les secrets des chefs pour garder vos tomates juteuses et savoureuses pendant des semaines...'
        : 'Discover chef secrets to keep your tomatoes juicy and flavorful for weeks...',
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
        ? 'Les bols nutritifs et colorés sont devenus le plat préféré des millennials...'
        : 'Nutritious and colorful bowls have become millennials\' favorite dish...',
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
        ? 'Une recette fraîche et légère parfaite pour les journées d\'été...'
        : 'A fresh and light recipe perfect for summer days...',
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
        ? 'Tous les secrets pour reconnaître une huile d\'olive extra vierge authentique...'
        : 'All the secrets to recognize an authentic extra virgin olive oil...',
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
      title: language === 'fr' ? 'Rencontre avec Chef Marie: "La cuisine, c\'est de l\'amour"' : 'Meet Chef Marie: "Cooking is love"',
      content: language === 'fr'
        ? 'Interview exclusive avec la cheffe étoilée qui révolutionne la cuisine française...'
        : 'Exclusive interview with the starred chef revolutionizing French cuisine...',
      imageUrl: CATEGORY_IMAGES.news,
      linkUrl: 'https://example.com/chef-marie-interview',
      category: 'news',
      active: true,
      featured: false,
      sticky: false,
      views: 9870,
      likes: 2150,
      publishAt: new Date(Date.now() - 21600000).toISOString()
    }
  ]

  const handleLike = async (itemId: string) => {
    if (!isAuthenticated) {
      onSignUpClick()
      return
    }
    
    try {
      await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId: itemId, action: 'like' })
      })
      
      setFeed(prev => prev.map(item => 
        item.id === itemId ? { ...item, likes: item.likes + 1 } : item
      ))
      
      setSelectedItem(prev => 
        prev && prev.id === itemId ? { ...prev, likes: prev.likes + 1 } : prev
      )
    } catch (err) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'ajouter le like' : 'Could not add like',
        variant: 'destructive'
      })
    }
  }

  const handleItemClick = async (item: NewsItem) => {
    // Record view
    try {
      await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId: item.id, action: 'view' })
      })
      
      setFeed(prev => prev.map(i => 
        i.id === item.id ? { ...i, views: i.views + 1 } : i
      ))
    } catch (err) {
      // Ignore view errors
    }
    
    // Always open modal for all categories
    setSelectedItem(item)
  }

  const handleGoToCooking = () => {
    setSelectedItem(null)
    onGoToCooking()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      tip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      news: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      recipe: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      trending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      promotion: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    }
    return styles[category] || 'bg-gray-100 text-gray-700'
  }

  const getCategoryLabel = (category: string) => {
    return categoryLabels[category]?.[language as 'fr' | 'en'] || category
  }

  const isCookingCategory = (category: string) => {
    return ['tip', 'recipe', 'trending'].includes(category)
  }

  const loadMore = () => {
    setVisibleItems(prev => prev + 5)
  }

  return (
    <>
      <div className="space-y-8">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={CATEGORY_IMAGES.hero}
              alt="Fresh ingredients"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:py-24 md:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl"
            >
              <Badge className="mb-4 bg-primary/90 text-primary-foreground border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                {language === 'fr' ? 'Nouveau' : 'New'}
              </Badge>
              
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {language === 'fr' 
                  ? 'L\'univers culinaire à portée de main' 
                  : 'The culinary world at your fingertips'}
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
                {language === 'fr' 
                  ? 'Découvrez les dernières tendances, astuces de chefs et recettes créatives pour inspirer votre cuisine.'
                  : 'Discover the latest trends, chef tips and creative recipes to inspire your cooking.'}
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg" 
                  onClick={() => onSignUpClick()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  {language === 'fr' ? 'Commencer gratuitement' : 'Get started free'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  {language === 'fr' ? 'Explorer' : 'Explore'}
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = selectedCategory === cat.id
            return (
              <motion.button
                key={cat.id ?? 'all'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </motion.button>
            )
          })}
        </div>

        {/* Feed Grid - Masonry Style */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              // Loading skeletons
              [...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 shimmer" />
                  <CardContent className="p-5">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              feed.slice(0, visibleItems).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleItemClick(item)}
                  className={item.featured ? 'md:col-span-2 lg:col-span-2' : ''}
                >
                  <Card className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md ${
                    item.featured ? 'ring-2 ring-primary/30' : ''
                  }`}>
                    {/* Image Section */}
                    <div className="relative h-48 md:h-56 overflow-hidden">
                      <img 
                        src={item.imageUrl || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.hero}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getCategoryBadge(item.category)} border-0`}>
                          {getCategoryLabel(item.category)}
                        </Badge>
                      </div>
                      
                      {/* Featured Badge */}
                      {item.featured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-primary text-primary-foreground border-0">
                            <Flame className="w-3 h-3 mr-1" />
                            {language === 'fr' ? 'À la une' : 'Featured'}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Play button overlay for video content */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-2xl"
                        >
                          <Play className="w-5 h-5 text-primary ml-1" />
                        </motion.div>
                      </div>
                      
                      {/* Title overlay on image bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-serif text-lg md:text-xl font-semibold text-white line-clamp-2 drop-shadow-lg">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    
                    <CardContent className="p-5">
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {item.content}
                      </p>
                      
                      {/* Stats and Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {formatNumber(item.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {formatNumber(item.likes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {Math.floor((Date.now() - new Date(item.publishAt).getTime()) / 3600000)}h
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(item.id)
                            }}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-muted-foreground hover:text-blue-500 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {feed.length > visibleItems && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={loadMore}
              className="gap-2"
            >
              {language === 'fr' ? 'Voir plus d\'articles' : 'Load more articles'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Sign Up CTA (shown for non-authenticated users after scrolling) */}
        {!isAuthenticated && visibleItems >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-card/95 backdrop-blur-lg border shadow-2xl rounded-2xl p-6 z-40"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <ChefHat className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-semibold text-foreground mb-1">
                  {language === 'fr' ? 'Continuez à explorer!' : 'Keep exploring!'}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {language === 'fr' 
                    ? 'Inscrivez-vous gratuitement pour découvrir plus de contenus et créer vos propres recettes.'
                    : 'Sign up for free to discover more content and create your own recipes.'}
                </p>
                <Button onClick={onSignUpClick} className="w-full bg-primary hover:bg-primary/90">
                  {language === 'fr' ? 'S\'inscrire gratuitement' : 'Sign up free'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] bg-card rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.imageUrl && (
                <img 
                  src={selectedItem.imageUrl} 
                  alt={selectedItem.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryBadge(selectedItem.category)}>
                      {getCategoryLabel(selectedItem.category)}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(selectedItem.publishAt)}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedItem(null)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <h2 className="font-serif text-xl font-bold mb-4">{selectedItem.title}</h2>
                
                <ScrollArea className="max-h-[30vh]">
                  <div className="prose prose-sm dark:prose-invert">
                    {/* For news: show summary only (respect copyright) */}
                    {selectedItem.category === 'news' ? (
                      <div className="space-y-4">
                        <p className="text-muted-foreground whitespace-pre-wrap">{selectedItem.content}</p>
                        
                        {/* Copyright notice for news */}
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium mb-1">
                                {language === 'fr' 
                                  ? 'Ceci est un résumé de l\'article original.' 
                                  : 'This is a summary of the original article.'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {language === 'fr' 
                                  ? 'Pour lire l\'article complet et soutenir l\'auteur, veuillez visiter le site source.'
                                  : 'To read the full article and support the author, please visit the source website.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* For tips, recipes, trending: show full content */
                      <p className="text-muted-foreground whitespace-pre-wrap">{selectedItem.content}</p>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(selectedItem.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      {formatNumber(selectedItem.likes)} {language === 'fr' ? 'J\'aime' : 'likes'}
                    </button>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatNumber(selectedItem.views)} {language === 'fr' ? 'vues' : 'views'}
                    </span>
                  </div>
                </div>
                
                {/* Action buttons based on category */}
                <div className="mt-4 pt-4 border-t">
                  {selectedItem.category === 'news' ? (
                    /* News: Link to original article */
                    selectedItem.linkUrl ? (
                      <Button
                        className="w-full"
                        onClick={() => window.open(selectedItem.linkUrl!, '_blank', 'noopener')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {language === 'fr' ? 'Lire l\'article complet' : 'Read full article'}
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        {language === 'fr' ? 'Lien non disponible' : 'Link not available'}
                      </p>
                    )
                  ) : (
                    /* Tips, Recipes, Trending: Go to cooking space */
                    <Button
                      className="w-full"
                      onClick={handleGoToCooking}
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Passer à la cuisine' : 'Go to cooking'}
                      <ArrowRightCircle className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
