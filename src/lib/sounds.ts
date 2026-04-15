// Sound effects utility for micro-interactions
// Uses Web Audio API for lightweight, instant sounds

class SoundEffects {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return this.audioContext
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  // Play a simple tone with given frequency and duration
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.enabled) return
    
    try {
      const ctx = this.getContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = type
      gainNode.gain.value = volume
      
      oscillator.start()
      
      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      
      setTimeout(() => {
        oscillator.stop()
      }, duration * 1000)
    } catch (e) {
      console.log('Sound effect failed:', e)
    }
  }

  // Play a sequence of tones
  private playSequence(notes: { freq: number; duration: number }[], type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.enabled) return
    
    let delay = 0
    notes.forEach(note => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration, type, volume)
      }, delay * 1000)
      delay += note.duration
    })
  }

  // Sound for selecting an ingredient
  select() {
    this.playTone(800, 0.08, 'sine', 0.08)
  }

  // Sound for deselecting an ingredient
  deselect() {
    this.playTone(600, 0.08, 'sine', 0.06)
  }

  // Sound for successful action
  success() {
    this.playSequence([
      { freq: 523, duration: 0.1 },  // C5
      { freq: 659, duration: 0.1 },  // E5
      { freq: 784, duration: 0.15 }, // G5
    ], 'sine', 0.1)
  }

  // Sound for adding to favorites
  favorite() {
    this.playSequence([
      { freq: 659, duration: 0.08 },  // E5
      { freq: 784, duration: 0.08 },  // G5
      { freq: 880, duration: 0.12 },  // A5
    ], 'sine', 0.08)
  }

  // Sound for removing from favorites
  unfavorite() {
    this.playTone(440, 0.15, 'sine', 0.06)
  }

  // Sound for adding to shopping list
  addToCart() {
    this.playSequence([
      { freq: 440, duration: 0.06 },  // A4
      { freq: 554, duration: 0.06 },  // C#5
      { freq: 659, duration: 0.1 },   // E5
    ], 'triangle', 0.08)
  }

  // Sound for checking off an item
  check() {
    this.playTone(1200, 0.06, 'sine', 0.08)
  }

  // Sound for unchecking an item
  uncheck() {
    this.playTone(800, 0.06, 'sine', 0.06)
  }

  // Sound for timer complete
  timerComplete() {
    // Play an attention-grabbing sound
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(880, 0.15, 'square', 0.15)
      }, i * 200)
    }
  }

  // Sound for navigation (next/previous step in chef mode)
  navigate() {
    this.playTone(500, 0.05, 'sine', 0.05)
  }

  // Sound for error
  error() {
    this.playTone(200, 0.2, 'sawtooth', 0.1)
  }

  // Sound for generating recipes (loading)
  loading() {
    this.playSequence([
      { freq: 400, duration: 0.1 },
      { freq: 500, duration: 0.1 },
      { freq: 600, duration: 0.1 },
    ], 'sine', 0.05)
  }

  // Celebration sound for completing a recipe
  celebration() {
    this.playSequence([
      { freq: 523, duration: 0.1 },  // C5
      { freq: 587, duration: 0.1 },  // D5
      { freq: 659, duration: 0.1 },  // E5
      { freq: 784, duration: 0.1 },  // G5
      { freq: 880, duration: 0.2 },  // A5
    ], 'sine', 0.1)
  }
}

// Export singleton instance
export const soundEffects = new SoundEffects()

// Hook for using sound effects in components
export function useSoundEffects() {
  return soundEffects
}
