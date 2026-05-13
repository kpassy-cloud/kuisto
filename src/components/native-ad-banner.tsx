'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

// Canadian sponsor ads for different positions
const CANADIAN_ADS = {
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

export function NativeAdBanner({ 
  position = 'middle', 
  className = '',
  compact = false
}: NativeAdBannerProps) {
  const { language } = useI18n()
  
  // Use deterministic ad based on position to avoid hydration mismatch
  const ad = CANADIAN_ADS[position]

  const t = (key: string) => {
    const translations: Record<string, { fr: string; en: string }> = {
      sponsored: { fr: 'Sponsorisé', en: 'Sponsored' }
    }
    return translations[key]?.[language as 'fr' | 'en'] || key
  }

  if (compact) {
    return (
      <motion.a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer nofollow"
        whileHover={{ scale: 1.01 }}
        className={`block ${className}`}
      >
        <div 
          className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-colors"
          style={{ borderLeftColor: ad.color, borderLeftWidth: '3px' }}
        >
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: ad.color + '15' }}
          >
            {ad.logo}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{t('sponsored')}</p>
            <p className="font-medium text-sm truncate">{ad.name}</p>
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
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="block"
      >
        <div 
          className="relative rounded-2xl overflow-hidden border border-border/30 shadow-lg hover:shadow-xl transition-shadow"
          style={{ 
            background: `linear-gradient(135deg, ${ad.color}08, ${ad.color}15)`,
          }}
        >
          {/* Decorative elements */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: ad.color }}
          />
          <div 
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-20"
            style={{ backgroundColor: ad.color }}
          />

          <div className="relative flex items-center gap-4 p-4">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md"
              style={{ 
                backgroundColor: ad.color + '25',
                boxShadow: `0 4px 20px ${ad.color}30`
              }}
            >
              {ad.logo}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">{t('sponsored')}</p>
              <h3 className="font-bold text-foreground truncate">{ad.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {ad.tagline[language as 'fr' | 'en']}
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span 
                className="text-xs font-medium px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: ad.color }}
              >
                {ad.offer[language as 'fr' | 'en']}
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
  
  return (
    <div className={`space-y-2 ${className}`}>
      {Object.values(CANADIAN_ADS).map((ad, index) => (
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
      ))}
    </div>
  )
}
