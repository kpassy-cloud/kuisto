'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Mail, Loader2, User, ChefHat } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/hooks/useAuth'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { t } = useI18n()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    const result = await login(email)
    
    if (result?.error) {
      setError('Erreur de connexion')
    } else {
      onClose()
    }
  }

  const handleDemoLogin = async () => {
    await login('demo@akanut.app')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-6 text-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg mx-auto mb-4">
                <ChefHat className="w-8 h-8" />
              </div>
              
              <h2 className="font-serif text-2xl font-bold">Bienvenue sur Kuisto</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Connectez-vous pour sauvegarder vos recettes
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full"
              >
                <User className="w-4 h-4 mr-2" />
                Essayer en mode démo
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                En vous connectant, vous acceptez nos conditions d'utilisation.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
