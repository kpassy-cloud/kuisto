import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateUser } from '@/lib/server-auth'

// Ingredient database for search
const ingredientDatabase = [
  // Légumes
  { id: 'tomate', name: 'Tomate', emoji: '🍅', category: 'Légumes' },
  { id: 'oignon', name: 'Oignon', emoji: '🧅', category: 'Légumes' },
  { id: 'ail', name: 'Ail', emoji: '🧄', category: 'Légumes' },
  { id: 'carotte', name: 'Carotte', emoji: '🥕', category: 'Légumes' },
  { id: 'pomme_de_terre', name: 'Pomme de terre', emoji: '🥔', category: 'Légumes' },
  { id: 'poivron', name: 'Poivron', emoji: '🫑', category: 'Légumes' },
  { id: 'courgette', name: 'Courgette', emoji: '🥒', category: 'Légumes' },
  { id: 'aubergine', name: 'Aubergine', emoji: '🍆', category: 'Légumes' },
  { id: 'brocoli', name: 'Brocoli', emoji: '🥦', category: 'Légumes' },
  { id: 'champignon', name: 'Champignon', emoji: '🍄', category: 'Légumes' },
  { id: 'epinard', name: 'Épinard', emoji: '🥬', category: 'Légumes' },
  { id: 'salade', name: 'Salade', emoji: '🥗', category: 'Légumes' },
  { id: 'concombre', name: 'Concombre', emoji: '🥒', category: 'Légumes' },
  { id: 'avocat', name: 'Avocat', emoji: '🥑', category: 'Légumes' },
  // Protéines
  { id: 'poulet', name: 'Poulet', emoji: '🍗', category: 'Protéines' },
  { id: 'boeuf', name: 'Bœuf', emoji: '🥩', category: 'Protéines' },
  { id: 'porc', name: 'Porc', emoji: '🥓', category: 'Protéines' },
  { id: 'poisson', name: 'Poisson', emoji: '🐟', category: 'Protéines' },
  { id: 'crevette', name: 'Crevette', emoji: '🦐', category: 'Protéines' },
  { id: 'oeuf', name: 'Œuf', emoji: '🥚', category: 'Protéines' },
  { id: 'tofu', name: 'Tofu', emoji: '🧈', category: 'Protéines' },
  { id: 'jambon', name: 'Jambon', emoji: '🍖', category: 'Protéines' },
  // Produits laitiers
  { id: 'lait', name: 'Lait', emoji: '🥛', category: 'Produits laitiers' },
  { id: 'beurre', name: 'Beurre', emoji: '🧈', category: 'Produits laitiers' },
  { id: 'fromage', name: 'Fromage', emoji: '🧀', category: 'Produits laitiers' },
  { id: 'creme', name: 'Crème fraîche', emoji: '🫗', category: 'Produits laitiers' },
  { id: 'yaourt', name: 'Yaourt', emoji: '🥛', category: 'Produits laitiers' },
  { id: 'mozzarella', name: 'Mozzarella', emoji: '🧀', category: 'Produits laitiers' },
  { id: 'parmesan', name: 'Parmesan', emoji: '🧀', category: 'Produits laitiers' },
  // Féculents
  { id: 'riz', name: 'Riz', emoji: '🍚', category: 'Féculents' },
  { id: 'pates', name: 'Pâtes', emoji: '🍝', category: 'Féculents' },
  { id: 'pain', name: 'Pain', emoji: '🍞', category: 'Féculents' },
  { id: 'farine', name: 'Farine', emoji: '🌾', category: 'Féculents' },
  { id: 'quinoa', name: 'Quinoa', emoji: '🌾', category: 'Féculents' },
  { id: 'tortilla', name: 'Tortilla', emoji: '🫓', category: 'Féculents' },
  // Fruits
  { id: 'pomme', name: 'Pomme', emoji: '🍎', category: 'Fruits' },
  { id: 'banane', name: 'Banane', emoji: '🍌', category: 'Fruits' },
  { id: 'orange', name: 'Orange', emoji: '🍊', category: 'Fruits' },
  { id: 'citron', name: 'Citron', emoji: '🍋', category: 'Fruits' },
  { id: 'fraise', name: 'Fraise', emoji: '🍓', category: 'Fruits' },
  { id: 'ananas', name: 'Ananas', emoji: '🍍', category: 'Fruits' },
  // Épices & Condiments
  { id: 'sel', name: 'Sel', emoji: '🧂', category: 'Épices' },
  { id: 'poivre', name: 'Poivre', emoji: '🌶️', category: 'Épices' },
  { id: 'huile_olive', name: "Huile d'olive", emoji: '🫒', category: 'Épices' },
  { id: 'vinaigre', name: 'Vinaigre', emoji: '🍾', category: 'Épices' },
  { id: 'curry', name: 'Curry', emoji: '🟠', category: 'Épices' },
  { id: 'basilic', name: 'Basilic', emoji: '🌿', category: 'Épices' },
  { id: 'persil', name: 'Persil', emoji: '🌿', category: 'Épices' },
  // Autres
  { id: 'miel', name: 'Miel', emoji: '🍯', category: 'Autres' },
  { id: 'chocolat', name: 'Chocolat', emoji: '🍫', category: 'Autres' },
  { id: 'sucre', name: 'Sucre', emoji: '🍬', category: 'Autres' },
  { id: 'noix', name: 'Noix', emoji: '🥜', category: 'Autres' },
]

// GET /api/search - Search ingredients and recipes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.toLowerCase() || ''

    if (q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const user = await getOrCreateUser()

    // Search ingredients
    const ingredientResults = ingredientDatabase
      .filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
      .map(item => ({
        id: item.id,
        name: item.name,
        type: 'ingredient' as const,
        emoji: item.emoji,
        category: item.category
      }))

    // Search favorite recipes
    const favorites = await db.favorite.findMany({
      where: {
        userId: user.id,
        OR: [
          { recipeName: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 5
    })

    const recipeResults = favorites.map(f => {
      const recipeData = JSON.parse(f.recipeData)
      return {
        id: f.id,
        name: f.recipeName,
        type: 'recipe' as const,
        emoji: '🍽️',
        prepTime: recipeData.prepTime,
        servings: recipeData.servings
      }
    })

    // Combine and limit results
    const results = [
      ...ingredientResults.slice(0, 10),
      ...recipeResults.slice(0, 5)
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ results: [] })
  }
}
