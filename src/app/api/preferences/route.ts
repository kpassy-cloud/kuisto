import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateUser } from '@/lib/server-auth'

const defaultPreferences = {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  lactoseFree: false,
  keto: false,
  halal: false,
  kosher: false,
  nutAllergy: false,
  peanutAllergy: false,
  shellfishAllergy: false,
  eggAllergy: false,
  soyAllergy: false,
  fishAllergy: false,
  servingSize: 2,
  difficultyLevel: 'easy',
  maxPrepTime: 30
}

// GET /api/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser()

    let preferences = await db.userPreferences.findUnique({
      where: { userId: user.id }
    })

    if (!preferences) {
      // Create default preferences for user
      preferences = await db.userPreferences.create({
        data: { userId: user.id, ...defaultPreferences }
      })
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Get preferences error:', error)
    return NextResponse.json({ preferences: { userId: 'demo-user', ...defaultPreferences } })
  }
}

// POST /api/preferences - Update preferences
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const body = await request.json()
    const { ...preferences } = body

    const updated = await db.userPreferences.upsert({
      where: { userId: user.id },
      update: preferences,
      create: {
        userId: user.id,
        ...defaultPreferences,
        ...preferences
      }
    })

    return NextResponse.json({ success: true, preferences: updated })
  } catch (error) {
    console.error('Update preferences error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des préférences' },
      { status: 500 }
    )
  }
}
