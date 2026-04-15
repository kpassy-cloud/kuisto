'use client'

import { useState, useEffect, useCallback } from 'react'

interface EngagementState {
  timeOnPage: number // seconds
  scrollDepth: number // percentage 0-100
  articlesViewed: number
  hasInteracted: boolean
}

interface UseEngagementTrackerProps {
  onEngagementThreshold?: () => void
  timeThreshold?: number // seconds before showing signup prompt
  scrollThreshold?: number // scroll percentage before showing signup
  articleThreshold?: number // number of articles viewed
}

export function useEngagementTracker({
  onEngagementThreshold,
  timeThreshold = 45, // 45 seconds default
  scrollThreshold = 70, // 70% scroll default
  articleThreshold = 3 // 3 articles viewed default
}: UseEngagementTrackerProps = {}) {
  const [state, setState] = useState<EngagementState>({
    timeOnPage: 0,
    scrollDepth: 0,
    articlesViewed: 0,
    hasInteracted: false
  })
  
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false)
  const [promptShown, setPromptShown] = useState(false)

  // Time tracker
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeOnPage: prev.timeOnPage + 1
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Scroll tracker
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      
      setState(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollPercent),
        hasInteracted: true
      }))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check if threshold is met
  useEffect(() => {
    if (promptShown) return

    const { timeOnPage, scrollDepth, articlesViewed } = state
    
    // Show prompt when ANY threshold is met
    const timeThresholdMet = timeOnPage >= timeThreshold
    const scrollThresholdMet = scrollDepth >= scrollThreshold
    const articleThresholdMet = articlesViewed >= articleThreshold

    if (timeThresholdMet || scrollThresholdMet || articleThresholdMet) {
      // Use setTimeout to avoid cascading renders
      const timer = setTimeout(() => {
        setShouldShowPrompt(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [state, timeThreshold, scrollThreshold, articleThreshold, promptShown])

  const markArticleViewed = useCallback(() => {
    setState(prev => ({
      ...prev,
      articlesViewed: prev.articlesViewed + 1,
      hasInteracted: true
    }))
  }, [])

  const markPromptShown = useCallback(() => {
    setPromptShown(true)
    setShouldShowPrompt(false)
  }, [])

  const resetPrompt = useCallback(() => {
    setPromptShown(false)
    setShouldShowPrompt(false)
  }, [])

  // Trigger callback when prompt should show
  useEffect(() => {
    if (shouldShowPrompt && onEngagementThreshold && !promptShown) {
      // Use setTimeout to avoid calling during render
      const timer = setTimeout(() => {
        onEngagementThreshold()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [shouldShowPrompt, onEngagementThreshold, promptShown])

  return {
    ...state,
    shouldShowPrompt,
    promptShown,
    markArticleViewed,
    markPromptShown,
    resetPrompt
  }
}
