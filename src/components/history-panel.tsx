'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, ChefHat, Star, Clock, Calendar } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

export interface HistoryRecipe {
  id: string
  recipeName: string
  recipeData: {
    name: string
    prepTime: string
    cookTime: string
    servings: string
    image?: string | null
    ingredients: string[]
    instructions: string[]
  }
  ingredients: string[]
  rating: number | null
  cookedAt: string
}

interface HistoryPanelProps {
  isOpen: boolean
  history: HistoryRecipe[]
  language: 'fr' | 'en'
  onClose: () => void
  onCookAgain: (recipe: HistoryRecipe) => void
  onRate: (historyId: string, rating: number) => void
}

export function HistoryPanel({
  isOpen,
  history,
  language,
  onClose,
  onCookAgain,
  onRate
}: HistoryPanelProps) {
  const { t } = useI18n()
  const dateLocale = language === 'fr' ? fr : enUS

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-b bg-gradient-to-r from-accent/5 via-muted/30 to-accent/5"
        >
          <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <ChefHat className="w-4 h-4 text-accent" />
                </div>
                {language === 'fr' ? 'Historique des recettes' : 'Recipe History'} ({history.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-muted">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <div className="p-4 rounded-2xl bg-muted/50 mb-3">
                  <ChefHat className="w-8 h-8 opacity-30" />
                </div>
                <p className="text-sm">
                  {language === 'fr' 
                    ? 'Aucune recette cuisinée pour le moment. Lancez-vous !'
                    : 'No recipes cooked yet. Get started!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {history.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow group">
                    {item.recipeData.image ? (
                      <div className="relative h-28 overflow-hidden">
                        <img 
                          src={item.recipeData.image} 
                          alt={item.recipeName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-2">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-xs font-medium">
                            <ChefHat className="w-3 h-3 text-accent" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 bg-gradient-to-br from-accent/10 via-muted to-primary/10 flex items-center justify-center">
                        <ChefHat className="w-8 h-8 text-accent/30" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm truncate text-foreground">{item.recipeName}</h4>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(item.cookedAt), { 
                            addSuffix: true, 
                            locale: dateLocale 
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.recipeData.prepTime}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => onRate(item.id, star)}
                            className="p-0.5 hover:scale-110 transition-transform"
                          >
                            <Star 
                              className={`w-4 h-4 ${
                                item.rating && star <= item.rating
                                  ? 'fill-accent text-accent'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 text-xs border-primary/20 text-primary hover:bg-primary/10"
                        onClick={() => onCookAgain(item)}
                      >
                        <ChefHat className="w-3 h-3 mr-1" />
                        {language === 'fr' ? 'Cuisiner à nouveau' : 'Cook again'}
                      </Button>
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
