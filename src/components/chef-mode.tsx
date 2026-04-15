'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  List,
  Eye,
  EyeOff,
  Coffee,
  AlertCircle,
} from 'lucide-react'
import { VoiceCommands } from '@/components/voice-commands'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface ChefModeProps {
  recipe: {
    name: string
    prepTime: string
    cookTime: string
    servings: string
    ingredients: string[]
    instructions: string[]
    tip?: string
    image?: string | null
  }
  onClose: () => void
}

interface DetectedTime {
  minutes: number
  originalText: string
}

// Regex pour détecter les temps dans les instructions
const TIME_PATTERNS = [
  /(\d+)\s*(?:minutes?|min\.?|mn)/gi,
  /(\d+)\s*(?:heures?|h)\s*(\d+)?\s*(?:minutes?|min\.?|mn)?/gi,
]

function detectTimeInInstruction(instruction: string): DetectedTime | null {
  for (const pattern of TIME_PATTERNS) {
    const match = pattern.exec(instruction)
    if (match) {
      let minutes = 0
      if (match[2]) {
        // Format "Xh Ymin"
        minutes = parseInt(match[1]) * 60 + parseInt(match[2])
      } else {
        // Format simple "X minutes" ou "Xh"
        const value = parseInt(match[1])
        if (instruction.toLowerCase().includes('h') && !instruction.toLowerCase().includes('min')) {
          minutes = value * 60
        } else {
          minutes = value
        }
      }
      return { minutes, originalText: match[0] }
    }
  }
  return null
}

export default function ChefMode({ recipe, onClose }: ChefModeProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showIngredients, setShowIngredients] = useState(false)
  const [wakeLockEnabled, setWakeLockEnabled] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(() => {
    const time = detectTimeInInstruction(recipe.instructions[0])
    return time ? time.minutes * 60 : 0
  })
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerFinished, setTimerFinished] = useState(false)
  
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const totalSteps = recipe.instructions.length

  // Derived: detect time from current instruction
  const detectedTime = useMemo(() => {
    return detectTimeInInstruction(recipe.instructions[currentStep])
  }, [currentStep, recipe.instructions])

  // Format timer display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Play alarm sound
  const playAlarm = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3
    
    oscillator.start()
    
    setTimeout(() => {
      oscillator.stop()
    }, 200)
  }, [])

  // Reset timer for current step
  const resetTimerForStep = useCallback((stepIndex: number) => {
    setTimerRunning(false)
    setTimerFinished(false)
    const time = detectTimeInInstruction(recipe.instructions[stepIndex])
    if (time) {
      setTimerSeconds(time.minutes * 60)
    } else {
      setTimerSeconds(0)
    }
  }, [recipe.instructions])

  // Navigation handlers
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      resetTimerForStep(newStep)
    }
  }, [currentStep, totalSteps, resetTimerForStep])

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      resetTimerForStep(newStep)
    }
  }, [currentStep, resetTimerForStep])

  // Empêcher le scroll du body
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false)
            setTimerFinished(true)
            playAlarm()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [timerRunning, playAlarm])

  // Wake Lock API
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
        setWakeLockEnabled(true)
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockEnabled(false)
        })
      } catch (err) {
        console.log('Wake Lock error:', err)
      }
    }
  }, [])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
      setWakeLockEnabled(false)
    }
  }, [])

  const toggleWakeLock = useCallback(() => {
    if (wakeLockEnabled) {
      releaseWakeLock()
    } else {
      requestWakeLock()
    }
  }, [wakeLockEnabled, releaseWakeLock, requestWakeLock])

  const readStep = useCallback(() => {
    // Speak current step using speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(recipe.instructions[currentStep])
      utterance.lang = 'fr-CA'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }, [currentStep, recipe.instructions])

  const readIngredients = useCallback(() => {
    if ('speechSynthesis' in window) {
      const text = recipe.ingredients.join(', ')
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'fr-CA'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }, [recipe.ingredients])

  // Timer controls
  const toggleTimer = useCallback(() => {
    if (timerFinished) {
      resetTimerForStep(currentStep)
    } else {
      setTimerRunning(prev => !prev)
    }
  }, [timerFinished, currentStep, resetTimerForStep])

  const resetCurrentTimer = useCallback(() => {
    setTimerRunning(false)
    setTimerFinished(false)
    if (detectedTime) {
      setTimerSeconds(detectedTime.minutes * 60)
    }
  }, [detectedTime])



  // Click handlers for navigation
  const handleMainClick = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    
    // Click gauche = prochain tiers de l'écran
    // Click droit = précédent deux-tiers de l'écran
    if (clickX > width * 0.66) {
      goToNextStep()
    } else if (clickX < width * 0.33) {
      goToPreviousStep()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          goToNextStep()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPreviousStep()
          break
        case 'Escape':
          onClose()
          break
        case 'Enter':
          if (detectedTime) {
            toggleTimer()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextStep, goToPreviousStep, onClose, detectedTime, timerRunning, timerFinished])

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  return (
    <div
      className="fixed inset-0 z-[9999] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col"
      onClick={handleMainClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-4">
          {recipe.image && (
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
            />
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">{recipe.name}</h1>
            <div className="flex gap-4 text-sm text-slate-400">
              <span>{recipe.prepTime}</span>
              <span>{recipe.cookTime}</span>
              <span>{recipe.servings}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Commands */}
          <div className="hidden md:block">
            <VoiceCommands
              onNextStep={goToNextStep}
              onPrevStep={goToPreviousStep}
              onPauseTimer={() => setTimerRunning(false)}
              onResumeTimer={() => setTimerRunning(true)}
              onRestartTimer={resetCurrentTimer}
              onReadStep={readStep}
              onReadIngredients={readIngredients}
              currentStep={currentStep + 1}
              totalSteps={totalSteps}
            />
          </div>

          <Button
            variant="ghost"
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              setShowIngredients(!showIngredients)
            }}
            className="text-white hover:bg-slate-700 min-w-[48px] min-h-[48px]"
          >
            {showIngredients ? <EyeOff className="w-6 h-6" /> : <List className="w-6 h-6" />}
            <span className="ml-2 hidden md:inline">
              {showIngredients ? 'Masquer' : 'Ingrédients'}
            </span>
          </Button>

          <Button
            variant={wakeLockEnabled ? 'default' : 'ghost'}
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              toggleWakeLock()
            }}
            className={`min-w-[48px] min-h-[48px] ${
              wakeLockEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'text-white hover:bg-slate-700'
            }`}
          >
            <Coffee className="w-6 h-6" />
            <span className="ml-2 hidden md:inline">
              {wakeLockEnabled ? 'Écran actif' : 'Éviter veille'}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-white hover:bg-red-600/20 hover:text-red-400 min-w-[48px] min-h-[48px]"
          >
            <X className="w-6 h-6" />
            <span className="ml-2 hidden md:inline">Quitter</span>
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 md:px-6 py-2">
        <Progress value={progressPercentage} className="h-2 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-500" />
        <p className="text-center text-slate-400 text-sm mt-1">
          Étape {currentStep + 1} sur {totalSteps}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Click zones indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity">
          <ChevronLeft className="w-16 h-16 text-slate-600" />
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity">
          <ChevronRight className="w-16 h-16 text-slate-600" />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.95, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="max-w-4xl mx-auto px-8 md:px-16 text-center"
          >
            {/* Step number */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
              className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white text-3xl md:text-4xl font-bold mb-8 shadow-lg shadow-orange-500/30"
            >
              {currentStep + 1}
            </motion.div>

            {/* Instruction text */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-5xl lg:text-6xl font-medium leading-relaxed mb-8"
            >
              {recipe.instructions[currentStep]}
            </motion.p>

            {/* Timer section */}
            {detectedTime && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`mt-8 inline-flex flex-col items-center gap-4 p-6 rounded-2xl ${
                  timerFinished
                    ? 'bg-red-500/20 border-2 border-red-500 animate-pulse'
                    : 'bg-slate-700/50 border-2 border-slate-600'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {timerFinished ? (
                  <div className="flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-8 h-8" />
                    <span className="text-2xl font-bold">Timer terminé!</span>
                  </div>
                ) : (
                  <div className="text-4xl md:text-5xl font-mono font-bold tabular-nums">
                    {formatTime(timerSeconds)}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTimer()
                    }}
                    className={`min-w-[80px] min-h-[56px] text-lg ${
                      timerFinished
                        ? 'bg-red-600 hover:bg-red-700'
                        : timerRunning
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {timerFinished ? (
                      <>
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Redémarrer
                      </>
                    ) : timerRunning ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Démarrer
                      </>
                    )}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      resetCurrentTimer()
                    }}
                    className="min-w-[56px] min-h-[56px] border-slate-500 text-white hover:bg-slate-600"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>

                <p className="text-sm text-slate-400">
                  Temps détecté: {detectedTime.originalText}
                </p>
              </motion.div>
            )}

            {/* Tip */}
            {recipe.tip && currentStep === totalSteps - 1 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl"
              >
                <p className="text-lg text-amber-300">
                  💡 <strong>Astuce:</strong> {recipe.tip}
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Ingredients drawer */}
      <AnimatePresence>
        {showIngredients && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-600 rounded-t-3xl max-h-[50vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Ingrédients</h2>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setShowIngredients(false)}
                  className="text-white hover:bg-slate-700"
                >
                  <EyeOff className="w-6 h-6" />
                </Button>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[calc(50vh-100px)]">
                {recipe.ingredients.map((ingredient, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-lg">{ingredient}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons for mobile */}
      <div className="flex justify-between items-center p-4 bg-slate-900/80 border-t border-slate-700">
        <Button
          variant="outline"
          size="lg"
          onClick={(e) => {
            e.stopPropagation()
            goToPreviousStep()
          }}
          disabled={currentStep === 0}
          className="min-w-[80px] min-h-[56px] border-slate-500 text-white hover:bg-slate-700 disabled:opacity-30"
        >
          <ChevronLeft className="w-6 h-6 mr-2" />
          Précédent
        </Button>

        <div className="flex gap-2">
          {recipe.instructions.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentStep(index)
                resetTimerForStep(index)
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-orange-500 scale-125'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={(e) => {
            e.stopPropagation()
            goToNextStep()
          }}
          disabled={currentStep === totalSteps - 1}
          className="min-w-[80px] min-h-[56px] border-slate-500 text-white hover:bg-slate-700 disabled:opacity-30"
        >
          Suivant
          <ChevronRight className="w-6 h-6 ml-2" />
        </Button>
      </div>

      {/* Final celebration */}
      <AnimatePresence>
        {currentStep === totalSteps - 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-lg font-bold shadow-lg shadow-green-500/30"
            >
              🎉 Recette terminée!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
