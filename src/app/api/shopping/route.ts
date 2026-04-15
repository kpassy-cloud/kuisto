import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseIngredient, normalizeIngredientName, addQuantities, ParsedIngredient } from '@/lib/ingredient-parser'

async function ensureUser(userId: string) {
  const existingUser = await db.user.findUnique({ where: { id: userId } })
  if (!existingUser) {
    await db.user.create({
      data: { id: userId, email: `${userId}@demo.local` }
    })
  }
}

// GET /api/shopping - Get user's shopping list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'

    const items = await db.shoppingList.findMany({
      where: { userId },
      orderBy: [
        { isChecked: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ 
      items: items.map(item => ({
        id: item.id,
        ingredient: item.ingredient,
        quantity: item.quantity,
        unit: item.unit,
        isChecked: item.isChecked,
        recipeNames: JSON.parse(item.recipeNames),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    })
  } catch (error) {
    console.error('Get shopping list error:', error)
    return NextResponse.json({ items: [] })
  }
}

// POST /api/shopping - Add ingredients from a recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || 'demo-user'
    const recipeName = body.recipeName
    const ingredients = body.ingredients as string[]

    if (!recipeName || !ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Nom de recette et liste d\'ingrédients requis' },
        { status: 400 }
      )
    }

    await ensureUser(userId)

    // Get existing items for this user
    const existingItems = await db.shoppingList.findMany({
      where: { userId }
    })

    // Create a map for quick lookup
    const existingMap = new Map<string, typeof existingItems[0]>()
    for (const item of existingItems) {
      const normalizedName = normalizeIngredientName(item.ingredient)
      existingMap.set(`${normalizedName}-${item.unit || 'null'}`, item)
    }

    // Process each ingredient
    for (const ingredientStr of ingredients) {
      const parsed: ParsedIngredient = parseIngredient(ingredientStr)
      const normalizedName = normalizeIngredientName(parsed.ingredient)
      const key = `${normalizedName}-${parsed.unit || 'null'}`

      const existing = existingMap.get(key)

      if (existing) {
        // Aggregate quantities
        const { quantity, unit } = addQuantities(
          existing.quantity,
          parsed.quantity,
          existing.unit,
          parsed.unit
        )

        // Update recipe names
        const recipeNames: string[] = JSON.parse(existing.recipeNames)
        if (!recipeNames.includes(recipeName)) {
          recipeNames.push(recipeName)
        }

        // Update existing item
        await db.shoppingList.update({
          where: { id: existing.id },
          data: {
            quantity,
            unit,
            recipeNames: JSON.stringify(recipeNames)
          }
        })
      } else {
        // Create new item
        const newItem = await db.shoppingList.create({
          data: {
            userId,
            ingredient: parsed.ingredient,
            quantity: parsed.quantity,
            unit: parsed.unit,
            recipeNames: JSON.stringify([recipeName])
          }
        })

        // Add to map for subsequent ingredients
        existingMap.set(key, newItem)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Add to shopping list error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout à la liste de courses' },
      { status: 500 }
    )
  }
}

// DELETE /api/shopping - Remove item or clear all
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || 'demo-user'
    const itemId = body.itemId
    const clearAll = body.clearAll

    if (clearAll) {
      // Clear all items for this user
      await db.shoppingList.deleteMany({
        where: { userId }
      })
      return NextResponse.json({ success: true, message: 'Liste vidée' })
    }

    if (!itemId) {
      return NextResponse.json(
        { error: 'ID de l\'item requis ou clearAll=true' },
        { status: 400 }
      )
    }

    await db.shoppingList.delete({
      where: { id: itemId, userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete from shopping list error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

// PATCH /api/shopping - Toggle item checked status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || 'demo-user'
    const itemId = body.itemId
    const isChecked = body.isChecked

    if (!itemId || typeof isChecked !== 'boolean') {
      return NextResponse.json(
        { error: 'ID de l\'item et état de coche requis' },
        { status: 400 }
      )
    }

    await db.shoppingList.update({
      where: { id: itemId, userId },
      data: { isChecked }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update shopping list error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
