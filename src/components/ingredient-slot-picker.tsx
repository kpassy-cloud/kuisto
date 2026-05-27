'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react'
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

// 3D Slot Machine Style Ingredient Picker
export function IngredientSlotPicker({
  ingredients,
  selectedIngredients,
  onToggleIngredient,
  language
}: IngredientSlotPickerProps) {
  const [centerIndex, setCenterIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const dragDelta = useRef(0)

  const totalItems = ingredients.length
  const centerIngredient = ingredients[centerIndex]
  const isSelected = centerIngredient ? selectedIngredients.some(i => i.id === centerIngredient.id) : false

  // Get visible items (3 on each side)
  const getVisibleItems = useCallback(() => {
    const items = []
    for (let offset = -3; offset <= 3; offset++) {
      let index = centerIndex + offset
      if (index < 0) index = totalItems + index
      if (index >= totalItems) index = index - totalItems
      items.push({ ingredient: ingredients[index], offset, index })
    }
    return items
  }, [centerIndex, ingredients, totalItems])

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
    if (e.deltaY > 10 || e.deltaX > 10) {
      navigateRight()
    } else if (e.deltaY < -10 || e.deltaX < -10) {
      navigateLeft()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigateLeft()
      if (e.key === 'ArrowRight') navigateRight()
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (centerIngredient) {
          soundEffects.select()
          onToggleIngredient(centerIngredient)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [centerIngredient, onToggleIngredient])

  // Select center ingredient
  const handleSelectCenter = () => {
    if (centerIngredient) {
      soundEffects.select()
      onToggleIngredient(centerIngredient)
    }
  }

  // Calculate 3D transform for each item
  const getItemStyle = (offset: number) => {
    const absOffset = Math.abs(offset)
    const isCenter = offset === 0
    
    // Scale: center is largest
    const scale = isCenter ? 1 : Math.max(0.5, 1 - absOffset * 0.15)
    
    // Opacity: fades out towards edges
    const opacity = isCenter ? 1 : Math.max(0.3, 1 - absOffset * 0.2)
    
    // Z translation: creates depth effect
    const z = isCenter ? 50 : -absOffset * 30
    
    // X translation: spreads items horizontally
    const x = offset * 80
    
    // Rotation: slight rotation for 3D effect
    const rotateY = isCenter ? 0 : offset * -15

    return {
      scale,
      opacity,
      z,
      x,
      rotateY
    }
  }

  return (
    <div className="w-full">
      {/* Slot Machine Container */}
      <div 
        ref={containerRef}
        className="relative h-48 md:h-56 perspective-1000"
        onWheel={handleWheel}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Background glow for center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-28 h-28 md:w-36 md:h-36 bg-primary/20 rounded-full blur-2xl" />
        </div>

        {/* Center highlight frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-primary/30 rounded-2xl" />
        </div>

        {/* Items */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {getVisibleItems().map(({ ingredient, offset }) => {
              const style = getItemStyle(offset)
              const isCenter = offset === 0
              const itemSelected = selectedIngredients.some(i => i.id === ingredient.id)
              
              return (
                <motion.div
                  key={`${ingredient.id}-${offset}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: style.opacity,
                    scale: style.scale,
                    x: style.x,
                    z: style.z,
                    rotateY: style.rotateY
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }}
                  className={`
                    absolute flex flex-col items-center justify-center
                    transition-all duration-200
                    ${isCenter ? 'cursor-pointer z-10' : 'cursor-grab z-0'}
                    ${isDragging ? 'select-none' : ''}
                  `}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `translateX(${style.x}px) translateZ(${style.z}px) rotateY(${style.rotateY}deg) scale(${style.scale})`
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
                        ? `bg-gradient-to-br from-background via-background to-muted
                           shadow-2xl shadow-primary/20
                           border-2 ${itemSelected ? 'border-primary bg-primary/10' : 'border-primary/50'}
                           hover:border-primary
                           hover:shadow-primary/30`
                        : 'bg-muted/50 border border-border/50'
                      }
                      ${itemSelected && !isCenter ? 'ring-2 ring-primary/50' : ''}
                    `}
                  >
                    {/* Emoji */}
                    <span 
                      className={`
                        transition-all duration-300
                        ${isCenter ? 'text-5xl md:text-6xl drop-shadow-lg' : 'text-3xl md:text-4xl'}
                      `}
                    >
                      {ingredient.emoji}
                    </span>
                    
                    {/* Name - only show for center item */}
                    {isCenter && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm md:text-base font-medium text-foreground text-center whitespace-nowrap"
                      >
                        {ingredient.name}
                      </motion.span>
                    )}

                    {/* Selected indicator for center */}
                    {isCenter && itemSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}

                    {/* 3D shine effect for center */}
                    {isCenter && (
                      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Left/Right gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-background to-transparent pointer-events-none z-20" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-20" />
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <Button
          variant="outline"
          size="icon"
          onClick={navigateLeft}
          className="rounded-full h-10 w-10 border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Add button */}
        <Button
          variant={isSelected ? "secondary" : "default"}
          size="lg"
          onClick={handleSelectCenter}
          className={`
            px-6 py-5 rounded-full font-semibold
            transition-all duration-300
            ${isSelected 
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30'
            }
          `}
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
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={navigateRight}
          className="rounded-full h-10 w-10 border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Scroll indicator */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        {language === 'fr' 
          ? '← Glissez ou utilisez les flèches →' 
          : '← Swipe or use arrows →'}
      </p>
    </div>
  )
}
