'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  X, ChefHat, Heart, Sparkles, Check, Mail, Lock, 
  User, ArrowRight, Utensils, Clock, Zap
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useState } from 'react'

interface SignupInvitationModalProps {
  isOpen: boolean
  onClose: () => void
  onSignup: (email: string, password: string, name?: string) => Promise<void>
}

export function SignupInvitationModal({ isOpen, onClose, onSignup }: SignupInvitationModalProps) {
  const { language } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !email.includes('@')) {
      setError(language === 'fr' ? 'Email invalide' : 'Invalid email')
      return
    }
    
    if (!password || password.length < 6) {
      setError(language === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters')
      return
    }
    
    setIsLoading(true)
    try {
      await onSignup(email, password, name || undefined)
      onClose()
    } catch (err) {
      setError(language === 'fr' ? 'Erreur lors de l\'inscription' : 'Error during signup')
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    { icon: Utensils, text: language === 'fr' ? 'Accès illimité aux recettes' : 'Unlimited recipe access' },
    { icon: Heart, text: language === 'fr' ? 'Sauvegardez vos favoris' : 'Save your favorites' },
    { icon: Clock, text: language === 'fr' ? 'Planificateur de repas' : 'Meal planner' },
    { icon: Zap, text: language === 'fr' ? 'Génération IA illimitée' : 'Unlimited AI generation' },
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
        >
          {/* Header with warm gradient */}
          <div className="relative bg-gradient-to-br from-primary via-primary to-terracotta p-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="inline-flex p-4 rounded-2xl bg-white/20 mb-4"
            >
              <ChefHat className="w-12 h-12 text-white" />
            </motion.div>
            
            <h2 className="font-serif text-2xl font-bold text-white mb-2">
              {language === 'fr' ? 'Rejoignez Kuisto !' : 'Join Kuisto!'}
            </h2>
            <p className="text-white/80">
              {language === 'fr' 
                ? 'Créez votre compte gratuit et débloquez toutes les fonctionnalités'
                : 'Create your free account and unlock all features'}
            </p>
          </div>

          {/* Benefits */}
          <div className="px-6 pt-6">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border border-border/50"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-medium">{benefit.text}</span>
                  </motion.div>
                )
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={language === 'fr' ? 'Votre nom (optionnel)' : 'Your name (optional)'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={language === 'fr' ? 'Mot de passe (min. 6 caractères)' : 'Password (min. 6 characters)'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-12 text-base font-medium shadow-lg shadow-primary/20"
              >
                {isLoading ? (
                  language === 'fr' ? 'Création...' : 'Creating...'
                ) : (
                  <>
                    {language === 'fr' ? 'Créer mon compte gratuit' : 'Create my free account'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pb-6 text-center">
              <p className="text-xs text-muted-foreground">
                {language === 'fr' 
                  ? 'En vous inscrivant, vous acceptez nos conditions d\'utilisation'
                  : 'By signing up, you agree to our terms of service'}
              </p>
              
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success" />
                <span>{language === 'fr' ? '100% gratuit' : '100% free'}</span>
                <span className="text-border">•</span>
                <Check className="w-4 h-4 text-success" />
                <span>{language === 'fr' ? 'Sans engagement' : 'No commitment'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
