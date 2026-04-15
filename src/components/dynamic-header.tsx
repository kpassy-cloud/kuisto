'use client'

import { useI18n } from '@/lib/i18n'
import { getCurrentSeason, seasonNames, getSeasonEmoji } from '@/lib/seasonal'
import { motion } from 'framer-motion'
import { Sun, Sunset, Moon } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'

type TimeOfDay = 'morning' | 'afternoon' | 'evening'

// Cached time of day - computed once per hour
let cachedTimeOfDay: TimeOfDay | null = null
let lastCacheHour = -1

function getTimeOfDaySnapshot(): TimeOfDay {
  const now = new Date()
  const hour = now.getHours()
  
  // Return cached result if same hour
  if (cachedTimeOfDay && lastCacheHour === hour) {
    return cachedTimeOfDay
  }
  
  lastCacheHour = hour
  if (hour >= 5 && hour < 12) {
    cachedTimeOfDay = 'morning'
  } else if (hour >= 12 && hour < 18) {
    cachedTimeOfDay = 'afternoon'
  } else {
    cachedTimeOfDay = 'evening'
  }
  
  return cachedTimeOfDay
}

function getGradientClass(time: TimeOfDay): string {
  switch (time) {
    case 'morning':
      return 'gradient-morning'
    case 'afternoon':
      return 'gradient-afternoon'
    case 'evening':
      return 'gradient-evening'
  }
}

// Map time of day to icon component
const timeIcons = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
}

// Subscribe function that never triggers updates (time changes hourly)
const subscribe = () => () => {}

export function DynamicHeader() {
  const { t } = useI18n()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  // Use useSyncExternalStore for SSR-safe time with cached snapshot
  const timeOfDay = useSyncExternalStore(
    subscribe,
    getTimeOfDaySnapshot,
    () => 'morning' as TimeOfDay // Server snapshot
  )
  
  const season = getCurrentSeason()
  const seasonEmoji = getSeasonEmoji(season)
  const TimeIcon = timeIcons[timeOfDay]
  
  const greeting = timeOfDay === 'morning' 
    ? t('greetingMorning')
    : timeOfDay === 'afternoon'
    ? t('greetingAfternoon')
    : t('greetingEvening')
    
  const question = timeOfDay === 'morning'
    ? t('greetingMorningQuestion')
    : timeOfDay === 'afternoon'
    ? t('greetingAfternoonQuestion')
    : t('greetingEveningQuestion')
  
  // Get text colors based on time of day and theme
  const getTextColors = () => {
    if (isDark) {
      // Dark mode: always light text
      return {
        title: 'text-white',
        question: 'text-white/80',
        seasonBg: 'bg-black/30',
        seasonText: 'text-white',
        seasonMuted: 'text-white/70',
        icon: 'text-primary'
      }
    }
    
    // Light mode: adjust based on time of day
    if (timeOfDay === 'evening') {
      // Evening gradient is dark in light mode too
      return {
        title: 'text-white',
        question: 'text-white/85',
        seasonBg: 'bg-white/20',
        seasonText: 'text-white',
        seasonMuted: 'text-white/80',
        icon: 'text-white'
      }
    }
    
    // Morning/afternoon in light mode: dark text
    return {
      title: 'text-gray-900',
      question: 'text-gray-700',
      seasonBg: 'bg-white/70',
      seasonText: 'text-gray-900',
      seasonMuted: 'text-gray-600',
      icon: 'text-primary'
    }
  }
  
  const colors = getTextColors()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden px-4 py-6 rounded-2xl mb-6 ${getGradientClass(timeOfDay)}`}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <TimeIcon className="w-full h-full" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <TimeIcon className={`w-5 h-5 ${colors.icon}`} />
          <h2 className={`font-serif text-2xl md:text-3xl font-semibold ${colors.title}`}>
            {greeting}
          </h2>
        </div>
        <p className={`text-sm md:text-base ${colors.question}`}>
          {question}
        </p>
        
        {/* Season indicator */}
        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 ${colors.seasonBg} backdrop-blur-sm rounded-full text-sm`}>
          <span>{seasonEmoji}</span>
          <span className={`font-medium ${colors.seasonText}`}>{seasonNames[season]}</span>
          <span className={colors.seasonMuted}>•</span>
          <span className={colors.seasonMuted}>{t('inSeason')}</span>
        </div>
      </div>
    </motion.div>
  )
}
