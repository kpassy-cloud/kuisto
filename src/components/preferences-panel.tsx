'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, Settings, Leaf, Wheat, Milk, Flame, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export interface Preferences {
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  lactoseFree: boolean
  keto: boolean
  halal: boolean
  kosher: boolean
  nutAllergy: boolean
  peanutAllergy: boolean
  shellfishAllergy: boolean
  eggAllergy: boolean
  soyAllergy: boolean
  fishAllergy: boolean
  servingSize: number
  difficultyLevel: string
  maxPrepTime: number
}

// Dietary options
const dietaryOptions = [
  { id: 'vegetarian', icon: Leaf },
  { id: 'vegan', icon: Leaf },
  { id: 'glutenFree', icon: Wheat },
  { id: 'lactoseFree', icon: Milk },
  { id: 'keto', icon: Flame },
  { id: 'halal', icon: Check },
  { id: 'kosher', icon: Check },
]

// Allergy options
const allergyOptions = [
  { id: 'nutAllergy' },
  { id: 'peanutAllergy' },
  { id: 'shellfishAllergy' },
  { id: 'eggAllergy' },
  { id: 'soyAllergy' },
  { id: 'fishAllergy' },
]

interface PreferencesPanelProps {
  isOpen: boolean
  preferences: Preferences
  onClose: () => void
  onToggle: (key: keyof Preferences) => void
}

export function PreferencesPanel({
  isOpen,
  preferences,
  onClose,
  onToggle
}: PreferencesPanelProps) {
  const { t } = useI18n()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-b bg-gradient-to-r from-primary/5 via-muted/30 to-primary/5"
        >
          <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Settings className="w-4 h-4 text-primary" />
                </div>
                {t('preferences')}
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-muted">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
              {dietaryOptions.map((option) => {
                const IconComponent = option.icon
                const isSelected = preferences[option.id as keyof Preferences]
                return (
                  <button
                    key={option.id}
                    onClick={() => onToggle(option.id as keyof Preferences)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border hover:border-primary/30 hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {t(option.id as any)}
                    {isSelected && <Check className="w-3 h-3 ml-auto" />}
                  </button>
                )
              })}
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">{t('allergies')}:</p>
              <div className="flex flex-wrap gap-2">
                {allergyOptions.map((option) => {
                  const isSelected = preferences[option.id as keyof Preferences]
                  return (
                    <button
                      key={option.id}
                      onClick={() => onToggle(option.id as keyof Preferences)}
                      className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-coral bg-coral/10 text-coral'
                          : 'border-border hover:border-coral/30 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t(option.id as any)}
                      {isSelected && ' ✕'}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
