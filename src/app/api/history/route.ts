import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateUser } from '@/lib/server-auth'

// GET /api/history - Get user history
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const history = await db.recipeHistory.findMany({
      where: { userId: user.id },
      orderBy: { cookedAt: 'desc' },
      take: limit
    })

    return NextResponse.json({ 
      history: history.map(h => ({
        id: h.id,
        recipeName: h.recipeName,
        recipeData: JSON.parse(h.recipeData),
        ingredients: JSON.parse(h.ingredients),
        rating: h.rating,
        cookedAt: h.cookedAt
      }))
    })
  } catch (error) {
    console.error('Get history error:', error)
    return NextResponse.json({ history: [] })
  }
}

// POST /api/history - Add to history
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const body = await request.json()
    const recipe = body.recipe
    const ingredients = body.ingredients
    const rating = body.rating

    if (!recipe || !recipe.name) {
      return NextResponse.json(
        { error: 'Recette requise' },
        { status: 400 }
      )
    }

    const historyEntry = await db.recipeHistory.create({
      data: {
        userId: user.id,
        recipeName: recipe.name,
        recipeData: JSON.stringify(recipe),
        ingredients: JSON.stringify(ingredients || []),
        rating: rating || null
      }
    })

    return NextResponse.json({ success: true, history: historyEntry })
  } catch (error) {
    console.error('Add history error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout à l\'historique' },
      { status: 500 }
    )
  }
}

// PATCH /api/history - Update rating
export async function PATCH(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const body = await request.json()
    const { historyId, rating } = body

    if (!historyId || !rating) {
      return NextResponse.json(
        { error: 'ID et note requis' },
        { status: 400 }
      )
    }

    const updated = await db.recipeHistory.update({
      where: { id: historyId, userId: user.id },
      data: { rating }
    })

    return NextResponse.json({ success: true, history: updated })
  } catch (error) {
    console.error('Update history error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
