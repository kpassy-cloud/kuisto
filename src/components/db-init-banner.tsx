'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Database, Loader2, Check, AlertCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function DbInitBanner() {
  const { language } = useI18n()
  const [show, setShow] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'checking' | 'needs-init' | 'initializing' | 'done' | 'error'>('checking')
  const [initResult, setInitResult] = useState<{ email: string; password: string; adminKey: string } | null>(null)

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    try {
      const res = await fetch('/api/admin/init-db')
      const data = await res.json()
      
      if (data.needsInit) {
        setShow(true)
        setStatus('needs-init')
      } else {
        setShow(false)
      }
    } catch (err) {
      console.error('Failed to check database:', err)
    }
  }

  const initializeDatabase = async () => {
    setIsLoading(true)
    setStatus('initializing')
    
    try {
      const res = await fetch('/api/admin/init-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initKey: 'kuisto-init-2024',
          email: 'admin@kuisto.ca',
          password: 'Admin123!',
          name: 'Admin'
        })
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        setStatus('done')
        setInitResult({
          email: data.login.email,
          password: data.login.password,
          adminKey: data.adminKey?.key || ''
        })
      } else {
        setStatus('error')
        console.error('Init failed:', data)
      }
    } catch (err) {
      setStatus('error')
      console.error('Init error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-[300] bg-amber-500 text-white p-4 shadow-lg"
      >
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-start gap-4">
            <Database className="w-6 h-6 shrink-0 mt-0.5" />
            
            <div className="flex-1">
              {status === 'needs-init' && (
                <>
                  <h3 className="font-semibold mb-1">
                    {language === 'fr' ? 'Base de données vide' : 'Empty database'}
                  </h3>
                  <p className="text-sm text-white/90 mb-3">
                    {language === 'fr' 
                      ? 'La base de données n\'a pas encore été initialisée. Cliquez pour créer un compte administrateur par défaut.'
                      : 'The database has not been initialized yet. Click to create a default admin account.'}
                  </p>
                  <Button
                    onClick={initializeDatabase}
                    disabled={isLoading}
                    className="bg-white text-amber-600 hover:bg-white/90"
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {language === 'fr' ? 'Initialisation...' : 'Initializing...'}
                      </>
                    ) : (
                      language === 'fr' ? 'Initialiser la base de données' : 'Initialize database'
                    )}
                  </Button>
                </>
              )}
              
              {status === 'done' && initResult && (
                <>
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    {language === 'fr' ? 'Base de données initialisée !' : 'Database initialized!'}
                  </h3>
                  <p className="text-sm text-white/90 mb-2">
                    {language === 'fr' 
                      ? 'Un compte administrateur a été créé. Utilisez ces identifiants pour vous connecter:'
                      : 'An admin account has been created. Use these credentials to login:'}
                  </p>
                  <div className="bg-white/20 rounded-lg p-3 text-sm font-mono space-y-1 mb-3">
                    <p><strong>Email:</strong> {initResult.email}</p>
                    <p><strong>Password:</strong> {initResult.password}</p>
                    {initResult.adminKey && (
                      <p><strong>Admin Key:</strong> {initResult.adminKey}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setShow(false)
                      window.location.reload()
                    }}
                    className="bg-white text-amber-600 hover:bg-white/90"
                    size="sm"
                  >
                    {language === 'fr' ? 'Fermer et actualiser' : 'Close and refresh'}
                  </Button>
                </>
              )}
              
              {status === 'error' && (
                <>
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {language === 'fr' ? 'Erreur' : 'Error'}
                  </h3>
                  <p className="text-sm text-white/90 mb-3">
                    {language === 'fr' 
                      ? 'Impossible d\'initialiser la base de données. Veuillez réessayer.'
                      : 'Could not initialize the database. Please try again.'}
                  </p>
                  <Button
                    onClick={initializeDatabase}
                    className="bg-white text-amber-600 hover:bg-white/90"
                    size="sm"
                  >
                    {language === 'fr' ? 'Réessayer' : 'Try again'}
                  </Button>
                </>
              )}
            </div>
            
            {status === 'needs-init' && (
              <button
                onClick={() => setShow(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
