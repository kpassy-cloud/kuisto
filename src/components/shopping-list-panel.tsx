'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  Check, 
  Package, 
  Leaf,
  Beef,
  Milk,
  Wheat,
  Apple,
  Cookie,
  Loader2,
  ChefHat
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ShoppingItem {
  id: string
  ingredient: string
  quantity: string
  unit: string | null
  isChecked: boolean
  recipeNames: string[]
  createdAt: string
  updatedAt: string
}

// Category mapping for ingredients with warm color palette
const ingredientCategories: { [key: string]: { icon: React.ElementType; color: string } } = {
  'légume': { icon: Leaf, color: 'text-success' },
  'legume': { icon: Leaf, color: 'text-success' },
  'oignon': { icon: Leaf, color: 'text-success' },
  'tomate': { icon: Leaf, color: 'text-coral' },
  'carotte': { icon: Leaf, color: 'text-accent' },
  'ail': { icon: Leaf, color: 'text-success' },
  'poivron': { icon: Leaf, color: 'text-coral' },
  'courgette': { icon: Leaf, color: 'text-success' },
  'aubergine': { icon: Leaf, color: 'text-purple-500' },
  'brocoli': { icon: Leaf, color: 'text-success' },
  'champignon': { icon: Leaf, color: 'text-terracotta' },
  'épinard': { icon: Leaf, color: 'text-success' },
  'epinard': { icon: Leaf, color: 'text-success' },
  'salade': { icon: Leaf, color: 'text-success' },
  'concombre': { icon: Leaf, color: 'text-success' },
  'avocat': { icon: Leaf, color: 'text-success' },
  'pomme de terre': { icon: Leaf, color: 'text-accent' },
  
  'viande': { icon: Beef, color: 'text-coral' },
  'poulet': { icon: Beef, color: 'text-coral' },
  'bœuf': { icon: Beef, color: 'text-coral' },
  'boeuf': { icon: Beef, color: 'text-coral' },
  'porc': { icon: Beef, color: 'text-terracotta' },
  'poisson': { icon: Beef, color: 'text-blue-500' },
  'crevette': { icon: Beef, color: 'text-coral' },
  'œuf': { icon: Beef, color: 'text-accent' },
  'oeuf': { icon: Beef, color: 'text-accent' },
  'jambon': { icon: Beef, color: 'text-coral' },
  'saucisse': { icon: Beef, color: 'text-terracotta' },
  'lardon': { icon: Beef, color: 'text-terracotta' },
  'tofu': { icon: Beef, color: 'text-accent' },
  
  'lait': { icon: Milk, color: 'text-blue-400' },
  'beurre': { icon: Milk, color: 'text-accent' },
  'fromage': { icon: Milk, color: 'text-accent' },
  'crème': { icon: Milk, color: 'text-blue-400' },
  'creme': { icon: Milk, color: 'text-blue-400' },
  'yaourt': { icon: Milk, color: 'text-blue-400' },
  'mozzarella': { icon: Milk, color: 'text-accent' },
  'parmesan': { icon: Milk, color: 'text-accent' },
  
  'riz': { icon: Wheat, color: 'text-accent' },
  'pâte': { icon: Wheat, color: 'text-accent' },
  'pate': { icon: Wheat, color: 'text-accent' },
  'pâtes': { icon: Wheat, color: 'text-accent' },
  'pates': { icon: Wheat, color: 'text-accent' },
  'pain': { icon: Wheat, color: 'text-accent' },
  'farine': { icon: Wheat, color: 'text-terracotta' },
  'semoule': { icon: Wheat, color: 'text-accent' },
  'quinoa': { icon: Wheat, color: 'text-accent' },
  'tortilla': { icon: Wheat, color: 'text-accent' },
  
  'pomme': { icon: Apple, color: 'text-coral' },
  'banane': { icon: Apple, color: 'text-accent' },
  'orange': { icon: Apple, color: 'text-primary' },
  'citron': { icon: Apple, color: 'text-accent' },
  'fraise': { icon: Apple, color: 'text-coral' },
  'pêche': { icon: Apple, color: 'text-primary' },
  'peche': { icon: Apple, color: 'text-primary' },
  'poire': { icon: Apple, color: 'text-success' },
  'ananas': { icon: Apple, color: 'text-accent' },
  
  'sel': { icon: Cookie, color: 'text-muted-foreground' },
  'poivre': { icon: Cookie, color: 'text-muted-foreground' },
  'huile': { icon: Cookie, color: 'text-accent' },
  'vinaigre': { icon: Cookie, color: 'text-accent' },
  'moutarde': { icon: Cookie, color: 'text-accent' },
  'curry': { icon: Cookie, color: 'text-primary' },
  'herbe': { icon: Cookie, color: 'text-success' },
  'basilic': { icon: Cookie, color: 'text-success' },
  'persil': { icon: Cookie, color: 'text-success' },
  'miel': { icon: Cookie, color: 'text-accent' },
  'chocolat': { icon: Cookie, color: 'text-terracotta' },
  'sucre': { icon: Cookie, color: 'text-muted-foreground' },
}

function getCategoryForIngredient(ingredient: string): { icon: React.ElementType; color: string } {
  const lower = ingredient.toLowerCase()
  for (const [key, value] of Object.entries(ingredientCategories)) {
    if (lower.includes(key)) {
      return value
    }
  }
  return { icon: Package, color: 'text-muted-foreground' }
}

interface ShoppingListPanelProps {
  isOpen: boolean
  onClose: () => void
  onAddFromRecipe?: (recipeName: string, ingredients: string[]) => void
}

export function ShoppingListPanel({ isOpen, onClose, onAddFromRecipe }: ShoppingListPanelProps) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [groupByCategory, setGroupByCategory] = useState(false)

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/shopping')
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Failed to load shopping list:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadItems()
    }
  }, [isOpen, loadItems])

  const toggleItem = async (itemId: string, isChecked: boolean) => {
    try {
      await fetch('/api/shopping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, isChecked })
      })
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, isChecked } : item
      ))
    } catch (error) {
      console.error('Failed to update item:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'article',
        variant: 'destructive'
      })
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      await fetch('/api/shopping', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      })
      setItems(prev => prev.filter(item => item.id !== itemId))
      toast({
        title: 'Article supprimé',
        description: 'L\'article a été retiré de la liste'
      })
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'article',
        variant: 'destructive'
      })
    }
  }

  const clearAll = async () => {
    try {
      await fetch('/api/shopping', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true })
      })
      setItems([])
      toast({
        title: 'Liste vidée',
        description: 'Tous les articles ont été supprimés'
      })
    } catch (error) {
      console.error('Failed to clear list:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de vider la liste',
        variant: 'destructive'
      })
    }
  }

  const toggleAll = async (checked: boolean) => {
    try {
      const updatePromises = items.map(item => 
        fetch('/api/shopping', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: item.id, isChecked: checked })
        })
      )
      await Promise.all(updatePromises)
      setItems(prev => prev.map(item => ({ ...item, isChecked: checked })))
      toast({
        title: checked ? 'Tout coché' : 'Tout décoché',
        description: `${items.length} articles ${checked ? 'cochés' : 'décochés'}`
      })
    } catch (error) {
      console.error('Failed to toggle all:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les articles',
        variant: 'destructive'
      })
    }
  }

  const checkedCount = items.filter(i => i.isChecked).length
  const uncheckedCount = items.length - checkedCount

  // Group items by category
  const groupedItems = React.useMemo(() => {
    if (!groupByCategory) {
      return { 'Tous les articles': items }
    }
    
    const groups: { [key: string]: ShoppingItem[] } = {}
    for (const item of items) {
      const category = getCategoryForIngredient(item.ingredient)
      const categoryName = category.icon.displayName || 'Autres'
      if (!groups[categoryName]) {
        groups[categoryName] = []
      }
      groups[categoryName].push(item)
    }
    return groups
  }, [items, groupByCategory])

  // Panel transition classes with warm theme
  const panelClasses = `fixed inset-y-0 right-0 w-full sm:w-96 bg-card shadow-2xl z-[200] transform transition-transform duration-300 ease-in-out pointer-events-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[190] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={panelClasses}>
        <div className="h-full flex flex-col">
          {/* Header with warm gradient */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg">Liste de courses</h2>
                <p className="text-sm text-primary-foreground/80">
                  {items.length} article{items.length !== 1 ? 's' : ''} • {checkedCount} coché{checkedCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-primary-foreground hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Action buttons */}
          <div className="p-3 border-b bg-muted/50 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAll(true)}
              disabled={items.length === 0 || checkedCount === items.length}
              className="text-primary border-primary/30 hover:bg-primary/10"
            >
              <Check className="w-4 h-4 mr-1" />
              Tout cocher
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAll(false)}
              disabled={items.length === 0 || uncheckedCount === items.length}
              className="text-muted-foreground"
            >
              <Check className="w-4 h-4 mr-1 opacity-0" />
              Tout décocher
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGroupByCategory(!groupByCategory)}
              className={groupByCategory ? 'bg-primary/10 text-primary border-primary/30' : ''}
            >
              <Package className="w-4 h-4 mr-1" />
              Catégories
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={items.length === 0}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Vider
            </Button>
          </div>

          {/* Items list */}
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <div className="p-4 rounded-2xl bg-muted/50 mb-3">
                  <ShoppingCart className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-sm font-medium">Votre liste est vide</p>
                <p className="text-xs mt-1">Ajoutez des ingrédients depuis une recette</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                  <div key={category}>
                    {groupByCategory && (
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-1">
                        {category}
                      </h3>
                    )}
                    <div className="space-y-1">
                      {categoryItems.map((item) => {
                        const cat = getCategoryForIngredient(item.ingredient)
                        const IconComponent = cat.icon
                        return (
                          <Card 
                            key={item.id} 
                            className={`transition-all duration-200 border-0 shadow-sm ${
                              item.isChecked 
                                ? 'bg-success/10 border-l-2 border-l-success' 
                                : 'bg-card hover:shadow-md'
                            }`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={item.isChecked}
                                  onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                                  className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <IconComponent className={`w-4 h-4 ${cat.color}`} />
                                    <span className={`font-medium text-sm ${item.isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                      {item.ingredient}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs bg-muted">
                                      {item.quantity} {item.unit || 'pièces'}
                                    </Badge>
                                    {item.recipeNames.length > 0 && (
                                      <span className="text-xs text-muted-foreground truncate">
                                        pour: {item.recipeNames.join(', ')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => deleteItem(item.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                    {groupByCategory && <Separator className="my-3" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer with progress */}
          {items.length > 0 && (
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progression</span>
                <span className="text-sm font-medium text-primary">
                  {Math.round((checkedCount / items.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                  style={{ width: `${(checkedCount / items.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {checkedCount} sur {items.length} articles cochés
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ShoppingListPanel
