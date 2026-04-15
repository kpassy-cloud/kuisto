'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, ChefHat, Clock, Users } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface SearchResult {
  id: string
  name: string
  type: 'ingredient' | 'recipe'
  emoji?: string
  category?: string
  prepTime?: string
  servings?: string
}

interface SearchBarProps {
  onIngredientSelect: (ingredient: { id: string; name: string; emoji: string }) => void
  onRecipeSelect?: (recipe: SearchResult) => void
}

export function SearchBar({ onIngredientSelect, onRecipeSelect }: SearchBarProps) {
  const { t, language } = useI18n()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(() => {
    searchItems(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const searchItems = async (searchQuery: string) => {
    setIsLoading(true)
    try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
    const data = await response.json()
    setResults(data.results || [])
    setIsOpen(data.results?.length > 0)
    } catch (err) {
    console.error('Search error:', err)
    setResults([])
    } finally {
    setIsLoading(false)
    }
  }

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'ingredient') {
    onIngredientSelect({
      id: result.id,
      name: result.name,
      emoji: result.emoji || '🍽️'
    })
    } else if (result.type === 'recipe' && onRecipeSelect) {
    onRecipeSelect(result)
    }
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={language === 'fr' 
            ? 'Rechercher un ingrédient ou une recette...' 
            : 'Search for an ingredient or recipe...'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-xl z-50 max-h-80 overflow-auto"
          >
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left border-b last:border-0"
              >
                <span className="text-2xl">{result.emoji || '🍽️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{result.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {result.type === 'ingredient' ? (
                      <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                        {result.category}
                      </span>
                    ) : (
                      <>
                        {result.prepTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.prepTime}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  result.type === 'ingredient' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {result.type === 'ingredient' 
                    ? (language === 'fr' ? 'Ingrédient' : 'Ingredient')
                    : (language === 'fr' ? 'Recette' : 'Recipe')
                  }
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
