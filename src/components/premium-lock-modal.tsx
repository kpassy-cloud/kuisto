'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Crown, Play, Lock, Sparkles, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface PremiumLockModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  featureDescription?: string
  onWatchAd?: () => void
  onUpgrade?: () => void
  hideAdOption?: boolean // For guests - they must signup, no ad option
}

export function PremiumLockModal({
  isOpen,
  onClose,
  featureName,
  featureDescription,
  onWatchAd,
  onUpgrade,
  hideAdOption = false
}: PremiumLockModalProps) {
  const { language } = useI18n()
  const [isHoveringAd, setIsHoveringAd] = useState(false)

  const t = (key: string) => {
    const translations: Record<string, { fr: string; en: string }> = {
      premiumFeature: { fr: 'Fonctionnalité Premium', en: 'Premium Feature' },
      unlockWithAd: { fr: 'Débloquer avec une publicité', en: 'Unlock with an ad' },
      watchAd: { fr: 'Regarder une publicité', en: 'Watch an ad' },
      watchAdDesc: { fr: 'Regardez une publicité de 30 secondes pour débloquer temporairement cette fonctionnalité', en: 'Watch a 30-second ad to temporarily unlock this feature' },
      orGoPremium: { fr: 'Ou passez à Premium', en: 'Or go Premium' },
      upgradeNow: { fr: 'Passer à Premium', en: 'Upgrade Now' },
      premiumBenefits: { fr: 'Avantages Premium', en: 'Premium Benefits' },
      unlimitedAccess: { fr: 'Accès illimité à toutes les fonctionnalités', en: 'Unlimited access to all features' },
      noAds: { fr: 'Aucune publicité', en: 'No ads' },
      exclusiveRecipes: { fr: 'Recettes exclusives', en: 'Exclusive recipes' },
      priority: { fr: 'Support prioritaire', en: 'Priority support' },
      adFree: { fr: 'Sans publicité', en: 'Ad-free' },
      only: { fr: 'Seulement', en: 'Only' },
      perMonth: { fr: '/mois', en: '/month' },
      temporaryUnlock: { fr: 'Déblocage temporaire (24h)', en: 'Temporary unlock (24h)' }
    }
    return translations[key]?.[language as 'fr' | 'en'] || key
  }

  const premiumBenefits = [
    { icon: Sparkles, text: t('unlimitedAccess') },
    { icon: Check, text: t('noAds') },
    { icon: Crown, text: t('exclusiveRecipes') },
    { icon: Check, text: t('priority') }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md pointer-events-auto"
        >
          <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-terracotta p-6 text-primary-foreground">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-white/20">
                  <Lock className="w-8 h-8" />
                </div>
              </div>
              
              <h2 className="font-serif text-2xl font-bold text-center">
                {t('premiumFeature')}
              </h2>
              <p className="text-center text-white/90 mt-1">
                {featureName}
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Feature description */}
              {featureDescription && (
                <p className="text-sm text-muted-foreground text-center">
                  {featureDescription}
                </p>
              )}

              {/* Watch Ad Option - Only for authenticated free users, NOT for guests */}
              {onWatchAd && !hideAdOption && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onWatchAd}
                  onMouseEnter={() => setIsHoveringAd(true)}
                  onMouseLeave={() => setIsHoveringAd(false)}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className={`p-2 rounded-lg ${isHoveringAd ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'} transition-colors`}>
                      <Play className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">
                        {t('watchAd')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('temporaryUnlock')}
                      </p>
                    </div>
                  </div>
                </motion.button>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t('orGoPremium')}
                  </span>
                </div>
              </div>

              {/* Premium Upgrade */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-amber-800 dark:text-amber-200">
                    {t('premiumBenefits')}
                  </span>
                </div>
                
                <ul className="space-y-2 mb-4">
                  {premiumBenefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      <benefit.icon className="w-4 h-4" />
                      {benefit.text}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                      $6.99 CA
                    </span>
                    <span className="text-sm text-amber-600 dark:text-amber-400">
                      {t('perMonth')}
                    </span>
                  </div>
                  
                  <Button
                    onClick={onUpgrade}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                  >
                    {t('upgradeNow')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
