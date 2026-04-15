'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useSyncExternalStore } from 'react'
import { translations, type Language, type TranslationKey } from './translations'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

// Get initial language synchronously (for SSR compatibility)
function getInitialLanguage(): Language {
  return 'fr'
}

// Custom store for language
const createLanguageStore = () => {
  let language: Language = 'fr'
  const listeners = new Set<() => void>()
  
  return {
    getSnapshot: () => language,
    getServerSnapshot: () => 'fr' as Language,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    setLanguage: (newLang: Language) => {
      language = newLang
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', newLang)
      }
      listeners.forEach(l => l())
    },
    initFromStorage: () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('language') as Language | null
        if (saved === 'en' || saved === 'fr') {
          language = saved
        } else {
          const browserLang = navigator.language.split('-')[0]
          if (browserLang === 'en') {
            language = 'en'
          }
        }
        listeners.forEach(l => l())
      }
    }
  }
}

const languageStore = createLanguageStore()

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.getSnapshot,
    languageStore.getServerSnapshot
  )
  
  // Initialize from storage on mount
  useEffect(() => {
    languageStore.initFromStorage()
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    languageStore.setLanguage(lang)
  }, [])

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || key
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, String(value))
      })
    }
    
    return text
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export { translations }
