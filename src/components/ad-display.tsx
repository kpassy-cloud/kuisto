'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/hooks/useAuth'

interface Ad {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  linkUrl: string | null
  buttonText: string | null
  type: string
}

interface AdBannerProps {
  type?: 'banner' | 'sidebar' | 'inline'
  country?: string
  region?: string
  onUpgradeClick?: () => void
}

export function AdBanner({ type = 'banner', country, region, onUpgradeClick }: AdBannerProps) {
  const { language } = useI18n()
  const { plan } = useAuth()
  const [ads, setAds] = useState<Ad[]>([])
  const [currentAd, setCurrentAd] = useState<Ad | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (plan === 'premium' || plan === 'pro') {
      return
    }

    const fetchAds = async () => {
      try {
        const params = new URLSearchParams()
        params.set('type', type)
        if (country) params.set('country', country)
        if (region) params.set('region', region)
        
        const res = await fetch(`/api/ads?${params}`)
        const data = await res.json()
        setAds(data.ads || [])
        if (data.ads?.length > 0) {
          setCurrentAd(data.ads[0])
        }
      } catch (err) {
        console.error('Failed to fetch ads:', err)
      }
    }

    fetchAds()
  }, [plan, type, country, region])

  // Don't show ads to premium/pro users
  if (plan === 'premium' || plan === 'pro' || dismissed || !currentAd) {
    return null
  }

  const handleClick = async () => {
    if (currentAd.linkUrl) {
      // Record click
      try {
        await fetch('/api/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adId: currentAd.id })
        })
      } catch (err) {
        console.error('Failed to record click:', err)
      }
      
      window.open(currentAd.linkUrl, '_blank', 'noopener')
    }
  }

  if (type === 'sidebar') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {language === 'fr' ? 'Publicité' : 'Sponsored'}
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {currentAd.imageUrl && (
          <img
            src={currentAd.imageUrl}
            alt={currentAd.title}
            className="w-full h-24 object-cover rounded-lg mb-2"
          />
        )}
        
        <h4 className="font-medium text-sm mb-1">{currentAd.title}</h4>
        {currentAd.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{currentAd.description}</p>
        )}
        
        <Button
          size="sm"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          onClick={handleClick}
        >
          {currentAd.buttonText || (language === 'fr' ? 'En savoir plus' : 'Learn more')}
        </Button>
        
        <button
          onClick={onUpgradeClick}
          className="w-full mt-2 text-xs text-center text-muted-foreground hover:text-primary"
        >
          <Crown className="w-3 h-3 inline mr-1" />
          {language === 'fr' ? 'Supprimer les pubs' : 'Remove ads'}
        </button>
      </motion.div>
    )
  }

  if (type === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
      >
        {currentAd.imageUrl && (
          <img
            src={currentAd.imageUrl}
            alt={currentAd.title}
            className="w-16 h-16 object-cover rounded-lg shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">
            {language === 'fr' ? 'Publicité' : 'Sponsored'}
          </p>
          <h4 className="font-medium text-sm truncate">{currentAd.title}</h4>
        </div>
        <Button size="sm" variant="outline" onClick={handleClick}>
          <ExternalLink className="w-3 h-3" />
        </Button>
      </motion.div>
    )
  }

  // Default banner
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-amber-50 to-primary/10 dark:from-primary/5 dark:via-amber-900/10 dark:to-primary/5 border"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 hover:bg-background"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div className="flex items-center gap-4 p-4">
        {currentAd.imageUrl && (
          <img
            src={currentAd.imageUrl}
            alt={currentAd.title}
            className="w-20 h-20 object-cover rounded-lg shrink-0 hidden sm:block"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {language === 'fr' ? 'Publicité' : 'Sponsored'}
            </span>
          </div>
          <h4 className="font-medium truncate">{currentAd.title}</h4>
          {currentAd.description && (
            <p className="text-sm text-muted-foreground truncate">{currentAd.description}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={handleClick}
          >
            {currentAd.buttonText || (language === 'fr' ? 'En savoir plus' : 'Learn more')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={onUpgradeClick}
          >
            <Crown className="w-3 h-3 mr-1 text-amber-500" />
            {language === 'fr' ? 'Sans pub' : 'Ad-free'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Popup ad component
export function AdPopup({ country, region, onUpgradeClick }: { country?: string; region?: string; onUpgradeClick?: () => void }) {
  const { language } = useI18n()
  const { plan } = useAuth()
  const [ad, setAd] = useState<Ad | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (plan === 'premium' || plan === 'pro' || dismissed) return

    // Show popup after 30 seconds
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams()
        params.set('type', 'popup')
        if (country) params.set('country', country)
        if (region) params.set('region', region)
        
        const res = await fetch(`/api/ads?${params}`)
        const data = await res.json()
        if (data.ads?.length > 0) {
          setAd(data.ads[0])
        }
      } catch (err) {
        console.error('Failed to fetch popup ad:', err)
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [plan, country, region, dismissed])

  if (!ad || plan === 'premium' || plan === 'pro' || dismissed) return null

  const handleClick = async () => {
    if (ad.linkUrl) {
      try {
        await fetch('/api/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adId: ad.id })
        })
      } catch (err) {
        console.error('Failed to record click:', err)
      }
      
      window.open(ad.linkUrl, '_blank', 'noopener')
      setDismissed(true)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4"
        onClick={() => setDismissed(true)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          <div className="relative">
            {ad.imageUrl && (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-48 object-cover"
              />
            )}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {language === 'fr' ? 'Publicité' : 'Sponsored'}
            </p>
            <h3 className="font-serif text-xl font-bold mb-2">{ad.title}</h3>
            {ad.description && (
              <p className="text-muted-foreground mb-4">{ad.description}</p>
            )}
            
            <div className="flex gap-2">
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={handleClick}>
                {ad.buttonText || (language === 'fr' ? 'En savoir plus' : 'Learn more')}
              </Button>
              <Button variant="outline" onClick={() => setDismissed(true)}>
                {language === 'fr' ? 'Fermer' : 'Close'}
              </Button>
            </div>
            
            <button
              onClick={onUpgradeClick}
              className="w-full mt-3 text-center text-sm text-muted-foreground hover:text-primary"
            >
              <Crown className="w-4 h-4 inline mr-1 text-amber-500" />
              {language === 'fr' ? 'Passer Premium pour supprimer les pubs' : 'Go Premium to remove ads'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
