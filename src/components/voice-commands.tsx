'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, MicOff, Volume2, VolumeX, HelpCircle, 
  X, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { toast } from '@/hooks/use-toast'

interface VoiceCommandsProps {
  isEnabled?: boolean
  isListening?: boolean
  onToggleListening?: () => void
  onCommand?: (command: string, result: string) => void
  onNextStep?: () => void
  onPrevStep?: () => void
  onPauseTimer?: () => void
  onResumeTimer?: () => void
  onRestartTimer?: () => void
  onReadStep?: () => void
  onReadIngredients?: () => void
  currentStep?: number
  totalSteps?: number
}

// Speech recognition setup
const SpeechRecognition = typeof window !== 'undefined' 
  ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition 
  : null

// Speech synthesis
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

export function VoiceCommands({
  isEnabled = true,
  isListening: externalIsListening,
  onToggleListening,
  onCommand,
  onNextStep,
  onPrevStep,
  onPauseTimer,
  onResumeTimer,
  onRestartTimer,
  onReadStep,
  onReadIngredients,
  currentStep = 1,
  totalSteps = 1,
}: VoiceCommandsProps) {
  const { t, language } = useI18n()
  const [isListening, setIsListening] = useState(externalIsListening || false)
  const [lastCommand, setLastCommand] = useState<string>('')
  const [lastResponse, setLastResponse] = useState<string>('')
  const [showHelp, setShowHelp] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState('')
  
  const recognitionRef = useRef<any>(null)
  
  // Check support at render time
  const isSupported = typeof window !== 'undefined' && 
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  // Speak function - defined first
  const speak = useCallback((text: string) => {
    if (!synth || isMuted) return
    
    synth.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'fr' ? 'fr-CA' : 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1
    
    synth.speak(utterance)
    setLastResponse(text)
  }, [language, isMuted])

  // Process voice command - defined after speak
  const processCommand = useCallback((text: string) => {
    // Check for matching commands
    const commands = [
      {
        patterns: [/\b(next|suivant|suivante|suivant(e|es)?)\b/i, /\b(étape suivante|prochaine étape)\b/i, /\b(avance|avancer)\b/i],
        action: () => {
          onNextStep?.()
          speak(language === 'fr' ? 'Étape suivante' : 'Next step')
        }
      },
      {
        patterns: [/\b(previous|précédent|précédente|précédent(e|es)?)\b/i, /\b(étape précédente|dernière étape)\b/i, /\b(recule|reculer|retour)\b/i],
        action: () => {
          onPrevStep?.()
          speak(language === 'fr' ? 'Étape précédente' : 'Previous step')
        }
      },
      {
        patterns: [/\b(pause|arrête|arrêter|stop)\b/i, /\b(minuterie en pause|timer pause)\b/i],
        action: () => {
          onPauseTimer?.()
          speak(language === 'fr' ? 'Minuterie en pause' : 'Timer paused')
        }
      },
      {
        patterns: [/\b(reprend|reprendre|continue|continuer|resume)\b/i, /\b(minuterie reprise|timer resume)\b/i],
        action: () => {
          onResumeTimer?.()
          speak(language === 'fr' ? 'Reprise de la minuterie' : 'Timer resumed')
        }
      },
      {
        patterns: [/\b(redémarre|redémarrer|restart|reset|réinitialise)\b/i, /\b(minuterie redémarrée|timer restart)\b/i],
        action: () => {
          onRestartTimer?.()
          speak(language === 'fr' ? 'Minuterie redémarrée' : 'Timer restarted')
        }
      },
      {
        patterns: [/\b(lis l'étape|lit l'étape|read step|étape actuelle)\b/i, /\b(répète|repeat|redis)\b/i],
        action: () => {
          onReadStep?.()
          speak(language === 'fr' ? `Étape ${currentStep}` : `Step ${currentStep}`)
        }
      },
      {
        patterns: [/\b(lis les ingrédients|lit les ingrédients|read ingredients|ingrédients)\b/i, /\b(quels sont les ingrédients|what are the ingredients)\b/i],
        action: () => {
          onReadIngredients?.()
          speak(language === 'fr' ? 'Voici les ingrédients' : 'Here are the ingredients')
        }
      },
      {
        patterns: [/\b(aide|help|comment ça marche|comment utiliser)\b/i, /\b(commandes|commands)\b/i],
        action: () => {
          setShowHelp(true)
          speak(language === 'fr' ? 'Voici les commandes disponibles' : 'Here are the available commands')
        }
      },
      {
        patterns: [/\b(répète|répéter|repeat|again|encore)\b/i],
        action: () => {
          speak(language === 'fr' ? 'Je répète' : 'Repeating')
        }
      },
    ]

    for (const cmd of commands) {
      for (const pattern of cmd.patterns) {
        if (pattern.test(text)) {
          setLastCommand(text)
          cmd.action()
          onCommand?.(cmd.patterns[0].source, text)
          return
        }
      }
    }

    setLastCommand(text)
    setLastResponse(language === 'fr' ? 'Commande non reconnue' : 'Command not recognized')
  }, [language, currentStep, speak, onNextStep, onPrevStep, onPauseTimer, onResumeTimer, onRestartTimer, onReadStep, onReadIngredients, onCommand])

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) {
      return
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognitionClass()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language === 'fr' ? 'fr-CA' : 'en-US'

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results)
      const transcriptText = results
        .map((result: any) => result[0].transcript)
        .join('')
        .toLowerCase()
      
      setTranscript(transcriptText)
      
      if (event.results[event.results.length - 1].isFinal) {
        processCommand(transcriptText)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        toast({
          title: language === 'fr' ? 'Microphone non autorisé' : 'Microphone not allowed',
          description: language === 'fr' 
            ? 'Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur'
            : 'Please allow microphone access in your browser settings',
          variant: 'destructive'
        })
      }
    }

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start()
        } catch (e) {
          console.error('Failed to restart recognition:', e)
        }
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [language, isListening, processCommand])

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        toast({
          title: language === 'fr' ? 'Écoute activée' : 'Listening activated',
          description: language === 'fr' 
            ? 'Dites une commande pour contrôler la recette'
            : 'Say a command to control the recipe'
        })
      } catch (e) {
        console.error('Failed to start recognition:', e)
      }
    }
    
    onToggleListening?.()
  }, [isListening, language, onToggleListening])

  if (!isSupported) {
    return null
  }

  const commandList = [
    { cmd: 'next', desc: language === 'fr' ? 'Suivant / Prochaine étape' : 'Next / Next step' },
    { cmd: 'previous', desc: language === 'fr' ? 'Précédent / Étape précédente' : 'Previous / Previous step' },
    { cmd: 'pause', desc: language === 'fr' ? 'Pause / Arrêter' : 'Pause / Stop' },
    { cmd: 'resume', desc: language === 'fr' ? 'Reprendre / Continuer' : 'Resume / Continue' },
    { cmd: 'restart', desc: language === 'fr' ? 'Redémarrer / Réinitialiser' : 'Restart / Reset' },
    { cmd: 'repeat', desc: language === 'fr' ? 'Répète / Encore' : 'Repeat / Again' },
    { cmd: 'ingredients', desc: language === 'fr' ? 'Ingrédients' : 'Ingredients' },
    { cmd: 'help', desc: language === 'fr' ? 'Aide / Commandes' : 'Help / Commands' },
  ]

  return (
    <>
      {/* Voice Control Button */}
      <div className="flex items-center gap-2">
        <Button
          variant={isListening ? 'default' : 'outline'}
          size="sm"
          onClick={toggleListening}
          className={isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : ''
          }
        >
          {isListening ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Mic className="w-4 h-4 mr-1" />
              </motion.div>
              {language === 'fr' ? 'Écoute...' : 'Listening...'}
            </>
          ) : (
            <>
              <MicOff className="w-4 h-4 mr-1" />
              {language === 'fr' ? 'Voix' : 'Voice'}
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted 
            ? (language === 'fr' ? 'Activer le son' : 'Unmute') 
            : (language === 'fr' ? 'Couper le son' : 'Mute')
          }
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowHelp(true)}
        >
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Transcript Display */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 bg-card border rounded-lg shadow-lg"
          >
            <p className="text-sm text-muted-foreground">
              {language === 'fr' ? 'Vous avez dit:' : 'You said:'} 
              <span className="font-medium text-foreground ml-1">"{transcript}"</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5 flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold flex items-center gap-2">
                  <Mic className="w-5 h-5 text-primary" />
                  {language === 'fr' ? 'Commandes vocales' : 'Voice Commands'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowHelp(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'fr' 
                    ? 'Dites une de ces commandes pour contrôler votre cuisson:'
                    : 'Say one of these commands to control your cooking:'}
                </p>
                
                <div className="space-y-2">
                  {commandList.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <Badge variant="outline" className="font-mono">
                        "{item.cmd}"
                      </Badge>
                      <span className="text-sm">{item.desc}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    💡 {language === 'fr' 
                      ? 'Les commandes fonctionnent en français et en anglais. Parlez naturellement!'
                      : 'Commands work in both French and English. Speak naturally!'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
