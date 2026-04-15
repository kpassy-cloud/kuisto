import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateUser } from '@/lib/server-auth'

// GET /api/favorites - Get user favorites
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser()

    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      favorites: favorites.map(f => ({
        id: f.id,
        recipeName: f.recipeName,
        recipeData: JSON.parse(f.recipeData),
        createdAt: f.createdAt
      }))
    })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json({ favorites: [] })
  }
}

// POST /api/favorites - Add favorite
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const body = await request.json()
    const recipe = body.recipe

    if (!recipe || !recipe.name) {
      return NextResponse.json(
        { error: 'Recette requise' },
        { status: 400 }
      )
    }

    const favorite = await db.favorite.upsert({
      where: {
        userId_recipeName: {
          userId: user.id,
          recipeName: recipe.name
        }
      },
      update: {
        recipeData: JSON.stringify(recipe)
      },
      create: {
        userId: user.id,
        recipeName: recipe.name,
        recipeData: JSON.stringify(recipe)
      }
    })

    return NextResponse.json({ success: true, favorite })
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout aux favoris' },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites - Remove favorite
export async function DELETE(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const body = await request.json()
    const recipeName = body.recipeName

    if (!recipeName) {
      return NextResponse.json(
        { error: 'Nom de recette requis' },
        { status: 400 }
      )
    }

    await db.favorite.deleteMany({
      where: { userId: user.id, recipeName }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete favorite error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
