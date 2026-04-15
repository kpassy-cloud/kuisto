// Seasonal ingredient utility
// Determines which ingredients are in season based on the current month

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface SeasonalInfo {
  inSeason: boolean
  season: Season
  months: string[]
}

// Get current season based on month (Northern Hemisphere)
export function getCurrentSeason(): Season {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

// Get current month name in French
export function getCurrentMonthFrench(): string {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  return months[new Date().getMonth()]
}

// Season names in French
export const seasonNames: Record<Season, string> = {
  spring: 'Printemps',
  summer: 'Été',
  autumn: 'Automne',
  winter: 'Hiver'
}

// Season colors for UI
export const seasonColors: Record<Season, { bg: string; text: string; border: string }> = {
  spring: { 
    bg: 'bg-green-100 dark:bg-green-900/30', 
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700'
  },
  summer: { 
    bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700'
  },
  autumn: { 
    bg: 'bg-orange-100 dark:bg-orange-900/30', 
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700'
  },
  winter: { 
    bg: 'bg-blue-100 dark:bg-blue-900/30', 
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700'
  }
}

// Ingredient seasonality data (by ingredient ID)
// true = in season for that season
const ingredientSeasonality: Record<string, Record<Season, boolean>> = {
  // Vegetables
  'tomate': { spring: false, summer: true, autumn: true, winter: false },
  'oignon': { spring: false, summer: false, autumn: true, winter: true },
  'ail': { spring: false, summer: true, autumn: true, winter: false },
  'carotte': { spring: true, summer: true, autumn: true, winter: true },
  'pomme_de_terre': { spring: false, summer: false, autumn: true, winter: true },
  'poivron': { spring: false, summer: true, autumn: true, winter: false },
  'courgette': { spring: false, summer: true, autumn: true, winter: false },
  'aubergine': { spring: false, summer: true, autumn: true, winter: false },
  'brocoli': { spring: true, summer: false, autumn: true, winter: true },
  'champignon': { spring: true, summer: true, autumn: true, winter: true },
  'epinard': { spring: true, summer: false, autumn: true, winter: true },
  'salade': { spring: true, summer: true, autumn: true, winter: false },
  'concombre': { spring: false, summer: true, autumn: true, winter: false },
  'avocat': { spring: true, summer: true, autumn: true, winter: true },
  
  // Fruits
  'pomme': { spring: false, summer: false, autumn: true, winter: true },
  'banane': { spring: true, summer: true, autumn: true, winter: true },
  'orange': { spring: true, summer: false, autumn: true, winter: true },
  'citron': { spring: true, summer: true, autumn: true, winter: true },
  'fraise': { spring: true, summer: true, autumn: false, winter: false },
  'peche': { spring: false, summer: true, autumn: true, winter: false },
  'poire': { spring: false, summer: false, autumn: true, winter: true },
  'ananas': { spring: true, summer: true, autumn: true, winter: true },
  
  // Proteins - generally available year-round
  'poulet': { spring: true, summer: true, autumn: true, winter: true },
  'boeuf': { spring: true, summer: true, autumn: true, winter: true },
  'porc': { spring: true, summer: true, autumn: true, winter: true },
  'poisson': { spring: true, summer: true, autumn: true, winter: true },
  'crevette': { spring: true, summer: true, autumn: true, winter: true },
  'oeuf': { spring: true, summer: true, autumn: true, winter: true },
  
  // Dairy - year-round
  'lait': { spring: true, summer: true, autumn: true, winter: true },
  'beurre': { spring: true, summer: true, autumn: true, winter: true },
  'fromage': { spring: true, summer: true, autumn: true, winter: true },
  'creme': { spring: true, summer: true, autumn: true, winter: true },
  'yaourt': { spring: true, summer: true, autumn: true, winter: true },
  
  // Grains - year-round
  'riz': { spring: true, summer: true, autumn: true, winter: true },
  'pates': { spring: true, summer: true, autumn: true, winter: true },
  'pain': { spring: true, summer: true, autumn: true, winter: true },
}

// Get seasonality info for an ingredient
export function getIngredientSeasonInfo(ingredientId: string): SeasonalInfo {
  const currentSeason = getCurrentSeason()
  const seasonality = ingredientSeasonality[ingredientId.toLowerCase()]
  
  if (!seasonality) {
    // Unknown ingredient, assume year-round
    return {
      inSeason: true,
      season: currentSeason,
      months: ['Toute l\'année']
    }
  }
  
  // Get months when ingredient is in season
  const monthsInSeason: string[] = []
  const allMonths = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  
  // Simplified month mapping
  const seasonMonths: Record<Season, string[]> = {
    spring: ['Mars', 'Avril', 'Mai'],
    summer: ['Juin', 'Juillet', 'Août'],
    autumn: ['Septembre', 'Octobre', 'Novembre'],
    winter: ['Décembre', 'Janvier', 'Février']
  }
  
  Object.entries(seasonality).forEach(([season, is]) => {
    if (is) {
      monthsInSeason.push(...seasonMonths[season as Season])
    }
  })
  
  return {
    inSeason: seasonality[currentSeason] ?? true,
    season: currentSeason,
    months: monthsInSeason.length > 0 ? [...new Set(monthsInSeason)] : ['Toute l\'année']
  }
}

// Get emoji for season
export function getSeasonEmoji(season: Season): string {
  const emojis: Record<Season, string> = {
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂',
    winter: '❄️'
  }
  return emojis[season]
}

// Get list of ingredients in season now
export function getInSeasonIngredients(): string[] {
  const currentSeason = getCurrentSeason()
  return Object.entries(ingredientSeasonality)
    .filter(([_, seasons]) => seasons[currentSeason])
    .map(([id]) => id)
}

// Get season icon name for Lucide
export function getSeasonIconName(season: Season): string {
  const icons: Record<Season, string> = {
    spring: 'Flower2',
    summer: 'Sun',
    autumn: 'Leaf',
    winter: 'Snowflake'
  }
  return icons[season]
}
