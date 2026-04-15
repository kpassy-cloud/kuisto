'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Mail, Loader2, User, ChefHat, Lock, Check, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type View = 'login' | 'register' | 'forgot-password' | 'reset-password'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t, language } = useI18n()
  const { login, isLoading } = useAuth()
  
  // Form state
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Reset password state
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  // Check URL for reset token on mount
  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('reset-token')
      const emailParam = urlParams.get('email')
      
      if (token && emailParam) {
        setResetToken(token)
        setEmail(emailParam)
        setView('reset-password')
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [isOpen])

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setError('')
    setSuccess('')
    setResetToken('')
    setNewPassword('')
    setConfirmNewPassword('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError(language === 'fr' ? 'Veuillez entrer une adresse email valide' : 'Please enter a valid email address')
      return
    }

    if (!password) {
      setError(language === 'fr' ? 'Veuillez entrer votre mot de passe' : 'Please enter your password')
      return
    }

    const result = await login(email, password)
    
    if (result?.error) {
      switch (result.error) {
        case 'USER_NOT_FOUND':
          setError(language === 'fr' ? 'Aucun compte trouvé avec cette adresse email' : 'No account found with this email address')
          break
        case 'INVALID_PASSWORD':
          setError(language === 'fr' ? 'Mot de passe incorrect' : 'Incorrect password')
          break
        case 'PASSWORD_NOT_SET':
          setError(language === 'fr' ? 'Ce compte nécessite une réinitialisation du mot de passe' : 'This account requires password reset')
          // Auto-switch to forgot password
          setTimeout(() => setView('forgot-password'), 1500)
          break
        default:
          setError(language === 'fr' ? 'Erreur de connexion' : 'Login error')
      }
    } else {
      toast({
        title: language === 'fr' ? 'Connexion réussie' : 'Login successful',
        description: language === 'fr' ? 'Bienvenue sur Akanut !' : 'Welcome to Akanut!'
      })
      onClose()
      resetForm()
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError(language === 'fr' ? 'Veuillez entrer une adresse email valide' : 'Please enter a valid email address')
      return
    }

    if (!password || password.length < 6) {
      setError(language === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError(language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match')
      return
    }

    setIsRegistering(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined })
      })

      const data = await response.json()

      if (!response.ok) {
        switch (data.error) {
          case 'EMAIL_EXISTS':
            setError(language === 'fr' ? 'Un compte existe déjà avec cette adresse email' : 'An account already exists with this email')
            break
          case 'EMAIL_INVALID':
            setError(language === 'fr' ? 'Adresse email invalide' : 'Invalid email address')
            break
          case 'PASSWORD_TOO_SHORT':
            setError(language === 'fr' ? 'Le mot de passe est trop court' : 'Password is too short')
            break
          default:
            setError(data.message || (language === 'fr' ? 'Erreur lors de la création du compte' : 'Error creating account'))
        }
        return
      }

      // Auto login after registration
      const result = await login(email, password)
      
      if (result?.error) {
        setError(language === 'fr' ? 'Compte créé mais erreur de connexion automatique' : 'Account created but auto-login failed')
      } else {
        toast({
          title: language === 'fr' ? 'Compte créé !' : 'Account created!',
          description: language === 'fr' ? 'Bienvenue sur Akanut !' : 'Welcome to Akanut!'
        })
        onClose()
        resetForm()
      }
    } catch (err) {
      setError(language === 'fr' ? 'Erreur de connexion au serveur' : 'Server connection error')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (!email || !email.includes('@')) {
      setError(language === 'fr' ? 'Veuillez entrer une adresse email valide' : 'Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        // Always show the same message whether user exists or not (security)
        setSuccess(language === 'fr' 
          ? 'Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation. Vérifiez votre boîte de réception et vos spams.'
          : 'If an account exists with this email, you will receive a reset link. Check your inbox and spam folder.')
      } else {
        setError(data.message || (language === 'fr' ? 'Une erreur est survenue' : 'An error occurred'))
      }
    } catch (err) {
      setError(language === 'fr' ? 'Erreur de connexion au serveur' : 'Server connection error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!resetToken) {
      setError(language === 'fr' ? 'Token de réinitialisation manquant' : 'Reset token is missing')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setError(language === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError(language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          token: resetToken, 
          newPassword 
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Mot de passe réinitialisé !' : 'Password reset!',
          description: language === 'fr' 
            ? 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'
            : 'You can now log in with your new password.'
        })
        setView('login')
        setActiveTab('login')
        setPassword('')
        setResetToken('')
        setNewPassword('')
        setConfirmNewPassword('')
      } else {
        switch (data.error) {
          case 'INVALID_TOKEN':
            setError(language === 'fr' ? 'Le lien de réinitialisation est invalide ou expiré' : 'Reset link is invalid or expired')
            break
          case 'USER_NOT_FOUND':
            setError(language === 'fr' ? 'Utilisateur non trouvé' : 'User not found')
            break
          default:
            setError(data.message || (language === 'fr' ? 'Une erreur est survenue' : 'An error occurred'))
        }
      }
    } catch (err) {
      setError(language === 'fr' ? 'Erreur de connexion au serveur' : 'Server connection error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const renderBackButton = () => (
    <button
      onClick={() => {
        setView('login')
        setError('')
        setSuccess('')
      }}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      {language === 'fr' ? 'Retour à la connexion' : 'Back to login'}
    </button>
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-6 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg mx-auto mb-4">
              {view === 'forgot-password' || view === 'reset-password' ? (
                <KeyRound className="w-8 h-8" />
              ) : (
                <ChefHat className="w-8 h-8" />
              )}
            </div>
            
            <h2 className="font-serif text-2xl font-bold">
              {view === 'forgot-password' 
                ? (language === 'fr' ? 'Mot de passe oublié' : 'Forgot password')
                : view === 'reset-password'
                  ? (language === 'fr' ? 'Réinitialiser le mot de passe' : 'Reset password')
                  : (language === 'fr' ? 'Bienvenue sur Akanut' : 'Welcome to Akanut')
              }
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {view === 'forgot-password'
                ? (language === 'fr' 
                    ? 'Entrez votre email pour réinitialiser votre mot de passe' 
                    : 'Enter your email to reset your password')
                : view === 'reset-password'
                  ? (language === 'fr' 
                      ? 'Créez un nouveau mot de passe' 
                      : 'Create a new password')
                  : (language === 'fr' 
                      ? 'Connectez-vous ou créez un compte' 
                      : 'Sign in or create an account')
              }
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Forgot Password View */}
            {view === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {renderBackButton()}
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {language === 'fr' ? 'Adresse email' : 'Email address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" />
                      {success}
                    </div>
                    
                    {/* Option to enter code manually */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setView('reset-password')
                          setSuccess('')
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        {language === 'fr' ? 'J\'ai déjà un code de réinitialisation' : 'I already have a reset code'}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'fr' ? 'Envoi...' : 'Sending...'}
                    </>
                  ) : (
                    language === 'fr' ? 'Envoyer le lien de réinitialisation' : 'Send reset link'
                  )}
                </Button>
              </form>
            )}

            {/* Reset Password View */}
            {view === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {renderBackButton()}

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {language === 'fr' ? 'Adresse email' : 'Email address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {language === 'fr' ? 'Code de réinitialisation' : 'Reset code'}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={language === 'fr' ? 'Entrez le code reçu par email' : 'Enter the code received by email'}
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="pl-10 font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'fr' 
                      ? 'Le code se trouve dans l\'email de réinitialisation que vous avez reçu.'
                      : 'The code is in the reset email you received.'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {language === 'fr' ? 'Nouveau mot de passe' : 'New password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder={language === 'fr' ? 'Minimum 6 caractères' : 'Minimum 6 characters'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {newPassword.length > 0 && newPassword.length < 6 && (
                    <p className="text-xs text-amber-500 mt-1">
                      {language === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters'}
                    </p>
                  )}
                  {newPassword.length >= 6 && (
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {language === 'fr' ? 'Mot de passe valide' : 'Valid password'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {confirmNewPassword.length > 0 && newPassword !== confirmNewPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'}
                    </p>
                  )}
                  {confirmNewPassword.length > 0 && newPassword === confirmNewPassword && (
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {language === 'fr' ? 'Les mots de passe correspondent' : 'Passwords match'}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || !resetToken || !email || newPassword.length < 6 || newPassword !== confirmNewPassword}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'fr' ? 'Réinitialisation...' : 'Resetting...'}
                    </>
                  ) : (
                    language === 'fr' ? 'Réinitialiser le mot de passe' : 'Reset password'
                  )}
                </Button>
              </form>
            )}

            {/* Login/Register Tabs */}
            {(view === 'login' || view === 'register') && (
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'register'); setError(''); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">
                    {language === 'fr' ? 'Connexion' : 'Sign In'}
                  </TabsTrigger>
                  <TabsTrigger value="register">
                    {language === 'fr' ? 'Inscription' : 'Sign Up'}
                  </TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {language === 'fr' ? 'Adresse email' : 'Email address'}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="vous@exemple.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {language === 'fr' ? 'Mot de passe' : 'Password'}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setView('forgot-password')
                          setError('')
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        {language === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
                      </button>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'fr' ? 'Connexion...' : 'Signing in...'}
                        </>
                      ) : (
                        language === 'fr' ? 'Se connecter' : 'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {language === 'fr' ? 'Nom (optionnel)' : 'Name (optional)'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder={language === 'fr' ? 'Votre nom' : 'Your name'}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {language === 'fr' ? 'Adresse email' : 'Email address'}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="vous@exemple.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {language === 'fr' ? 'Mot de passe' : 'Password'}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder={language === 'fr' ? 'Minimum 6 caractères' : 'Minimum 6 characters'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {password.length > 0 && password.length < 6 && (
                        <p className="text-xs text-amber-500 mt-1">
                          {language === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters'}
                        </p>
                      )}
                      {password.length >= 6 && (
                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {language === 'fr' ? 'Mot de passe valide' : 'Valid password'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {confirmPassword.length > 0 && password !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          {language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'}
                        </p>
                      )}
                      {confirmPassword.length > 0 && password === confirmPassword && (
                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {language === 'fr' ? 'Les mots de passe correspondent' : 'Passwords match'}
                        </p>
                      )}
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || isRegistering}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                    >
                      {isLoading || isRegistering ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'fr' ? 'Création...' : 'Creating...'}
                        </>
                      ) : (
                        language === 'fr' ? 'Créer mon compte' : 'Create my account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            <p className="text-xs text-center text-muted-foreground mt-4">
              {language === 'fr' 
                ? 'En vous connectant, vous acceptez nos conditions d\'utilisation.'
                : 'By signing in, you agree to our terms of service.'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
