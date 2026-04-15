'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6'
}

const gapClasses = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5'
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className 
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const displayRating = hoveredRating ?? rating

  const handleStarClick = (starIndex: number) => {
    if (interactive && onChange) {
      const newRating = starIndex + 1
      onChange(newRating === rating ? 0 : newRating)
    }
  }

  const handleStarHover = (starIndex: number | null) => {
    if (interactive) {
      setHoveredRating(starIndex !== null ? starIndex + 1 : null)
    }
  }

  return (
    <div className={cn('flex items-center', gapClasses[size], className)}>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const isFilled = index < displayRating
          const isHalfFilled = !isFilled && index === Math.floor(displayRating) && displayRating % 1 !== 0
          
          return (
            <motion.button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleStarClick(index)}
              onMouseEnter={() => handleStarHover(index)}
              onMouseLeave={() => handleStarHover(null)}
              whileHover={interactive ? { scale: 1.2 } : {}}
              whileTap={interactive ? { scale: 0.9 } : {}}
              className={cn(
                'relative focus:outline-none',
                interactive ? 'cursor-pointer' : 'cursor-default'
              )}
            >
              {/* Background star (empty) */}
              <Star 
                className={cn(
                  sizeClasses[size],
                  'text-muted-foreground/30'
                )}
              />
              
              {/* Filled star overlay */}
              {(isFilled || isHalfFilled) && (
                <Star 
                  className={cn(
                    sizeClasses[size],
                    'absolute inset-0 text-yellow-400 fill-yellow-400',
                    interactive && 'transition-transform'
                  )}
                  style={isHalfFilled ? {
                    clipPath: 'inset(0 50% 0 0)'
                  } : undefined}
                />
              )}
              
              {/* Hover effect for interactive mode */}
              {interactive && hoveredRating !== null && index < hoveredRating && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0"
                >
                  <Star 
                    className={cn(
                      sizeClasses[size],
                      'text-yellow-300 fill-yellow-300'
                    )}
                  />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

// Compact version for use in cards
export function CompactRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  )
}
