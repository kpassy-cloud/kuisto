'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  X, Crown, Check, Sparkles, CreditCard, Calendar, 
  ChefHat, Clock, Heart, ShoppingCart, Zap, Star,
  ChevronRight, Shield, Gift, ExternalLink
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface SubscriptionDashboardProps {
  isOpen: boolean
  onClose: () => void
}

interface SubscriptionData {
  plan: string
  status: string
  recipesGenerated: number
  mealPlansCreated: number
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

const plans = [
  {
    id: 'free',
    name: { fr: 'Gratuit', en: 'Free' },
    price: { fr: '$0', en: '$0' },
    period: { fr: 'pour toujours', en: 'forever' },
    features: [
      { fr: '5 recettes par jour', en: '5 recipes per day' },
      { fr: 'Planificateur basique', en: 'Basic planner' },
      { fr: 'Liste de courses', en: 'Shopping list' },
      { fr: 'Mode Cuistot', en: 'Chef Mode' },
    ],
    limits: {
      recipesPerDay: 5,
      mealPlansPerWeek: 7,
    },
    color: 'from-gray-400 to-gray-500',
    popular: false,
  },
  {
    id: 'premium',
    name: { fr: 'Premium', en: 'Premium' },
    priceMonthly: 6.99,
    priceYearly: 69.99,
    price: { fr: '$6.99 CA', en: '$6.99 CA' },
    period: { fr: '/mois', en: '/month' },
    features: [
      { fr: '25 recettes par jour', en: '25 recipes per day' },
      { fr: 'Planificateur avancé', en: 'Advanced planner' },
      { fr: 'Sans publicités', en: 'Ad-free experience' },
      { fr: 'Filtres avancés', en: 'Advanced filters' },
      { fr: 'Export PDF', en: 'PDF export' },
      { fr: 'Support prioritaire', en: 'Priority support' },
    ],
    limits: {
      recipesPerDay: 25,
      mealPlansPerWeek: -1,
    },
    color: 'from-primary to-emerald-500',
    popular: true,
  },
  {
    id: 'pro',
    name: { fr: 'Pro', en: 'Pro' },
    priceMonthly: 14.99,
    priceYearly: 149.99,
    price: { fr: '$14.99 CA', en: '$14.99 CA' },
    period: { fr: '/mois', en: '/month' },
    features: [
      { fr: 'Recettes illimitées', en: 'Unlimited recipes' },
      { fr: 'Tout de Premium', en: 'Everything in Premium' },
      { fr: 'API Access', en: 'API Access' },
      { fr: 'Recettes exclusives', en: 'Exclusive recipes' },
      { fr: 'Statistiques avancées', en: 'Advanced analytics' },
      { fr: 'Support VIP', en: 'VIP support' },
    ],
    limits: {
      recipesPerDay: -1,
      mealPlansPerWeek: -1,
    },
    color: 'from-amber-400 to-orange-500',
    popular: false,
  },
]

export function SubscriptionDashboard({ isOpen, onClose }: SubscriptionDashboardProps) {
  const { t, language } = useI18n()
  const { user, plan: currentPlan, refreshUser } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCheckout, setShowCheckout] = useState<string | null>(null)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    if (isOpen && user) {
      loadSubscription()
    }
  }, [isOpen, user])

  // Check for success/cancel from Stripe redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const subscriptionStatus = urlParams.get('subscription')
    
    if (subscriptionStatus === 'success') {
      toast({
        title: language === 'fr' ? 'Paiement réussi !' : 'Payment successful!',
        description: language === 'fr'
          ? 'Votre abonnement est maintenant actif'
          : 'Your subscription is now active'
      })
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
      loadSubscription()
      refreshUser?.()
    } else if (subscriptionStatus === 'canceled') {
      toast({
        title: language === 'fr' ? 'Paiement annulé' : 'Payment canceled',
        description: language === 'fr'
          ? 'Le paiement a été annulé'
          : 'The payment was canceled',
        variant: 'destructive'
      })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [language])

  const loadSubscription = async () => {
    try {
      const response = await fetch('/api/subscription')
      const data = await response.json()
      setSubscription(data.subscription)
    } catch (err) {
      console.error('Failed to load subscription:', err)
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      toast({
        title: language === 'fr' ? 'Connexion requise' : 'Login required',
        description: language === 'fr' 
          ? 'Veuillez vous connecter pour souscrire à un abonnement'
          : 'Please sign in to subscribe',
        variant: 'destructive'
      })
      return
    }

    // Free plan - just update directly
    if (planId === 'free') {
      setIsLoading(true)
      try {
        const response = await fetch('/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: 'free' })
        })

        if (response.ok) {
          toast({
            title: language === 'fr' ? 'Plan gratuit activé' : 'Free plan activated'
          })
          loadSubscription()
          refreshUser?.()
        }
      } catch (err) {
        console.error('Failed to update plan:', err)
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Premium/Pro - redirect to Stripe Checkout
    setShowCheckout(planId)
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: planId, 
          interval: billingInterval 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: err.message || (language === 'fr'
          ? 'Une erreur est survenue lors du paiement'
          : 'An error occurred during payment'),
        variant: 'destructive'
      })
      setShowCheckout(null)
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Portal failed')
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: err.message || (language === 'fr'
          ? 'Impossible d\'ouvrir le portail client'
          : 'Could not open customer portal'),
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    // For Stripe subscriptions, redirect to portal
    if (subscription?.stripeSubscriptionId) {
      handleManageSubscription()
      return
    }

    // For mock subscriptions
    try {
      const response = await fetch('/api/subscription', {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Abonnement annulé' : 'Subscription cancelled',
          description: language === 'fr'
            ? 'Votre abonnement prendra fin à la prochaine période'
            : 'Your subscription will end at the next period'
        })
        loadSubscription()
      }
    } catch (err) {
      console.error('Failed to cancel subscription:', err)
    }
  }

  const getCurrentPlan = () => {
    return plans.find(p => p.id === (subscription?.plan || 'free')) || plans[0]
  }

  const getUsagePercentage = () => {
    if (!subscription) return 0
    const freePlan = plans[0]
    return Math.min(100, (subscription.recipesGenerated / freePlan.limits.recipesPerDay) * 100)
  }

  const getPriceDisplay = (plan: typeof plans[0]) => {
    if (plan.id === 'free') return plan.price[language as 'fr' | 'en']
    
    const price = billingInterval === 'monthly' ? plan.priceMonthly : plan.priceYearly
    const suffix = billingInterval === 'yearly' 
      ? (language === 'fr' ? '/an' : '/year')
      : (language === 'fr' ? '/mois' : '/month')
    
    return `$${price?.toFixed(2)} CA`
  }

  const getPricePeriod = (plan: typeof plans[0]) => {
    if (plan.id === 'free') return plan.period[language as 'fr' | 'en']
    return billingInterval === 'yearly' 
      ? (language === 'fr' ? '/an' : '/year')
      : (language === 'fr' ? '/mois' : '/month')
  }

  if (!isOpen) return null

  const currentPlanData = getCurrentPlan()

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
          className="w-full max-w-4xl bg-card rounded-2xl shadow-2xl overflow-hidden my-8 pointer-events-auto"
        >
          {/* Header */}
          <div className={`relative bg-gradient-to-r ${currentPlanData.color} p-6 text-white`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/20">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold">
                  {language === 'fr' ? 'Gestion de l\'abonnement' : 'Subscription Management'}
                </h2>
                <p className="text-white/80">
                  {language === 'fr' 
                    ? `Plan actuel: ${currentPlanData.name[language as 'fr' | 'en']}`
                    : `Current plan: ${currentPlanData.name[language as 'fr' | 'en']}`}
                </p>
              </div>
            </div>
          </div>

          {/* Current Usage (Free tier) */}
          {(!subscription || subscription.plan === 'free') && (
            <div className="p-6 border-b bg-muted/30">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                {language === 'fr' ? 'Utilisation aujourd\'hui' : 'Today\'s usage'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {language === 'fr' ? 'Recettes générées' : 'Recipes generated'}
                    </span>
                    <Badge variant="secondary">
                      {subscription?.recipesGenerated || 0}/5
                    </Badge>
                  </div>
                  <Progress value={getUsagePercentage()} className="h-2" />
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {language === 'fr' ? 'Repas planifiés' : 'Meals planned'}
                    </span>
                    <Badge variant="secondary">
                      {subscription?.mealPlansCreated || 0}/7
                    </Badge>
                  </div>
                  <Progress value={((subscription?.mealPlansCreated || 0) / 7) * 100} className="h-2" />
                </div>
              </div>
            </div>
          )}

          {/* Billing Toggle */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg w-fit mx-auto">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingInterval === 'monthly'
                    ? 'bg-card shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {language === 'fr' ? 'Mensuel' : 'Monthly'}
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingInterval === 'yearly'
                    ? 'bg-card shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {language === 'fr' ? 'Annuel' : 'Yearly'}
                <Badge variant="secondary" className="ml-2 text-xs">
                  -20%
                </Badge>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className="p-6">
            <h3 className="font-medium mb-4">
              {language === 'fr' ? 'Choisir un plan' : 'Choose a plan'}
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isCurrentPlan = (subscription?.plan || 'free') === plan.id
                
                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative rounded-xl border-2 transition-all ${
                      plan.popular 
                        ? 'border-primary shadow-lg' 
                        : 'border-border hover:border-primary/50'
                    } ${isCurrentPlan ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          {language === 'fr' ? 'Populaire' : 'Popular'}
                        </Badge>
                      </div>
                    )}
                    
                    <div className={`p-4 bg-gradient-to-r ${plan.color} rounded-t-lg text-white`}>
                      <h4 className="font-bold text-lg">{plan.name[language as 'fr' | 'en']}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{getPriceDisplay(plan)}</span>
                        <span className="text-sm opacity-80">{getPricePeriod(plan)}</span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                            {feature[language as 'fr' | 'en']}
                          </li>
                        ))}
                      </ul>
                      
                      {isCurrentPlan ? (
                        <Button variant="outline" className="w-full" disabled>
                          <Check className="w-4 h-4 mr-2" />
                          {language === 'fr' ? 'Plan actuel' : 'Current plan'}
                        </Button>
                      ) : (
                        <Button 
                          className={`w-full bg-gradient-to-r ${plan.color} text-white hover:opacity-90`}
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={isLoading}
                        >
                          {isLoading && showCheckout === plan.id ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                              />
                              {language === 'fr' ? 'Redirection...' : 'Redirecting...'}
                            </>
                          ) : (
                            <>
                              {plan.id === 'free' 
                                ? (language === 'fr' ? 'Réinitialiser' : 'Reset')
                                : (language === 'fr' ? 'Passer à ' : 'Upgrade to ') + plan.name[language as 'fr' | 'en']
                              }
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Payment Info (for premium/pro users) */}
          {subscription && subscription.plan !== 'free' && (
            <div className="p-6 border-t bg-muted/30">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                {language === 'fr' ? 'Informations de facturation' : 'Billing information'}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fr' ? 'Prochain paiement' : 'Next payment'}
                      </p>
                      <p className="font-medium">
                        {subscription.currentPeriodEnd 
                          ? new Date(subscription.currentPeriodEnd).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : '-'
                        }
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-card border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fr' ? 'Statut' : 'Status'}
                      </p>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        {subscription.status === 'active' 
                          ? (language === 'fr' ? 'Actif' : 'Active')
                          : subscription.status
                        }
                      </Badge>
                    </div>
                    <Shield className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {subscription.stripeSubscriptionId && (
                  <Button 
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={isLoading}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Gérer l\'abonnement' : 'Manage subscription'}
                  </Button>
                )}
                
                {!subscription.cancelAtPeriodEnd && (
                  <Button 
                    variant="outline" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    {language === 'fr' ? 'Annuler l\'abonnement' : 'Cancel subscription'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Features Overview */}
          <div className="p-6 border-t">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              {language === 'fr' ? 'Pourquoi passer Premium ?' : 'Why go Premium?'}
            </h3>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium text-sm">
                  {language === 'fr' ? 'Plus de recettes' : 'More recipes'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'fr' ? '25 recettes par jour ou illimité' : '25 recipes/day or unlimited'}
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium text-sm">
                  {language === 'fr' ? 'Sans publicités' : 'Ad-free'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'fr' ? 'Expérience fluide et rapide' : 'Smooth and fast experience'}
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium text-sm">
                  {language === 'fr' ? 'Filtres avancés' : 'Advanced filters'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'fr' ? 'Trouvez exactement ce que vous cherchez' : 'Find exactly what you need'}
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium text-sm">
                  {language === 'fr' ? 'Export PDF' : 'PDF Export'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'fr' ? 'Exportez et partagez vos recettes' : 'Export and share your recipes'}
                </p>
              </div>
            </div>
          </div>

          {/* Stripe Notice */}
          <div className="p-4 bg-muted/50 text-center text-xs text-muted-foreground border-t">
            <Shield className="w-4 h-4 inline mr-1" />
            {language === 'fr' 
              ? 'Paiements sécurisés par Stripe. Annulation à tout moment.'
              : 'Secure payments by Stripe. Cancel anytime.'}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
