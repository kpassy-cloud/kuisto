'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Check, Sparkles } from 'lucide-react'
import { soundEffects } from '@/lib/sounds'

interface Ingredient {
  id: string
  name: string
  emoji: string
  category: string
}

interface IngredientSlotPickerProps {
  ingredients: Ingredient[]
  selectedIngredients: Ingredient[]
  onToggleIngredient: (ingredient: Ingredient) => void
  language: 'fr' | 'en'
}

// Sparkle particle component
const SparkleParticle = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [0, -30]
    }}
    transition={{ 
      duration: 1.5, 
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 2
    }}
    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${50 + Math.random() * 50}%`
    }}
  />
)

// Neon glow ring animation
const NeonRing = ({ color, size, delay }: { color: string; size: number; delay: number }) => (
  <motion.div
    initial={{ opacity: 0.3, scale: 0.8 }}
    animate={{ 
      opacity: [0.3, 0.7, 0.3],
      scale: [0.9, 1.1, 0.9]
    }}
    transition={{ 
      duration: 2,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={`absolute rounded-full border-2 ${color}`}
    style={{ width: size, height: size }}
  />
)

// 3D Slot Machine Style Ingredient Picker - CASINO EDITION
export function IngredientSlotPicker({
  ingredients,
  selectedIngredients,
  onToggleIngredient,
  language
}: IngredientSlotPickerProps) {
  const [centerIndex, setCenterIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const dragDelta = useRef(0)
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const totalItems = ingredients.length
  const centerIngredient = ingredients[centerIndex]
  const isSelected = centerIngredient ? selectedIngredients.some(i => i.id === centerIngredient.id) : false

  // Category colors for vibrant effects
  const getCategoryColor = (category: string) => {
    const colors: Record<string, { glow: string; border: string; bg: string }> = {
      vegetable: { glow: 'bg-green-500', border: 'border-green-400', bg: 'from-green-500/20' },
      meat: { glow: 'bg-red-500', border: 'border-red-400', bg: 'from-red-500/20' },
      seafood: { glow: 'bg-blue-500', border: 'border-blue-400', bg: 'from-blue-500/20' },
      dairy: { glow: 'bg-yellow-500', border: 'border-yellow-400', bg: 'from-yellow-500/20' },
      protein: { glow: 'bg-orange-500', border: 'border-orange-400', bg: 'from-orange-500/20' },
      carbs: { glow: 'bg-amber-500', border: 'border-amber-400', bg: 'from-amber-500/20' },
      fruit: { glow: 'bg-pink-500', border: 'border-pink-400', bg: 'from-pink-500/20' },
      herbs: { glow: 'bg-emerald-500', border: 'border-emerald-400', bg: 'from-emerald-500/20' },
      condiments: { glow: 'bg-purple-500', border: 'border-purple-400', bg: 'from-purple-500/20' },
      nuts: { glow: 'bg-amber-700', border: 'border-amber-600', bg: 'from-amber-700/20' },
      others: { glow: 'bg-violet-500', border: 'border-violet-400', bg: 'from-violet-500/20' },
    }
    return colors[category] || { glow: 'bg-primary', border: 'border-primary', bg: 'from-primary/20' }
  }

  // Get visible items (5 on each side for more depth)
  const getVisibleItems = useCallback(() => {
    const items = []
    for (let offset = -5; offset <= 5; offset++) {
      let index = centerIndex + offset
      if (index < 0) index = totalItems + index
      if (index >= totalItems) index = index - totalItems
      items.push({ ingredient: ingredients[index], offset, index })
    }
    return items
  }, [centerIndex, ingredients, totalItems])

  // Spin animation for fast navigation
  const spinTo = (direction: 'left' | 'right', times: number = 1) => {
    if (isSpinning) return
    setIsSpinning(true)
    
    let count = 0
    const interval = setInterval(() => {
      if (count >= times) {
        clearInterval(interval)
        setIsSpinning(false)
        return
      }
      setCenterIndex(prev => {
        if (direction === 'left') return (prev - 1 + totalItems) % totalItems
        return (prev + 1) % totalItems
      })
      count++
    }, 80)
  }

  // Navigate left/right
  const navigateLeft = () => {
    soundEffects.select()
    setCenterIndex(prev => (prev - 1 + totalItems) % totalItems)
  }

  const navigateRight = () => {
    soundEffects.select()
    setCenterIndex(prev => (prev + 1) % totalItems)
  }

  // Handle drag
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    dragStartX.current = clientX
    dragDelta.current = 0
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    dragDelta.current = clientX - dragStartX.current
  }

  const handleDragEnd = () => {
    if (isDragging && Math.abs(dragDelta.current) > 50) {
      if (dragDelta.current > 0) {
        navigateLeft()
      } else {
        navigateRight()
      }
    }
    setIsDragging(false)
    dragDelta.current = 0
  }

  // Handle wheel scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (spinTimeoutRef.current) return
    
    if (e.deltaY > 10 || e.deltaX > 10) {
      navigateRight()
    } else if (e.deltaY < -10 || e.deltaX < -10) {
      navigateLeft()
    }
    
    spinTimeoutRef.current = setTimeout(() => {
      spinTimeoutRef.current = null
    }, 100)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigateLeft()
      if (e.key === 'ArrowRight') navigateRight()
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (centerIngredient) {
          handleSelectCenter()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [centerIngredient, onToggleIngredient])

  // Select center ingredient with celebration
  const handleSelectCenter = () => {
    if (centerIngredient) {
      soundEffects.select()
      onToggleIngredient(centerIngredient)
      
      // Show celebration if adding (not removing)
      if (!isSelected) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 1000)
      }
    }
  }

  // Calculate 3D transform for each item
  const getItemStyle = (offset: number) => {
    const absOffset = Math.abs(offset)
    const isCenter = offset === 0
    
    const scale = isCenter ? 1.15 : Math.max(0.4, 1 - absOffset * 0.12)
    const opacity = isCenter ? 1 : Math.max(0.2, 1 - absOffset * 0.15)
    const z = isCenter ? 80 : -absOffset * 40
    const x = offset * 90
    const rotateY = isCenter ? 0 : offset * -20
    const blur = isCenter ? 0 : absOffset * 0.5

    return { scale, opacity, z, x, rotateY, blur }
  }

  const categoryColors = centerIngredient ? getCategoryColor(centerIngredient.category) : null

  return (
    <div className="w-full relative">
      {/* Casino light decorations */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: 1,
              delay: i * 0.2,
              repeat: Infinity
            }}
            className="w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"
          />
        ))}
      </div>

      {/* Slot Machine Container */}
      <div 
        ref={containerRef}
        className="relative h-52 md:h-64 overflow-hidden rounded-3xl"
        style={{ perspective: '1200px' }}
        onWheel={handleWheel}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Vibrant background with animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-orange-900/20" />
        
        {/* Animated neon rings for center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {categoryColors && (
            <>
              <NeonRing color={categoryColors.border} size={160} delay={0} />
              <NeonRing color={categoryColors.border} size={140} delay={0.5} />
              <NeonRing color={categoryColors.border} size={120} delay={1} />
            </>
          )}
        </div>

        {/* Pulsing glow for center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-32 h-32 md:w-40 md:h-40 rounded-full blur-3xl ${categoryColors?.glow || 'bg-primary'} opacity-40`}
          />
        </div>

        {/* Center highlight frame - casino style */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ 
              borderColor: isSelected 
                ? ['rgba(34, 197, 94, 0.5)', 'rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0.5)']
                : ['rgba(168, 85, 247, 0.5)', 'rgba(251, 146, 60, 0.5)', 'rgba(168, 85, 247, 0.5)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-28 h-28 md:w-36 md:h-36 border-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
              boxShadow: isSelected 
                ? '0 0 30px rgba(34, 197, 94, 0.5), inset 0 0 20px rgba(34, 197, 94, 0.1)'
                : '0 0 30px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(251, 146, 60, 0.1)'
            }}
          />
        </div>

        {/* Celebration particles */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1,
                  scale: 0,
                  x: '50%',
                  y: '50%'
                }}
                animate={{ 
                  opacity: 0,
                  scale: [0, 1.5, 0],
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  y: `${50 + (Math.random() - 0.5) * 100}%`
                }}
                transition={{ duration: 0.8, delay: i * 0.02 }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#f97316'][i % 5]
                }}
              />
            ))}
          </div>
        )}

        {/* Sparkle particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <SparkleParticle key={i} delay={i * 0.3} />
          ))}
        </div>

        {/* Items */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {getVisibleItems().map(({ ingredient, offset }) => {
              const style = getItemStyle(offset)
              const isCenter = offset === 0
              const itemSelected = selectedIngredients.some(i => i.id === ingredient.id)
              const itemColors = getCategoryColor(ingredient.category)
              
              return (
                <motion.div
                  key={`${ingredient.id}-${offset}`}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{
                    opacity: style.opacity,
                    scale: style.scale,
                    x: style.x,
                    rotateY: style.rotateY
                  }}
                  exit={{ opacity: 0, scale: 0.3 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: isSpinning ? 500 : 300,
                    damping: isSpinning ? 30 : 25
                  }}
                  className={`
                    absolute flex flex-col items-center justify-center
                    ${isCenter ? 'cursor-pointer z-10' : 'cursor-grab z-0'}
                    ${isDragging ? 'select-none' : ''}
                  `}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `translateX(${style.x}px) translateZ(${style.z}px) rotateY(${style.rotateY}deg) scale(${style.scale})`,
                    filter: `blur(${style.blur}px)`
                  }}
                  onClick={isCenter ? handleSelectCenter : undefined}
                >
                  {/* Ingredient Card */}
                  <div
                    className={`
                      relative flex flex-col items-center justify-center
                      rounded-2xl p-3 md:p-4
                      transition-all duration-300
                      ${isCenter 
                        ? `bg-gradient-to-br ${itemColors.bg} via-background to-background/80
                           shadow-2xl
                           border-3 ${itemSelected ? 'border-green-400 shadow-green-500/40' : itemColors.border}
                           hover:scale-105`
                        : 'bg-muted/30 border border-white/10'
                      }
                      ${itemSelected && !isCenter ? 'ring-2 ring-green-400/50 bg-green-500/10' : ''}
                    `}
                    style={isCenter ? {
                      boxShadow: itemSelected 
                        ? '0 0 40px rgba(34, 197, 94, 0.4), 0 10px 30px rgba(0,0,0,0.3)'
                        : `0 0 30px ${ingredient.category === 'vegetable' ? 'rgba(34, 197, 94, 0.3)' :
                            ingredient.category === 'meat' ? 'rgba(239, 68, 68, 0.3)' :
                            ingredient.category === 'seafood' ? 'rgba(59, 130, 246, 0.3)' :
                            ingredient.category === 'fruit' ? 'rgba(236, 72, 153, 0.3)' :
                            ingredient.category === 'dairy' ? 'rgba(234, 179, 8, 0.3)' :
                            ingredient.category === 'protein' ? 'rgba(249, 115, 22, 0.3)' :
                            ingredient.category === 'carbs' ? 'rgba(245, 158, 11, 0.3)' :
                            ingredient.category === 'herbs' ? 'rgba(16, 185, 129, 0.3)' :
                            ingredient.category === 'condiments' ? 'rgba(168, 85, 247, 0.3)' :
                            ingredient.category === 'nuts' ? 'rgba(180, 83, 9, 0.3)' :
                            ingredient.category === 'others' ? 'rgba(139, 92, 246, 0.3)' :
                            'rgba(168, 85, 247, 0.3)'}, 0 10px 30px rgba(0,0,0,0.3)`
                    } : {}}
                  >
                    {/* Emoji */}
                    <motion.span 
                      animate={isCenter && isSpinning ? { rotate: 360 } : {}}
                      transition={{ duration: 0.3 }}
                      className={`
                        transition-all duration-300
                        ${isCenter ? 'text-5xl md:text-7xl drop-shadow-2xl' : 'text-2xl md:text-3xl'}
                      `}
                      style={isCenter ? {
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                      } : {}}
                    >
                      {ingredient.emoji}
                    </motion.span>
                    
                    {/* Name - only show for center item */}
                    {isCenter && (
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm md:text-base font-bold text-foreground text-center whitespace-nowrap"
                        style={{
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        {ingredient.name}
                      </motion.span>
                    )}

                    {/* Selected indicator for center */}
                    {isCenter && itemSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 border-2 border-white"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}

                    {/* 3D shine effect for center */}
                    {isCenter && (
                      <>
                        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                          <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                          />
                        </div>
                        {/* Bottom glow reflection */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-gradient-to-t from-transparent to-white/10 rounded-full blur-md" />
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Left/Right gradients - casino style */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-background via-background/90 to-transparent pointer-events-none z-20" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-background via-background/90 to-transparent pointer-events-none z-20" />
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => spinTo('left', 5)}
          className="rounded-full h-12 w-12 border-2 border-purple-400/50 hover:border-purple-400 hover:bg-purple-500/20 shadow-lg shadow-purple-500/20 transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-purple-400" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={navigateLeft}
          className="rounded-full h-10 w-10 border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Add button - casino style */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={isSelected ? "secondary" : "default"}
            size="lg"
            onClick={handleSelectCenter}
            className={`
              px-8 py-6 rounded-full font-bold text-base
              transition-all duration-300
              ${isSelected 
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/30' 
                : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 shadow-lg shadow-pink-500/30'
              }
            `}
            style={!isSelected ? {
              backgroundSize: '200% 200%',
              animation: 'gradient 3s ease infinite'
            } : {}}
          >
            {isSelected ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                {language === 'fr' ? 'Retirer' : 'Remove'}
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                {language === 'fr' ? 'Ajouter' : 'Add'}
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        <Button
          variant="outline"
          size="icon"
          onClick={navigateRight}
          className="rounded-full h-10 w-10 border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => spinTo('right', 5)}
          className="rounded-full h-12 w-12 border-2 border-orange-400/50 hover:border-orange-400 hover:bg-orange-500/20 shadow-lg shadow-orange-500/20 transition-all"
        >
          <ChevronRight className="w-6 h-6 text-orange-400" />
        </Button>
      </div>

      {/* Counter */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
          <span className="text-sm text-muted-foreground">
            {language === 'fr' ? 'Ingrédient' : 'Ingredient'}
          </span>
          <span className="font-bold text-foreground">
            {centerIndex + 1} / {totalItems}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        {language === 'fr' 
          ? '🎰 Glissez, scrollez ou utilisez les flèches' 
          : '🎰 Swipe, scroll or use arrows'}
      </p>

      {/* CSS for gradient animation */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}
