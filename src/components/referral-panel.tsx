'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  X, Gift, Copy, Share2, Users, Sparkles, Check, Loader2,
  ChevronDown, ChevronUp, Star
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface ReferralPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface ReferralData {
  referralCode: string | null
  referralCount: number
  referredBy: string | null
  referrals: Array<{
    id: string
    createdAt: string
    rewardGranted: boolean
    referredUserName: string
  }>
  stats: {
    totalReferrals: number
    rewardsEarned: number
    pendingRewards: number
    rewardPerReferral: number
  }
}

export function ReferralPanel({ isOpen, onClose }: ReferralPanelProps) {
  const { language } = useI18n()
  const { user } = useAuth()
  const [data, setData] = useState<ReferralData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      loadReferralData()
    }
  }, [isOpen, user])

  const loadReferralData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/referral')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (err) {
      console.error('Failed to load referral data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const generateCode = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/referral', {
        method: 'POST'
      })
      if (response.ok) {
        const result = await response.json()
        setData(prev => prev ? { ...prev, referralCode: result.referralCode } : null)
        toast({
          title: language === 'fr' ? 'Code créé !' : 'Code created!',
          description: language === 'fr'
            ? 'Votre code de parrainage est prêt'
            : 'Your referral code is ready'
        })
      }
    } catch (err) {
      console.error('Failed to generate code:', err)
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr'
          ? 'Impossible de générer le code'
          : 'Could not generate code',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyCode = async () => {
    if (!data?.referralCode) return
    
    try {
      await navigator.clipboard.writeText(data.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: language === 'fr' ? 'Copié !' : 'Copied!',
        description: language === 'fr'
          ? 'Le code a été copié dans le presse-papier'
          : 'Code copied to clipboard'
      })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const copyReferralLink = async () => {
    if (!data?.referralCode) return
    
    const link = `${window.location.origin}?ref=${data.referralCode}`
    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: language === 'fr' ? 'Lien copié !' : 'Link copied!',
        description: language === 'fr'
          ? 'Le lien de parrainage a été copié'
          : 'Referral link copied'
      })
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const shareReferral = async () => {
    if (!data?.referralCode) return
    
    const shareData = {
      title: 'Kuisto',
      text: language === 'fr'
        ? `Rejoins-moi sur Kuisto et obtiens des recettes gratuites ! Utilise mon code: ${data.referralCode}`
        : `Join me on Kuisto and get free recipes! Use my code: ${data.referralCode}`,
      url: `${window.location.origin}?ref=${data.referralCode}`
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or share failed
        copyReferralLink()
      }
    } else {
      copyReferralLink()
    }
  }

  if (!isOpen) return null

  const t = (key: string) => {
    const translations: Record<string, { fr: string; en: string }> = {
      title: { fr: 'Programme de parrainage', en: 'Referral Program' },
      subtitle: { fr: 'Invitez vos amis et gagnez des récompenses', en: 'Invite friends and earn rewards' },
      yourCode: { fr: 'Votre code de parrainage', en: 'Your referral code' },
      generateCode: { fr: 'Générer mon code', en: 'Generate my code' },
      copyCode: { fr: 'Copier le code', en: 'Copy code' },
      shareLink: { fr: 'Partager le lien', en: 'Share link' },
      stats: { fr: 'Vos statistiques', en: 'Your stats' },
      totalReferrals: { fr: 'Parrainages totaux', en: 'Total referrals' },
      rewardsEarned: { fr: 'Récompenses gagnées', en: 'Rewards earned' },
      pendingRewards: { fr: 'En attente', en: 'Pending' },
      history: { fr: 'Historique des parrainages', en: 'Referral history' },
      noReferrals: { fr: 'Aucun parrainage pour le moment', en: 'No referrals yet' },
      howItWorks: { fr: 'Comment ça marche ?', en: 'How it works?' },
      step1: { fr: 'Partagez votre code unique avec vos amis', en: 'Share your unique code with friends' },
      step2: { fr: 'Ils s\'inscrivent avec votre code', en: 'They sign up with your code' },
      step3: { fr: 'Vous gagnez 5 recettes bonus chacun !', en: 'You both earn 5 bonus recipes!' },
      bonusRecipes: { fr: 'recettes bonus', en: 'bonus recipes' },
      perReferral: { fr: 'par parrainage', en: 'per referral' },
      invitedBy: { fr: 'Vous avez été invité par', en: 'You were invited by' },
      showMore: { fr: 'Voir plus', en: 'Show more' },
      showLess: { fr: 'Voir moins', en: 'Show less' },
      copied: { fr: 'Copié !', en: 'Copied!' },
    }
    return translations[key]?.[language as 'fr' | 'en'] || key
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden my-8 pointer-events-auto"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <Gift className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold">{t('title')}</h2>
                <p className="text-muted-foreground">{t('subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Referral Code Section */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      {t('yourCode')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data?.referralCode ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={data.referralCode}
                            readOnly
                            className="font-mono text-lg text-center bg-muted/50"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={copyCode}
                            className="shrink-0"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={copyReferralLink}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            {t('copyCode')}
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                            onClick={shareReferral}
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            {t('shareLink')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-primary/80"
                        onClick={generateCode}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {language === 'fr' ? 'Génération...' : 'Generating...'}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t('generateCode')}
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Stats Section */}
                {data && (
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="text-center">
                      <CardContent className="pt-4 pb-3">
                        <div className="text-2xl font-bold text-primary">
                          {data.stats.totalReferrals}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('totalReferrals')}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="pt-4 pb-3">
                        <div className="text-2xl font-bold text-green-500">
                          {data.stats.rewardsEarned * data.stats.rewardPerReferral}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('rewardsEarned')}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="pt-4 pb-3">
                        <div className="text-2xl font-bold text-amber-500">
                          {data.stats.pendingRewards}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('pendingRewards')}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Reward Info */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {data?.stats.rewardPerReferral || 5} {t('bonusRecipes')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('perReferral')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referred By */}
                {data?.referredBy && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('invitedBy')}: <span className="font-mono">{data.referredBy}</span>
                  </div>
                )}

                {/* How It Works */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('howItWorks')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">1</span>
                        <span className="text-sm">{t('step1')}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">2</span>
                        <span className="text-sm">{t('step2')}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">3</span>
                        <span className="text-sm">{t('step3')}</span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>

                {/* Referral History */}
                {data?.referrals && data.referrals.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowHistory(!showHistory)}
                      >
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          {t('history')}
                        </CardTitle>
                        {showHistory ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                    {showHistory && (
                      <CardContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {data.referrals.map((referral) => (
                            <div
                              key={referral.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                            >
                              <div>
                                <div className="font-medium text-sm">
                                  {referral.referredUserName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(referral.createdAt).toLocaleDateString(
                                    language === 'fr' ? 'fr-FR' : 'en-US',
                                    { day: 'numeric', month: 'short', year: 'numeric' }
                                  )}
                                </div>
                              </div>
                              <Badge variant={referral.rewardGranted ? 'default' : 'secondary'}>
                                {referral.rewardGranted
                                  ? (language === 'fr' ? 'Récompensé' : 'Rewarded')
                                  : (language === 'fr' ? 'En attente' : 'Pending')
                                }
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}

                {data?.referrals && data.referrals.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t('noReferrals')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
