'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  Users, Minus, Plus, Calculator, Scale, 
  ChefHat, RefreshCw, Copy, Check
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { toast } from '@/hooks/use-toast'

interface IngredientAmount {
  name: string
  originalAmount: number
  unit: string
  calculatedAmount: number
}

interface PortionCalculatorProps {
  originalServings: number
  ingredients: string[]
  onPortionChange?: (newServings: number, adjustedIngredients: IngredientAmount[]) => void
}

// Parse ingredient string to extract amount and unit
function parseIngredient(ingredient: string): { amount: number; unit: string; name: string } {
  // Common patterns: "2 cups flour", "1/2 cup sugar", "3 tbsp olive oil", "1 onion"
  const fractionRegex = /^(\d+)\/(\d+)\s*(?:cup|tbsp|tsp|ml|l|g|kg|oz|lb|c\.à\.s|c\.à\.c)?/i
  const decimalRegex = /^(\d+(?:\.\d+)?)\s*(cup|tbsp|tsp|ml|l|g|kg|oz|lb|c\.à\.s|c\.à\.c|cups|tablespoons|teaspoons)?/i
  const numberRegex = /^(\d+)\s*(cup|tbsp|tsp|ml|l|g|kg|oz|lb|c\.à\.s|c\.à\.c|cups|tablespoons|teaspoons|pieces|pièces)?/i

  let amount = 1
  let unit = ''
  let name = ingredient

  // Try fraction first (e.g., "1/2 cup")
  const fractionMatch = ingredient.match(fractionRegex)
  if (fractionMatch) {
    amount = parseInt(fractionMatch[1]) / parseInt(fractionMatch[2])
    unit = fractionMatch[3] || ''
    name = ingredient.replace(fractionRegex, '').trim()
  } else {
    // Try decimal (e.g., "1.5 cups")
    const decimalMatch = ingredient.match(decimalRegex)
    if (decimalMatch) {
      amount = parseFloat(decimalMatch[1])
      unit = decimalMatch[2] || ''
      name = ingredient.replace(decimalRegex, '').trim()
    } else {
      // Try integer (e.g., "2 onions")
      const numberMatch = ingredient.match(numberRegex)
      if (numberMatch) {
        amount = parseInt(numberMatch[1])
        unit = numberMatch[2] || ''
        name = ingredient.replace(numberRegex, '').trim()
      }
    }
  }

  return { amount, unit, name }
}

// Format number nicely
function formatAmount(num: number): string {
  if (num === 0) return '0'
  if (num < 0.125) return 'pinch'
  if (num < 1) {
    // Convert to fraction for display
    const fractions: Record<string, string> = {
      '0.125': '⅛',
      '0.25': '¼',
      '0.333': '⅓',
      '0.375': '⅜',
      '0.5': '½',
      '0.625': '⅝',
      '0.666': '⅔',
      '0.75': '¾',
      '0.875': '⅞',
    }
    const closest = Object.keys(fractions).reduce((prev, curr) => 
      Math.abs(parseFloat(curr) - num) < Math.abs(parseFloat(prev) - num) ? curr : prev
    )
    if (Math.abs(parseFloat(closest) - num) < 0.05) {
      return fractions[closest]
    }
  }
  return num % 1 === 0 ? num.toString() : num.toFixed(1)
}

export function PortionCalculator({ 
  originalServings, 
  ingredients, 
  onPortionChange 
}: PortionCalculatorProps) {
  const { t, language } = useI18n()
  const [targetServings, setTargetServings] = useState(originalServings)
  const [copied, setCopied] = useState(false)

  // Parse ingredients and calculate adjusted amounts
  const adjustedIngredients = useMemo(() => {
    const ratio = targetServings / originalServings
    
    return ingredients.map(ing => {
      const parsed = parseIngredient(ing)
      return {
        name: parsed.name,
        originalAmount: parsed.amount,
        unit: parsed.unit,
        calculatedAmount: Math.round(parsed.amount * ratio * 100) / 100,
        originalString: ing
      }
    })
  }, [ingredients, originalServings, targetServings])

  const handleSliderChange = (value: number[]) => {
    setTargetServings(value[0])
  }

  const incrementServings = () => {
    setTargetServings(prev => Math.min(prev + 1, 50))
  }

  const decrementServings = () => {
    setTargetServings(prev => Math.max(prev - 1, 1))
  }

  const resetToOriginal = () => {
    setTargetServings(originalServings)
  }

  const copyAdjustedIngredients = async () => {
    const text = adjustedIngredients.map(ing => {
      const amount = formatAmount(ing.calculatedAmount)
      return `${amount} ${ing.unit} ${ing.name}`.trim()
    }).join('\n')
    
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: language === 'fr' ? 'Copié!' : 'Copied!',
        description: language === 'fr' 
          ? 'Ingrédients ajustés copiés dans le presse-papier'
          : 'Adjusted ingredients copied to clipboard'
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Impossible de copier'
          : 'Could not copy',
        variant: 'destructive'
      })
    }
  }

  const getRatio = () => {
    const ratio = targetServings / originalServings
    if (ratio > 1) return `×${ratio.toFixed(1)}`
    if (ratio < 1) return `÷${(1/ratio).toFixed(1)}`
    return '1:1'
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-primary" />
          {language === 'fr' ? 'Calculateur de portions' : 'Portion Calculator'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Portion Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementServings}
              disabled={targetServings <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold">{targetServings}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'fr' ? 'portions' : 'servings'}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={incrementServings}
              disabled={targetServings >= 50}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {getRatio()}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetToOriginal}
              title={language === 'fr' ? 'Réinitialiser' : 'Reset'}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Slider */}
        <div className="px-2">
          <Slider
            value={[targetServings]}
            onValueChange={handleSliderChange}
            min={1}
            max={20}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1</span>
            <span>{language === 'fr' ? 'Original' : 'Original'}: {originalServings}</span>
            <span>20</span>
          </div>
        </div>

        {/* Adjusted Ingredients */}
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
            <span className="text-sm font-medium">
              {language === 'fr' ? 'Ingrédients ajustés' : 'Adjusted Ingredients'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAdjustedIngredients}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {adjustedIngredients.map((ing, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex items-center justify-between p-2 ${
                  index !== adjustedIngredients.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm truncate">{ing.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground line-through">
                    {ing.originalAmount} {ing.unit}
                  </span>
                  <span className="text-primary font-medium">
                    {formatAmount(ing.calculatedAmount)} {ing.unit}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <Scale className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {language === 'fr' 
              ? 'Les quantités sont ajustées proportionnellement. Pour les assaisonnements, ajustez selon votre goût.'
              : 'Quantities are adjusted proportionally. For seasonings, adjust to taste.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
