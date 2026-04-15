'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, X, 
  ChefHat, Clock, Trash2, UtensilsCrossed, Sparkles,
  Heart, Star, ShoppingCart
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { format, startOfWeek, addDays, isToday } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { RecipeSelectorModal } from './recipe-selector-modal'
import { toast } from '@/hooks/use-toast'
import type { Recipe } from './recipe-list'

export interface MealPlanEntry {
  id: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  recipeName: string
  recipeData?: {
    name: string
    prepTime: string
    cookTime: string
    servings: string
    image?: string | null
    ingredients?: string[]
    instructions?: string[]
  }
}

interface MealPlannerProps {
  isOpen: boolean
  onClose: () => void
  onStartCooking?: (recipe: Recipe) => void
}

const mealTypes = [
  { id: 'breakfast', icon: '🌅', labelFr: 'Petit-déjeuner', labelEn: 'Breakfast' },
  { id: 'lunch', icon: '☀️', labelFr: 'Déjeuner', labelEn: 'Lunch' },
  { id: 'dinner', icon: '🌙', labelFr: 'Dîner', labelEn: 'Dinner' },
  { id: 'snack', icon: '🍎', labelFr: 'Collation', labelEn: 'Snack' },
]

const dayNames = {
  fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
}

export function MealPlanner({ isOpen, onClose, onStartCooking }: MealPlannerProps) {
  const { t, language } = useI18n()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mealPlans, setMealPlans] = useState<MealPlanEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showRecipeSelector, setShowRecipeSelector] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: string } | null>(null)
  const [hoveredMeal, setHoveredMeal] = useState<string | null>(null)

  const dateLocale = language === 'fr' ? fr : enUS
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    if (isOpen) {
      loadMealPlans()
    }
  }, [isOpen, currentDate])

  const loadMealPlans = async () => {
    setIsLoading(true)
    try {
      const startDate = format(weekStart, 'yyyy-MM-dd')
      const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd')
      
      const response = await fetch(`/api/meal-plan?start=${startDate}&end=${endDate}`)
      const data = await response.json()
      setMealPlans(data.plans || [])
    } catch (err) {
      console.error('Failed to load meal plans:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRecipe = (date: string, mealType: string) => {
    setSelectedSlot({ date, mealType })
    setShowRecipeSelector(true)
  }

  const handleSelectRecipe = async (recipe: Recipe) => {
    if (!selectedSlot) return
    
    try {
      const response = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedSlot.date,
          mealType: selectedSlot.mealType,
          recipeName: recipe.name,
          recipeData: recipe
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setMealPlans(prev => [...prev, data.plan])
        toast({
          title: language === 'fr' ? 'Recette ajoutée' : 'Recipe added',
          description: `${recipe.name} ${language === 'fr' ? 'ajoutée au planificateur' : 'added to planner'}`
        })
      }
    } catch (err) {
      console.error('Failed to add meal plan:', err)
    }
  }

  const deleteMealPlan = async (id: string) => {
    try {
      await fetch(`/api/meal-plan?id=${id}`, { method: 'DELETE' })
      setMealPlans(prev => prev.filter(p => p.id !== id))
      toast({
        title: language === 'fr' ? 'Recette supprimée' : 'Recipe removed',
        description: language === 'fr' ? 'Recette retirée du planificateur' : 'Recipe removed from planner'
      })
    } catch (err) {
      console.error('Failed to delete meal plan:', err)
    }
  }

  const addIngredientsToShopping = async (meal: MealPlanEntry) => {
    if (!meal.recipeData?.ingredients) return
    
    try {
      await fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipeName: meal.recipeName, 
          ingredients: meal.recipeData.ingredients 
        })
      })
      toast({
        title: language === 'fr' ? 'Ingrédients ajoutés' : 'Ingredients added',
        description: language === 'fr' 
          ? `${meal.recipeData.ingredients.length} ingrédients ajoutés à la liste`
          : `${meal.recipeData.ingredients.length} ingredients added to the list`
      })
    } catch (err) {
      console.error('Failed to add to shopping list:', err)
    }
  }

  const getMealsForDayAndType = (date: string, mealType: string) => {
    return mealPlans.filter(p => p.date === date && p.mealType === mealType)
  }

  const previousWeek = () => {
    setCurrentDate(addDays(currentDate, -7))
  }

  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getMealStats = () => {
    const stats = {
      total: mealPlans.length,
      breakfast: mealPlans.filter(p => p.mealType === 'breakfast').length,
      lunch: mealPlans.filter(p => p.mealType === 'lunch').length,
      dinner: mealPlans.filter(p => p.mealType === 'dinner').length,
      snack: mealPlans.filter(p => p.mealType === 'snack').length,
    }
    return stats
  }

  const stats = getMealStats()

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-6xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold">
                    {language === 'fr' ? 'Planificateur de repas' : 'Meal Planner'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {language === 'fr' ? 'Organisez vos repas de la semaine' : 'Organize your weekly meals'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={previousWeek}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  {language === 'fr' ? "Aujourd'hui" : 'Today'}
                </Button>
                <Button variant="outline" size="icon" onClick={nextWeek}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="font-medium text-sm">
                {format(weekStart, 'd MMMM', { locale: dateLocale })} - {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: dateLocale })}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-8 gap-2 min-w-[800px]">
                {/* Header Row */}
                <div className="p-2 text-xs font-medium text-muted-foreground">
                  {language === 'fr' ? 'Repas' : 'Meal'}
                </div>
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className={`p-2 text-center text-xs font-medium rounded-lg ${
                      isToday(day)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <div>{dayNames[language][day.getDay()]}</div>
                    <div className="text-lg font-bold">{format(day, 'd')}</div>
                  </div>
                ))}

                {/* Meal Rows */}
                {mealTypes.map(mealType => (
                  <React.Fragment key={mealType.id}>
                    {/* Meal Type Label */}
                    <div className="p-2 flex items-center gap-2 text-sm font-medium bg-muted/30 rounded-lg">
                      <span>{mealType.icon}</span>
                      <span className="hidden lg:inline">
                        {language === 'fr' ? mealType.labelFr : mealType.labelEn}
                      </span>
                    </div>

                    {/* Days */}
                    {weekDays.map((day, i) => {
                      const dateStr = format(day, 'yyyy-MM-dd')
                      const meals = getMealsForDayAndType(dateStr, mealType.id)

                      return (
                        <div
                          key={i}
                          className={`p-1 min-h-[100px] rounded-lg border border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors ${
                            isToday(day) ? 'bg-primary/5' : ''
                          }`}
                        >
                          {meals.map(meal => (
                            <motion.div
                              key={meal.id}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="group relative p-2 mb-1 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
                              onMouseEnter={() => setHoveredMeal(meal.id)}
                              onMouseLeave={() => setHoveredMeal(null)}
                            >
                              <div className="flex items-start gap-2">
                                {meal.recipeData?.image && (
                                  <img 
                                    src={meal.recipeData.image} 
                                    alt={meal.recipeName}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-xs truncate pr-4">{meal.recipeName}</div>
                                  {meal.recipeData?.prepTime && (
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      {meal.recipeData.prepTime}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Action buttons on hover */}
                              {hoveredMeal === meal.id && (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="absolute top-1 right-1 flex gap-0.5"
                                >
                                  {onStartCooking && meal.recipeData && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onStartCooking(meal.recipeData as Recipe)
                                        onClose()
                                      }}
                                      className="p-1 rounded bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50"
                                      title={language === 'fr' ? 'Cuisiner' : 'Cook'}
                                    >
                                      <ChefHat className="w-3 h-3" />
                                    </button>
                                  )}
                                  {meal.recipeData?.ingredients && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        addIngredientsToShopping(meal)
                                      }}
                                      className="p-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                      title={language === 'fr' ? 'Ajouter à la liste' : 'Add to list'}
                                    >
                                      <ShoppingCart className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteMealPlan(meal.id)
                                    }}
                                    className="p-1 rounded bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50"
                                    title={language === 'fr' ? 'Supprimer' : 'Delete'}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </motion.div>
                              )}
                            </motion.div>
                          ))}
                          
                          <button
                            onClick={() => handleAddRecipe(dateStr, mealType.id)}
                            className="w-full h-full min-h-[40px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Footer with Stats */}
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">{stats.total}</span>
                    <span className="text-muted-foreground">
                      {language === 'fr' ? 'repas planifiés' : 'meals planned'}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      🌅 {stats.breakfast}
                    </span>
                    <span className="flex items-center gap-1">
                      ☀️ {stats.lunch}
                    </span>
                    <span className="flex items-center gap-1">
                      🌙 {stats.dinner}
                    </span>
                    <span className="flex items-center gap-1">
                      🍎 {stats.snack}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={loadMealPlans}>
                    {language === 'fr' ? 'Actualiser' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Recipe Selector Modal */}
      <RecipeSelectorModal
        isOpen={showRecipeSelector}
        onClose={() => setShowRecipeSelector(false)}
        onSelect={handleSelectRecipe}
        selectedDate={selectedSlot?.date || ''}
        selectedMealType={selectedSlot?.mealType || ''}
      />
    </>
  )
}
