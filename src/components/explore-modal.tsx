'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  ChefHat, UtensilsCrossed, Lightbulb, TrendingUp, Newspaper,
  Heart, Calendar, ShoppingCart, Leaf, Sparkles, ArrowRight,
  X, Check, Star, Clock, Users, Globe, ArrowLeft, Flame,
  Bookmark, Zap, Gift, Crown
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface ExploreModalProps {
  isOpen: boolean
  onClose: () => void
  onGoToCooking: () => void
  onSignUp: () => void
  isAuthenticated: boolean
}

const FEATURE_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80',
  cooking: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
  tips: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&auto=format&fit=crop&q=80',
  trends: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  ingredients: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
  planner: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
  shopping: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  community: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
}

export function ExploreModal({ isOpen, onClose, onGoToCooking, onSignUp, isAuthenticated }: ExploreModalProps) {
  const { language } = useI18n()
  const [currentStep, setCurrentStep] = useState(0)

  const handleGoToCooking = () => {
    onClose()
    onGoToCooking()
  }

  const handleSignUp = () => {
    onClose()
    onSignUp()
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [
    {
      id: 'welcome',
      title: language === 'fr' ? 'Bienvenue sur Kuisto' : 'Welcome to Kuisto',
      subtitle: language === 'fr' ? 'Votre assistant culinaire intelligent' : 'Your intelligent cooking assistant',
      image: FEATURE_IMAGES.hero,
      icon: ChefHat,
      color: 'from-primary to-primary/80',
      content: language === 'fr' 
        ? 'Kuisto révolutionne votre façon de cuisiner. Découvrez comment notre application peut transformer votre quotidien culinaire en quelques étapes simples.'
        : 'Kuisto revolutionizes the way you cook. Discover how our app can transform your daily cooking in a few simple steps.',
    },
    {
      id: 'ai-recipes',
      title: language === 'fr' ? 'Génération de recettes IA' : 'AI Recipe Generation',
      subtitle: language === 'fr' ? 'Des recettes sur mesure' : 'Custom recipes for you',
      image: FEATURE_IMAGES.cooking,
      icon: Sparkles,
      color: 'from-green-500 to-emerald-600',
      content: language === 'fr'
        ? 'Entrez simplement les ingrédients que vous avez dans votre cuisine et notre intelligence artificielle créera pour vous des recettes délicieuses et personnalisées en quelques secondes.'
        : 'Simply enter the ingredients you have in your kitchen and our artificial intelligence will create delicious and personalized recipes for you in seconds.',
      highlight: language === 'fr' ? 'Plus de 10 000 recettes générées!' : 'Over 10,000 recipes generated!',
    },
    {
      id: 'ingredients',
      title: language === 'fr' ? 'Sélection intelligente' : 'Smart selection',
      subtitle: language === 'fr' ? 'Vos ingrédients, nos idées' : 'Your ingredients, our ideas',
      image: FEATURE_IMAGES.ingredients,
      icon: UtensilsCrossed,
      color: 'from-amber-500 to-orange-600',
      content: language === 'fr'
        ? 'Parcourez notre catalogue d\'ingrédients ou ajoutez les vôtres. L\'IA analysera vos choix pour proposer des recettes adaptées à vos goûts et préférences alimentaires.'
        : 'Browse our ingredient catalog or add your own. The AI will analyze your choices to suggest recipes tailored to your tastes and dietary preferences.',
    },
    {
      id: 'tips',
      title: language === 'fr' ? 'Astuces de chefs' : 'Chef Tips',
      subtitle: language === 'fr' ? 'Les secrets des grands chefs' : 'Secrets from great chefs',
      image: FEATURE_IMAGES.tips,
      icon: Lightbulb,
      color: 'from-blue-500 to-cyan-600',
      content: language === 'fr'
        ? 'Accédez à une collection exclusive d\'astuces et techniques professionnelles. Apprenez les secrets des meilleurs chefs pour sublimer vos plats.'
        : 'Access an exclusive collection of tips and professional techniques. Learn the secrets of the best chefs to enhance your dishes.',
    },
    {
      id: 'trends',
      title: language === 'fr' ? 'Tendances culinaires' : 'Food Trends',
      subtitle: language === 'fr' ? 'Restez à la page' : 'Stay up to date',
      image: FEATURE_IMAGES.trends,
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-600',
      content: language === 'fr'
        ? 'Découvrez les dernières tendances gastronomiques: nouveaux ingrédients, techniques innovantes, et styles culinaires émergents du monde entier.'
        : 'Discover the latest gastronomic trends: new ingredients, innovative techniques, and emerging culinary styles from around the world.',
    },
    {
      id: 'planner',
      title: language === 'fr' ? 'Planification de repas' : 'Meal Planning',
      subtitle: language === 'fr' ? 'Organisez votre semaine' : 'Organize your week',
      image: FEATURE_IMAGES.planner,
      icon: Calendar,
      color: 'from-violet-500 to-purple-600',
      content: language === 'fr'
        ? 'Planifiez vos repas de la semaine en quelques clics. Ajoutez les recettes à votre calendrier et ne vous souciez plus de "Qu\'est-ce qu\'on mange ce soir?".'
        : 'Plan your weekly meals in just a few clicks. Add recipes to your calendar and never worry about "What\'s for dinner?" again.',
    },
    {
      id: 'shopping',
      title: language === 'fr' ? 'Liste de courses' : 'Shopping List',
      subtitle: language === 'fr' ? 'Automatique et intelligente' : 'Automatic and smart',
      image: FEATURE_IMAGES.shopping,
      icon: ShoppingCart,
      color: 'from-teal-500 to-cyan-600',
      content: language === 'fr'
        ? 'Générez automatiquement votre liste de courses à partir des recettes choisies. Exportez-la facilement et ne manquez plus jamais un ingrédient!'
        : 'Automatically generate your shopping list from selected recipes. Export it easily and never miss an ingredient again!',
    },
    {
      id: 'community',
      title: language === 'fr' ? 'Rejoignez Kuisto' : 'Join Kuisto',
      subtitle: language === 'fr' ? 'Commencez maintenant!' : 'Start now!',
      image: FEATURE_IMAGES.community,
      icon: Users,
      color: 'from-primary to-terracotta',
      content: language === 'fr'
        ? 'Vous avez fait le tour! Rejoignez des milliers de cuisiniers passionnés et commencez à créer des recettes extraordinaires avec ce que vous avez déjà dans votre cuisine.'
        : 'You\'ve seen it all! Join thousands of passionate cooks and start creating extraordinary recipes with what you already have in your kitchen.',
      isFinal: true,
    },
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        key="explore-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="explore-modal-content"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                {language === 'fr' ? `Étape ${currentStep + 1} sur ${steps.length}` : `Step ${currentStep + 1} of ${steps.length}`}
              </span>
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Header with close button */}
          <div className="px-6 py-3 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="font-serif font-semibold">Kuisto</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Image */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <img 
                    src={currentStepData.image}
                    alt={currentStepData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  
                  {/* Step indicator badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${currentStepData.color} text-white shadow-lg`}>
                      <currentStepData.icon className="w-5 h-5" />
                    </div>
                    {currentStepData.isFinal && (
                      <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        <Gift className="w-3 h-3 inline mr-1" />
                        {language === 'fr' ? 'Dernière étape' : 'Final step'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Content */}
                <div className="p-6">
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
                    {currentStepData.title}
                  </h2>
                  <p className="text-sm text-primary mb-4">{currentStepData.subtitle}</p>
                  
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {currentStepData.content}
                  </p>

                  {currentStepData.highlight && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                      <Zap className="w-4 h-4" />
                      {currentStepData.highlight}
                    </div>
                  )}

                  {/* Final step special content */}
                  {currentStepData.isFinal && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                        <Check className="w-4 h-4" />
                        <span>{language === 'fr' ? 'Gratuit' : 'Free'}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm">
                        <Zap className="w-4 h-4" />
                        <span>{language === 'fr' ? 'Rapide' : 'Fast'}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm">
                        <Heart className="w-4 h-4" />
                        <span>{language === 'fr' ? 'Personnalisé' : 'Personalized'}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span>{language === 'fr' ? 'Noté 4.8/5' : 'Rated 4.8/5'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'fr' ? 'Précédent' : 'Previous'}
            </Button>

            {/* Step dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep 
                      ? 'w-6 bg-primary' 
                      : i < currentStep 
                        ? 'bg-primary/50' 
                        : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            {currentStep < steps.length - 1 ? (
              <Button
                size="lg"
                onClick={nextStep}
                className="gap-2 bg-gradient-to-r from-primary to-primary/90"
              >
                {language === 'fr' ? 'Suivant' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    onClick={handleGoToCooking}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/90"
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    {language === 'fr' ? 'Passer à la cuisine' : 'Go to cooking'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleGoToCooking}
                      className="gap-2"
                    >
                      {language === 'fr' ? 'Explorer' : 'Explore'}
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleSignUp}
                      className="gap-2 bg-gradient-to-r from-primary to-primary/90"
                    >
                      <ChefHat className="w-4 h-4" />
                      {language === 'fr' ? 'Créer un compte' : 'Sign up'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
