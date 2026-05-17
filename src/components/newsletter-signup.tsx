'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface NewsletterSignupProps {
  source?: string
  variant?: 'footer' | 'inline' | 'modal'
  className?: string
}

export function NewsletterSignup({ 
  source = 'footer', 
  variant = 'footer',
  className = '' 
}: NewsletterSignupProps) {
  const { t, language } = useI18n()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage(language === 'fr' ? 'Veuillez entrer un email valide' : 'Please enter a valid email')
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(language === 'fr' ? 'Merci pour votre inscription !' : 'Thanks for subscribing!')
        setEmail('')
      } else {
        setStatus('error')
        if (data.alreadySubscribed) {
          setMessage(language === 'fr' ? 'Cet email est déjà inscrit' : 'This email is already subscribed')
        } else {
          setMessage(data.error || (language === 'fr' ? 'Une erreur est survenue' : 'An error occurred'))
        }
      }
    } catch {
      setStatus('error')
      setMessage(language === 'fr' ? 'Erreur de connexion' : 'Connection error')
    }
  }

  // Footer variant - compact horizontal layout (optimized for dark backgrounds)
  if (variant === 'footer') {
    return (
      <div className={`${className}`}>
        <p className="text-xs text-zinc-400 mb-2 font-medium">{t('newsletterTitle')}</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 h-9 text-sm bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          <Button 
            type="submit" 
            size="sm"
            disabled={status === 'loading' || status === 'success'}
            className="h-9 px-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg shadow-primary/25"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              t('subscribeButton')
            )}
          </Button>
        </form>
        
        <AnimatePresence mode="wait">
          {status === 'success' && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-green-400 mt-2 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              {message}
            </motion.p>
          )}
          {status === 'error' && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-red-400 mt-2 flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {message}
            </motion.p>
          )}
        </AnimatePresence>
        
        <p className="text-[10px] text-zinc-500 mt-2">
          {t('privacyNote')}
        </p>
      </div>
    )
  }

  // Inline variant - vertical layout with title
  if (variant === 'inline') {
    return (
      <div className={`bg-muted/30 rounded-xl p-4 ${className}`}>
        <h3 className="font-semibold text-foreground mb-1">{t('newsletterTitle')}</h3>
        <p className="text-sm text-muted-foreground mb-3">{t('newsletterDescription')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            disabled={status === 'loading' || status === 'success'}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {language === 'fr' ? 'Inscription...' : 'Subscribing...'}
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('subscribeSuccess')}
              </>
            ) : (
              t('subscribeButton')
            )}
          </Button>
        </form>
        
        <AnimatePresence mode="wait">
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-3 bg-success/10 border border-success/20 rounded-lg"
            >
              <p className="text-sm text-success flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {message}
              </p>
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-xs text-muted-foreground mt-3">
          {t('privacyNote')}
        </p>
      </div>
    )
  }

  // Modal variant - compact with focus
  return (
    <div className={`${className}`}>
      <p className="text-sm text-muted-foreground mb-3">{t('newsletterDescription')}</p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
            disabled={status === 'loading' || status === 'success'}
          />
        </div>
        <Button 
          type="submit" 
          disabled={status === 'loading' || status === 'success'}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            t('subscribeButton')
          )}
        </Button>
      </form>
      
      <AnimatePresence mode="wait">
        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-success mt-2 flex items-center gap-1"
          >
            <CheckCircle className="w-4 h-4" />
            {message}
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-destructive mt-2 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
