'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, Play, Pause, Volume2, VolumeX, ChevronRight, ExternalLink } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

// Canadian sponsor ads
const SPONSOR_ADS = [
  {
    id: 'metro',
    name: 'Metro Ontario',
    tagline: { fr: 'Votre épicerie de quartier', en: 'Your neighbourhood grocery' },
    logo: '🛒',
    color: '#E31E24',
    cta: { fr: 'Visitez Metro', en: 'Visit Metro' },
    link: 'https://www.metro.ca'
  },
  {
    id: 'canadian-tire',
    name: 'Canadian Tire',
    tagline: { fr: 'Pour la vie au Canada', en: 'For life in Canada' },
    logo: '🔶',
    color: '#E31E24',
    cta: { fr: 'Achetez maintenant', en: 'Shop now' },
    link: 'https://www.canadiantire.ca'
  },
  {
    id: 'loblaws',
    name: 'Loblaws',
    tagline: { fr: 'Vivez bien pour moins', en: 'Live well for less' },
    logo: '🥬',
    color: '#006649',
    cta: { fr: 'Découvrir les offres', en: 'Discover deals' },
    link: 'https://www.loblaws.ca'
  },
  {
    id: 'instacart',
    name: 'Instacart Canada',
    tagline: { fr: 'Livraison d\'épicerie en 1 heure', en: 'Grocery delivery in 1 hour' },
    logo: '🥕',
    color: '#43B02A',
    cta: { fr: 'Commander', en: 'Order now' },
    link: 'https://www.instacart.ca'
  }
]

interface VideoAdModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  duration?: number // in seconds
}

export function VideoAdModal({
  isOpen,
  onClose,
  onComplete,
  duration = 30
}: VideoAdModalProps) {
  const { language } = useI18n()
  const [timeRemaining, setTimeRemaining] = useState(duration)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [canClose, setCanClose] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  
  // Use useMemo to select a random ad when the modal opens
  const [adKey, setAdKey] = useState(0)
  const currentAd = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * SPONSOR_ADS.length)
    return SPONSOR_ADS[randomIndex]
  }, [adKey])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAdKey(k => k + 1) // Trigger new random ad
      setTimeRemaining(duration)
      setIsPlaying(true)
      setCanClose(false)
      setHasStarted(false)
    }
  }, [isOpen, duration])

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !isPlaying || !hasStarted) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCanClose(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, isPlaying, hasStarted])

  const handleStart = useCallback(() => {
    setHasStarted(true)
  }, [])

  const handleComplete = useCallback(() => {
    onComplete()
    onClose()
  }, [onComplete, onClose])

  const progress = ((duration - timeRemaining) / duration) * 100

  const t = (key: string) => {
    const translations: Record<string, { fr: string; en: string }> = {
      adIn: { fr: 'Publicité dans', en: 'Ad in' },
      seconds: { fr: 'secondes', en: 'seconds' },
      skipAd: { fr: 'Passer la publicité', en: 'Skip ad' },
      thanks: { fr: 'Merci d\'avoir regardé !', en: 'Thanks for watching!' },
      featureUnlocked: { fr: 'Fonctionnalité débloquée', en: 'Feature unlocked' },
      close: { fr: 'Fermer', en: 'Close' },
      sponsoredBy: { fr: 'Sponsorisé par', en: 'Sponsored by' }
    }
    return translations[key]?.[language as 'fr' | 'en'] || key
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl mx-4 pointer-events-auto"
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Close button - only enabled when ad is complete */}
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="text-white/60 text-sm">
              {canClose 
                ? (language === 'fr' ? 'Terminé' : 'Done')
                : `${timeRemaining}s`
              }
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={canClose ? handleComplete : undefined}
              disabled={!canClose}
              className={`text-white ${canClose ? 'hover:bg-white/20' : 'opacity-50 cursor-not-allowed'}`}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Ad Content */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            {!hasStarted ? (
              // Start screen
              <div className="aspect-video flex flex-col items-center justify-center p-8 text-center">
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mb-6"
                  style={{ backgroundColor: currentAd.color + '20' }}
                >
                  {currentAd.logo}
                </div>
                <h2 className="text-white text-2xl font-bold mb-2">{currentAd.name}</h2>
                <p className="text-white/70 mb-8">{currentAd.tagline[language as 'fr' | 'en']}</p>
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {language === 'fr' ? 'Commencer' : 'Start'}
                </Button>
              </div>
            ) : (
              // Running ad
              <div className="aspect-video flex flex-col items-center justify-center p-8 text-center relative">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-1/2 -right-1/2 w-full h-full opacity-10"
                    style={{ backgroundColor: currentAd.color }}
                  />
                </div>

                {/* Sponsor logo animation */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    y: [0, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative z-10"
                >
                  <div 
                    className="w-32 h-32 rounded-3xl flex items-center justify-center text-7xl mb-6 shadow-2xl"
                    style={{ backgroundColor: currentAd.color + '30', boxShadow: `0 0 60px ${currentAd.color}40` }}
                  >
                    {currentAd.logo}
                  </div>
                </motion.div>

                <motion.h2 
                  key={currentAd.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative z-10 text-white text-3xl font-bold mb-3"
                >
                  {currentAd.name}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 text-white/80 text-lg mb-8"
                >
                  {currentAd.tagline[language as 'fr' | 'en']}
                </motion.p>

                {/* CTA Button */}
                <motion.a
                  href={currentAd.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-colors"
                  style={{ backgroundColor: currentAd.color }}
                >
                  {currentAd.cta[language as 'fr' | 'en']}
                  <ExternalLink className="w-4 h-4" />
                </motion.a>

                {/* Controls */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Completion message */}
                {canClose && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' }}
                        >
                          ✅
                        </motion.div>
                      </div>
                      <h3 className="text-white text-xl font-bold mb-2">{t('thanks')}</h3>
                      <p className="text-white/70 mb-6">{t('featureUnlocked')}</p>
                      <Button
                        onClick={handleComplete}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {t('close')}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Sponsored by text */}
          <p className="text-center text-white/40 text-xs mt-4">
            {t('sponsoredBy')} {currentAd.name}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
