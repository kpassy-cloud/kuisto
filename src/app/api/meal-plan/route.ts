import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateUser } from '@/lib/server-auth'

// GET /api/meal-plan - Get meal plans for a date range
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      )
    }

    const plans = await db.mealPlan.findMany({
      where: {
        userId: user.id,
        date: {
        gte: start,
        lte: end
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({
      plans: plans.map(p => ({
        id: p.id,
        date: p.date,
        mealType: p.mealType,
        recipeName: p.recipeName,
        recipeData: p.recipeData ? JSON.parse(p.recipeData) : null
      }))
    })
  } catch (error) {
    console.error('Get meal plans error:', error)
    return NextResponse.json({ plans: [] })
  }
}

// POST /api/meal-plan - Create a meal plan
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const body = await request.json()
    const { date, mealType, recipeName, recipeData } = body

    if (!date || !mealType || !recipeName) {
      return NextResponse.json(
        { error: 'Date, meal type, and recipe name are required' },
        { status: 400 }
      )
    }

    // Check if already exists for this date/mealType
    const existing = await db.mealPlan.findFirst({
      where: {
        userId: user.id,
        date,
        mealType
      }
    })

    if (existing) {
      // Update existing
      const updated = await db.mealPlan.update({
        where: { id: existing.id },
        data: {
          recipeName,
          recipeData: recipeData ? JSON.stringify(recipeData) : null
        }
      })
      return NextResponse.json({
        success: true,
        plan: {
          id: updated.id,
          date: updated.date,
          mealType: updated.mealType,
          recipeName: updated.recipeName,
          recipeData: recipeData
        }
      })
    }

    const plan = await db.mealPlan.create({
      data: {
        userId: user.id,
        date,
        mealType,
        recipeName,
        recipeData: recipeData ? JSON.stringify(recipeData) : null
      }
    })

    return NextResponse.json({
      success: true,
      plan: {
        id: plan.id,
        date: plan.date,
        mealType: plan.mealType,
        recipeName: plan.recipeName,
        recipeData: recipeData
      }
    })
  } catch (error) {
    console.error('Create meal plan error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}

// DELETE /api/meal-plan - Delete a meal plan
export async function DELETE(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
      { error: 'ID is required' },
        { status: 400 }
      )
    }

    await db.mealPlan.deleteMany({
      where: {
        id,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete meal plan error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
