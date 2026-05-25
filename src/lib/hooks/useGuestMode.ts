'use client'

import { useState, useEffect, useCallback } from 'react'

interface GuestUsage {
  recipesViewed: number
  articlesRead: number
  timeSpent: number // in seconds
  lastInteraction: number
}

interface GuestLimits {
  maxRecipesViewed: number
  maxArticlesRead: number
  maxTimeSpent: number // in seconds (5 minutes = 300)
}

const DEFAULT_LIMITS: GuestLimits = {
  maxRecipesViewed: 3,
  maxArticlesRead: 5,
  maxTimeSpent: 300 // 5 minutes
}

const STORAGE_KEY = 'kuisto_guest_usage'

export function useGuestMode(isAuthenticated: boolean) {
  const [usage, setUsage] = useState<GuestUsage>({
    recipesViewed: 0,
    articlesRead: 0,
    timeSpent: 0,
    lastInteraction: Date.now()
  })
  
  const [limits] = useState<GuestLimits>(DEFAULT_LIMITS)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null)

  // Load usage from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Reset if more than 24 hours old
          if (Date.now() - parsed.lastInteraction < 86400000) {
            setUsage(parsed)
          }
        } catch (e) {
          console.error('Failed to parse guest usage:', e)
        }
      }
    }
  }, [isAuthenticated])

  // Track time spent
  useEffect(() => {
    if (isAuthenticated) return
    
    const interval = setInterval(() => {
      setUsage(prev => {
        const newUsage = {
          ...prev,
          timeSpent: prev.timeSpent + 1,
          lastInteraction: Date.now()
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage))
        return newUsage
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Check limits
  const checkLimit = useCallback((type: 'recipes' | 'articles' | 'time'): boolean => {
    if (isAuthenticated) return true
    
    let limitReached = false
    let reason = ''
    
    switch (type) {
      case 'recipes':
        limitReached = usage.recipesViewed >= limits.maxRecipesViewed
        reason = `You've viewed ${usage.recipesViewed} of ${limits.maxRecipesViewed} free recipes`
        break
      case 'articles':
        limitReached = usage.articlesRead >= limits.maxArticlesRead
        reason = `You've read ${usage.articlesRead} of ${limits.maxArticlesRead} free articles`
        break
      case 'time':
        limitReached = usage.timeSpent >= limits.maxTimeSpent
        reason = `Your ${Math.floor(limits.maxTimeSpent / 60)} minute free trial has ended`
        break
    }
    
    if (limitReached) {
      setUpgradeReason(reason)
      setShowUpgradePrompt(true)
    }
    
    return !limitReached
  }, [usage, limits, isAuthenticated])

  // Increment usage
  const incrementUsage = useCallback((type: 'recipes' | 'articles') => {
    if (isAuthenticated) return
    
    setUsage(prev => {
      const newUsage = {
        ...prev,
        ...(type === 'recipes' && { recipesViewed: prev.recipesViewed + 1 }),
        ...(type === 'articles' && { articlesRead: prev.articlesRead + 1 }),
        lastInteraction: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage))
      return newUsage
    })
  }, [isAuthenticated])

  // Clear usage (for testing or on signup)
  const clearUsage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUsage({
      recipesViewed: 0,
      articlesRead: 0,
      timeSpent: 0,
      lastInteraction: Date.now()
    })
  }, [])

  // Get remaining counts
  const getRemaining = useCallback(() => ({
    recipes: Math.max(0, limits.maxRecipesViewed - usage.recipesViewed),
    articles: Math.max(0, limits.maxArticlesRead - usage.articlesRead),
    time: Math.max(0, limits.maxTimeSpent - usage.timeSpent)
  }), [usage, limits])

  // Check if user can access premium content
  const canAccessPremium = useCallback((): { allowed: boolean; reason?: string } => {
    if (isAuthenticated) {
      return { allowed: true }
    }
    
    const timeRemaining = limits.maxTimeSpent - usage.timeSpent
    if (timeRemaining <= 0) {
      return { 
        allowed: false, 
        reason: 'Your free trial has ended. Sign up to continue!' 
      }
    }
    
    return { allowed: true }
  }, [isAuthenticated, usage, limits])

  return {
    usage,
    limits,
    showUpgradePrompt,
    upgradeReason,
    checkLimit,
    incrementUsage,
    clearUsage,
    getRemaining,
    canAccessPremium,
    dismissUpgradePrompt: () => setShowUpgradePrompt(false)
  }
}
