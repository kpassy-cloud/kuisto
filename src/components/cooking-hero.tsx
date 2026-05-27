'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, ChefHat, Sparkles, UtensilsCrossed, Clock, Users, 
  Flame, Leaf, Fish, Drumstick, Egg, Apple, Carrot, Milk,
  Plus, X, ArrowRight, Loader2
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { soundEffects } from '@/lib/sounds'

interface Ingredient {
  id: string
  name: string
  emoji: string
  category: string
}

interface CookingHeroProps {
  onGenerate: () => void
  isLoading: boolean
  selectedIngredients: Ingredient[]
  onToggleIngredient: (ingredient: Ingredient) => void
  onClearAll: () => void
  isAuthenticated: boolean
  onSignUp: () => void
}

const QUICK_INGREDIENTS = [
  { id: 'tomato', name: 'Tomate', emoji: '🍅', category: 'vegetable' },
  { id: 'chicken', name: 'Poulet', emoji: '🍗', category: 'meat' },
  { id: 'cheese', name: 'Fromage', emoji: '🧀', category: 'dairy' },
  { id: 'egg', name: 'Oeuf', emoji: '🥚', category: 'protein' },
  { id: 'pasta', name: 'Pâtes', emoji: '🍝', category: 'carbs' },
  { id: 'rice', name: 'Riz', emoji: '🍚', category: 'carbs' },
  { id: 'onion', name: 'Oignon', emoji: '🧅', category: 'vegetable' },
  { id: 'garlic', name: 'Ail', emoji: '🧄', category: 'vegetable' },
  { id: 'beef', name: 'Boeuf', emoji: '🥩', category: 'meat' },
  { id: 'fish', name: 'Poisson', emoji: '🐟', category: 'seafood' },
  { id: 'shrimp', name: 'Crevettes', emoji: '🦐', category: 'seafood' },
  { id: 'potato', name: 'Pomme de terre', emoji: '🥔', category: 'vegetable' },
  { id: 'carrot', name: 'Carotte', emoji: '🥕', category: 'vegetable' },
  { id: 'pepper', name: 'Poivron', emoji: '🫑', category: 'vegetable' },
  { id: 'mushroom', name: 'Champignon', emoji: '🍄', category: 'vegetable' },
  { id: 'cream', name: 'Crème', emoji: '🥛', category: 'dairy' },
]

const INGREDIENT_CATEGORIES = [
  { id: 'all', icon: ChefHat, label: { fr: 'Tous', en: 'All' } },
  { id: 'meat', icon: Drumstick, label: { fr: 'Viandes', en: 'Meat' } },
  { id: 'seafood', icon: Fish, label: { fr: 'Poissons', en: 'Seafood' } },
  { id: 'vegetable', icon: Carrot, label: { fr: 'Légumes', en: 'Vegetables' } },
  { id: 'dairy', icon: Milk, label: { fr: 'Laitages', en: 'Dairy' } },
  { id: 'protein', icon: Egg, label: { fr: 'Protéines', en: 'Protein' } },
  { id: 'carbs', icon: Apple, label: { fr: 'Féculents', en: 'Carbs' } },
]

export function CookingHero({
  onGenerate,
  isLoading,
  selectedIngredients,
  onToggleIngredient,
  onClearAll,
  isAuthenticated,
  onSignUp
}: CookingHeroProps) {
  const { language } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch - this is a standard pattern
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  
  const t = (key: string) => {
    const translations: Record<string, { fr: string; en: string }> = {
      title: { fr: 'Qu\'avez-vous dans votre cuisine ?', en: 'What\'s in your kitchen?' },
      subtitle: { fr: 'Sélectionnez vos ingrédients pour découvrir des recettes', en: 'Select your ingredients to discover recipes' },
      searchPlaceholder: { fr: 'Rechercher un ingrédient...', en: 'Search for an ingredient...' },
      quickSelect: { fr: 'Sélection rapide', en: 'Quick select' },
      selected: { fr: 'Ingrédients sélectionnés', en: 'Selected ingredients' },
      generate: { fr: 'Générer mes recettes', en: 'Generate my recipes' },
      generateCount: { fr: 'Générer ({count} ingrédients)', en: 'Generate ({count} ingredients)' },
      minIngredients: { fr: 'Sélectionnez au moins 3 ingrédients', en: 'Select at least 3 ingredients' },
      clearAll: { fr: 'Tout effacer', en: 'Clear all' },
      orSignUp: { fr: 'ou créez un compte pour plus de recettes', en: 'or create an account for more recipes' },
      inspiration: { fr: 'Besoin d\'inspiration ?', en: 'Need inspiration?' },
      popularCombos: { fr: 'Combinaisons populaires', en: 'Popular combos' }
    }
    return translations[key]?.[language as 'fr' | 'en'] || key
  }

  const filteredIngredients = QUICK_INGREDIENTS.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ing.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || ing.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const canGenerate = selectedIngredients.length >= 3

  const popularCombos = [
    { name: language === 'fr' ? 'Poulet rôti' : 'Roast chicken', ingredients: ['chicken', 'onion', 'garlic', 'potato'] },
    { name: language === 'fr' ? 'Pâtes carbonara' : 'Carbonara pasta', ingredients: ['pasta', 'egg', 'cheese', 'cream'] },
    { name: language === 'fr' ? 'Riz sauté' : 'Fried rice', ingredients: ['rice', 'egg', 'onion', 'carrot'] },
  ]

  // Show placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-terracotta/5" />
        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          <div className="text-center mb-8">
            <div className="h-8 w-32 mx-auto bg-muted rounded-full animate-pulse mb-4" />
            <div className="h-10 w-96 mx-auto bg-muted rounded animate-pulse mb-3" />
            <div className="h-6 w-80 mx-auto bg-muted rounded animate-pulse" />
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="h-12 bg-muted rounded animate-pulse mb-4" />
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-9 w-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(i => (
                <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-terracotta/5" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-terracotta/10 rounded-full blur-2xl opacity-50" />
      
      <div className="container mx-auto px-4 py-8 md:py-12 relative">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {language === 'fr' ? 'Proposé par IA' : 'AI-powered'}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Selected Ingredients Display */}
        <AnimatePresence>
          {selectedIngredients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      {t('selected')} ({selectedIngredients.length})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3 mr-1" />
                      {t('clearAll')}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedIngredients.map((ing) => (
                      <Badge
                        key={ing.id}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm bg-background border cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => onToggleIngredient(ing)}
                      >
                        <span className="mr-1.5">{ing.emoji}</span>
                        {ing.name}
                        <X className="w-3 h-3 ml-1.5 opacity-50" />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Category Filter */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg bg-background border-2 focus:border-primary transition-colors"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {INGREDIENT_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className="shrink-0 gap-1.5"
              >
                <cat.icon className="w-4 h-4" />
                {cat.label[language as 'fr' | 'en']}
              </Button>
            ))}
          </div>
        </div>

        {/* Ingredient Grid */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {filteredIngredients.map((ingredient) => {
              const isSelected = selectedIngredients.some(i => i.id === ingredient.id)
              return (
                <motion.button
                  key={ingredient.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    soundEffects.select()
                    onToggleIngredient(ingredient)
                  }}
                  className={`
                    relative flex flex-col items-center justify-center p-3 rounded-xl
                    transition-all duration-200 border-2
                    ${isSelected 
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25' 
                      : 'bg-background border-border hover:border-primary/50 hover:shadow-md'
                    }
                  `}
                >
                  <span className="text-2xl mb-1">{ingredient.emoji}</span>
                  <span className="text-xs font-medium text-center leading-tight">
                    {ingredient.name}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 text-primary-foreground rotate-45" />
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <Button
            size="lg"
            disabled={!canGenerate || isLoading}
            onClick={onGenerate}
            className={`
              px-8 py-6 text-lg font-semibold
              bg-gradient-to-r from-primary to-primary/90 
              hover:from-primary/90 hover:to-primary
              shadow-lg shadow-primary/30
              transition-all duration-300
              ${canGenerate ? 'animate-pulse-slow' : ''}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {language === 'fr' ? 'Génération en cours...' : 'Generating...'}
              </>
            ) : canGenerate ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {t('generateCount').replace('{count}', String(selectedIngredients.length))}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                <UtensilsCrossed className="w-5 h-5 mr-2" />
                {t('minIngredients')}
              </>
            )}
          </Button>
          
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-3">
              {language === 'fr' ? 'Première recette gratuite ! ' : 'First recipe free! '}
              <button 
                onClick={onSignUp}
                className="text-primary hover:underline font-medium"
              >
                {t('orSignUp')}
              </button>
            </p>
          )}
        </div>

        {/* Popular Combinations */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-center text-sm font-medium text-muted-foreground mb-3">
            {t('popularCombos')}
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {popularCombos.map((combo, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  onClearAll()
                  combo.ingredients.forEach(ingId => {
                    const ingredient = QUICK_INGREDIENTS.find(i => i.id === ingId)
                    if (ingredient) {
                      onToggleIngredient(ingredient)
                    }
                  })
                }}
                className="gap-1.5"
              >
                {combo.name}
                <ArrowRight className="w-3 h-3 opacity-50" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
