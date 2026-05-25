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

const SYSTEM_PROMPT = `Tu es un assistant culinaire expert spécialisé dans la création de recettes improvisées, accessibles et nutritives. Tu possèdes une connaissance approfondie des techniques de cuisine simples, des associations d'ingrédients, et tu excelles dans l'adaptation de recettes pour les cuisiniers amateurs.

IMPORTANT - Tu dois TOUJOURS inclure les informations nutritionnelles pour chaque recette.

Tu dois répondre UNIQUEMENT avec un JSON valide. Le format de réponse doit être:

{
  "recipes": [
    {
      "name": "Nom de la recette",
      "prepTime": "10 min",
      "cookTime": "15 min",
      "servings": "2 personnes",
      "difficulty": "facile",
      "ingredients": ["ingrédient 1 avec quantité", "ingrédient 2 avec quantité"],
      "instructions": ["Étape 1", "Étape 2", "Étape 3"],
      "tip": "Astuce ou variante",
      "nutrition": {
        "calories": 350,
        "protein": "25g",
        "carbs": "30g",
        "fat": "12g",
        "fiber": "5g"
      },
      "missingIngredients": ["ingrédient manquant (optionnel)"],
      "tags": ["rapide", "facile", "végétarien"]
    }
  ]
}

Règles importantes:
1. Propose uniquement des recettes avec des techniques simples
2. Temps de préparation maximum 30 minutes
3. INCLUE TOUJOURS les valeurs nutritionnelles (calories, protéines, glucides, lipides)
4. Ajoute des tags pertinents (végétarien, rapide, facile, etc.)
5. Priorise les recettes utilisant le maximum d'ingrédients disponibles
6. Si des préférences diététiques sont fournies, respecte-les strictement
7. Ton ton doit être encourageant et pragmatique

Génère entre 2 et 3 recettes maximum.`

// Demo recipes generator - creates varied recipes based on ingredients
function generateDemoRecipes(ingredients: string[], preferences: any) {
  const ingredientList = ingredients.join(', ')
  const hasVegetables = ingredients.some(i => 
    ['tomate', 'oignon', 'carotte', 'poivron', 'courgette', 'aubergine', 'brocoli', 'champignon', 'épinard', 'salade', 'concombre', 'avocat'].includes(i.toLowerCase())
  )
  const hasProteins = ingredients.some(i => 
    ['poulet', 'boeuf', 'porc', 'poisson', 'crevette', 'oeuf', 'tofu', 'jambon'].includes(i.toLowerCase())
  )
  const hasDairy = ingredients.some(i => 
    ['lait', 'beurre', 'fromage', 'crème', 'yaourt', 'mozzarella', 'parmesan'].includes(i.toLowerCase())
  )
  const hasStarches = ingredients.some(i => 
    ['riz', 'pâtes', 'pain', 'farine', 'semoule', 'quinoa', 'tortilla'].includes(i.toLowerCase())
  )

  const recipes: any[] = []

  // Recipe 1: Stir-fry / Sauté
  recipes.push({
    name: `Sauté de ${hasVegetables ? 'légumes' : 'ingrédients'}${hasProteins ? ' et protéines' : ''} aux saveurs du jour`,
    prepTime: "15 min",
    cookTime: "20 min",
    servings: "2 personnes",
    difficulty: "facile",
    ingredients: [
      ...ingredients.slice(0, 5).map(i => `${i} (quantité selon goût)`),
      "2 c.à.s d'huile d'olive",
      "Sel et poivre",
      "Herbes de Provence"
    ],
    instructions: [
      "Lavez et coupez tous les ingrédients en morceaux de taille similaire.",
      "Faites chauffer l'huile dans une grande poêle ou un wok à feu vif.",
      hasProteins ? "Commencez par faire dorer les protéines 3-4 minutes." : "Faites chauffer l'huile à feu vif.",
      "Ajoutez les légumes les plus fermes en premier, puis les plus tendres.",
      "Assaisonnez avec les herbes, le sel et le poivre.",
      "Remuez régulièrement pendant 10-12 minutes jusqu'à ce que tout soit cuit.",
      "Servez chaud, éventuellement avec du riz ou des pâtes."
    ],
    tip: "Pour plus de saveur, ajoutez un peu d'ail ou de gingembre frais si vous en avez !",
    nutrition: {
      calories: 320 + (hasProteins ? 150 : 0),
      protein: hasProteins ? "28g" : "12g",
      carbs: "25g",
      fat: "18g",
      fiber: "6g"
    },
    tags: ["rapide", "équilibré", hasProteins ? "riche en protéines" : "végétarien"]
  })

  // Recipe 2: Bowl / Salad
  recipes.push({
    name: `Bowl gourmand aux ${ingredients.slice(0, 3).join(', ')}`,
    prepTime: "10 min",
    cookTime: "0 min",
    servings: "1-2 personnes",
    difficulty: "très facile",
    ingredients: [
      ...ingredients.slice(0, 4).map(i => `${i} frais`),
      "Huile d'olive extra vierge",
      "Jus de citron",
      "Sel, poivre"
    ],
    instructions: [
      "Préparez tous les ingrédients : lavez, coupez en morceaux.",
      hasStarches ? "Faites cuire la base (riz/quinoa/pâtes) si nécessaire." : "Disposez une base de légumes frais.",
      "Disposez harmonieusement tous les ingrédients dans un bol.",
      "Préparez une sauce avec l'huile, le citron, sel et poivre.",
      "Versez la sauce au dernier moment et mélangez avant de déguster."
    ],
    tip: "Ce bowl se déguste froid ou tiède - parfait pour un déjeuner sur le pouce !",
    nutrition: {
      calories: 280 + (hasProteins ? 120 : 0),
      protein: hasProteins ? "22g" : "8g",
      carbs: hasStarches ? "35g" : "18g",
      fat: "14g",
      fiber: "7g"
    },
    tags: ["froid", "healthy", "bowls", "rapide"]
  })

  // Recipe 3: Gratin or Oven dish (if has dairy or vegetables)
  if (hasVegetables || hasDairy) {
    recipes.push({
      name: `Gratin croustillant de ${ingredients.slice(0, 2).join(' et ')}`,
      prepTime: "20 min",
      cookTime: "35 min",
      servings: "3-4 personnes",
      difficulty: "moyen",
      ingredients: [
        ...ingredients.slice(0, 4).map(i => `${i}`),
        hasDairy ? "100g de fromage râpé" : "Chapelure",
        "20cl de crème fraîche (ou lait)",
        "Sel, poivre, muscade"
      ],
      instructions: [
        "Préchauffez le four à 180°C.",
        "Émincez tous les légumes en fines rondelles ou morceaux.",
        "Faites-les précuire 5 min à la vapeur ou à l'eau.",
        "Disposez dans un plat à gratin.",
        "Mélangez la crème avec les assaisonnements et versez sur les légumes.",
        "Parsemez de fromage râpé ou de chapelure.",
        "Enfournez 25-30 min jusqu'à ce que le dessus soit bien doré.",
        "Laissez reposer 5 min avant de servir."
      ],
      tip: "Pour un gratin plus léger, remplacez la crème par un mélange oeuf-lait battu.",
      nutrition: {
        calories: 380,
        protein: "16g",
        carbs: "22g",
        fat: "26g",
        fiber: "5g"
      },
      tags: ["four", "réconfortant", "familial", "gratin"]
    })
  }

  // Recipe 4: Omelette or Egg dish (if has eggs)
  if (ingredients.some(i => i.toLowerCase() === 'oeuf')) {
    recipes.push({
      name: `Omelette garnie aux ${ingredients.slice(1, 4).join(', ')}`,
      prepTime: "5 min",
      cookTime: "10 min",
      servings: "1 personne",
      difficulty: "facile",
      ingredients: [
        "3 oeufs",
        ...ingredients.filter(i => i.toLowerCase() !== 'oeuf').slice(0, 3),
        "1 c.à.s de beurre",
        "Sel, poivre"
      ],
      instructions: [
        "Battez les oeufs avec une pincée de sel et de poivre.",
        "Faites fondre le beurre dans une poêle antiadhésive.",
        "Versez les oeufs battus et laissez prendre 1 minute.",
        "Disposez les autres ingrédients sur une moitié de l'omelette.",
        "Repliez l'omelette en deux et servez immédiatement."
      ],
      tip: "Pour une omelette baveuse, ne la surcuisez pas - retirez-la du feu quand elle est encore légèrement humide.",
      nutrition: {
        calories: 350,
        protein: "18g",
        carbs: "8g",
        fat: "28g",
        fiber: "2g"
      },
      tags: ["petit-déjeuner", "rapide", "protéiné", "omelette"]
    })
  }

  // Filter based on preferences
  if (preferences) {
    let filtered = [...recipes]
    
    if (preferences.vegetarian) {
      filtered = filtered.filter(r => !r.ingredients.some((i: string) => 
        ['poulet', 'boeuf', 'porc', 'poisson', 'crevette', 'jambon', 'lardons'].some(meat => i.toLowerCase().includes(meat))
      ))
    }
    
    if (preferences.vegan) {
      filtered = filtered.filter(r => !r.ingredients.some((i: string) => 
        ['poulet', 'boeuf', 'porc', 'poisson', 'crevette', 'jambon', 'oeuf', 'fromage', 'crème', 'lait', 'yaourt'].some(animal => i.toLowerCase().includes(animal))
      ))
    }

    if (filtered.length > 0) {
      return filtered.slice(0, 3)
    }
  }

  return recipes.slice(0, 3)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ingredients, preferences, demoMode } = body

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length < 3) {
      return NextResponse.json(
        { error: 'Au moins 3 ingrédients sont requis' },
        { status: 400 }
      )
    }

    // If demo mode is requested, skip AI and return demo recipes
    if (demoMode) {
      console.log('🎮 Demo mode enabled - generating demo recipes')
      const recipes = generateDemoRecipes(ingredients, preferences)
      return NextResponse.json({ recipes, demoMode: true })
    }

    // Try AI generation
    try {
      const zai = await getAI()

      if (!zai) {
        console.log('🤖 AI unavailable, using demo mode')
        const recipes = generateDemoRecipes(ingredients, preferences)
        return NextResponse.json({ recipes, demoMode: true })
      }

      // Build prompt with dietary preferences
      let preferencesText = ''
      if (preferences) {
        const prefs = []
        if (preferences.vegetarian) prefs.push('végétarien')
        if (preferences.vegan) prefs.push('vegan')
        if (preferences.glutenFree) prefs.push('sans gluten')
        if (preferences.lactoseFree) prefs.push('sans lactose')
        if (preferences.keto) prefs.push('keto')
        if (preferences.halal) prefs.push('halal')
        if (preferences.kosher) prefs.push('casher')
        if (preferences.nutAllergy) prefs.push('sans fruits à coque')
        if (preferences.peanutAllergy) prefs.push('sans cacahuètes')
        if (preferences.shellfishAllergy) prefs.push('sans fruits de mer')
        if (preferences.eggAllergy) prefs.push('sans œufs')
        if (preferences.soyAllergy) prefs.push('sans soja')
        if (preferences.fishAllergy) prefs.push('sans poisson')
        
        if (prefs.length > 0) {
          preferencesText = `\n\nIMPORTANT - Contraintes diététiques à respecter ABSOLUMENT: ${prefs.join(', ')}.`
        }
        
        if (preferences.maxPrepTime) {
          preferencesText += `\nTemps de préparation maximum: ${preferences.maxPrepTime} minutes.`
        }
        
        if (preferences.difficultyLevel) {
          preferencesText += `\nNiveau de difficulté maximum: ${preferences.difficultyLevel}.`
        }
      }

      const userPrompt = `Voici les ingrédients que j'ai dans ma cuisine: ${ingredients.join(', ')}${preferencesText}

Génère 2 à 3 recettes réalisables avec ces ingrédients en respectant les contraintes diététiques.
INCLUE OBLIGATOIREMENT les informations nutritionnelles pour chaque recette.

Réponds UNIQUEMENT avec un JSON valide contenant les recettes.`

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        thinking: { type: 'disabled' }
      })

      const response = completion.choices[0]?.message?.content

      if (!response) {
        throw new Error('Pas de réponse de l\'IA')
      }

      // Parse JSON response
      let recipes
      try {
        let jsonStr = response.trim()
        
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.slice(7)
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.slice(3)
        }
        if (jsonStr.endsWith('```')) {
          jsonStr = jsonStr.slice(0, -3)
        }
        
        const data = JSON.parse(jsonStr.trim())
        recipes = data.recipes
      } catch (parseError) {
        console.error('JSON parse error, using demo recipes:', parseError)
        recipes = generateDemoRecipes(ingredients, preferences)
      }
      
      return NextResponse.json({ recipes })
    } catch (aiError) {
      console.log('🤖 AI unavailable, falling back to demo mode:', aiError)
      const recipes = generateDemoRecipes(ingredients, preferences)
      return NextResponse.json({ recipes, demoMode: true })
    }
  } catch (error) {
    console.error('Recipe generation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération des recettes' },
      { status: 500 }
    )
  }
}
