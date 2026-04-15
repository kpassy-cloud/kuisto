export interface ParsedIngredient {
  quantity: string
  unit: string | null
  ingredient: string
}

// Common French units
const frenchUnits = [
  'g', 'kg', 'mg',
  'ml', 'cl', 'l', 'litre', 'litres',
  'cuillère à soupe', 'cuillères à soupe', 'c. à soupe', 'c.s.',
  'cuillère à café', 'cuillères à café', 'c. à café', 'c.c.',
  'tasse', 'tasses',
  'verre', 'verres',
  'tranche', 'tranches',
  'pièce', 'pièces',
  'botte', 'bottes',
  'gousse', 'gousses',
  'feuille', 'feuilles',
  'branche', 'branches',
  'pincée', 'pincées',
  'sachet', 'sachets',
  'boîte', 'boîtes',
  'pot', 'pots',
  'bouteille', 'bouteilles',
  'paquet', 'paquets',
  'cube', 'cubes',
  'morceau', 'morceaux',
  'filet', 'filets',
  'rondelle', 'rondelles',
  'bâton', 'bâtons',
]

// Fraction mappings
const fractionMap: { [key: string]: string } = {
  '½': '0.5',
  '⅓': '0.33',
  '⅔': '0.66',
  '¼': '0.25',
  '¾': '0.75',
  '⅕': '0.2',
  '⅖': '0.4',
  '⅗': '0.6',
  '⅘': '0.8',
  '⅙': '0.16',
  '⅚': '0.83',
  '⅛': '0.125',
  '⅜': '0.375',
  '⅝': '0.625',
  '⅞': '0.875',
}

/**
 * Parse an ingredient string into its components
 * Examples:
 * - "2 oignons" -> { quantity: "2", unit: null, ingredient: "oignons" }
 * - "200g de farine" -> { quantity: "200", unit: "g", ingredient: "farine" }
 * - "1 cuillère à soupe d'huile" -> { quantity: "1", unit: "cuillère à soupe", ingredient: "huile" }
 * - "Sel" -> { quantity: "", unit: null, ingredient: "sel" }
 */
export function parseIngredient(ingredientStr: string): ParsedIngredient {
  const original = ingredientStr.trim()
  const str = original.toLowerCase()
  
  // Default result
  let result: ParsedIngredient = {
    quantity: '',
    unit: null,
    ingredient: original
  }
  
  // Try to match patterns
  
  // Pattern 1: "200g de farine" or "200g farine" or "200 g de farine"
  const massVolumePattern = /^(\d+(?:[.,]\d+)?)\s*(g|kg|mg|ml|cl|l|litres?)\s*(?:de\s+)?(.+)$/i
  const massMatch = str.match(massVolumePattern)
  if (massMatch) {
    return {
      quantity: massMatch[1].replace(',', '.'),
      unit: massMatch[2].toLowerCase(),
      ingredient: massMatch[3].trim()
    }
  }
  
  // Pattern 2: "2 oignons" or "2 oignon"
  const simpleQuantityPattern = /^(\d+(?:[.,]\d+)?)\s+(.+)$/
  const simpleMatch = str.match(simpleQuantityPattern)
  if (simpleMatch) {
    const quantity = simpleMatch[1].replace(',', '.')
    const rest = simpleMatch[2].trim()
    
    // Check if the next word is a unit
    for (const unit of frenchUnits) {
      if (rest.startsWith(unit + ' ') || rest.startsWith(unit + 's ') || rest === unit || rest === unit + 's') {
        const remaining = rest.substring(unit.length).replace(/^(s)?\s*(d[eu]?\s*)?/i, '').trim()
        return {
          quantity,
          unit: unit,
          ingredient: remaining || rest
        }
      }
    }
    
    // No unit found, rest is the ingredient
    return {
      quantity,
      unit: null,
      ingredient: rest
    }
  }
  
  // Pattern 3: Fractions like "½ tasse de farine"
  for (const [fraction, value] of Object.entries(fractionMap)) {
    if (str.startsWith(fraction)) {
      const rest = str.substring(fraction.length).trim()
      
      // Check for unit after fraction
      for (const unit of frenchUnits) {
        if (rest.startsWith(unit + ' ') || rest.startsWith(unit + 's ') || rest === unit || rest === unit + 's') {
          const remaining = rest.substring(unit.length).replace(/^(s)?\s*(d[eu]?\s*)?/i, '').trim()
          return {
            quantity: value,
            unit: unit,
            ingredient: remaining || rest
          }
        }
      }
      
      // No unit found
      return {
        quantity: value,
        unit: null,
        ingredient: rest.replace(/^(d[eu]?\s*)?/i, '').trim()
      }
    }
  }
  
  // Pattern 4: Try to find any unit in the string
  for (const unit of frenchUnits) {
    const unitPattern = new RegExp(`^(.+?)\\s+(${unit}s?)\\s*(?:d[eu]?\\s*)?(.+)$`, 'i')
    const unitMatch = str.match(unitPattern)
    if (unitMatch) {
      const qty = unitMatch[1].trim()
      // Check if the first part is a quantity
      const qtyMatch = qty.match(/^(\d+(?:[.,]\d+)?|[\d½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+)$/)
      if (qtyMatch) {
        let finalQty = qtyMatch[1]
        // Convert fractions
        if (fractionMap[finalQty]) {
          finalQty = fractionMap[finalQty]
        }
        return {
          quantity: finalQty.replace(',', '.'),
          unit: unitMatch[2].toLowerCase(),
          ingredient: unitMatch[3].trim()
        }
      }
    }
  }
  
  // Pattern 5: Check for "un/e/une" at the start
  const unPattern = /^(un|une|un(e)?)\s+(.+)$/i
  const unMatch = str.match(unPattern)
  if (unMatch) {
    const rest = unMatch[3].trim()
    
    // Check if the next word is a unit
    for (const unit of frenchUnits) {
      if (rest.startsWith(unit + ' ') || rest.startsWith(unit + 's ') || rest === unit || rest === unit + 's') {
        const remaining = rest.substring(unit.length).replace(/^(s)?\s*(d[eu]?\s*)?/i, '').trim()
        return {
          quantity: '1',
          unit: unit,
          ingredient: remaining || rest
        }
      }
    }
    
    return {
      quantity: '1',
      unit: null,
      ingredient: rest
    }
  }
  
  // Pattern 6: Check for "du/de la/des" at the start
  const duPattern = /^(du|de la|des|de)\s+(.+)$/i
  const duMatch = str.match(duPattern)
  if (duMatch) {
    return {
      quantity: '',
      unit: null,
      ingredient: duMatch[2].trim()
    }
  }
  
  // If no pattern matched, return the original string as ingredient
  return result
}

/**
 * Normalize ingredient name for comparison/aggregation
 */
export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^(du|de la|des|de|un|une|les|le|la)\s+/, '')
    .replace(/\s+(frais|fraîche|fraiches|séché|séchée|séchés|sec|secs)$/, '')
    .trim()
}

/**
 * Try to add quantities if they have the same unit
 */
export function addQuantities(q1: string, q2: string, unit1: string | null, unit2: string | null): { quantity: string; unit: string | null } {
  // If no units or same units, try to add
  if (unit1 === unit2 || (!unit1 && !unit2)) {
    const num1 = parseFloat(q1) || 0
    const num2 = parseFloat(q2) || 0
    const sum = num1 + num2
    
    // Return as integer if it's a whole number
    return {
      quantity: Number.isInteger(sum) ? sum.toString() : sum.toFixed(2).replace(/\.?0+$/, ''),
      unit: unit1 || unit2
    }
  }
  
  // Different units, keep the first one and note the difference
  return {
    quantity: q1,
    unit: unit1
  }
}
