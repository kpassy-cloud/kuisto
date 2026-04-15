'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { 
  Carrot, Beef, Apple, Cookie, Milk, Wheat, 
  Sparkles, X, Check, Snowflake, SunMedium, CloudSun, Flower2 
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { soundEffects } from '@/lib/sounds'
import { 
  getIngredientSeasonInfo, 
  getCurrentSeason, 
  type Season 
} from '@/lib/seasonal'

// Map icons to components
const iconMap = {
  Carrot, Beef, Milk, Wheat, Apple, Cookie
}

export interface Ingredient {
  id: string
  name: string
  emoji: string
}

export interface IngredientCategory {
  name: string
  nameKey: string
  icon: keyof typeof iconMap
  color: string
  ingredients: Ingredient[]
}

// Ingredient categories with icons
export const ingredientCategories: IngredientCategory[] = [
  {
    name: 'Légumes',
    nameKey: 'vegetables',
    icon: 'Carrot',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    ingredients: [
      { id: 'tomate', name: 'Tomate', emoji: '🍅' },
      { id: 'oignon', name: 'Oignon', emoji: '🧅' },
      { id: 'ail', name: 'Ail', emoji: '🧄' },
      { id: 'carotte', name: 'Carotte', emoji: '🥕' },
      { id: 'pomme_de_terre', name: 'Pomme de terre', emoji: '🥔' },
      { id: 'poivron', name: 'Poivron', emoji: '🫑' },
      { id: 'courgette', name: 'Courgette', emoji: '🥒' },
      { id: 'aubergine', name: 'Aubergine', emoji: '🍆' },
      { id: 'brocoli', name: 'Brocoli', emoji: '🥦' },
      { id: 'champignon', name: 'Champignon', emoji: '🍄' },
      { id: 'epinard', name: 'Épinard', emoji: '🥬' },
      { id: 'salade', name: 'Salade', emoji: '🥗' },
      { id: 'concombre', name: 'Concombre', emoji: '🥒' },
      { id: 'avocat', name: 'Avocat', emoji: '🥑' },
    ]
  },
  {
    name: 'Protéines',
    nameKey: 'proteins',
    icon: 'Beef',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    ingredients: [
      { id: 'poulet', name: 'Poulet', emoji: '🍗' },
      { id: 'boeuf', name: 'Bœuf', emoji: '🥩' },
      { id: 'porc', name: 'Porc', emoji: '🥓' },
      { id: 'poisson', name: 'Poisson', emoji: '🐟' },
      { id: 'crevette', name: 'Crevette', emoji: '🦐' },
      { id: 'oeuf', name: 'Œuf', emoji: '🥚' },
      { id: 'tofu', name: 'Tofu', emoji: '🧈' },
      { id: 'jambon', name: 'Jambon', emoji: '🍖' },
      { id: 'saucisse', name: 'Saucisse', emoji: '🌭' },
      { id: 'lardons', name: 'Lardons', emoji: '🥓' },
    ]
  },
  {
    name: 'Produits laitiers',
    nameKey: 'dairy',
    icon: 'Milk',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    ingredients: [
      { id: 'lait', name: 'Lait', emoji: '🥛' },
      { id: 'beurre', name: 'Beurre', emoji: '🧈' },
      { id: 'fromage', name: 'Fromage', emoji: '🧀' },
      { id: 'creme', name: 'Crème fraîche', emoji: '🫗' },
      { id: 'yaourt', name: 'Yaourt', emoji: '🥛' },
      { id: 'mozzarella', name: 'Mozzarella', emoji: '🧀' },
      { id: 'parmesan', name: 'Parmesan', emoji: '🧀' },
    ]
  },
  {
    name: 'Féculents & Céréales',
    nameKey: 'starches',
    icon: 'Wheat',
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    ingredients: [
      { id: 'riz', name: 'Riz', emoji: '🍚' },
      { id: 'pates', name: 'Pâtes', emoji: '🍝' },
      { id: 'pain', name: 'Pain', emoji: '🍞' },
      { id: 'farine', name: 'Farine', emoji: '🌾' },
      { id: 'semoule', name: 'Semoule', emoji: '🌾' },
      { id: 'quinoa', name: 'Quinoa', emoji: '🌾' },
      { id: 'pain_de_mie', name: 'Pain de mie', emoji: '🍞' },
      { id: 'tortilla', name: 'Tortilla', emoji: '🫓' },
    ]
  },
  {
    name: 'Fruits',
    nameKey: 'fruits',
    icon: 'Apple',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    ingredients: [
      { id: 'pomme', name: 'Pomme', emoji: '🍎' },
      { id: 'banane', name: 'Banane', emoji: '🍌' },
      { id: 'orange', name: 'Orange', emoji: '🍊' },
      { id: 'citron', name: 'Citron', emoji: '🍋' },
      { id: 'fraise', name: 'Fraise', emoji: '🍓' },
      { id: 'peche', name: 'Pêche', emoji: '🍑' },
      { id: 'poire', name: 'Poire', emoji: '🍐' },
      { id: 'ananas', name: 'Ananas', emoji: '🍍' },
    ]
  },
  {
    name: 'Épices & Condiments',
    nameKey: 'spices',
    icon: 'Cookie',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    ingredients: [
      { id: 'sel', name: 'Sel', emoji: '🧂' },
      { id: 'poivre', name: 'Poivre', emoji: '🌶️' },
      { id: 'huile_olive', name: "Huile d'olive", emoji: '🫒' },
      { id: 'vinaigre', name: 'Vinaigre', emoji: '🍾' },
      { id: 'moutarde', name: 'Moutarde', emoji: '🟡' },
      { id: 'curry', name: 'Curry', emoji: '🟠' },
      { id: 'herbes_provence', name: 'Herbes de Provence', emoji: '🌿' },
      { id: 'basilic', name: 'Basilic', emoji: '🌿' },
      { id: 'persil', name: 'Persil', emoji: '🌿' },
    ]
  },
  {
    name: 'Autres',
    nameKey: 'other',
    icon: 'Cookie',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    ingredients: [
      { id: 'miel', name: 'Miel', emoji: '🍯' },
      { id: 'chocolat', name: 'Chocolat', emoji: '🍫' },
      { id: 'sucre', name: 'Sucre', emoji: '🍬' },
      { id: 'huile', name: 'Huile', emoji: '🫒' },
      { id: 'olive', name: 'Olive', emoji: '🫒' },
      { id: 'noix', name: 'Noix', emoji: '🥜' },
    ]
  }
]

interface IngredientSelectorProps {
  selectedIngredients: Ingredient[]
  onToggle: (ingredient: Ingredient) => void
  onRemove: (ingredientId: string) => void
  onClearAll: () => void
}

export function IngredientSelector({
  selectedIngredients,
  onToggle,
  onRemove,
  onClearAll
}: IngredientSelectorProps) {
  const { t } = useI18n()
  const currentSeason = getCurrentSeason()
  
  const SeasonIcon = currentSeason === 'winter' ? Snowflake 
    : currentSeason === 'spring' ? Flower2
    : currentSeason === 'summer' ? SunMedium
    : CloudSun

  return (
    <div className="space-y-4">
      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-600" />
              {t('selectedIngredients')} ({selectedIngredients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ingredient) => (
                <Badge
                  key={ingredient.id}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700"
                >
                  <span className="mr-1.5">{ingredient.emoji}</span>
                  {ingredient.name}
                  <button
                    onClick={() => onRemove(ingredient.id)}
                    className="ml-2 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="mt-3 text-gray-500 hover:text-red-500"
            >
              <X className="w-3 h-3 mr-1" />
              {t('clearAll')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ingredient Categories */}
      <ScrollArea className="h-[calc(100vh-350px)] pr-4 recipe-scrollbar">
        <div className="space-y-4">
          {ingredientCategories.map((category) => {
            const IconComponent = iconMap[category.icon]
            return (
              <Card key={category.name} className="overflow-hidden">
                <CardHeader className="pb-2 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/20">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className={`p-1 rounded-lg ${category.color}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    {t(category.nameKey as any) || category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
                    {category.ingredients.map((ingredient) => {
                      const isSelected = selectedIngredients.some(i => i.id === ingredient.id)
                      const seasonInfo = getIngredientSeasonInfo(ingredient.id)
                      
                      return (
                        <motion.button
                          key={ingredient.id}
                          onClick={() => {
                            if (isSelected) {
                              soundEffects.deselect()
                            } else {
                              soundEffects.select()
                            }
                            onToggle(ingredient)
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative flex flex-col items-center gap-0.5 p-2.5 rounded-xl border-2 transition-all duration-200 ${
                            isSelected 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50/30 dark:hover:bg-green-900/10'
                          }`}
                        >
                          {/* Seasonal indicator */}
                          {seasonInfo.inSeason && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          <span className="text-xl">{ingredient.emoji}</span>
                          <span className={`text-xs font-medium text-center line-clamp-1 ${
                            isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {ingredient.name}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
