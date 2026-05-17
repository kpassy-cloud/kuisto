'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Sparkles, Crown, X, ShoppingCart, ChefHat, Truck } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'

interface AdData {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  linkUrl?: string | null
  buttonText?: string | null
  type: string
  priority: number
}

// Fallback sidebar ads
const FALLBACK_SIDEBAR_ADS = [
  {
    id: 'metro-sidebar',
    title: 'Metro',
    description: { fr: 'Livraison d\'épicerie', en: 'Grocery delivery' },
    icon: ShoppingCart,
    color: '#E31E24',
    link: 'https://www.metro.ca'
  },
  {
    id: 'cookit-sidebar',
    title: 'Cook it',
    description: { fr: 'Kits repas en 15 min', en: 'Meal kits in 15 min' },
    icon: ChefHat,
    color: '#FF6B35',
    link: 'https://www.cookit.ca'
  },
  {
    id: 'instacart-sidebar',
    title: 'Instacart',
    description: { fr: 'Livraison en 1 heure', en: 'Delivery in 1 hour' },
    icon: Truck,
    color: '#43B02A',
    link: 'https://www.instacart.ca'
  }
]

interface SidebarAdProps {
  className?: string
  onUpgradeClick?: () => void
  variant?: 'card' | 'minimal' | 'featured'
}

export function SidebarAd({ 
  className = '', 
  onUpgradeClick,
  variant = 'card'
}: SidebarAdProps) {
  const { language, t } = useI18n()
  const { plan } = useAuth()
  const [ads, setAds] = useState<AdData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  // Don't show ads to premium/pro users
  const shouldShowAds = plan !== 'premium' && plan !== 'pro'

  useEffect(() => {
    if (!shouldShowAds) return
    fetchAds()
  }, [shouldShowAds])

  useEffect(() => {
    if (!shouldShowAds || ads.length <= 1) return
    
    // Rotate ads every 10 seconds
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length)
    }, 10000)
    
    return () => clearInterval(interval)
  }, [shouldShowAds, ads.length])

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads?type=sidebar')
      const data = await response.json()
      if (data.ads && data.ads.length > 0) {
        setAds(data.ads)
      }
    } catch (error) {
      console.error('Error fetching sidebar ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdClick = async (adId: string, linkUrl: string) => {
    try {
      await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId })
      })
    } catch (error) {
      console.error('Error recording click:', error)
    }
    window.open(linkUrl, '_blank', 'noopener,noreferrer')
  }

  // Don't show if premium/pro user or dismissed
  if (!shouldShowAds || dismissed) return null

  // Loading skeleton
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="rounded-xl border border-border/30 h-40 bg-muted/50" />
      </div>
    )
  }

  // If we have ads from database
  if (ads.length > 0) {
    const currentAd = ads[currentIndex] || ads[0]

    if (variant === 'minimal') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative ${className}`}
        >
          <div 
            onClick={() => handleAdClick(currentAd.id, currentAd.linkUrl || '')}
            className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/30 dark:hover:to-orange-950/30 cursor-pointer transition-all"
          >
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground">
              {t('sponsored')}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{currentAd.title}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </motion.div>
      )
    }

    if (variant === 'featured') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative ${className}`}
        >
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 hover:bg-background transition-colors"
            aria-label="Dismiss ad"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>

          <div 
            onClick={() => handleAdClick(currentAd.id, currentAd.linkUrl || '')}
            className="relative rounded-2xl overflow-hidden border border-amber-200/50 dark:border-amber-800/30 shadow-lg cursor-pointer"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-900/40" />
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-40 bg-amber-400" />
            
            <div className="relative p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {t('sponsored')}
                </span>
              </div>
              
              <h4 className="font-bold text-lg text-foreground mb-1">{currentAd.title}</h4>
              {currentAd.description && (
                <p className="text-sm text-muted-foreground mb-3">{currentAd.description}</p>
              )}
              
              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  {currentAd.buttonText || t('learnMore')}
                </Button>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Ad indicators */}
          {ads.length > 1 && (
            <div className="flex justify-center gap-1 mt-2">
              {ads.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Remove ads */}
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="w-full mt-3 text-center text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
            >
              <Crown className="w-3 h-3 text-amber-500" />
              {t('removeAds')}
            </button>
          )}
        </motion.div>
      )
    }

    // Default card variant
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative ${className}`}
      >
        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 hover:bg-background transition-colors"
          aria-label="Dismiss ad"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>

        <div 
          onClick={() => handleAdClick(currentAd.id, currentAd.linkUrl || '')}
          className="rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-all cursor-pointer overflow-hidden"
        >
          {/* Header with sponsor label */}
          <div className="px-3 py-2 border-b border-border/30 bg-muted/30">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              {t('sponsored')}
            </span>
          </div>
          
          <div className="p-4">
            <h4 className="font-semibold text-foreground mb-1">{currentAd.title}</h4>
            {currentAd.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{currentAd.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-medium">
                {currentAd.buttonText || t('learnMore')} →
              </span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Ad indicators */}
        {ads.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Remove ads */}
        {onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="w-full mt-3 text-center text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
          >
            <Crown className="w-3 h-3 text-amber-500" />
            {t('removeAds')}
          </button>
        )}
      </motion.div>
    )
  }

  // Fallback to hardcoded ads
  const fallbackAd = FALLBACK_SIDEBAR_ADS[currentIndex % FALLBACK_SIDEBAR_ADS.length]
  const Icon = fallbackAd.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${className}`}
    >
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 hover:bg-background transition-colors"
        aria-label="Dismiss ad"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>

      <a
        href={fallbackAd.link}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="block rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-all overflow-hidden"
      >
        {/* Header with sponsor label */}
        <div className="px-3 py-2 border-b border-border/30 bg-muted/30">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            {t('sponsored')}
          </span>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: fallbackAd.color + '15' }}
            >
              <Icon className="w-5 h-5" style={{ color: fallbackAd.color }} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{fallbackAd.title}</h4>
              <p className="text-xs text-muted-foreground">
                {fallbackAd.description[language as 'fr' | 'en']}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary font-medium">
              {t('learnMore')} →
            </span>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </a>

      {/* Ad indicators */}
      <div className="flex justify-center gap-1 mt-2">
        {FALLBACK_SIDEBAR_ADS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              idx === currentIndex % FALLBACK_SIDEBAR_ADS.length ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Remove ads */}
      {onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="w-full mt-3 text-center text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
        >
          <Crown className="w-3 h-3 text-amber-500" />
          {t('removeAds')}
        </button>
      )}
    </motion.div>
  )
}

// Multi-ad sidebar widget showing multiple ads
export function SidebarAdStack({ 
  className = '', 
  onUpgradeClick,
  maxAds = 3 
}: SidebarAdProps & { maxAds?: number }) {
  const { t } = useI18n()
  const { plan } = useAuth()
  const [ads, setAds] = useState<AdData[]>([])
  const [loading, setLoading] = useState(true)

  // Don't show ads to premium/pro users
  const shouldShowAds = plan !== 'premium' && plan !== 'pro'

  useEffect(() => {
    if (!shouldShowAds) return
    fetchAds()
  }, [shouldShowAds])

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads?type=sidebar')
      const data = await response.json()
      if (data.ads && data.ads.length > 0) {
        setAds(data.ads.slice(0, maxAds))
      }
    } catch (error) {
      console.error('Error fetching sidebar ads:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!shouldShowAds) return null

  return (
    <div className={className}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
        <Sparkles className="w-3 h-3" />
        <span>{t('sponsored')}</span>
      </div>
      
      {loading ? (
        <div className="space-y-2">
          {[...Array(maxAds)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : ads.length > 0 ? (
        <div className="space-y-2">
          {ads.map((ad, index) => (
            <motion.a
              key={ad.id}
              href={ad.linkUrl || '#'}
              target="_blank"
              rel="noopener noreferrer nofollow"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{ad.title}</p>
                {ad.description && (
                  <p className="text-xs text-muted-foreground truncate">{ad.description}</p>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
            </motion.a>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {FALLBACK_SIDEBAR_ADS.slice(0, maxAds).map((ad, index) => {
            const Icon = ad.icon
            return (
              <motion.a
                key={ad.id}
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer nofollow"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-card/50 hover:bg-card transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: ad.color + '15' }}
                >
                  <Icon className="w-4 h-4" style={{ color: ad.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{ad.title}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.a>
            )
          })}
        </div>
      )}

      {/* Remove ads */}
      {onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="w-full mt-3 text-center text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
        >
          <Crown className="w-3 h-3 text-amber-500" />
          {t('removeAds')}
        </button>
      )}
    </div>
  )
}
