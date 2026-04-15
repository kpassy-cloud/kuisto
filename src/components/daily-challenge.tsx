'use client'

import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Trophy, Sparkles } from 'lucide-react'
import { useSyncExternalStore } from 'react'

interface DailyChallengeProps {
  onJoin?: () => void
}

// Challenges list
const challenges = [
  { emoji: '🍋', title: 'Défi Citron : 3 recettes acidulées à tester' },
  { emoji: '🥕', title: 'Défi Carotte : Cuisinez orange cette semaine' },
  { emoji: '🍅', title: 'Défi Tomate : La star de l\'été' },
  { emoji: '🥑', title: 'Défi Avocat : Vert et crémeux' },
  { emoji: '🌶️', title: 'Défi Épices : Pimentez votre cuisine' },
  { emoji: '🧀', title: 'Défi Fromage : Gourmandise assurée' },
  { emoji: '🥬', title: 'Défi Vert : 5 légumes différents' },
]

// Cached challenge result - computed once per day
let cachedChallenge: { emoji: string; title: string; progress: number } | null = null
let lastCacheDay = -1

// Get challenge based on day of year (deterministic, cached)
function getDailyChallengeSnapshot(): { emoji: string; title: string; progress: number } {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  // Return cached result if same day
  if (cachedChallenge && lastCacheDay === dayOfYear) {
    return cachedChallenge
  }
  
  // Deterministic "random" progress based on day
  const progress = 50 + (dayOfYear * 7) % 30 // 50-80%
  
  cachedChallenge = {
    ...challenges[dayOfYear % challenges.length],
    progress
  }
  lastCacheDay = dayOfYear
  
  return cachedChallenge
}

// Static challenge for SSR
const serverChallenge = { emoji: '🍋', title: 'Défi du jour', progress: 67 }

// Subscribe function that never triggers updates (challenge only changes daily)
const subscribe = () => () => {}

export function DailyChallenge({ onJoin }: DailyChallengeProps) {
  const { t } = useI18n()
  
  // Use useSyncExternalStore for SSR-safe challenge with cached snapshot
  const challenge = useSyncExternalStore(
    subscribe,
    getDailyChallengeSnapshot,
    () => serverChallenge
  )
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-5 mb-6"
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
        {challenge.emoji}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg font-semibold">{t('dailyChallenge')}</h3>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{challenge.emoji}</span>
          <p className="text-foreground font-medium">{challenge.title}</p>
        </div>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span>{t('challengeProgress', { percent: challenge.progress })}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${challenge.progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
        </div>
        
        <Button 
          onClick={onJoin}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {t('joinChallenge')}
        </Button>
      </div>
    </motion.div>
  )
}
