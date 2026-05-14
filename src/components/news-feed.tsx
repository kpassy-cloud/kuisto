'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Newspaper, ExternalLink, Heart, ChefHat, X,
  TrendingUp, Lightbulb, Sparkles, Tag, Calendar, Eye
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface FeedItem {
  id: string
  title: string
  content: string
  imageUrl: string | null
  linkUrl: string | null
  category: string
  views: number
  likes: number
  publishAt: string
}

interface NewsFeedProps {
  country?: string
  limit?: number
  compact?: boolean
}

const categoryIcons: Record<string, React.ReactNode> = {
  tip: <Lightbulb className="w-4 h-4" />,
  news: <Newspaper className="w-4 h-4" />,
  recipe: <ChefHat className="w-4 h-4" />,
  promotion: <Sparkles className="w-4 h-4" />,
  trending: <TrendingUp className="w-4 h-4" />
}

const categoryColors: Record<string, string> = {
  tip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  news: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  recipe: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  promotion: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  trending: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
}

const categoryLabels: Record<string, { fr: string; en: string }> = {
  tip: { fr: 'Astuce', en: 'Tip' },
  news: { fr: 'Actualité', en: 'News' },
  recipe: { fr: 'Recette', en: 'Recipe' },
  promotion: { fr: 'Promotion', en: 'Promotion' },
  trending: { fr: 'Tendance', en: 'Trending' }
}

function formatTimeAgo(dateString: string, language: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) {
    return language === 'fr' ? `Il y a ${days}j` : `${days}d ago`
  }
  if (hours > 0) {
    return language === 'fr' ? `Il y a ${hours}h` : `${hours}h ago`
  }
  return language === 'fr' ? 'À l\'instant' : 'Just now'
}

function formatDate(dateString: string, language: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function NewsFeed({ country, limit = 5, compact = false }: NewsFeedProps) {
  const { language } = useI18n()
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null)

  useEffect(() => {
    const fetchFeedItems = async () => {
      try {
        const params = new URLSearchParams()
        params.set('limit', limit.toString())
        if (country) params.set('country', country)
        
        const res = await fetch(`/api/feed?${params}`)
        const data = await res.json()
        setFeed(data.feed || [])
      } catch (err) {
        console.error('Failed to fetch feed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedItems()
  }, [country, limit])

  const handleView = async (feedId: string) => {
    try {
      await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId, action: 'view' })
      })
      // Update local state
      setFeed(prev => prev.map(item => 
        item.id === feedId ? { ...item, views: item.views + 1 } : item
      ))
    } catch (err) {
        console.error('Failed to record view:', err)
    }
  }

  const handleLike = async (feedId: string) => {
    try {
      await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId, action: 'like' })
      })
      setFeed(prev => prev.map(item => 
        item.id === feedId ? { ...item, likes: item.likes + 1 } : item
      ))
    } catch (err) {
      console.error('Failed to record like:', err)
    }
  }

  const handleItemClick = (item: FeedItem) => {
    handleView(item.id)
    if (item.linkUrl) {
      window.open(item.linkUrl, '_blank', 'noopener')
    } else {
      setSelectedItem(item)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-24" />
        ))}
      </div>
    )
  }

  if (feed.length === 0) {
    return null
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {feed.slice(0, 3).map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleItemClick(item)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {categoryIcons[item.category] || <Tag className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(item.publishAt, language)}
              </p>
            </div>
            {item.linkUrl && (
              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            {language === 'fr' ? 'Actualités culinaires' : 'Cooking News'}
          </h3>
        </div>

        <div className="space-y-3">
          {feed.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:border-primary/30"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-0">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={categoryColors[item.category] || ''}>
                        {categoryIcons[item.category]}
                        <span className="ml-1">{categoryLabels[item.category]?.[language as 'fr' | 'en'] || item.category}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(item.publishAt, language)}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                  </div>
                  
                  <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(item.id)
                        }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-3 h-3" />
                        {item.likes}
                      </button>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-primary">
                      {language === 'fr' ? 'Lire plus' : 'Read more'}
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
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
                    <Badge className={categoryColors[selectedItem.category] || ''}>
                      {categoryIcons[selectedItem.category]}
                      <span className="ml-1">{categoryLabels[selectedItem.category]?.[language as 'fr' | 'en'] || selectedItem.category}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(selectedItem.publishAt, language)}
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
                
                <ScrollArea className="max-h-[40vh]">
                  <div className="prose prose-sm dark:prose-invert">
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedItem.content}</p>
                  </div>
                </ScrollArea>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(selectedItem.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      {selectedItem.likes} {language === 'fr' ? 'J\'aime' : 'likes'}
                    </button>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedItem.views} {language === 'fr' ? 'vues' : 'views'}
                    </span>
                  </div>
                  
                  {selectedItem.linkUrl && (
                    <Button
                      size="sm"
                      onClick={() => window.open(selectedItem.linkUrl!, '_blank', 'noopener')}
                    >
                      {language === 'fr' ? 'Voir le lien' : 'View link'}
                      <ExternalLink className="w-4 h-4 ml-1" />
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

// News ticker for header
export function NewsTicker() {
  const { language } = useI18n()
  const [feed, setFeed] = useState<FeedItem[]>([])

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch('/api/feed?limit=5&category=tip')
        const data = await res.json()
        setFeed(data.feed || [])
      } catch (err) {
        console.error('Failed to fetch feed:', err)
      }
    }

    fetchFeed()
  }, [])

  if (feed.length === 0) return null

  return (
    <div className="bg-primary/5 border-b py-2 overflow-hidden">
      <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
        <span className="shrink-0 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
          {language === 'fr' ? 'Astuce du jour' : 'Tip of the day'}
        </span>
        {feed.map((item, index) => (
          <span key={item.id} className="text-sm text-muted-foreground whitespace-nowrap">
            💡 {item.title}
            {index < feed.length - 1 && <span className="mx-4">•</span>}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {feed.map((item, index) => (
          <span key={`dup-${item.id}`} className="text-sm text-muted-foreground whitespace-nowrap">
            💡 {item.title}
            {index < feed.length - 1 && <span className="mx-4">•</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
