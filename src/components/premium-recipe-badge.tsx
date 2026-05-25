'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Crown, Lock, Star } from 'lucide-react'

interface PremiumRecipeBadgeProps {
  type: 'chef' | 'exclusive' | 'keto' | 'batch'
  size?: 'sm' | 'md'
}

export function PremiumRecipeBadge({ type, size = 'md' }: PremiumRecipeBadgeProps) {
  const badges = {
    chef: {
      icon: Crown,
      label: 'Chef Étoilé',
      className: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-amber-500/25'
    },
    exclusive: {
      icon: Lock,
      label: 'Premium',
      className: 'bg-gradient-to-r from-primary to-terracotta text-primary-foreground border-0 shadow-primary/25'
    },
    keto: {
      icon: Star,
      label: 'Keto Pro',
      className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-emerald-500/25'
    },
    batch: {
      icon: Star,
      label: 'Batch Cooking',
      className: 'bg-gradient-to-r from-violet-500 to-violet-600 text-white border-0 shadow-violet-500/25'
    }
  }

  const badge = badges[type]
  const Icon = badge.icon

  return (
    <Badge 
      className={`${badge.className} ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'} shadow-lg flex items-center gap-1`}
    >
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {badge.label}
    </Badge>
  )
}
