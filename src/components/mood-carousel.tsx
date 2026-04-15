'use client'

import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Clock, Leaf, Sparkles, Heart, Flame, Apple } from 'lucide-react'

interface MoodOption {
  id: string
  icon: React.ElementType
  colorClass: string
  bgClass: string
}

const moods: MoodOption[] = [
  { id: 'quick', icon: Clock, colorClass: 'text-amber-600', bgClass: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700' },
  { id: 'vegan', icon: Leaf, colorClass: 'text-green-600', bgClass: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' },
  { id: 'new', icon: Sparkles, colorClass: 'text-purple-600', bgClass: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700' },
  { id: 'favorites', icon: Heart, colorClass: 'text-coral', bgClass: 'bg-coral/10 border-coral/30' },
  { id: 'comfort', icon: Flame, colorClass: 'text-orange-600', bgClass: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700' },
  { id: 'healthy', icon: Apple, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700' },
]

interface MoodCarouselProps {
  onMoodSelect?: (moodId: string) => void
  selectedMood?: string
}

export function MoodCarousel({ onMoodSelect, selectedMood }: MoodCarouselProps) {
  const { t } = useI18n()
  
  return (
    <div className="mb-6">
      <h3 className="font-serif text-lg font-semibold mb-3 text-foreground">
        {t('moodTitle')}
      </h3>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {moods.map((mood, index) => {
          const IconComponent = mood.icon
          const isSelected = selectedMood === mood.id
          
          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onMoodSelect?.(mood.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 min-w-[100px] transition-all ${
                isSelected 
                  ? `${mood.bgClass} border-primary shadow-lg scale-105`
                  : `${mood.bgClass} border-transparent hover:scale-105`
              }`}
            >
              <div className={`p-2 rounded-xl ${mood.colorClass} bg-white/50 dark:bg-black/10`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t(mood.id as any)}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
