'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Sparkles, Loader2, Megaphone } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

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

// Fallback Canadian sponsor ads for when no ads in database
const FALLBACK_ADS = {
  top: {
    id: 'metro',
    name: 'Metro Ontario',
    tagline: { fr: 'Votre épicerie de quartier', en: 'Your neighbourhood grocery' },
    offer: { fr: 'Livraison gratuite aujourd\'hui!', en: 'Free delivery today!' },
    logo: '🛒',
    color: '#E31E24',
    link: 'https://www.metro.ca'
  },
  middle: {
    id: 'loblaws',
    name: 'Loblaws',
    tagline: { fr: 'Vivez bien pour moins', en: 'Live well for less' },
    offer: { fr: 'Jusqu\'à 50% de réduction', en: 'Up to 50% off' },
    logo: '🥬',
    color: '#006649',
    link: 'https://www.loblaws.ca'
  },
  bottom: {
    id: 'instacart',
    name: 'Instacart Canada',
    tagline: { fr: 'Livraison en 1 heure', en: 'Delivery in 1 hour' },
    offer: { fr: 'Essayez Instacart Express gratuitement', en: 'Try Instacart Express free' },
    logo: '🥕',
    color: '#43B02A',
    link: 'https://www.instacart.ca'
  }
}

type AdPosition = 'top' | 'middle' | 'bottom'

interface NativeAdBannerProps {
  position?: AdPosition
  className?: string
  compact?: boolean
}

// Helper to ensure URL has protocol
const normalizeUrl = (url: string | null | undefined): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

// Helper to check if image URL is valid
const hasValidImage = (url: string | null | undefined): boolean => {
  if (!url) return false
  return url.trim().length > 0 && url.startsWith('http')
}

export function NativeAdBanner({ 
  position = 'middle', 
  className = '',
  compact = false
}: NativeAdBannerProps) {
  const { language } = useI18n()
  const [ads, setAds] = useState<AdData[]>([])
  const [loading, setLoading] = useState(true)
  const [clickedAd, setClickedAd] = useState<string | null>(null)

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads?type=banner')
      const data = await response.json()
      if (data.ads && data.ads.length > 0) {
        setAds(data.ads)
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdClick = async (adId: string, linkUrl: string) => {
    setClickedAd(adId)
    try {
      await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId })
      })
    } catch (error) {
      console.error('Error recording click:', error)
    }
    // Open link in new tab with normalized URL
    const normalizedUrl = normalizeUrl(linkUrl)
    if (normalizedUrl) {
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer')
    }
    setClickedAd(null)
  }

  const t = (key: string) => {
    const translations: Record<string, { fr: string; en: string }> = {
      sponsored: { fr: 'Sponsorisé', en: 'Sponsored' }
    }
    return translations[key]?.[language as 'fr' | 'en'] || key
  }

  // If we have ads from database, show them
  if (ads.length > 0) {
    // Select ad based on position (rotate through available ads)
    const adIndex = position === 'top' ? 0 : position === 'middle' ? 1 % ads.length : 2 % ads.length
    const currentAd = ads[adIndex] || ads[0]
    const validImage = hasValidImage(currentAd.imageUrl)

    if (compact) {
      return (
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => handleAdClick(currentAd.id, currentAd.linkUrl || '')}
          className={`block cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-colors">
            {validImage ? (
              <img 
                src={currentAd.imageUrl!} 
                alt={currentAd.title}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 bg-primary/10">
                <Megaphone className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('sponsored')}</p>
              <p className="font-medium text-sm truncate">{currentAd.title}</p>
              {currentAd.description && (
                <p className="text-xs text-muted-foreground truncate">{currentAd.description}</p>
              )}
            </div>
            {clickedAd === currentAd.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
            ) : (
              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden cursor-pointer ${className}`}
        onClick={() => handleAdClick(currentAd.id, currentAd.linkUrl || '')}
      >
        <div className="relative rounded-2xl overflow-hidden border border-border/30 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 bg-primary" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-20 bg-primary" />

          <div className="relative flex items-center gap-4 p-4">
            {/* Image or Logo */}
            {validImage ? (
              <motion.img
                src={currentAd.imageUrl!}
                alt={currentAd.title}
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-md"
              />
            ) : (
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md bg-primary/20"
              >
                <Megaphone className="w-8 h-8 text-primary" />
              </motion.div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">{t('sponsored')}</p>
              <h3 className="font-bold text-foreground truncate">{currentAd.title}</h3>
              {currentAd.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {currentAd.description}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              {currentAd.buttonText && (
                <span className="text-xs font-medium px-3 py-1 rounded-full text-white bg-primary">
                  {currentAd.buttonText}
                </span>
              )}
              {clickedAd === currentAd.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Fallback to hardcoded ads if no ads in database
  const fallbackAd = FALLBACK_ADS[position]

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="rounded-2xl border border-border/30 h-24 bg-muted/50" />
      </div>
    )
  }

  // Use fallback hardcoded ads
  if (compact) {
    return (
      <motion.a
        href={fallbackAd.link}
        target="_blank"
        rel="noopener noreferrer nofollow"
        whileHover={{ scale: 1.01 }}
        className={`block ${className}`}
      >
        <div 
          className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-colors"
          style={{ borderLeftColor: fallbackAd.color, borderLeftWidth: '3px' }}
        >
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: fallbackAd.color + '15' }}
          >
            {fallbackAd.logo}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{t('sponsored')}</p>
            <p className="font-medium text-sm truncate">{fallbackAd.name}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      </motion.a>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden ${className}`}
    >
      <a
        href={fallbackAd.link}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="block"
      >
        <div 
          className="relative rounded-2xl overflow-hidden border border-border/30 shadow-lg hover:shadow-xl transition-shadow"
          style={{ 
            background: `linear-gradient(135deg, ${fallbackAd.color}08, ${fallbackAd.color}15)`,
          }}
        >
          {/* Decorative elements */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: fallbackAd.color }}
          />
          <div 
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-20"
            style={{ backgroundColor: fallbackAd.color }}
          />

          <div className="relative flex items-center gap-4 p-4">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md"
              style={{ 
                backgroundColor: fallbackAd.color + '25',
                boxShadow: `0 4px 20px ${fallbackAd.color}30`
              }}
            >
              {fallbackAd.logo}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">{t('sponsored')}</p>
              <h3 className="font-bold text-foreground truncate">{fallbackAd.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {fallbackAd.tagline[language as 'fr' | 'en']}
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span 
                className="text-xs font-medium px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: fallbackAd.color }}
              >
                {fallbackAd.offer[language as 'fr' | 'en']}
              </span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  )
}

// Inline ad that appears between content
export function InlineAdBanner({ className = '' }: { className?: string }) {
  return (
    <NativeAdBanner position="middle" className={className} />
  )
}

// Compact ad strip for sidebars or small spaces
export function CompactAdStrip({ className = '' }: { className?: string }) {
  const { language } = useI18n()
  const [ads, setAds] = useState<AdData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads?type=banner')
      const data = await response.json()
      if (data.ads && data.ads.length > 0) {
        setAds(data.ads)
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show ads from database
  if (ads.length > 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        {ads.slice(0, 3).map((ad, index) => (
          <motion.a
            key={ad.id}
            href={normalizeUrl(ad.linkUrl)}
            target="_blank"
            rel="noopener noreferrer nofollow"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-card/50 hover:bg-card transition-colors"
          >
            {hasValidImage(ad.imageUrl) ? (
              <img src={ad.imageUrl!} alt={ad.title} className="w-6 h-6 rounded object-cover" />
            ) : (
              <Megaphone className="w-5 h-5 text-primary" />
            )}
            <span className="text-sm font-medium truncate flex-1">{ad.title}</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </motion.a>
        ))}
      </div>
    )
  }

  // Fallback to hardcoded ads
  return (
    <div className={`space-y-2 ${className}`}>
      {loading ? (
        [...Array(3)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />
        ))
      ) : (
        Object.values(FALLBACK_ADS).map((ad, index) => (
          <motion.a
            key={ad.id}
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer nofollow"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-card/50 hover:bg-card transition-colors"
          >
            <span className="text-lg">{ad.logo}</span>
            <span className="text-sm font-medium truncate flex-1">{ad.name}</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </motion.a>
        ))
      )}
    </div>
  )
}
