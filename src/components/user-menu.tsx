'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LogOut, User, Settings, ChefHat, Crown, History, Shield, Key } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useI18n } from '@/lib/i18n'
import { toast } from '@/hooks/use-toast'

interface UserMenuProps {
  onOpenPreferences: () => void
  onOpenHistory: () => void
  onOpenSubscription: () => void
  isAdmin?: boolean
  onAdminStatusChange?: () => void
}

export function UserMenu({ onOpenPreferences, onOpenHistory, onOpenSubscription, isAdmin, onAdminStatusChange }: UserMenuProps) {
  const { user, isAuthenticated, logout, plan } = useAuth()
  const { language } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [showAdminSetup, setShowAdminSetup] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isAuthenticated || !user) {
    return null
  }

  const initials = user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

  const handlePromoteToAdmin = async () => {
    if (!user?.email) return
    
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, secretKey: adminKey })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast({
          title: language === 'fr' ? 'Succès!' : 'Success!',
          description: language === 'fr' 
            ? 'Vous êtes maintenant administrateur. Reconnectez-vous.'
            : 'You are now an admin. Please re-login.',
        })
        setShowAdminSetup(false)
        setIsOpen(false)
        onAdminStatusChange?.()
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: data.error || (language === 'fr' ? 'Échec de la promotion' : 'Failed to promote'),
          variant: 'destructive'
        })
      }
    } catch (err) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Une erreur est survenue' : 'An error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanBadge = () => {
    switch (plan) {
      case 'premium':
        return (
          <Badge className="bg-gradient-to-r from-primary to-emerald-500 text-white text-[10px] px-1.5 py-0">
            <Crown className="w-3 h-3 mr-0.5" />
            Premium
          </Badge>
        )
      case 'pro':
        return (
          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] px-1.5 py-0">
            <Crown className="w-3 h-3 mr-0.5" />
            Pro
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Free
          </Badge>
        )
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <Avatar className="w-8 h-8 border-2 border-primary/20">
          <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{user.name || (language === 'fr' ? 'Utilisateur' : 'User')}</p>
                  {getPlanBadge()}
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    onOpenHistory()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <History className="w-4 h-4 text-primary" />
                  {language === 'fr' ? 'Historique des recettes' : 'Recipe history'}
                </button>

                <button
                  onClick={() => {
                    onOpenSubscription()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <Crown className="w-4 h-4 text-amber-500" />
                  {language === 'fr' ? 'Mon abonnement' : 'My subscription'}
                </button>

                <button
                  onClick={() => {
                    onOpenPreferences()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  {language === 'fr' ? 'Préférences' : 'Preferences'}
                </button>
              </div>

              <div className="p-1 border-t border-border">
                {/* Admin Setup Section */}
                {!isAdmin && (
                  <button
                    onClick={() => {
                      setShowAdminSetup(true)
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 transition-colors text-left"
                  >
                    <Shield className="w-4 h-4" />
                    {language === 'fr' ? 'Devenir Admin' : 'Become Admin'}
                  </button>
                )}
                
                <button
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  {language === 'fr' ? 'Déconnexion' : 'Sign out'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Setup Modal */}
      <AnimatePresence>
        {showAdminSetup && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowAdminSetup(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-card rounded-xl shadow-xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold">{language === 'fr' ? 'Devenir Administrateur' : 'Become Administrator'}</h3>
                  <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Clé d\'activation requise' : 'Activation key required'}</p>
                </div>
              </div>

              <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                {language === 'fr'
                  ? 'Contactez un administrateur existant pour obtenir une clé d\'activation.'
                  : 'Contact an existing administrator to get an activation key.'}
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder={language === 'fr' ? 'Clé secrète' : 'Secret key'}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAdminSetup(false)}
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={handlePromoteToAdmin}
                    disabled={isLoading || !adminKey}
                  >
                    {isLoading 
                      ? (language === 'fr' ? 'Chargement...' : 'Loading...')
                      : (language === 'fr' ? 'Promouvoir' : 'Promote')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
