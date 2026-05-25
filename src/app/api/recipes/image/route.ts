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

// Demo image URLs (placeholder food images) - cooked dishes only
const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1024&h=1024&fit=crop', // Pasta dish
  'https://images.unsplash.com/photo-1476224203421-9ac012cb5b22?w=1024&h=1024&fit=crop', // Eggs dish
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1024&h=1024&fit=crop', // Pizza
  'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=1024&h=1024&fit=crop', // Meat dish
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1024&h=1024&fit=crop', // Grilled dish
  'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=1024&h=1024&fit=crop', // Fish dish
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=1024&h=1024&fit=crop', // Pasta bowl
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1024&h=1024&fit=crop', // Grilled meat
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1024&h=1024&fit=crop', // Pancakes
  'https://images.unsplash.com/photo-1540189549332-26d518a33a60?w=1024&h=1024&fit=crop', // Roasted veggies
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
      const imagePrompt = `Professional food photography of ${recipeName}. A delicious fully cooked hot meal ready to serve on a white ceramic plate. The dish contains: ${mainIngredients}. The food is prepared, cooked, and beautifully plated. Steam rising from the hot food. Restaurant quality presentation with elegant garnish. Natural warm lighting, shallow depth of field, appetizing appearance. NO raw vegetables, NO uncut ingredients, NO whole produce, NO stems, NO leaves attached to vegetables. Only the finished cooked plated dish.`

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
