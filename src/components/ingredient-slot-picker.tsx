'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Check, Sparkles, Dice5, Zap } from 'lucide-react'

interface Ingredient {
  id: string
  name: string
  nameEn?: string
  emoji: string
  category: string
}

interface IngredientSlotPickerProps {
  ingredients: Ingredient[]
  selectedIngredients: Ingredient[]
  onToggleIngredient: (ingredient: Ingredient) => void
  language: 'fr' | 'en'
}

// Casino sound effects using Web Audio API
const useCasinoSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTick = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05)
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.05)
    } catch {
      // Audio not supported
    }
  }, [getAudioContext])

  const playJackpot = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3)
        
        oscillator.start(ctx.currentTime + i * 0.1)
        oscillator.stop(ctx.currentTime + i * 0.1 + 0.3)
      })
    } catch {
      // Audio not supported
    }
  }, [getAudioContext])

  const playSpin = useCallback(() => {
    try {
      const ctx = getAudioContext()
      
      for (let i = 0; i < 10; i++) {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.frequency.setValueAtTime(300 + i * 50, ctx.currentTime + i * 0.03)
        oscillator.type = 'square'
        
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.03)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.03 + 0.03)
        
        oscillator.start(ctx.currentTime + i * 0.03)
        oscillator.stop(ctx.currentTime + i * 0.03 + 0.03)
      }
    } catch {
      // Audio not supported
    }
  }, [getAudioContext])

  const playWin = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const melody = [
        { freq: 523.25, time: 0 },
        { freq: 587.33, time: 0.1 },
        { freq: 659.25, time: 0.2 },
        { freq: 783.99, time: 0.3 },
        { freq: 880.00, time: 0.4 },
        { freq: 1046.50, time: 0.5 },
      ]
      
      melody.forEach(({ freq, time }) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + time)
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime + time)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.15)
        
        oscillator.start(ctx.currentTime + time)
        oscillator.stop(ctx.currentTime + time + 0.15)
      })
    } catch {
      // Audio not supported
    }
  }, [getAudioContext])

  return { playTick, playJackpot, playSpin, playWin }
}

// Sparkle particle component
const SparkleParticle = ({ delay = 0, color = '#fbbf24' }: { delay?: number; color?: string }) => (
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
    className="absolute w-2 h-2 rounded-full"
    style={{
      backgroundColor: color,
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
  const [autoSpinActive, setAutoSpinActive] = useState(false)
  const [luckyMessage, setLuckyMessage] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const dragDelta = useRef(0)
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoSpinIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { playTick, playJackpot, playSpin, playWin } = useCasinoSounds()

  const totalItems = ingredients.length
  const centerIngredient = ingredients[centerIndex]
  const isSelected = centerIngredient ? selectedIngredients.some(i => i.id === centerIngredient.id) : false

  // Lucky messages based on selected count
  const getLuckyMessage = useCallback((count: number) => {
    const messages = {
      fr: [
        { min: 0, max: 0, msg: '🎰 Tournez pour trouver votre inspiration!' },
        { min: 1, max: 2, msg: '🍀 Continuez, la chance vous sourit!' },
        { min: 3, max: 4, msg: '⚡ Excellent! Presque un jackpot!' },
        { min: 5, max: 6, msg: '🔥 INCROYABLE! Le festin approche!' },
        { min: 7, max: 999, msg: '👑 JACKPOT ROYAL! Vous êtes un chef!' },
      ],
      en: [
        { min: 0, max: 0, msg: '🎰 Spin to find your inspiration!' },
        { min: 1, max: 2, msg: '🍀 Keep going, luck is on your side!' },
        { min: 3, max: 4, msg: '⚡ Excellent! Almost a jackpot!' },
        { min: 5, max: 6, msg: '🔥 INCREDIBLE! The feast is coming!' },
        { min: 7, max: 999, msg: '👑 ROYAL JACKPOT! You are a chef!' },
      ]
    }
    const msgs = messages[language as 'fr' | 'en'] || messages.en
    return msgs.find(m => count >= m.min && count <= m.max)?.msg || msgs[0].msg
  }, [language])

  // Calculate potential recipes (fun estimate)
  const potentialRecipes = Math.min(50, Math.max(1, selectedIngredients.length * 7 + Math.floor(Math.random() * 5)))

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

  // Auto spin - like a real slot machine!
  const startAutoSpin = useCallback(() => {
    if (autoSpinActive || isSpinning) return
    
    setAutoSpinActive(true)
    playSpin()
    
    let spinCount = 0
    const totalSpins = 15 + Math.floor(Math.random() * 10) // 15-25 spins
    
    autoSpinIntervalRef.current = setInterval(() => {
      setCenterIndex(prev => (prev + 1) % totalItems)
      playTick()
      spinCount++
      
      if (spinCount >= totalSpins) {
        clearInterval(autoSpinIntervalRef.current!)
        setAutoSpinActive(false)
        
        // Jackpot! Randomly add the ingredient
        setTimeout(() => {
          playJackpot()
          setShowCelebration(true)
          setLuckyMessage(language === 'fr' ? '🎲 Tournez encore ou ajoutez!' : '🎲 Spin again or add!')
          setTimeout(() => setShowCelebration(false), 1500)
        }, 100)
      }
    }, 80)
  }, [autoSpinActive, isSpinning, totalItems, playSpin, playTick, playJackpot, language])

  // Navigate left/right
  const navigateLeft = useCallback(() => {
    if (autoSpinActive) return
    playTick()
    setCenterIndex(prev => (prev - 1 + totalItems) % totalItems)
  }, [autoSpinActive, totalItems, playTick])

  const navigateRight = useCallback(() => {
    if (autoSpinActive) return
    playTick()
    setCenterIndex(prev => (prev + 1) % totalItems)
  }, [autoSpinActive, totalItems, playTick])

  // Handle drag
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (autoSpinActive) return
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    dragStartX.current = clientX
    dragDelta.current = 0
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || autoSpinActive) return
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
    if (autoSpinActive) return
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
      if (autoSpinActive) return
      if (e.key === 'ArrowLeft') navigateLeft()
      if (e.key === 'ArrowRight') navigateRight()
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault()
        startAutoSpin()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigateLeft, navigateRight, startAutoSpin, autoSpinActive])

  // Update lucky message
  useEffect(() => {
    setLuckyMessage(getLuckyMessage(selectedIngredients.length))
  }, [selectedIngredients.length, getLuckyMessage])

  // Select center ingredient with celebration
  const handleSelectCenter = () => {
    if (centerIngredient && !autoSpinActive) {
      if (!isSelected) {
        playWin()
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 1200)
      }
      onToggleIngredient(centerIngredient)
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
      {/* Lucky message banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-400/30 text-sm font-medium">
          {luckyMessage}
        </span>
      </motion.div>

      {/* Slot Machine Container */}
      <div 
        ref={containerRef}
        className={`relative h-52 md:h-64 overflow-hidden rounded-3xl transition-all duration-300 ${autoSpinActive ? 'ring-4 ring-yellow-400/50 ring-offset-2 ring-offset-background' : ''}`}
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
              scale: autoSpinActive ? [1, 1.3, 1] : [1, 1.2, 1],
              opacity: autoSpinActive ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3]
            }}
            transition={{ duration: autoSpinActive ? 0.3 : 2, repeat: Infinity }}
            className={`w-32 h-32 md:w-40 md:h-40 rounded-full blur-3xl ${categoryColors?.glow || 'bg-primary'} opacity-40`}
          />
        </div>

        {/* Center highlight frame - casino style */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ 
              borderColor: isSelected 
                ? ['rgba(34, 197, 94, 0.5)', 'rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0.5)']
                : autoSpinActive
                  ? ['rgba(251, 191, 36, 0.5)', 'rgba(251, 191, 36, 0.8)', 'rgba(251, 191, 36, 0.5)']
                  : ['rgba(168, 85, 247, 0.5)', 'rgba(251, 146, 60, 0.5)', 'rgba(168, 85, 247, 0.5)']
            }}
            transition={{ duration: autoSpinActive ? 0.2 : 2, repeat: Infinity }}
            className="w-28 h-28 md:w-36 md:h-36 border-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
              boxShadow: isSelected 
                ? '0 0 30px rgba(34, 197, 94, 0.5), inset 0 0 20px rgba(34, 197, 94, 0.1)'
                : autoSpinActive
                  ? '0 0 40px rgba(251, 191, 36, 0.5), inset 0 0 20px rgba(251, 191, 36, 0.2)'
                  : '0 0 30px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(251, 146, 60, 0.1)'
            }}
          />
        </div>

        {/* Celebration particles */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {[...Array(30)].map((_, i) => (
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
                  x: `${50 + (Math.random() - 0.5) * 120}%`,
                  y: `${50 + (Math.random() - 0.5) * 120}%`
                }}
                transition={{ duration: 0.8, delay: i * 0.02 }}
                className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full"
                style={{
                  backgroundColor: ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#f97316', '#a78bfa'][i % 6]
                }}
              />
            ))}
          </div>
        )}

        {/* Sparkle particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <SparkleParticle key={i} delay={i * 0.3} color={['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#f97316', '#a78bfa'][i]} />
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
                    stiffness: autoSpinActive ? 600 : 300,
                    damping: autoSpinActive ? 25 : 25
                  }}
                  className={`
                    absolute flex flex-col items-center justify-center
                    ${isCenter && !autoSpinActive ? 'cursor-pointer z-10' : 'cursor-grab z-0'}
                    ${isDragging ? 'select-none' : ''}
                  `}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `translateX(${style.x}px) translateZ(${style.z}px) rotateY(${style.rotateY}deg) scale(${style.scale})`,
                    filter: `blur(${style.blur}px)`
                  }}
                  onClick={isCenter && !autoSpinActive ? handleSelectCenter : undefined}
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
                        : autoSpinActive
                          ? '0 0 50px rgba(251, 191, 36, 0.4), 0 10px 30px rgba(0,0,0,0.3)'
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
                      animate={isCenter && autoSpinActive ? { rotate: 360 } : {}}
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
                        {language === 'en' && ingredient.nameEn ? ingredient.nameEn : ingredient.name}
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
                            animate={autoSpinActive ? { x: ['-100%', '200%'] } : { x: ['-100%', '200%'] }}
                            transition={autoSpinActive ? { duration: 0.5, repeat: Infinity } : { duration: 3, repeat: Infinity, repeatDelay: 2 }}
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
      <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
        {/* Auto Spin Button - The Star! */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="lg"
            onClick={startAutoSpin}
            disabled={autoSpinActive}
            className={`
              px-6 py-5 rounded-full font-bold
              border-2 border-yellow-400/50
              bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20
              hover:from-yellow-500/30 hover:via-orange-500/30 hover:to-red-500/30
              shadow-lg shadow-yellow-500/20
              transition-all duration-300
              ${autoSpinActive ? 'animate-pulse cursor-not-allowed' : 'hover:shadow-yellow-500/40'}
            `}
          >
            <Dice5 className={`w-6 h-6 mr-2 text-yellow-400 ${autoSpinActive ? 'animate-spin' : ''}`} />
            {language === 'fr' ? 'Lancer!' : 'Spin!'}
          </Button>
        </motion.div>

        <Button
          variant="outline"
          size="icon"
          onClick={navigateLeft}
          disabled={autoSpinActive}
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
            disabled={autoSpinActive}
            className={`
              px-8 py-5 rounded-full font-bold text-base
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
          disabled={autoSpinActive}
          className="rounded-full h-10 w-10 border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Luck Counter */}
      {selectedIngredients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-4"
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-400/20">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">
              {language === 'fr' ? `${potentialRecipes} recettes potentielles!` : `${potentialRecipes} potential recipes!`}
            </span>
            <span className="text-lg">🎰</span>
          </div>
        </motion.div>
      )}

      {/* Counter & Instructions */}
      <div className="flex flex-col items-center gap-2 mt-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
          <span className="text-sm text-muted-foreground">
            {language === 'fr' ? 'Ingrédient' : 'Ingredient'}
          </span>
          <span className="font-bold text-foreground">
            {centerIndex + 1} / {totalItems}
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {language === 'fr' 
            ? '🎰 Glissez, scrollez ou lancez les dés!' 
            : '🎰 Swipe, scroll or roll the dice!'}
          <br />
          <span className="text-yellow-500">{language === 'fr' ? 'Espace = Auto-spin' : 'Space = Auto-spin'}</span>
        </p>
      </div>

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
