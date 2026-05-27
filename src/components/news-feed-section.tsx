'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ExternalLink, Heart, Eye, Clock, User, TrendingUp, 
  Lightbulb, ChefHat, Newspaper, Flame
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface FeedItem {
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

interface NewsFeedSectionProps {
  onSignUpClick: () => void
  isAuthenticated: boolean
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  tip: <Lightbulb className="w-4 h-4" />,
  news: <Newspaper className="w-4 h-4" />,
  recipe: <ChefHat className="w-4 h-4" />,
  trending: <Flame className="w-4 h-4" />,
  promotion: <TrendingUp className="w-4 h-4" />
}

const CATEGORY_COLORS: Record<string, string> = {
  tip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  news: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  recipe: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  trending: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  promotion: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
}

export function NewsFeedSection({ onSignUpClick, isAuthenticated }: NewsFeedSectionProps) {
  const { language } = useI18n()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(6)
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch - this is a standard pattern
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/feed?limit=20')
      const data = await response.json()
      setFeedItems(data.feed || [])
    } catch (error) {
      console.error('Failed to fetch feed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [...new Set(feedItems.map(item => item.category))]

  const filteredItems = selectedCategory 
    ? feedItems.filter(item => item.category === selectedCategory)
    : feedItems

  const displayedItems = filteredItems.slice(0, visibleCount)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Show placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (feedItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{language === 'fr' ? 'Aucune actualité disponible' : 'No news available'}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className="shrink-0"
        >
          {language === 'fr' ? 'Tout' : 'All'}
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="shrink-0 gap-1.5"
          >
            {CATEGORY_ICONS[cat]}
            {language === 'fr' 
              ? { tip: 'Astuces', news: 'Actualités', recipe: 'Recettes', trending: 'Tendances', promotion: 'Promos' }[cat] || cat
              : cat.charAt(0).toUpperCase() + cat.slice(1)
            }
          </Button>
        ))}
      </div>

      {/* Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={CATEGORY_COLORS[item.category] || ''}>
                        {CATEGORY_ICONS[item.category]}
                        <span className="ml-1 text-xs">
                          {language === 'fr' 
                            ? { tip: 'Astuce', news: 'Actu', recipe: 'Recette', trending: 'Tendance', promotion: 'Promo' }[item.category] || item.category
                            : item.category
                          }
                        </span>
                      </Badge>
                      {item.featured && (
                        <span className="text-amber-500">⭐</span>
                      )}
                    </div>
                    <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {item.likes}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.publishAt)}
                      </span>
                    </div>
                  </div>
                </div>
                {item.linkUrl && (
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1 text-sm text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {language === 'fr' ? 'Lire plus' : 'Read more'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {visibleCount < filteredItems.length && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => setVisibleCount(prev => prev + 6)}
          >
            {language === 'fr' ? 'Voir plus' : 'Load more'}
          </Button>
        </div>
      )}

      {/* Sign up prompt for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mt-8 text-center">
          <Card className="bg-primary/5 border-primary/20 inline-block">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'fr' 
                  ? 'Créez un compte pour sauvegarder vos recettes favorites'
                  : 'Create an account to save your favorite recipes'}
              </p>
              <Button size="sm" onClick={onSignUpClick}>
                <User className="w-4 h-4 mr-1" />
                {language === 'fr' ? 'Créer un compte' : 'Sign up'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
