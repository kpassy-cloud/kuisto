'use client'

import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
      className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary gap-1"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">{language.toUpperCase()}</span>
    </Button>
  )
}
