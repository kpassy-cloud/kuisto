import { NextRequest, NextResponse } from 'next/server'

// Dynamic import to avoid build-time initialization
const getAI = async () => {
  if (typeof window !== 'undefined') return null
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    return await ZAI.create({
      token: process.env.Z_AI_TOKEN || process.env.ZAI_TOKEN
    })
  } catch {
    return null
  }
}

// Demo image URLs (placeholder food images) - more variety
const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1024&h=1024&fit=crop', // Salad
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1024&h=1024&fit=crop', // Pancakes
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1024&h=1024&fit=crop', // Pizza
  'https://images.unsplash.com/photo-1540189549332-26d518a33a60?w=1024&h=1024&fit=crop', // Veggies
  'https://images.unsplash.com/photo-1476224203421-9ac012cb5b22?w=1024&h=1024&fit=crop', // Eggs
  'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=1024&h=1024&fit=crop', // Meat
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1024&h=1024&fit=crop', // Bowl
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1024&h=1024&fit=crop', // Grilled
  'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=1024&h=1024&fit=crop', // Fish
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=1024&h=1024&fit=crop', // Pasta
]

// Better hash function for more variety
function getImageIndex(recipeName: string, ingredients: string[] = []): number {
  // Combine recipe name and ingredients for more variety
  const combined = recipeName + (ingredients.length > 0 ? ingredients.slice(0, 3).join(',') : '')
  
  // Better hash to spread values more evenly
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return Math.abs(hash) % DEMO_IMAGES.length
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipeName, ingredients, demoMode } = body

    if (!recipeName) {
      return NextResponse.json(
        { error: 'Le nom de la recette est requis' },
        { status: 400 }
      )
    }

    // Demo mode - return a placeholder image
    if (demoMode) {
      // Use a deterministic but varied image based on recipe name and ingredients
      const imageIndex = getImageIndex(recipeName, ingredients)
      const demoImageUrl = DEMO_IMAGES[imageIndex]
      
      return NextResponse.json({ 
        image: demoImageUrl,
        demoMode: true 
      })
    }

    // Try AI image generation
    try {
      const zai = await getAI()

      if (!zai) {
        console.log('🎨 AI unavailable, using demo image')
        const imageIndex = getImageIndex(recipeName, ingredients)
        const demoImageUrl = DEMO_IMAGES[imageIndex]
        return NextResponse.json({
          image: demoImageUrl,
          demoMode: true
        })
      }

      // Generate image prompt - focus on the COOKED dish, not raw ingredients
      const mainIngredients = (ingredients || []).slice(0, 4).join(', ')
      const imagePrompt = `Professional food photography of a fully cooked and prepared dish: ${recipeName}. This is a READY-TO-EAT plated meal made with ${mainIngredients}. Show the finished dish beautifully presented on a modern ceramic plate, garnished elegantly, on a rustic wooden table. The food should look appetizing, warm, and freshly cooked. Natural lighting, restaurant quality presentation, soft bokeh background, high detail, warm inviting atmosphere. IMPORTANT: Do NOT show raw vegetables with stems, do NOT show whole uncut ingredients - only show the prepared, cooked, plated final dish.`

      const imageResponse = await zai.images.generations.create({
        prompt: imagePrompt,
        size: '1024x1024'
      })

      const imageBase64 = imageResponse.data[0]?.base64

      if (!imageBase64) {
        throw new Error('Impossible de générer l\'image')
      }

      return NextResponse.json({ 
        image: `data:image/png;base64,${imageBase64}` 
      })
    } catch (aiError) {
      console.log('🎨 AI image unavailable, using demo image:', aiError)
      
      // Fallback to demo image
      const imageIndex = getImageIndex(recipeName, ingredients)
      const demoImageUrl = DEMO_IMAGES[imageIndex]
      
      return NextResponse.json({ 
        image: demoImageUrl,
        demoMode: true 
      })
    }
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération de l\'image' },
      { status: 500 }
    )
  }
}
