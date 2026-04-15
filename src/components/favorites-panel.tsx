'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Heart, Clock, Users } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export interface FavoriteRecipe {
  id: string
  recipeName: string
  recipeData: {
    name: string
    prepTime: string
    servings: string
    image?: string | null
  }
  createdAt: string
}

interface FavoritesPanelProps {
  isOpen: boolean
  favorites: FavoriteRecipe[]
  onClose: () => void
}

export function FavoritesPanel({
  isOpen,
  favorites,
  onClose
}: FavoritesPanelProps) {
  const { t } = useI18n()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-b bg-gradient-to-r from-coral/5 via-primary/5 to-coral/5"
        >
          <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-coral/10">
                  <Heart className="w-4 h-4 text-coral fill-coral" />
                </div>
                {t('favorites')} ({favorites.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-muted">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <div className="p-4 rounded-2xl bg-muted/50 mb-3">
                  <Heart className="w-8 h-8 opacity-30" />
                </div>
                <p className="text-sm">{t('noFavorites')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {favorites.map((fav) => (
                  <Card key={fav.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow group">
                    {fav.recipeData.image ? (
                      <div className="relative h-28 overflow-hidden">
                        <img 
                          src={fav.recipeData.image} 
                          alt={fav.recipeName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-2">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-xs font-medium">
                            <Heart className="w-3 h-3 text-coral fill-coral" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 bg-gradient-to-br from-primary/10 via-muted to-coral/10 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-coral/30" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm truncate text-foreground">{fav.recipeName}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {fav.recipeData.prepTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {fav.recipeData.servings}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
