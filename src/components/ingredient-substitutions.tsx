'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRightLeft, Search, Lightbulb, AlertTriangle, 
  Check, X, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface Substitution {
  original: string
  substitute: string
  ratio: string
  notes?: string
  dietary?: string[]
  category: string
}

interface IngredientSubstitutionsProps {
  ingredients?: string[]
  onSubstitute?: (original: string, substitute: string) => void
}

// Database of ingredient substitutions
const substitutionDatabase: Substitution[] = [
  // Dairy
  { original: 'beurre', substitute: 'huile de coco', ratio: '3:4', notes: 'Pour la cuisson', dietary: ['vegan', 'dairy-free'], category: 'Produits laitiers' },
  { original: 'beurre', substitute: 'purée d\'amande', ratio: '1:1', notes: 'Pour les pâtisseries', dietary: ['vegan', 'dairy-free'], category: 'Produits laitiers' },
  { original: 'lait', substitute: 'lait d\'amande', ratio: '1:1', dietary: ['vegan', 'dairy-free'], category: 'Produits laitiers' },
  { original: 'lait', substitute: 'lait de coco', ratio: '1:1', notes: 'Goût plus riche', dietary: ['vegan', 'dairy-free'], category: 'Produits laitiers' },
  { original: 'crème fraîche', substitute: 'yaourt grec', ratio: '1:1', notes: 'Moins gras', dietary: [], category: 'Produits laitiers' },
  { original: 'crème fraîche', substitute: 'crème de coco', ratio: '1:1', dietary: ['vegan', 'dairy-free'], category: 'Produits laitiers' },
  { original: 'fromage râpé', substitute: 'levure nutritionnelle', ratio: '1:1', notes: 'Goût fromager', dietary: ['vegan', 'dairy-free'], category: 'Produits laitiers' },
  { original: 'œuf', substitute: 'graines de lin moulues + eau', ratio: '1 œuf = 1 c.s. lin + 3 c.s. eau', notes: 'Pour les pâtisseries', dietary: ['vegan'], category: 'Produits laitiers' },
  { original: 'œuf', substitute: 'compote de pommes', ratio: '1 œuf = 1/4 tasse', notes: 'Pour gâteaux/muffins', dietary: ['vegan', 'fat-free'], category: 'Produits laitiers' },
  { original: 'œuf', substitute: 'tofu soyeux', ratio: '1 œuf = 1/4 tasse tofu mixé', notes: 'Pour quiches/crèmes', dietary: ['vegan'], category: 'Produits laitiers' },
  
  // Flour & Starches
  { original: 'farine de blé', substitute: 'farine d\'amande', ratio: '3:4', notes: 'Sans gluten, plus riche', dietary: ['gluten-free', 'keto'], category: 'Féculents' },
  { original: 'farine de blé', substitute: 'farine de coco', ratio: '1:4', notes: 'Absorbe plus de liquide', dietary: ['gluten-free', 'keto', 'vegan'], category: 'Féculents' },
  { original: 'farine de blé', substitute: 'farine d\'avoine', ratio: '3:4', notes: 'Doit être certifiée sans gluten', dietary: ['gluten-free', 'vegan'], category: 'Féculents' },
  { original: 'chapelure', substitute: 'chapelure sans gluten', ratio: '1:1', dietary: ['gluten-free'], category: 'Féculents' },
  { original: 'chapelure', substitute: 'noix/graines broyées', ratio: '1:1', notes: 'Plus croquant', dietary: ['gluten-free', 'keto'], category: 'Féculents' },
  { original: 'pâtes', substitute: 'pâtes de courgettes', ratio: '1:1', notes: 'Faible en glucides', dietary: ['gluten-free', 'keto', 'low-carb'], category: 'Féculents' },
  { original: 'pâtes', substitute: 'pâtes de riz', ratio: '1:1', dietary: ['gluten-free'], category: 'Féculents' },
  { original: 'riz', substitute: 'riz de chou-fleur', ratio: '1:1', notes: 'Faible en glucides', dietary: ['gluten-free', 'keto', 'low-carb'], category: 'Féculents' },
  { original: 'riz', substitute: 'quinoa', ratio: '1:1', notes: 'Plus de protéines', dietary: ['gluten-free'], category: 'Féculents' },
  
  // Sweeteners
  { original: 'sucre', substitute: 'sirop d\'érable', ratio: '3:4', notes: 'Réduire liquide de 3 c.s.', dietary: ['vegan'], category: 'Sucres' },
  { original: 'sucre', substitute: 'miel', ratio: '2:3', notes: 'Réduire liquide de 2 c.s.', dietary: [], category: 'Sucres' },
  { original: 'sucre', substitute: 'stévia', ratio: '1 c.s. sucre = 1 pincée', notes: 'Très concentré', dietary: ['vegan', 'keto', 'zero-calorie'], category: 'Sucres' },
  { original: 'sucre', substitute: 'purée de dattes', ratio: '1:1', notes: 'Fibres ajoutées', dietary: ['vegan', 'natural'], category: 'Sucres' },
  
  // Oils & Fats
  { original: 'huile végétale', substitute: 'huile d\'olive', ratio: '1:1', notes: 'Meilleur goût, cuisson à feu moyen', dietary: [], category: 'Huiles' },
  { original: 'huile végétale', substitute: 'huile d\'avocat', ratio: '1:1', notes: 'Point de fumée élevé', dietary: ['keto'], category: 'Huiles' },
  { original: 'huile végétale', substitute: 'purée d\'avocat', ratio: '1:1', notes: 'Pour pâtisseries', dietary: ['vegan', 'whole-food'], category: 'Huiles' },
  
  // Proteins
  { original: 'viande hachée', substitute: 'tofu émietté', ratio: '1:1', notes: 'Bien assaisonner', dietary: ['vegan', 'vegetarian'], category: 'Protéines' },
  { original: 'viande hachée', substitute: 'lentilles cuites', ratio: '1:1', notes: 'Pour sauces, chili', dietary: ['vegan', 'vegetarian'], category: 'Protéines' },
  { original: 'poulet', substitute: 'tofu ferme', ratio: '1:1', notes: 'Mariner longtemps', dietary: ['vegan', 'vegetarian'], category: 'Protéines' },
  { original: 'poulet', substitute: 'seitan', ratio: '1:1', notes: 'Texture similaire', dietary: ['vegetarian'], category: 'Protéines' },
  { original: 'poisson', substitute: 'tofu fumé', ratio: '1:1', notes: 'Goût fumé similaire', dietary: ['vegan', 'vegetarian'], category: 'Protéines' },
  { original: 'thon en conserve', substitute: 'cœurs de palmier émiettés', ratio: '1:1', notes: 'Texture similaire', dietary: ['vegan', 'vegetarian'], category: 'Protéines' },
  
  // Herbs & Spices
  { original: 'sel', substitute: 'herbes séchées', ratio: 'au goût', notes: 'Réduire sodium', dietary: ['low-sodium'], category: 'Épices' },
  { original: 'sel', substitute: 'citron', ratio: 'jus au goût', notes: 'Rehausse les saveurs', dietary: ['low-sodium'], category: 'Épices' },
  { original: 'ail frais', substitute: 'ail en poudre', ratio: '1 gousse = 1/4 c.t.', dietary: [], category: 'Épices' },
  { original: 'oignon frais', substitute: 'poudre d\'oignon', ratio: '1 oignon = 1 c.s.', dietary: [], category: 'Épices' },
  { original: 'basilic frais', substitute: 'basilic séché', ratio: '3:1 frais:séché', dietary: [], category: 'Épices' },
  
  // Leavening
  { original: 'levure chimique', substitute: 'bicarbonate + crème de tartre', ratio: '1 c.c. = 1/2 c.c. bicarbonate + 1/2 c.c. crème de tartre', dietary: [], category: 'Levage' },
  { original: 'levure chimique', substitute: 'levure boulangère', ratio: 'Ne pas substituer', notes: 'Fonctionne différemment', dietary: [], category: 'Levage' },
  
  // Thickeners
  { original: 'farine (épaississant)', substitute: 'fécule de maïs', ratio: '2:1 fécule:farine', notes: 'Dissoudre d\'abord dans l\'eau froide', dietary: ['gluten-free'], category: 'Épaississants' },
  { original: 'farine (épaississant)', substitute: 'arrow-root', ratio: '2:1 arrow-root:farine', dietary: ['gluten-free'], category: 'Épaississants' },
  { original: 'crème (épaississant)', substitute: 'purée de légumineuses', ratio: '1/4 tasse', notes: 'Ajoute des protéines', dietary: ['vegan'], category: 'Épaississants' },
  
  // Buttermilk
  { original: 'babeurre', substitute: 'lait + vinaigre/citron', ratio: '1 tasse lait + 1 c.s. vinaigre', notes: 'Laisser reposer 5 min', dietary: ['vegetarian'], category: 'Produits laitiers' },
]

const categories = [
  { id: 'all', labelFr: 'Tous', labelEn: 'All' },
  { id: 'Produits laitiers', labelFr: 'Produits laitiers', labelEn: 'Dairy' },
  { id: 'Féculents', labelFr: 'Féculents', labelEn: 'Starches' },
  { id: 'Sucres', labelFr: 'Sucres', labelEn: 'Sweeteners' },
  { id: 'Protéines', labelFr: 'Protéines', labelEn: 'Proteins' },
  { id: 'Épices', labelFr: 'Épices', labelEn: 'Spices' },
  { id: 'Huiles', labelFr: 'Huiles', labelEn: 'Oils' },
  { id: 'Épaississants', labelFr: 'Épaississants', labelEn: 'Thickeners' },
]

export function IngredientSubstitutions({ ingredients, onSubstitute }: IngredientSubstitutionsProps) {
  const { t, language } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedSub, setExpandedSub] = useState<string | null>(null)

  // Filter substitutions
  const filteredSubstitutions = useMemo(() => {
    return substitutionDatabase.filter(sub => {
      const matchesSearch = searchQuery === '' || 
        sub.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.substitute.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || sub.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  // Get suggestions for recipe ingredients
  const suggestions = useMemo(() => {
    if (!ingredients || ingredients.length === 0) return []
    
    return ingredients.flatMap(ing => {
      const ingLower = ing.toLowerCase()
      return substitutionDatabase
        .filter(sub => ingLower.includes(sub.original.toLowerCase()))
        .map(sub => ({ ...sub, ingredient: ing }))
    })
  }, [ingredients])

  const getDietaryBadge = (dietary?: string[]) => {
    if (!dietary || dietary.length === 0) return null
    
    return dietary.map(d => {
      let color = 'bg-gray-100 text-gray-600'
      let label = d
      
      switch (d) {
        case 'vegan':
          color = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
          label = 'Vegan'
          break
        case 'vegetarian':
          color = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
          label = language === 'fr' ? 'Végétarien' : 'Vegetarian'
          break
        case 'gluten-free':
          color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          label = language === 'fr' ? 'Sans gluten' : 'Gluten-free'
          break
        case 'dairy-free':
          color = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          label = language === 'fr' ? 'Sans lactose' : 'Dairy-free'
          break
        case 'keto':
          color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
          label = 'Keto'
          break
        case 'low-carb':
          color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
          label = language === 'fr' ? 'Faible glucides' : 'Low-carb'
          break
        case 'low-sodium':
          color = 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
          label = language === 'fr' ? 'Faible sodium' : 'Low-sodium'
          break
      }
      
      return (
        <Badge key={d} variant="outline" className={`text-[10px] ${color}`}>
          {label}
        </Badge>
      )
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          {language === 'fr' ? 'Substitutions d\'ingrédients' : 'Ingredient Substitutions'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={language === 'fr' ? 'Rechercher un ingrédient...' : 'Search for an ingredient...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : ''}
            >
              {language === 'fr' ? cat.labelFr : cat.labelEn}
            </Button>
          ))}
        </div>

        {/* Suggestions for recipe ingredients */}
        {suggestions.length > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {language === 'fr' ? 'Suggestions pour votre recette' : 'Suggestions for your recipe'}
              </span>
            </div>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((sub, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{sub.ingredient}</span>
                  <ArrowRightLeft className="w-3 h-3 text-primary" />
                  <span className="font-medium">{sub.substitute}</span>
                  {sub.dietary && sub.dietary.length > 0 && (
                    <div className="flex gap-1">{getDietaryBadge(sub.dietary)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Substitution List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredSubstitutions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {language === 'fr' 
                  ? 'Aucune substitution trouvée'
                  : 'No substitutions found'}
              </p>
            </div>
          ) : (
            filteredSubstitutions.map((sub, index) => {
              const isExpanded = expandedSub === `${sub.original}-${sub.substitute}`
              
              return (
                <motion.div
                  key={`${sub.original}-${sub.substitute}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedSub(isExpanded ? null : `${sub.original}-${sub.substitute}`)}
                    className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sub.original}</span>
                        <ArrowRightLeft className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">{sub.substitute}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.dietary && sub.dietary.length > 0 && (
                        <div className="hidden sm:flex gap-1">{getDietaryBadge(sub.dietary.slice(0, 2))}</div>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 pt-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {language === 'fr' ? 'Ratio' : 'Ratio'}: {sub.ratio}
                            </Badge>
                            <Badge variant="outline">
                              {sub.category}
                            </Badge>
                          </div>
                          
                          {sub.notes && (
                            <p className="text-sm text-muted-foreground flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              {sub.notes}
                            </p>
                          )}
                          
                          {sub.dietary && sub.dietary.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {getDietaryBadge(sub.dietary)}
                            </div>
                          )}
                          
                          {onSubstitute && (
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => onSubstitute(sub.original, sub.substitute)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {language === 'fr' ? 'Appliquer' : 'Apply'}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            {language === 'fr' 
              ? 'Les substitutions peuvent affecter le goût et la texture. Testez d\'abord avec de petites quantités.'
              : 'Substitutions may affect taste and texture. Test with small quantities first.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
