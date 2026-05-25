'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Heart, Settings, ShoppingCart, Leaf, ChefHat, Calendar, Crown, Shield, ArrowRight, UtensilsCrossed, User } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useTheme } from 'next-themes'
import { ShoppingListPanel } from '@/components/shopping-list-panel'
import ChefMode from '@/components/chef-mode'
import { soundEffects } from '@/lib/sounds'
import { useI18n } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DynamicHeader } from '@/components/dynamic-header'
import { MoodCarousel } from '@/components/mood-carousel'
import { DailyChallenge } from '@/components/daily-challenge'
import { IngredientSelector, type Ingredient } from '@/components/ingredient-selector'
import { RecipeList, type Recipe } from '@/components/recipe-list'
import { PreferencesPanel, type Preferences } from '@/components/preferences-panel'
import { FavoritesPanel, type FavoriteRecipe } from '@/components/favorites-panel'
import { HistoryPanel, type HistoryRecipe } from '@/components/history-panel'
import { AuthModal } from '@/components/auth-modal'
import { SubscriptionDashboard } from '@/components/subscription-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'
import { UserMenu } from '@/components/user-menu'
import { MealPlanner } from '@/components/meal-planner'
import { SearchBar } from '@/components/search-bar'
import { RecipeDetailModal } from '@/components/recipe-detail-modal'
import { NewsFeedHero } from '@/components/news-feed-hero'
import { SignupInvitationModal } from '@/components/signup-invitation-modal'
import { PremiumLockModal } from '@/components/premium-lock-modal'
import { VideoAdModal } from '@/components/video-ad-modal'
import { NativeAdBanner } from '@/components/native-ad-banner'
import { useEngagementTracker } from '@/lib/hooks/useEngagementTracker'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Home() {
  // Auth state
  const { user, isAuthenticated, isLoading: authLoading, login, plan } = useAuth()
  
  // Core state
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])
  const [history, setHistory] = useState<HistoryRecipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [showPreferences, setShowPreferences] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [showMealPlanner, setShowMealPlanner] = useState(false)
  const [chefModeRecipe, setChefModeRecipe] = useState<Recipe | null>(null)
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<Recipe | null>(null)
  const [showRecipeDetail, setShowRecipeDetail] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showRecipeSection, setShowRecipeSection] = useState(false)
  
  // Engagement tracking for signup prompt
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const engagement = useEngagementTracker({
    timeThreshold: 45, // Show prompt after 45 seconds
    scrollThreshold: 70,
    articleThreshold: 3
  })

  // Theme
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // i18n
  const { t, language } = useI18n()
  
  // Preferences state
  const [preferences, setPreferences] = useState<Preferences>({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    lactoseFree: false,
    keto: false,
    halal: false,
    kosher: false,
    nutAllergy: false,
    peanutAllergy: false,
    shellfishAllergy: false,
    eggAllergy: false,
    soyAllergy: false,
    fishAllergy: false,
    servingSize: 2,
    difficultyLevel: 'easy',
    maxPrepTime: 30
  })

  // Mood state
  const [selectedMood, setSelectedMood] = useState<string | undefined>()
  
  // Demo mode state
  const [isDemoMode, setIsDemoMode] = useState(false)
  
  // Guest state (for freemium model)
  const [guestId, setGuestId] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [unlockedFeatures, setUnlockedFeatures] = useState<Set<string>>(new Set())
  const [recipeGenerationCount, setRecipeGenerationCount] = useState<number>(0) // Counter for free recipes
  
  // Premium lock modal state
  const [showPremiumLock, setShowPremiumLock] = useState(false)
  const [premiumFeature, setPremiumFeature] = useState<{ name: string; description?: string }>({ name: '' })
  const [showVideoAd, setShowVideoAd] = useState(false)
  const [pendingFeatureUnlock, setPendingFeatureUnlock] = useState<string | null>(null)
  const [pendingRecipeGeneration, setPendingRecipeGeneration] = useState(false) // Flag to trigger recipe generation after ad
  const [adWatchedForGeneration, setAdWatchedForGeneration] = useState(false) // One-time unlock after watching ad

  // Initialize
  useEffect(() => {
    setMounted(true)
    
    // Initialize guest session if not authenticated
    if (!isAuthenticated) {
      const storedGuestId = localStorage.getItem('kuisto_guest_id')
      const storedSessionStart = localStorage.getItem('kuisto_session_start')
      const storedUnlocked = localStorage.getItem('kuisto_unlocked_features')
      
      if (storedGuestId) {
        setGuestId(storedGuestId)
      } else {
        const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('kuisto_guest_id', newGuestId)
        setGuestId(newGuestId)
      }
      
      if (storedSessionStart) {
        setSessionStartTime(new Date(storedSessionStart))
      } else {
        const now = new Date()
        localStorage.setItem('kuisto_session_start', now.toISOString())
        setSessionStartTime(now)
      }
      
      if (storedUnlocked) {
        try {
          const unlocked = JSON.parse(storedUnlocked)
          // Filter out expired unlocks (24h)
          const validUnlocks = Object.entries(unlocked).filter(
            ([_, expiry]) => new Date(expiry as string) > new Date()
          )
          setUnlockedFeatures(new Set(validUnlocks.map(([feature]) => feature)))
        } catch {
          // Invalid data, ignore
        }
      }
      
      // Load recipe generation count
      const storedCount = localStorage.getItem('kuisto_recipe_count')
      if (storedCount) {
        setRecipeGenerationCount(parseInt(storedCount, 10) || 0)
      }
    }
  }, [isAuthenticated])

  // Show signup prompt based on engagement
  useEffect(() => {
    if (engagement.shouldShowPrompt && !isAuthenticated && !showSignupPrompt) {
      setShowSignupPrompt(true)
      engagement.markPromptShown()
    }
  }, [engagement.shouldShowPrompt, isAuthenticated, showSignupPrompt])

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences()
      loadFavorites()
      loadHistory()
      checkAdminStatus()
    }
  }, [isAuthenticated])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      if (data?.user?.role === 'admin') {
        setIsAdmin(true)
      }
    } catch (err) {
      console.error('Failed to check admin status:', err)
    }
  }

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/preferences')
      const data = await response.json()
      if (data.preferences) {
        setPreferences(data.preferences)
      }
    } catch (err) {
      console.error('Failed to load preferences:', err)
    }
  }

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      const data = await response.json()
      setFavorites(data.favorites || [])
    } catch (err) {
      console.error('Failed to load favorites:', err)
    }
  }

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history')
      const data = await response.json()
      setHistory(data.history || [])
    } catch (err) {
      console.error('Failed to load history:', err)
    }
  }

  const savePreferences = async (newPrefs: Partial<Preferences>) => {
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs)
      })
    } catch (err) {
      console.error('Failed to save preferences:', err)
    }
  }

  const togglePreference = (key: keyof Preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] }
    setPreferences(newPrefs)
    savePreferences({ [key]: !preferences[key] })
  }

  const toggleIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients(prev => {
      const isSelected = prev.some(i => i.id === ingredient.id)
      if (isSelected) {
        soundEffects.deselect()
        return prev.filter(i => i.id !== ingredient.id)
      } else {
        soundEffects.select()
        return [...prev, ingredient]
      }
    })
  }

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => prev.filter(i => i.id !== ingredientId))
  }

  const clearAllIngredients = () => {
    setSelectedIngredients([])
    setRecipes([])
    setError(null)
  }

  const isFavorite = useCallback((recipeName: string) => {
    return favorites.some(f => f.recipeName === recipeName)
  }, [favorites])

  const toggleFavorite = async (recipe: Recipe) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    
    try {
      if (isFavorite(recipe.name)) {
        soundEffects.unfavorite()
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeName: recipe.name })
        })
        setFavorites(prev => prev.filter(f => f.recipeName !== recipe.name))
        toast({ title: t('removeFromFavorites'), description: recipe.name })
      } else {
        soundEffects.favorite()
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe })
        })
        setFavorites(prev => [...prev, { 
          id: Date.now().toString(), 
          recipeName: recipe.name, 
          recipeData: recipe,
          createdAt: new Date().toISOString()
        }])
        toast({ title: t('addToFavorites') + ' ❤️', description: recipe.name })
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  const generateRecipes = async (skipAuthCheck = false) => {
    // Debug logging
    console.log('=== generateRecipes called ===')
    console.log('isAuthenticated:', isAuthenticated)
    console.log('plan:', plan)
    console.log('skipAuthCheck:', skipAuthCheck)
    console.log('adWatchedForGeneration:', adWatchedForGeneration)
    
    // PREMIUM users have unlimited access
    if (isAuthenticated && plan === 'premium') {
      console.log('Premium user - unlimited access')
      // Proceed directly to generation
    }
    // AUTHENTICATED FREE users: 3 recipes per session, then premium/ad prompt
    else if (isAuthenticated && plan === 'free') {
      const storageKey = 'kuisto_free_user_recipe_count'
      const storedCount = parseInt(localStorage.getItem(storageKey) || '0', 10)
      console.log('Free user storedCount:', storedCount)
      
      // After 3 recipes, require premium or ad
      if (!skipAuthCheck && storedCount >= 3 && !adWatchedForGeneration) {
        console.log('BLOCKING Free user: Showing premium lock modal')
        showPremiumLockModal(
          language === 'fr' ? 'Limite atteinte' : 'Limit reached',
          language === 'fr' 
            ? 'Vous avez utilisé vos 3 recettes gratuites. Passez premium pour un accès illimité ou regardez une publicité.'
            : 'You have used your 3 free recipes. Upgrade to premium for unlimited access or watch an ad.',
          'recipe_generation'
        )
        setPendingRecipeGeneration(true)
        return
      }
      
      // Increment counter
      const newCount = storedCount + 1
      localStorage.setItem(storageKey, newCount.toString())
      console.log('Free user counter incremented to:', newCount)
      
      if (adWatchedForGeneration) {
        setAdWatchedForGeneration(false)
      }
    }
    // GUEST users (not authenticated): 1 recipe only, then signup prompt
    else if (!isAuthenticated) {
      const storageKey = 'kuisto_guest_recipe_count'
      const storedCount = parseInt(localStorage.getItem(storageKey) || '0', 10)
      console.log('Guest storedCount:', storedCount)
      
      // After 1 recipe, require signup (NO ad option for guests)
      if (storedCount >= 1 && !skipAuthCheck) {
        console.log('BLOCKING Guest: Showing auth modal for signup')
        // For guests, show auth modal to encourage signup
        setShowAuthModal(true)
        toast({
          title: language === 'fr' ? 'Inscription requise' : 'Signup required',
          description: language === 'fr' 
            ? 'Créez un compte gratuit pour continuer à générer des recettes!'
            : 'Create a free account to continue generating recipes!',
          variant: 'default'
        })
        return
      }
      
      // Increment counter
      const newCount = storedCount + 1
      localStorage.setItem(storageKey, newCount.toString())
      console.log('Guest counter incremented to:', newCount)
    }

    if (selectedIngredients.length < 3) {
      toast({
        title: t('notEnoughIngredients'),
        description: t('selectMinIngredients', { count: '3' }),
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setRecipes([])

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedIngredients.map(i => i.name),
          preferences,
          mood: selectedMood
        })
      })

      let data
      try {
        data = await response.json()
      } catch {
        throw new Error(t('serverError'))
      }

      if (!response.ok) {
        throw new Error(data.error || t('generationError'))
      }
      
      if (data.demoMode) {
        setIsDemoMode(true)
      }
      
      if (data.recipes && data.recipes.length > 0) {
        soundEffects.success()
        const recipesWithLoading = data.recipes.map((recipe: Recipe) => ({
          ...recipe,
          image: null,
          imageLoading: true,
          isFavorite: isFavorite(recipe.name),
          isDemo: data.demoMode
        }))
        setRecipes(recipesWithLoading)
        setIsLoading(false)

        // Generate images sequentially
        for (let i = 0; i < recipesWithLoading.length; i++) {
          try {
            const imageResponse = await fetch('/api/recipes/image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipeName: recipesWithLoading[i].name,
                ingredients: recipesWithLoading[i].ingredients,
                demoMode: data.demoMode
              })
            })

            if (imageResponse.ok) {
              const imageData = await imageResponse.json()
              setRecipes(prev => prev.map((r, idx) => 
                idx === i ? { ...r, image: imageData.image, imageLoading: false } : r
              ))
            } else {
              setRecipes(prev => prev.map((r, idx) => 
                idx === i ? { ...r, imageLoading: false } : r
              ))
            }
          } catch {
            setRecipes(prev => prev.map((r, idx) => 
              idx === i ? { ...r, imageLoading: false } : r
            ))
          }
        }
      } else {
        setError(language === 'fr' 
          ? 'Impossible de générer des recettes avec ces ingrédients.'
          : 'Unable to generate recipes with these ingredients.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('generationError')
      setError(errorMessage)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const addToShoppingList = async (recipeName: string, ingredients: string[]) => {
    try {
      soundEffects.addToCart()
      await fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeName, ingredients })
      })
      toast({
        title: t('addToShoppingList') + ' 🛒',
        description: language === 'fr'
          ? `${ingredients.length} ingrédients ajoutés à votre liste`
          : `${ingredients.length} ingredients added to your list`
      })
    } catch (error) {
      console.error('Failed to add to shopping list:', error)
      soundEffects.error()
      toast({
        title: t('generationError'),
        description: language === 'fr'
          ? "Impossible d'ajouter les ingrédients à la liste"
          : 'Unable to add ingredients to the list',
        variant: 'destructive'
      })
    }
  }

  const handleRateHistory = async (historyId: string, rating: number) => {
    try {
      await fetch('/api/history', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyId, rating })
      })
      setHistory(prev => prev.map(h => 
        h.id === historyId ? { ...h, rating } : h
      ))
    } catch (err) {
      console.error('Failed to rate recipe:', err)
    }
  }

  const handleCookAgain = (historyItem: HistoryRecipe) => {
    setChefModeRecipe(historyItem.recipeData as Recipe)
    setShowHistory(false)
  }

  const handleViewRecipeDetails = (recipe: Recipe) => {
    setSelectedRecipeForDetail(recipe)
    setShowRecipeDetail(true)
  }

  const handleRateRecipe = async (rating: number) => {
    if (!selectedRecipeForDetail) return
    setRecipes(prev => prev.map(r => 
      r.name === selectedRecipeForDetail.name ? { ...r, rating } : r
    ))
  }

  const handleSignup = async (email: string, password: string, name?: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }
    
    // Auto login after registration
    await login(email, password)
    
    toast({
      title: language === 'fr' ? 'Compte créé !' : 'Account created!',
      description: language === 'fr' ? 'Bienvenue sur Kuisto !' : 'Welcome to Kuisto!'
    })
  }

  // Freemium: Check if feature is locked
  const isFeatureLocked = (featureId: string): boolean => {
    if (isAuthenticated) return false // Authenticated users have access
    return !unlockedFeatures.has(featureId)
  }

  // Freemium: Show premium lock modal
  const showPremiumLockModal = (featureName: string, featureDescription?: string, featureId?: string) => {
    setPremiumFeature({ name: featureName, description: featureDescription })
    setPendingFeatureUnlock(featureId || null)
    setShowPremiumLock(true)
  }

  // Freemium: Handle watching ad to unlock feature
  const handleWatchAd = () => {
    setShowPremiumLock(false)
    setShowVideoAd(true)
  }

  // Freemium: Handle ad completion
  const handleAdComplete = () => {
    // Set the one-time unlock flag for recipe generation
    setAdWatchedForGeneration(true)
    setPendingFeatureUnlock(null)
    
    toast({
      title: language === 'fr' ? 'Publicité terminée !' : 'Ad completed!',
      description: language === 'fr' 
        ? 'Vous pouvez maintenant générer une recette !'
        : 'You can now generate a recipe!'
    })
    
    // If pending recipe generation, show recipe section and auto-generate if ingredients selected
    if (pendingRecipeGeneration) {
      setShowRecipeSection(true)
      setPendingRecipeGeneration(false)
      // Auto-scroll to recipe section
      setTimeout(() => {
        const recipeSection = document.querySelector('[data-recipe-section]')
        if (recipeSection) {
          recipeSection.scrollIntoView({ behavior: 'smooth' })
        }
        // Auto-generate if enough ingredients are selected
        if (selectedIngredients.length >= 3) {
          // Small delay to let UI update first
          setTimeout(() => {
            generateRecipes(true)
          }, 500)
        }
      }, 100)
    }
  }

  // Freemium: Handle upgrade click
  const handleUpgradeClick = () => {
    setShowPremiumLock(false)
    setShowSubscription(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">      
      {/* Header - Modern & Warm */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary via-primary to-terracotta text-primary-foreground shadow-lg shadow-primary/25">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-bold bg-gradient-to-r from-primary via-primary to-terracotta bg-clip-text text-transparent">{t('appName')}</h1>
                <p className="text-xs text-muted-foreground">{t('appTagline')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              
              {isAuthenticated && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShoppingList(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">{t('shopping')}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFavorites(!showFavorites)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Heart className={`w-4 h-4 mr-1 ${showFavorites ? 'fill-coral text-coral' : ''}`} />
                    <span className="hidden sm:inline">{t('favorites')}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMealPlanner(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">{language === 'fr' ? 'Planner' : 'Planner'}</span>
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdminDashboard(true)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Shield className="w-4 h-4 mr-1 text-primary" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  )}
                </>
              )}
              
              {isAuthenticated ? (
                <UserMenu 
                  onOpenPreferences={() => setShowPreferences(true)}
                  onOpenHistory={() => setShowHistory(true)}
                  onOpenSubscription={() => setShowSubscription(true)}
                  isAdmin={isAdmin}
                  onAdminStatusChange={checkAdminStatus}
                />
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="ml-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md shadow-primary/20"
                >
                  {language === 'fr' ? 'Connexion' : 'Sign in'}
                </Button>
              )}
              
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-primary" />
                  ) : (
                    <Moon className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Preferences Panel */}
      <PreferencesPanel
        isOpen={showPreferences}
        preferences={preferences}
        onClose={() => setShowPreferences(false)}
        onToggle={togglePreference}
      />

      {/* Favorites Panel */}
      <FavoritesPanel
        isOpen={showFavorites}
        favorites={favorites}
        onClose={() => setShowFavorites(false)}
      />

      {/* History Panel */}
      <HistoryPanel
        isOpen={showHistory}
        history={history}
        language={language}
        onClose={() => setShowHistory(false)}
        onCookAgain={handleCookAgain}
        onRate={handleRateHistory}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* HERO - News Feed (Always visible) */}
        <section className="container mx-auto px-4 py-8">
          <NewsFeedHero 
            onSignUpClick={() => setShowAuthModal(true)}
            isAuthenticated={isAuthenticated}
            onGoToCooking={() => setShowRecipeSection(true)}
          />
          
          {/* Native Ad for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mt-6">
              <NativeAdBanner position="top" />
            </div>
          )}
        </section>

        {/* Guest CTA Section - Encourage sign up */}
        {!isAuthenticated && !showRecipeSection && (
          <section className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                  {language === 'fr' 
                    ? 'Créez des recettes avec vos ingrédients' 
                    : 'Create recipes with your ingredients'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {language === 'fr'
                    ? 'Inscrivez-vous gratuitement pour générer des recettes personnalisées basées sur ce que vous avez dans votre cuisine.'
                    : 'Sign up for free to generate personalized recipes based on what you have in your kitchen.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Créer un compte gratuit' : 'Create free account'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // First recipe is free - show recipe section directly
                      if (recipeGenerationCount === 0) {
                        setShowRecipeSection(true)
                        // Scroll to recipe section
                        setTimeout(() => {
                          const recipeSection = document.querySelector('[data-recipe-section]')
                          if (recipeSection) {
                            recipeSection.scrollIntoView({ behavior: 'smooth' })
                          }
                        }, 100)
                      } else {
                        // Show premium lock for subsequent generations
                        showPremiumLockModal(
                          language === 'fr' ? 'Génération de recettes' : 'Recipe generation',
                          language === 'fr' 
                            ? 'Regardez une publicité pour générer des recettes sans créer de compte'
                            : 'Watch an ad to generate recipes without creating an account',
                          'recipe_generation'
                        )
                        setPendingRecipeGeneration(true)
                      }
                    }}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Essayer gratuitement' : 'Try for free'}
                  </Button>
                </div>
              </div>
              <div>
                <NativeAdBanner position="middle" />
              </div>
            </div>
          </section>
        )}

        {/* RECIPE SECTION - Secondary, requires auth OR freemium trial */}
        <AnimatePresence>
          {showRecipeSection && (
            <motion.section
              data-recipe-section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t bg-muted/30"
            >
              <div className="container mx-auto px-4 py-8">
                <DynamicHeader />
                <MoodCarousel selectedMood={selectedMood} onMoodSelect={setSelectedMood} />
                <DailyChallenge />
                
                <div className="grid lg:grid-cols-[1fr,400px] gap-6 mt-6">
                  <IngredientSelector
                    selectedIngredients={selectedIngredients}
                    onToggle={toggleIngredient}
                    onRemove={removeIngredient}
                    onClearAll={clearAllIngredients}
                  />

                  <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-100px)]">
                    <RecipeList
                      recipes={recipes}
                      isLoading={isLoading}
                      canGenerate={selectedIngredients.length >= 3}
                      selectedCount={selectedIngredients.length}
                      minIngredients={3}
                      isDemoMode={isDemoMode}
                      onGenerate={generateRecipes}
                      onToggleFavorite={toggleFavorite}
                      onStartCooking={setChefModeRecipe}
                      onAddToShoppingList={addToShoppingList}
                      onViewDetails={handleViewRecipeDetails}
                      isFavorite={isFavorite}
                    />
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* CTA to access recipes for authenticated users */}
        {isAuthenticated && !showRecipeSection && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-4 py-8"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-muted/50 to-accent/5 border border-border/50 p-8">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
              
              <div className="relative flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
                  <UtensilsCrossed className="w-10 h-10" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                    {language === 'fr' ? 'Créez vos propres recettes' : 'Create your own recipes'}
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    {language === 'fr' 
                      ? 'Générez des recettes personnalisées basées sur vos ingrédients disponibles'
                      : 'Generate personalized recipes based on your available ingredients'}
                  </p>
                  <Button 
                    onClick={() => setShowRecipeSection(true)}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/20 gap-2"
                  >
                    {language === 'fr' ? 'Commencer à cuisiner' : 'Start cooking'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Chef Mode */}
      {chefModeRecipe && (
        <ChefMode 
          recipe={chefModeRecipe}
          onClose={() => setChefModeRecipe(null)}
          onNewRecipe={() => {
            setChefModeRecipe(null)
            setRecipes([])
            setSelectedIngredients([])
            setShowRecipeSection(true)
          }}
          onGoHome={() => {
            setChefModeRecipe(null)
            setRecipes([])
            setSelectedIngredients([])
            setShowRecipeSection(false)
          }}
        />
      )}

      {/* Shopping List Panel */}
      <ShoppingListPanel 
        isOpen={showShoppingList} 
        onClose={() => setShowShoppingList(false)} 
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Signup Invitation Modal */}
      <SignupInvitationModal
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        onSignup={handleSignup}
      />

      {/* Subscription Dashboard */}
      <SubscriptionDashboard
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
      />

      {/* Meal Planner */}
      <MealPlanner
        isOpen={showMealPlanner}
        onClose={() => setShowMealPlanner(false)}
        onStartCooking={setChefModeRecipe}
      />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipeForDetail}
        isOpen={showRecipeDetail}
        onClose={() => setShowRecipeDetail(false)}
        isFavorite={selectedRecipeForDetail ? isFavorite(selectedRecipeForDetail.name) : false}
        onToggleFavorite={toggleFavorite}
        onAddToShoppingList={addToShoppingList}
        onStartCooking={setChefModeRecipe}
        onRate={handleRateRecipe}
        currentRating={selectedRecipeForDetail?.rating}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
      />

      {/* Premium Lock Modal */}
      <PremiumLockModal
        isOpen={showPremiumLock}
        onClose={() => setShowPremiumLock(false)}
        featureName={premiumFeature.name}
        featureDescription={premiumFeature.description}
        onWatchAd={handleWatchAd}
        onUpgrade={handleUpgradeClick}
      />

      {/* Video Ad Modal */}
      <VideoAdModal
        isOpen={showVideoAd}
        onClose={() => setShowVideoAd(false)}
        onComplete={handleAdComplete}
        duration={30}
      />

      {/* Footer */}
      <footer className="mt-auto border-t bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-terracotta text-primary-foreground">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="font-serif font-semibold text-foreground">Kuisto</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Leaf className="w-4 h-4 text-success" />
              <span>{language === 'fr' ? 'Des recettes saines avec vos ingrédients' : 'Healthy recipes with your ingredients'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
