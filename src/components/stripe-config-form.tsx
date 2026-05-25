'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, Check, AlertCircle, ExternalLink, Copy, 
  DollarSign, Calendar, Percent, Sparkles, Crown
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface StripeConfigFormProps {
  onComplete?: (config: StripeConfig) => void
}

export interface StripeConfig {
  stripeSecretKey: string
  stripePublishableKey: string
  stripeWebhookSecret: string
  pricePremiumMonthly: string
  pricePremiumYearly: string
  priceProMonthly: string
  priceProYearly: string
}

// Calcul des prix avec réduction 20%
export const PRICING = {
  premium: {
    monthly: 6.99,
    yearly: Number((6.99 * 12 * 0.80).toFixed(2)), // $67.10 avec 20% de réduction
    yearlyFull: 6.99 * 12, // $83.88 sans réduction
    discount: 20,
    savings: Number((6.99 * 12 * 0.20).toFixed(2)) // $16.78 économisés
  },
  pro: {
    monthly: 14.99,
    yearly: Number((14.99 * 12 * 0.80).toFixed(2)), // $143.90 avec 20% de réduction
    yearlyFull: 14.99 * 12, // $179.88 sans réduction
    discount: 20,
    savings: Number((14.99 * 12 * 0.20).toFixed(2)) // $35.98 économisés
  }
}

export function StripeConfigForm({ onComplete }: StripeConfigFormProps) {
  const [config, setConfig] = useState<StripeConfig>({
    stripeSecretKey: '',
    stripePublishableKey: '',
    stripeWebhookSecret: '',
    pricePremiumMonthly: '',
    pricePremiumYearly: '',
    priceProMonthly: '',
    priceProYearly: ''
  })
  const [isValidated, setIsValidated] = useState(false)

  const handleChange = (field: keyof StripeConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    setIsValidated(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copié !' })
  }

  const generateEnvContent = () => {
    return `# Stripe Configuration
STRIPE_SECRET_KEY=${config.stripeSecretKey}
STRIPE_PUBLISHABLE_KEY=${config.stripePublishableKey}
STRIPE_WEBHOOK_SECRET=${config.stripeWebhookSecret}

# Stripe Price IDs
STRIPE_PRICE_PREMIUM_MONTHLY=${config.pricePremiumMonthly}
STRIPE_PRICE_PREMIUM_YEARLY=${config.pricePremiumYearly}
STRIPE_PRICE_PRO_MONTHLY=${config.priceProMonthly}
STRIPE_PRICE_PRO_YEARLY=${config.priceProYearly}`
  }

  const handleValidate = () => {
    const required = [
      'stripeSecretKey',
      'stripePublishableKey',
      'pricePremiumMonthly',
      'pricePremiumYearly',
      'priceProMonthly',
      'priceProYearly'
    ]
    
    const missing = required.filter(field => !config[field as keyof StripeConfig])
    
    if (missing.length > 0) {
      toast({
        title: 'Champs manquants',
        description: `Veuillez remplir: ${missing.join(', ')}`,
        variant: 'destructive'
      })
      return
    }

    setIsValidated(true)
    onComplete?.(config)
    toast({
      title: 'Configuration validée !',
      description: 'Vous pouvez maintenant copier la configuration .env'
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white mb-4">
          <CreditCard className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold">Configuration Stripe</h1>
        <p className="text-muted-foreground">
          Intégrez vos produits Stripe dans Kuisto
        </p>
      </div>

      {/* Pricing Summary */}
      <Card className="border-2 border-violet-200 dark:border-violet-800">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950">
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-violet-500" />
            Récapitulatif des prix
          </CardTitle>
          <CardDescription>
            Calcul automatique avec réduction de 20% sur l'annuel
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Premium */}
            <div className="p-4 rounded-xl border bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-lg">Premium</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Mensuel
                  </span>
                  <span className="font-bold text-xl">${PRICING.premium.monthly} CA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Annuel
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-xl">${PRICING.premium.yearly} CA</span>
                    <Badge variant="secondary" className="ml-2 text-green-600">
                      -{PRICING.premium.discount}%
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Économie de ${PRICING.premium.savings} CA/an
                </p>
              </div>
            </div>

            {/* Pro */}
            <div className="p-4 rounded-xl border bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-lg">Pro</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Mensuel
                  </span>
                  <span className="font-bold text-xl">${PRICING.pro.monthly} CA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Annuel
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-xl">${PRICING.pro.yearly} CA</span>
                    <Badge variant="secondary" className="ml-2 text-green-600">
                      -{PRICING.pro.discount}%
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Économie de ${PRICING.pro.savings} CA/an
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center font-bold text-violet-600">
              1
            </div>
            <div>
              <CardTitle>Clés API Stripe</CardTitle>
              <CardDescription>
                Trouvez ces clés dans votre{' '}
                <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener" className="text-violet-500 hover:underline inline-flex items-center gap-1">
                  Dashboard Stripe <ExternalLink className="w-3 h-3" />
                </a>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Clé secrète (STRIPE_SECRET_KEY)
            </label>
            <Input
              type="password"
              placeholder="sk_test_xxx ou sk_live_xxx"
              value={config.stripeSecretKey}
              onChange={(e) => handleChange('stripeSecretKey', e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Commence par sk_test_ (test) ou sk_live_ (production)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Clé publique (STRIPE_PUBLISHABLE_KEY)
            </label>
            <Input
              placeholder="pk_test_xxx ou pk_live_xxx"
              value={config.stripePublishableKey}
              onChange={(e) => handleChange('stripePublishableKey', e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Commence par pk_test_ (test) ou pk_live_ (production)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Secret Webhook (STRIPE_WEBHOOK_SECRET) - Optionnel
            </label>
            <Input
              type="password"
              placeholder="whsec_xxx"
              value={config.stripeWebhookSecret}
              onChange={(e) => handleChange('stripeWebhookSecret', e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Configuré dans Dashboard Stripe → Developers → Webhooks
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Price IDs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center font-bold text-violet-600">
              2
            </div>
            <div>
              <CardTitle>Price IDs Stripe</CardTitle>
              <CardDescription>
                Copiez les Price IDs depuis vos produits créés dans Stripe
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Premium Prices */}
          <div className="p-4 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="font-bold">Premium</span>
              <Badge variant="outline">${PRICING.premium.monthly}/mois ou ${PRICING.premium.yearly}/an</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price ID Mensuel (${PRICING.premium.monthly} CA)
                </label>
                <Input
                  placeholder="price_xxx"
                  value={config.pricePremiumMonthly}
                  onChange={(e) => handleChange('pricePremiumMonthly', e.target.value)}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price ID Annuel (${PRICING.premium.yearly} CA)
                </label>
                <Input
                  placeholder="price_xxx"
                  value={config.pricePremiumYearly}
                  onChange={(e) => handleChange('pricePremiumYearly', e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          {/* Pro Prices */}
          <div className="p-4 rounded-lg border bg-orange-50/50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-orange-500" />
              <span className="font-bold">Pro</span>
              <Badge variant="outline">${PRICING.pro.monthly}/mois ou ${PRICING.pro.yearly}/an</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price ID Mensuel (${PRICING.pro.monthly} CA)
                </label>
                <Input
                  placeholder="price_xxx"
                  value={config.priceProMonthly}
                  onChange={(e) => handleChange('priceProMonthly', e.target.value)}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price ID Annuel (${PRICING.pro.yearly} CA)
                </label>
                <Input
                  placeholder="price_xxx"
                  value={config.priceProYearly}
                  onChange={(e) => handleChange('priceProYearly', e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Generate Config */}
      <Card className={isValidated ? 'border-green-500' : ''}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              isValidated 
                ? 'bg-green-100 dark:bg-green-900 text-green-600' 
                : 'bg-violet-100 dark:bg-violet-900 text-violet-600'
            }`}>
              {isValidated ? <Check className="w-5 h-5" /> : '3'}
            </div>
            <div>
              <CardTitle>Configuration finale</CardTitle>
              <CardDescription>
                Validez et copiez la configuration pour votre fichier .env
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleValidate}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            size="lg"
          >
            {isValidated ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Configuration validée
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5 mr-2" />
                Valider la configuration
              </>
            )}
          </Button>

          {isValidated && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contenu du fichier .env :</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(generateEnvContent())}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copier
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-sm overflow-x-auto">
                {generateEnvContent()}
              </pre>

              <div className="flex items-start gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">
                <Check className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Configuration prête !</p>
                  <p>Copiez ce contenu dans votre fichier <code className="bg-green-100 dark:bg-green-900 px-1 rounded">.env</code> à la racine du projet Kuisto.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            Instructions Stripe
          </h3>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold shrink-0">1</span>
              <span>Créez un compte sur <a href="https://stripe.com" target="_blank" className="text-blue-500 hover:underline">stripe.com</a></span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold shrink-0">2</span>
              <span>Dans <strong>Products</strong>, créez "Kuisto Premium" avec un prix mensuel de $6.99 CA et annuel de $67.10 CA</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold shrink-0">3</span>
              <span>Créez "Kuisto Pro" avec un prix mensuel de $14.99 CA et annuel de $143.90 CA</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold shrink-0">4</span>
              <span>Copiez les <strong>Price IDs</strong> (commençant par price_) de chaque prix créé</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold shrink-0">5</span>
              <span>Collez les clés et Price IDs dans ce formulaire</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
