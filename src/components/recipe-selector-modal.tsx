'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  X, Search, Heart, Clock, ChefHat, Star, 
  UtensilsCrossed, Sparkles, Calendar
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Recipe } from './recipe-list'

interface RecipeSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (recipe: Recipe) => void
  selectedDate: string
  selectedMealType: string
}

export function RecipeSelectorModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedDate, 
  selectedMealType 
}: RecipeSelectorModalProps) {
  const { t, language } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<Array<{ recipeName: string; recipeData: string }>>([])
  const [history, setHistory] = useState<Array<{ recipeName: string; recipeData: string; rating?: number }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('favorites')

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [favRes, histRes] = await Promise.all([
        fetch('/api/favorites'),
        fetch('/api/history')
      ])
      const favData = await favRes.json()
      const histData = await histRes.json()
      setFavorites(favData.favorites || [])
      setHistory(histData.history || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const parseRecipe = (recipeData: string): Recipe | null => {
    try {
      return JSON.parse(recipeData)
    } catch {
      return null
    }
  }

  const mealTypeLabels = {
    breakfast: language === 'fr' ? 'Petit-déjeuner' : 'Breakfast',
    lunch: language === 'fr' ? 'Déjeuner' : 'Lunch',
    dinner: language === 'fr' ? 'Dîner' : 'Dinner',
    snack: language === 'fr' ? 'Collation' : 'Snack'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const filteredFavorites = favorites.filter(f => 
    f.recipeName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredHistory = history.filter(h => 
    h.recipeName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (recipe: Recipe) => {
    onSelect(recipe)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-3xl max-h-[85vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold">
                  {language === 'fr' ? 'Choisir une recette' : 'Select a Recipe'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mealTypeLabels[selectedMealType as keyof typeof mealTypeLabels]} • {formatDate(selectedDate)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher une recette...' : 'Search for a recipe...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="favorites" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    {language === 'fr' ? 'Favoris' : 'Favorites'}
                    <Badge variant="secondary" className="ml-1">{filteredFavorites.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {language === 'fr' ? 'Historique' : 'History'}
                    <Badge variant="secondary" className="ml-1">{filteredHistory.length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="favorites" className="flex-1 overflow-auto p-4 mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
                    />
                  </div>
                ) : filteredFavorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'fr' 
                        ? 'Aucune recette favorite trouvée' 
                        : 'No favorite recipes found'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredFavorites.map((fav, index) => {
                      const recipe = parseRecipe(fav.recipeData)
                      if (!recipe) return null
                      
                      return (
                        <motion.div
                          key={fav.recipeName + index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                            onClick={() => handleSelect(recipe)}
                          >
                            <div className="flex items-start gap-4">
                              {recipe.image ? (
                                <img 
                                  src={recipe.image} 
                                  alt={recipe.name}
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                                  <ChefHat className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{recipe.name}</h3>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  {recipe.prepTime && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {recipe.prepTime}
                                    </span>
                                  )}
                                  {recipe.servings && (
                                    <span className="flex items-center gap-1">
                                      <UtensilsCrossed className="w-3 h-3" />
                                      {recipe.servings}
                                    </span>
                                  )}
                                </div>
                                {recipe.ingredients && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {recipe.ingredients.slice(0, 4).map((ing: string, i: number) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {ing}
                                      </Badge>
                                    ))}
                                    {recipe.ingredients.length > 4 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{recipe.ingredients.length - 4}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              <Heart className="w-5 h-5 text-coral fill-coral" />
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-auto p-4 mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
                    />
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'fr' 
                        ? 'Aucune recette dans l\'historique' 
                        : 'No recipes in history'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredHistory.map((hist, index) => {
                      const recipe = parseRecipe(hist.recipeData)
                      if (!recipe) return null
                      
                      return (
                        <motion.div
                          key={hist.recipeName + index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                            onClick={() => handleSelect(recipe)}
                          >
                            <div className="flex items-start gap-4">
                              {recipe.image ? (
                                <img 
                                  src={recipe.image} 
                                  alt={recipe.name}
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                                  <ChefHat className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{recipe.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                  {hist.rating && (
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-3 h-3 ${i < hist.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                  {recipe.prepTime && (
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {recipe.prepTime}
                                    </span>
                                  )}
                                </div>
                                {recipe.ingredients && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {recipe.ingredients.slice(0, 4).map((ing: string, i: number) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {ing}
                                      </Badge>
                                    ))}
                                    {recipe.ingredients.length > 4 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{recipe.ingredients.length - 4}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              <Button variant="ghost" size="sm" className="shrink-0">
                                <Sparkles className="w-4 h-4 mr-1" />
                                {language === 'fr' ? 'Ajouter' : 'Add'}
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
