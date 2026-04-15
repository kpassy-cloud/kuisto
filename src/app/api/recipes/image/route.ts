import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Demo image URLs (placeholder food images)
const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1024&h=1024&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1024&h=1024&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1024&h=1024&fit=crop',
  'https://images.unsplash.com/photo-1540189549332-26d518a33a60?w=1024&h=1024&fit=crop',
  'https://images.unsplash.com/photo-1476224203421-9ac012cb5b22?w=1024&h=1024&fit=crop',
]

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
      // Use a deterministic but varied image based on recipe name
      const imageIndex = recipeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % DEMO_IMAGES.length
      const demoImageUrl = DEMO_IMAGES[imageIndex]
      
      return NextResponse.json({ 
        image: demoImageUrl,
        demoMode: true 
      })
    }

    // Try AI image generation
    try {
      const zai = await ZAI.create({
        token: process.env.Z_AI_TOKEN || process.env.ZAI_TOKEN
      })

      // Generate image prompt
      const mainIngredients = (ingredients || []).slice(0, 5).join(', ')
      const imagePrompt = `Professional food photography of ${recipeName}, beautifully plated on a rustic wooden table in a warm kitchen setting, natural lighting from a nearby window, fresh ingredients visible including ${mainIngredients}, appetizing presentation, high quality, detailed, restaurant style plating, soft bokeh background, warm color tones`

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
      const imageIndex = recipeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % DEMO_IMAGES.length
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
