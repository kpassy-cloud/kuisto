'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Key, CheckCircle, AlertCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { toast } from '@/hooks/use-toast'

interface AdminSetupProps {
  userEmail: string | null | undefined
  isAdmin: boolean
  onAdminStatusChange: () => void
}

export function AdminSetup({ userEmail, isAdmin, onAdminStatusChange }: AdminSetupProps) {
  const { language } = useI18n()
  const [secretKey, setSecretKey] = useState('kuisto-admin-2024')
  const [isLoading, setIsLoading] = useState(false)
  const [adminCount, setAdminCount] = useState(0)
  
  useEffect(() => {
    fetchAdminStatus()
  }, [])
  
  const fetchAdminStatus = async () => {
    try {
      const res = await fetch('/api/admin/setup')
      const data = await res.json()
      setAdminCount(data.adminCount || 0)
    } catch (err) {
      console.error('Failed to fetch admin status:', err)
    }
  }
  
  const handlePromoteToAdmin = async () => {
    if (!userEmail) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Vous devez être connecté' : 'You must be logged in',
        variant: 'destructive'
      })
      return
    }
    
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, secretKey })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast({
          title: language === 'fr' ? 'Succès!' : 'Success!',
          description: language === 'fr' 
            ? 'Vous êtes maintenant administrateur. Reconnectez-vous pour voir le dashboard.'
            : 'You are now an admin. Re-login to see the dashboard.',
        })
        onAdminStatusChange()
        fetchAdminStatus()
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: data.error || (language === 'fr' ? 'Échec de la promotion' : 'Failed to promote'),
          variant: 'destructive'
        })
      }
    } catch (err) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Une erreur est survenue' : 'An error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isAdmin) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-300">
                {language === 'fr' ? 'Vous êtes administrateur' : 'You are an administrator'}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {language === 'fr' 
                  ? 'Accédez au dashboard via le bouton Admin dans le header'
                  : 'Access the dashboard via the Admin button in the header'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <Shield className="w-5 h-5" />
          {language === 'fr' ? 'Devenir administrateur' : 'Become an administrator'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {language === 'fr' 
            ? 'Entrez la clé secrète pour obtenir les droits d\'administrateur.'
            : 'Enter the secret key to get administrator privileges.'}
        </p>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder={language === 'fr' ? 'Clé secrète' : 'Secret key'}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handlePromoteToAdmin}
            disabled={isLoading || !userEmail}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading 
              ? (language === 'fr' ? 'Chargement...' : 'Loading...')
              : (language === 'fr' ? 'Promouvoir' : 'Promote')}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3" />
          <span>
            {language === 'fr' 
              ? `${adminCount} administrateur(s) actuellement`
              : `${adminCount} admin(s) currently`}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
