'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  X, Clock, Users, ChefHat, Heart, Share2, 
  ShoppingCart, Printer, Star, Copy, Check,
  Flame, Leaf, Wheat, MilkOff, UtensilsCrossed,
  ChevronRight, Timer, Calculator, ArrowRightLeft
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { toast } from '@/hooks/use-toast'
import { StarRating, CompactRating } from './star-rating'
import { PortionCalculator } from './portion-calculator'
import { IngredientSubstitutions } from './ingredient-substitutions'
import type { Recipe } from './recipe-list'

interface RecipeDetailModalProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: (recipe: Recipe) => void
  onAddToShoppingList: (recipeName: string, ingredients: string[]) => void
  onStartCooking: (recipe: Recipe) => void
  onRate?: (rating: number) => void
  currentRating?: number
}

// Helper to parse servings number
function parseServings(servings: string): number {
  const match = servings.match(/(\d+)/)
  return match ? parseInt(match[1]) : 4
}

export function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToShoppingList,
  onStartCooking,
  onRate,
  currentRating
}: RecipeDetailModalProps) {
  const { t, language } = useI18n()
  const [copied, setCopied] = useState(false)
  const [userRating, setUserRating] = useState(currentRating || 0)
  const [activeTab, setActiveTab] = useState('details')

  // Generate shareable URL
  const getShareableUrl = () => {
    if (!recipe) return ''
    const baseUrl = window.location.origin
    const recipeSlug = recipe.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    return `${baseUrl}/?recipe=${encodeURIComponent(recipeSlug)}&name=${encodeURIComponent(recipe.name)}`
  }

  const handleShare = async () => {
    const url = getShareableUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: language === 'fr' ? 'Lien copié!' : 'Link copied!',
        description: language === 'fr' 
          ? 'Le lien a été copié dans le presse-papier' 
          : 'The link has been copied to your clipboard'
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Impossible de copier le lien' 
          : 'Could not copy the link',
        variant: 'destructive'
      })
    }
  }

  const handlePrint = () => {
    if (!recipe) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${recipe.name}</title>
          <style>
            body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; }
            h1 { color: #2d5a3d; border-bottom: 2px solid #2d5a3d; padding-bottom: 10px; }
            .meta { color: #666; margin-bottom: 20px; }
            .meta span { margin-right: 20px; }
            h2 { color: #2d5a3d; margin-top: 30px; }
            ul { line-height: 1.8; }
            ol { line-height: 2; }
            li { margin-bottom: 8px; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${recipe.name}</h1>
          <div class="meta">
            ${recipe.prepTime ? `<span>⏱️ ${recipe.prepTime}</span>` : ''}
            ${recipe.cookTime ? `<span>🔥 ${recipe.cookTime}</span>` : ''}
            ${recipe.servings ? `<span>👥 ${recipe.servings}</span>` : ''}
          </div>
          ${recipe.ingredients ? `
            <h2>${language === 'fr' ? 'Ingrédients' : 'Ingredients'}</h2>
            <ul>
              ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
            </ul>
          ` : ''}
          ${recipe.instructions ? `
            <h2>${language === 'fr' ? 'Instructions' : 'Instructions'}</h2>
            <ol>
              ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
            </ol>
          ` : ''}
          <div class="footer">
            ${language === 'fr' ? 'Imprimé depuis Kuisto' : 'Printed from Kuisto'} - ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleRatingChange = (rating: number) => {
    setUserRating(rating)
    onRate?.(rating)
    toast({
      title: language === 'fr' ? 'Note enregistrée' : 'Rating saved',
      description: rating === 0 
        ? (language === 'fr' ? 'Note supprimée' : 'Rating removed')
        : `${rating} ${language === 'fr' ? 'étoiles' : 'stars'}`
    })
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'facile':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'medium':
      case 'moyen':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'hard':
      case 'difficile':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (!recipe) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Hero Image */}
            {recipe.image && (
              <div className="relative h-48 sm:h-64 overflow-hidden">
                <img 
                  src={recipe.image} 
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
                    {recipe.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    {recipe.prepTime && (
                      <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        {recipe.prepTime}
                      </Badge>
                    )}
                    {recipe.servings && (
                      <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                        <Users className="w-3 h-3 mr-1" />
                        {recipe.servings}
                      </Badge>
                    )}
                    {recipe.difficulty && (
                      <Badge className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                    )}
                    {recipe.isDemo && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                        ✨ {language === 'fr' ? 'Démo' : 'Demo'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Header (if no image) */}
            {!recipe.image && (
              <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
                <h1 className="font-serif text-2xl font-bold mb-2">{recipe.name}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  {recipe.prepTime && (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {recipe.prepTime}
                    </Badge>
                  )}
                  {recipe.servings && (
                    <Badge variant="secondary">
                      <Users className="w-3 h-3 mr-1" />
                      {recipe.servings}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Actions bar */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Button
                  variant={isFavorite ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToggleFavorite(recipe)}
                  className={isFavorite ? 'bg-coral hover:bg-coral/90 text-white' : ''}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite 
                    ? (language === 'fr' ? 'Favori' : 'Favorite')
                    : (language === 'fr' ? 'Ajouter' : 'Add')
                  }
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleShare}>
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Share2 className="w-4 h-4 mr-1" />}
                  {language === 'fr' ? 'Partager' : 'Share'}
                </Button>
                
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-1" />
                  {language === 'fr' ? 'Imprimer' : 'Print'}
                </Button>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {language === 'fr' ? 'Note:' : 'Rate:'}
                </span>
                <StarRating 
                  rating={userRating}
                  interactive={!!onRate}
                  onChange={handleRatingChange}
                  size="md"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start rounded-none bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="details" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <ChefHat className="w-4 h-4 mr-1" />
                    {language === 'fr' ? 'Détails' : 'Details'}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="portions" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <Calculator className="w-4 h-4 mr-1" />
                    {language === 'fr' ? 'Portions' : 'Portions'}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="substitutions" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-1" />
                    {language === 'fr' ? 'Substitutions' : 'Substitutions'}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} className="h-full">
                <TabsContent value="details" className="h-full m-0">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      {/* Nutritional info */}
                      {recipe.nutrition && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                          {recipe.nutrition.calories && (
                            <div className="text-center p-3 rounded-xl bg-muted/50">
                              <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                              <div className="font-bold">{recipe.nutrition.calories}</div>
                              <div className="text-xs text-muted-foreground">
                                {language === 'fr' ? 'Calories' : 'Cal'}
                              </div>
                            </div>
                          )}
                          {recipe.nutrition.protein && (
                            <div className="text-center p-3 rounded-xl bg-muted/50">
                              <div className="font-bold text-blue-500">{recipe.nutrition.protein}g</div>
                              <div className="text-xs text-muted-foreground">
                                {language === 'fr' ? 'Protéines' : 'Protein'}
                              </div>
                            </div>
                          )}
                          {recipe.nutrition.carbs && (
                            <div className="text-center p-3 rounded-xl bg-muted/50">
                              <div className="font-bold text-yellow-500">{recipe.nutrition.carbs}g</div>
                              <div className="text-xs text-muted-foreground">
                                {language === 'fr' ? 'Glucides' : 'Carbs'}
                              </div>
                            </div>
                          )}
                          {recipe.nutrition.fat && (
                            <div className="text-center p-3 rounded-xl bg-muted/50">
                              <div className="font-bold text-red-400">{recipe.nutrition.fat}g</div>
                              <div className="text-xs text-muted-foreground">
                                {language === 'fr' ? 'Lipides' : 'Fat'}
                              </div>
                            </div>
                          )}
                          {recipe.nutrition.fiber && (
                            <div className="text-center p-3 rounded-xl bg-muted/50">
                              <div className="font-bold text-green-500">{recipe.nutrition.fiber}g</div>
                              <div className="text-xs text-muted-foreground">
                                {language === 'fr' ? 'Fibres' : 'Fiber'}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Dietary tags */}
                      {(recipe.vegetarian || recipe.vegan || recipe.glutenFree || recipe.dairyFree) && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {recipe.vegetarian && (
                            <Badge variant="outline" className="gap-1">
                              <Leaf className="w-3 h-3 text-green-500" />
                              {language === 'fr' ? 'Végétarien' : 'Vegetarian'}
                            </Badge>
                          )}
                          {recipe.vegan && (
                            <Badge variant="outline" className="gap-1">
                              <Leaf className="w-3 h-3 text-green-600" />
                              {language === 'fr' ? 'Végan' : 'Vegan'}
                            </Badge>
                          )}
                          {recipe.glutenFree && (
                            <Badge variant="outline" className="gap-1">
                              <Wheat className="w-3 h-3 text-amber-500" />
                              {language === 'fr' ? 'Sans gluten' : 'Gluten-free'}
                            </Badge>
                          )}
                          {recipe.dairyFree && (
                            <Badge variant="outline" className="gap-1">
                              <MilkOff className="w-3 h-3 text-blue-400" />
                              {language === 'fr' ? 'Sans lactose' : 'Dairy-free'}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Ingredients */}
                      {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <h2 className="font-serif text-lg font-bold flex items-center gap-2">
                              <UtensilsCrossed className="w-5 h-5 text-primary" />
                              {language === 'fr' ? 'Ingrédients' : 'Ingredients'}
                            </h2>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onAddToShoppingList(recipe.name, recipe.ingredients!)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              {language === 'fr' ? 'Ajouter à la liste' : 'Add to list'}
                            </Button>
                          </div>
                          <div className="grid gap-2">
                            {recipe.ingredients.map((ingredient, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                  {index + 1}
                                </div>
                                <span>{ingredient}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Instructions */}
                      {recipe.instructions && recipe.instructions.length > 0 && (
                        <div className="mb-6">
                          <h2 className="font-serif text-lg font-bold flex items-center gap-2 mb-3">
                            <ChefHat className="w-5 h-5 text-primary" />
                            {language === 'fr' ? 'Instructions' : 'Instructions'}
                          </h2>
                          <div className="space-y-4">
                            {recipe.instructions.map((instruction, index) => {
                              const timeMatch = instruction.match(/(\d+)\s*(minutes?|min)/i)
                              const hasTimer = !!timeMatch
                              
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                      {index + 1}
                                    </div>
                                    {index < recipe.instructions!.length - 1 && (
                                      <div className="w-0.5 flex-1 bg-muted my-2" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="leading-relaxed">{instruction}</p>
                                    {hasTimer && (
                                      <Badge variant="outline" className="mt-2 text-xs">
                                        <Timer className="w-3 h-3 mr-1" />
                                        {language === 'fr' ? 'Minuterie disponible' : 'Timer available'}
                                      </Badge>
                                    )}
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      {recipe.tips && recipe.tips.length > 0 && (
                        <div className="mb-6">
                          <h2 className="font-serif text-lg font-bold flex items-center gap-2 mb-3">
                            <span className="text-yellow-500">💡</span>
                            {language === 'fr' ? 'Astuces' : 'Tips'}
                          </h2>
                          <ul className="space-y-2">
                            {recipe.tips.map((tip, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="portions" className="h-full m-0 overflow-auto">
                  <div className="p-6">
                    {recipe.ingredients && (
                      <PortionCalculator
                        originalServings={parseServings(recipe.servings)}
                        ingredients={recipe.ingredients}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="substitutions" className="h-full m-0 overflow-auto">
                  <div className="p-6">
                    <IngredientSubstitutions
                      ingredients={recipe.ingredients}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/30">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onStartCooking(recipe)}
              >
                <ChefHat className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Commencer la cuisson' : 'Start Cooking'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
