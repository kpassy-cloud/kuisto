'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ChefHat, UtensilsCrossed, Lightbulb, TrendingUp, Newspaper,
  Heart, Calendar, ShoppingCart, Leaf, Sparkles, ArrowRight,
  X, Check, Star, Clock, Users, Globe
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
}

export function ExploreModal({ isOpen, onClose, onGoToCooking, onSignUp, isAuthenticated }: ExploreModalProps) {
  const { language } = useI18n()

  const handleGoToCooking = () => {
    onClose()
    onGoToCooking()
  }

  const handleSignUp = () => {
    onClose()
    onSignUp()
  }

  const features = [
    {
      icon: ChefHat,
      title: language === 'fr' ? 'Génération de recettes IA' : 'AI Recipe Generation',
      description: language === 'fr' 
        ? 'Entrez vos ingrédients disponibles et laissez notre IA créer des recettes personnalisées pour vous.'
        : 'Enter your available ingredients and let our AI create personalized recipes for you.',
      image: FEATURE_IMAGES.cooking,
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Lightbulb,
      title: language === 'fr' ? 'Astuces de chefs' : 'Chef Tips',
      description: language === 'fr'
        ? 'Découvrez les secrets et techniques des grands chefs pour améliorer votre cuisine.'
        : 'Discover the secrets and techniques of great chefs to improve your cooking.',
      image: FEATURE_IMAGES.tips,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: TrendingUp,
      title: language === 'fr' ? 'Tendances culinaires' : 'Food Trends',
      description: language === 'fr'
        ? 'Restez à jour avec les dernières tendances gastronomiques du moment.'
        : 'Stay up to date with the latest gastronomic trends.',
      image: FEATURE_IMAGES.trends,
      color: 'from-orange-500 to-amber-600'
    },
    {
      icon: Newspaper,
      title: language === 'fr' ? 'Actualités gourmandes' : 'Food News',
      description: language === 'fr'
        ? 'Suivez l\'actualité culinaire: nouveaux restaurants, événements, et innovations.'
        : 'Follow culinary news: new restaurants, events, and innovations.',
      color: 'from-purple-500 to-violet-600'
    }
  ]

  const benefits = [
    {
      icon: Heart,
      title: language === 'fr' ? 'Favoris illimités' : 'Unlimited favorites',
      description: language === 'fr' ? 'Sauvegardez vos recettes préférées' : 'Save your favorite recipes'
    },
    {
      icon: Calendar,
      title: language === 'fr' ? 'Planification de repas' : 'Meal planning',
      description: language === 'fr' ? 'Organisez vos menus de la semaine' : 'Organize your weekly menus'
    },
    {
      icon: ShoppingCart,
      title: language === 'fr' ? 'Liste de courses' : 'Shopping list',
      description: language === 'fr' ? 'Générez automatiquement votre liste' : 'Auto-generate your list'
    },
    {
      icon: Leaf,
      title: language === 'fr' ? 'Recettes saines' : 'Healthy recipes',
      description: language === 'fr' ? 'Options végétariennes, sans gluten...' : 'Vegetarian, gluten-free options...'
    }
  ]

  const stats = [
    { value: '10K+', label: language === 'fr' ? 'Recettes générées' : 'Recipes generated' },
    { value: '5K+', label: language === 'fr' ? 'Utilisateurs actifs' : 'Active users' },
    { value: '4.8', label: language === 'fr' ? 'Note moyenne' : 'Average rating', icon: Star },
    { value: '24/7', label: language === 'fr' ? 'Disponibilité' : 'Availability' },
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with image */}
          <div className="relative h-48 md:h-56">
            <img 
              src={FEATURE_IMAGES.hero}
              alt="Kuisto App"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            <div className="absolute top-4 right-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="bg-black/30 text-white hover:bg-black/50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                    {language === 'fr' ? 'Bienvenue sur Kuisto' : 'Welcome to Kuisto'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {language === 'fr' 
                      ? 'Votre assistant culinaire intelligent' 
                      : 'Your intelligent cooking assistant'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[calc(90vh-14rem)]">
            <div className="p-6 space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-2xl font-bold text-primary">{stat.value}</span>
                      {stat.icon && <stat.icon className="w-4 h-4 text-amber-500 fill-amber-500" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Introduction */}
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {language === 'fr' 
                    ? 'Kuisto révolutionne votre façon de cuisiner. Avec notre intelligence artificielle, transformez les ingrédients que vous avez déjà en recettes délicieuses et personnalisées. Plus besoin de chercher des idées - Kuisto les trouve pour vous!'
                    : 'Kuisto revolutionizes the way you cook. With our artificial intelligence, transform the ingredients you already have into delicious and personalized recipes. No need to search for ideas - Kuisto finds them for you!'}
                </p>
              </div>

              {/* Main Features */}
              <div>
                <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {language === 'fr' ? 'Fonctionnalités principales' : 'Main Features'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  {language === 'fr' ? 'Avantages' : 'Benefits'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {benefits.map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="text-center p-3 rounded-lg bg-muted/30"
                    >
                      <benefit.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                      <h4 className="text-sm font-medium mb-1">{benefit.title}</h4>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div>
                <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {language === 'fr' ? 'Comment ça marche?' : 'How it works?'}
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
                  {[
                    { step: '1', title: language === 'fr' ? 'Sélectionnez' : 'Select', desc: language === 'fr' ? 'Vos ingrédients' : 'Your ingredients' },
                    { step: '2', title: language === 'fr' ? 'Générez' : 'Generate', desc: language === 'fr' ? 'Des recettes sur mesure' : 'Custom recipes' },
                    { step: '3', title: language === 'fr' ? 'Cuisinez' : 'Cook', desc: language === 'fr' ? 'Suivez le guide' : 'Follow the guide' },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 relative">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      {i < 2 && (
                        <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Community */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {language === 'fr' ? 'Rejoignez notre communauté' : 'Join our community'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {language === 'fr' 
                        ? 'Des milliers de cuisiniers passionnés partagent leurs créations chaque jour'
                        : 'Thousands of passionate cooks share their creations every day'}
                    </p>
                  </div>
                  <Globe className="w-8 h-8 text-muted-foreground/30" />
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                    onClick={handleGoToCooking}
                  >
                    <UtensilsCrossed className="w-5 h-5 mr-2" />
                    {language === 'fr' ? 'Passer à la cuisine' : 'Go to cooking'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                      onClick={handleSignUp}
                    >
                      <ChefHat className="w-5 h-5 mr-2" />
                      {language === 'fr' ? 'Créer un compte gratuit' : 'Create free account'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1"
                      onClick={handleGoToCooking}
                    >
                      {language === 'fr' ? 'Explorer les recettes' : 'Explore recipes'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
