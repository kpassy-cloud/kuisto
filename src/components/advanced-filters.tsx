'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Filter, X, Clock, Flame, Leaf, Wheat, Milk, 
  Globe, ChevronDown, RotateCcw 
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export interface FilterState {
  cuisine: string[]
  prepTime: string | null
  difficulty: string | null
  dietary: string[]
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void
  initialFilters?: FilterState
}

const cuisineOptions = [
  { id: 'french', labelFr: 'Française', labelEn: 'French', emoji: '🇫🇷' },
  { id: 'italian', labelFr: 'Italienne', labelEn: 'Italian', emoji: '🇮🇹' },
  { id: 'asian', labelFr: 'Asiatique', labelEn: 'Asian', emoji: '🥢' },
  { id: 'mexican', labelFr: 'Mexicaine', labelEn: 'Mexican', emoji: '🌮' },
  { id: 'indian', labelFr: 'Indienne', labelEn: 'Indian', emoji: '🍛' },
  { id: 'mediterranean', labelFr: 'Méditerranéenne', labelEn: 'Mediterranean', emoji: '🫒' },
  { id: 'american', labelFr: 'Américaine', labelEn: 'American', emoji: '🍔' },
]

const prepTimeOptions = [
  { id: '15', labelFr: '< 15 min', labelEn: '< 15 min' },
  { id: '30', labelFr: '< 30 min', labelEn: '< 30 min' },
  { id: '45', labelFr: '< 45 min', labelEn: '< 45 min' },
  { id: '60', labelFr: '< 1h', labelEn: '< 1h' },
]

const difficultyOptions = [
  { id: 'easy', labelFr: 'Facile', labelEn: 'Easy', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { id: 'medium', labelFr: 'Moyen', labelEn: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { id: 'hard', labelFr: 'Difficile', labelEn: 'Hard', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
]

const dietaryOptions = [
  { id: 'vegetarian', labelFr: 'Végétarien', labelEn: 'Vegetarian', icon: Leaf },
  { id: 'vegan', labelFr: 'Vegan', labelEn: 'Vegan', icon: Leaf },
  { id: 'glutenFree', labelFr: 'Sans gluten', labelEn: 'Gluten-free', icon: Wheat },
  { id: 'lactoseFree', labelFr: 'Sans lactose', labelEn: 'Lactose-free', icon: Milk },
]

export function AdvancedFilters({ onFilterChange, initialFilters }: AdvancedFiltersProps) {
  const { t, language } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    cuisine: [],
    prepTime: null,
    difficulty: null,
    dietary: []
  })

  const toggleCuisine = (cuisineId: string) => {
    const newCuisine = filters.cuisine.includes(cuisineId)
      ? filters.cuisine.filter(c => c !== cuisineId)
      : [...filters.cuisine, cuisineId]
    const newFilters = { ...filters, cuisine: newCuisine }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const setPrepTime = (time: string | null) => {
    const newFilters = { ...filters, prepTime: filters.prepTime === time ? null : time }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const setDifficulty = (diff: string | null) => {
    const newFilters = { ...filters, difficulty: filters.difficulty === diff ? null : diff }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleDietary = (dietId: string) => {
    const newDietary = filters.dietary.includes(dietId)
      ? filters.dietary.filter(d => d !== dietId)
      : [...filters.dietary, dietId]
    const newFilters = { ...filters, dietary: newDietary }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const resetFilters = () => {
    const resetState = { cuisine: [], prepTime: null, difficulty: null, dietary: [] }
    setFilters(resetState)
    onFilterChange(resetState)
  }

  const activeFiltersCount = 
    filters.cuisine.length + 
    (filters.prepTime ? 1 : 0) + 
    (filters.difficulty ? 1 : 0) + 
    filters.dietary.length

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`gap-2 ${activeFiltersCount > 0 ? 'border-primary text-primary' : ''}`}
      >
        <Filter className="w-4 h-4" />
        {language === 'fr' ? 'Filtres' : 'Filters'}
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
            {activeFiltersCount}
          </Badge>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-80 bg-card border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {language === 'fr' ? 'Filtres avancés' : 'Advanced filters'}
              </h3>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-7">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {language === 'fr' ? 'Réinitialiser' : 'Reset'}
                </Button>
              )}
            </div>

            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {/* Cuisine */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  {language === 'fr' ? 'Type de cuisine' : 'Cuisine type'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {cuisineOptions.map(cuisine => (
                    <button
                      key={cuisine.id}
                      onClick={() => toggleCuisine(cuisine.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        filters.cuisine.includes(cuisine.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <span className="mr-1">{cuisine.emoji}</span>
                      {language === 'fr' ? cuisine.labelFr : cuisine.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prep Time */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {language === 'fr' ? 'Temps de préparation' : 'Prep time'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {prepTimeOptions.map(time => (
                    <button
                      key={time.id}
                      onClick={() => setPrepTime(time.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.prepTime === time.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {language === 'fr' ? time.labelFr : time.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-muted-foreground" />
                  {language === 'fr' ? 'Difficulté' : 'Difficulty'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {difficultyOptions.map(diff => (
                    <button
                      key={diff.id}
                      onClick={() => setDifficulty(diff.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.difficulty === diff.id
                          ? diff.color + ' ring-2 ring-primary'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {language === 'fr' ? diff.labelFr : diff.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-muted-foreground" />
                  {language === 'fr' ? 'Régime alimentaire' : 'Dietary'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {dietaryOptions.map(diet => {
                    const Icon = diet.icon
                    return (
                      <button
                        key={diet.id}
                        onClick={() => toggleDietary(diet.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          filters.dietary.includes(diet.id)
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {language === 'fr' ? diet.labelFr : diet.labelEn}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Active filters summary */}
            {activeFiltersCount > 0 && (
              <div className="p-3 border-t bg-muted/20">
                <div className="flex flex-wrap gap-1">
                  {filters.cuisine.map(c => {
                    const cuisine = cuisineOptions.find(opt => opt.id === c)
                    return (
                      <Badge key={c} variant="secondary" className="text-xs">
                        {cuisine?.emoji} {language === 'fr' ? cuisine?.labelFr : cuisine?.labelEn}
                        <button onClick={() => toggleCuisine(c)} className="ml-1 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )
                  })}
                  {filters.prepTime && (
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {prepTimeOptions.find(t => t.id === filters.prepTime)?.labelFr}
                      <button onClick={() => setPrepTime(null)} className="ml-1 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.difficulty && (
                    <Badge variant="secondary" className="text-xs">
                      <Flame className="w-3 h-3 mr-1" />
                      {difficultyOptions.find(d => d.id === filters.difficulty)?.labelFr}
                      <button onClick={() => setDifficulty(null)} className="ml-1 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.dietary.map(d => {
                    const diet = dietaryOptions.find(opt => opt.id === d)
                    return (
                      <Badge key={d} variant="secondary" className="text-xs">
                        {language === 'fr' ? diet?.labelFr : diet?.labelEn}
                        <button onClick={() => toggleDietary(d)} className="ml-1 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
