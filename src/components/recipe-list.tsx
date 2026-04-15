'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { 
  ChefHat, Loader2, Clock, Timer, Users, Flame, 
  Heart, ShoppingCart, Lightbulb, UtensilsCrossed, Sparkles,
  Eye
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { CompactRating } from './star-rating'

export interface Recipe {
  name: string
  prepTime: string
  cookTime: string
  servings: string
  difficulty?: string
  ingredients: string[]
  instructions: string[]
  tip?: string
  tips?: string[]
  nutrition?: {
    calories: number
    protein: string
    carbs: string
    fat: string
    fiber?: string
  }
  tags?: string[]
  missingIngredients?: string[]
  image?: string | null
  imageLoading?: boolean
  isFavorite?: boolean
  vegetarian?: boolean
  vegan?: boolean
  glutenFree?: boolean
  dairyFree?: boolean
  isDemo?: boolean
  rating?: number
}

interface RecipeListProps {
  recipes: Recipe[]
  isLoading: boolean
  canGenerate: boolean
  selectedCount: number
  minIngredients: number
  isDemoMode?: boolean
  onGenerate: () => void
  onToggleFavorite: (recipe: Recipe) => void
  onStartCooking: (recipe: Recipe) => void
  onAddToShoppingList: (recipeName: string, ingredients: string[]) => void
  onViewDetails?: (recipe: Recipe) => void
  isFavorite: (recipeName: string) => boolean
}

export function RecipeList({
  recipes,
  isLoading,
  canGenerate,
  selectedCount,
  minIngredients,
  isDemoMode,
  onGenerate,
  onToggleFavorite,
  onStartCooking,
  onAddToShoppingList,
  onViewDetails,
  isFavorite
}: RecipeListProps) {
  const { t, language } = useI18n()

  const formatTime = (time: string) => time || 'Non spécifié'

  const getDifficultyBadge = (difficulty?: string) => {
    if (!difficulty) return null
    const lower = difficulty.toLowerCase()
    if (lower === 'easy' || lower === 'facile') {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">{difficulty}</Badge>
    }
    if (lower === 'medium' || lower === 'moyen') {
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs">{difficulty}</Badge>
    }
    if (lower === 'hard' || lower === 'difficile') {
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs">{difficulty}</Badge>
    }
    return <Badge variant="secondary" className="text-xs">{difficulty}</Badge>
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UtensilsCrossed className="w-5 h-5 text-green-600" />
            {t('yourRecipes')}
          </CardTitle>
          {isDemoMode && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
              <Sparkles className="w-3 h-3 mr-1" />
              Démo
            </Badge>
          )}
        </div>
        <CardDescription>
          {selectedCount < minIngredients 
            ? t('minIngredients', { count: minIngredients }).replace('{count}', String(minIngredients)) + ` (${selectedCount}/${minIngredients})`
            : t('readyToGenerate')
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate || isLoading}
          className="w-full mb-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t('generating')}
            </>
          ) : (
            <>
              <ChefHat className="w-5 h-5 mr-2" />
              {t('generateRecipes')}
            </>
          )}
        </Button>
        
        {recipes.some(r => r.imageLoading) && (
          <p className="text-xs text-center text-green-600 dark:text-green-400 mb-3">
            🖼️ {t('generatingImages')}
          </p>
        )}

        <ScrollArea className="flex-1 recipe-scrollbar">
          <div className="space-y-4">
            {recipes.length === 0 && !isLoading && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">
                  {t('selectIngredients')}
                </p>
              </div>
            )}

            {recipes.map((recipe, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                  {/* Recipe Image */}
                  {recipe.imageLoading ? (
                    <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">{t('generatingImages')}</p>
                      </div>
                    </div>
                  ) : recipe.image ? (
                    <div className="relative w-full aspect-video overflow-hidden cursor-pointer group" onClick={() => onViewDetails?.(recipe)}>
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <CardTitle className="text-lg text-white drop-shadow-lg">
                          {recipe.name}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {recipe.tags?.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-white/20 text-white border-0">
                              {tag}
                            </Badge>
                          ))}
                          {recipe.isDemo && (
                            <Badge variant="outline" className="text-xs bg-yellow-400/80 text-yellow-900 border-0">
                              ✨ {language === 'fr' ? 'Démo' : 'Demo'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* View Details Overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="bg-white/90 dark:bg-black/70 rounded-full p-3">
                          <Eye className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(recipe)
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                      >
                        <Heart className={`w-5 h-5 ${isFavorite(recipe.name) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                      </button>
                      
                      {recipe.rating && (
                        <div className="absolute top-3 left-3">
                          <CompactRating rating={recipe.rating} />
                        </div>
                      )}
                    </div>
                  ) : null}

                  <CardHeader className={recipe.image ? 'pb-2' : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 pb-2'}>
                    {!recipe.image && !recipe.imageLoading && (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base text-green-800 dark:text-green-200">
                            {recipe.name}
                          </CardTitle>
                          {recipe.isDemo && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              ✨ {language === 'fr' ? 'Démo' : 'Demo'}
                            </Badge>
                          )}
                        </div>
                        <button onClick={() => onToggleFavorite(recipe)} className="ml-2">
                          <Heart className={`w-5 h-5 ${isFavorite(recipe.name) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {t('prepTime')}: {formatTime(recipe.prepTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5" />
                        {t('cookTime')}: {formatTime(recipe.cookTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {recipe.servings}
                      </span>
                      {recipe.difficulty && getDifficultyBadge(recipe.difficulty)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-3 space-y-3">
                    {/* Nutrition Info */}
                    {recipe.nutrition && (
                      <div className="grid grid-cols-5 gap-2 p-2 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{recipe.nutrition.calories}</p>
                          <p className="text-xs text-gray-500">{t('calories')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{recipe.nutrition.protein}</p>
                          <p className="text-xs text-gray-500">{t('protein')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-amber-600">{recipe.nutrition.carbs}</p>
                          <p className="text-xs text-gray-500">{t('carbs')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-red-600">{recipe.nutrition.fat}</p>
                          <p className="text-xs text-gray-500">{t('fat')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{recipe.nutrition.fiber || '-'}</p>
                          <p className="text-xs text-gray-500">{t('fiber')}</p>
                        </div>
                      </div>
                    )}

                    {/* Missing Ingredients Warning */}
                    {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                          <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('tip')}:</strong> {recipe.tip}</span>
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {onViewDetails && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={() => onViewDetails(recipe)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {language === 'fr' ? 'Détails' : 'Details'}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        onClick={() => onStartCooking(recipe)}
                      >
                        <ChefHat className="w-4 h-4 mr-1" />
                        {t('startCooking')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        onClick={() => onAddToShoppingList(recipe.name, recipe.ingredients)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
