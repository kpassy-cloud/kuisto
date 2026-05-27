'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, ChefHat, Sparkles, UtensilsCrossed, Clock, Users, 
  Flame, Leaf, Fish, Drumstick, Egg, Apple, Carrot, Milk,
  Plus, X, ArrowRight, Loader2, PartyPopper, Zap
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { soundEffects } from '@/lib/sounds'
import { IngredientSlotPicker } from '@/components/ingredient-slot-picker'

interface Ingredient {
  id: string
  name: string
  nameEn?: string
  emoji: string
  category: string
}

interface CookingHeroProps {
  onGenerate: () => void
  isLoading: boolean
  selectedIngredients: Ingredient[]
  onToggleIngredient: (ingredient: Ingredient) => void
  onClearAll: () => void
  isAuthenticated: boolean
  onSignUp: () => void
}

const QUICK_INGREDIENTS = [
  // LÉGUMES (vegetable) - tous uniques
  { id: 'tomato', name: 'Tomate', nameEn: 'Tomato', emoji: '🍅', category: 'vegetable' },
  { id: 'onion', name: 'Oignon', nameEn: 'Onion', emoji: '🧅', category: 'vegetable' },
  { id: 'garlic', name: 'Ail', nameEn: 'Garlic', emoji: '🧄', category: 'vegetable' },
  { id: 'potato', name: 'Pomme de terre', nameEn: 'Potato', emoji: '🥔', category: 'vegetable' },
  { id: 'carrot', name: 'Carotte', nameEn: 'Carrot', emoji: '🥕', category: 'vegetable' },
  { id: 'pepper', name: 'Poivron', nameEn: 'Bell pepper', emoji: '🫑', category: 'vegetable' },
  { id: 'mushroom', name: 'Champignon', nameEn: 'Mushroom', emoji: '🍄', category: 'vegetable' },
  { id: 'zucchini', name: 'Courgette', nameEn: 'Zucchini', emoji: '🥒', category: 'vegetable' },
  { id: 'eggplant', name: 'Aubergine', nameEn: 'Eggplant', emoji: '🍆', category: 'vegetable' },
  { id: 'broccoli', name: 'Brocoli', nameEn: 'Broccoli', emoji: '🥦', category: 'vegetable' },
  { id: 'spinach', name: 'Épinards', nameEn: 'Spinach', emoji: '🥬', category: 'vegetable' },
  { id: 'cucumber', name: 'Concombre', nameEn: 'Cucumber', emoji: '🥗', category: 'vegetable' },
  { id: 'celery', name: 'Céleri', nameEn: 'Celery', emoji: '🌿', category: 'vegetable' },
  { id: 'cabbage', name: 'Chou', nameEn: 'Cabbage', emoji: '🥗', category: 'vegetable' },
  { id: 'lettuce', name: 'Laitue', nameEn: 'Lettuce', emoji: '🥬', category: 'vegetable' },
  { id: 'leek', name: 'Poireau', nameEn: 'Leek', emoji: '🧅', category: 'vegetable' },
  { id: 'pumpkin', name: 'Citrouille', nameEn: 'Pumpkin', emoji: '🎃', category: 'vegetable' },
  { id: 'squash', name: 'Courge', nameEn: 'Squash', emoji: '🟧', category: 'vegetable' },
  { id: 'peas', name: 'Pois', nameEn: 'Peas', emoji: '🫛', category: 'vegetable' },
  { id: 'greenbeans', name: 'Haricots verts', nameEn: 'Green beans', emoji: '🫛', category: 'vegetable' },
  { id: 'corn', name: 'Maïs', nameEn: 'Corn', emoji: '🌽', category: 'vegetable' },
  { id: 'asparagus', name: 'Asperges', nameEn: 'Asparagus', emoji: '🌱', category: 'vegetable' },
  { id: 'artichoke', name: 'Artichaut', nameEn: 'Artichoke', emoji: '🌻', category: 'vegetable' },
  { id: 'cauliflower', name: 'Chou-fleur', nameEn: 'Cauliflower', emoji: '⚪', category: 'vegetable' },
  { id: 'radish', name: 'Radis', nameEn: 'Radish', emoji: '🔴', category: 'vegetable' },
  { id: 'beetroot', name: 'Betterave', nameEn: 'Beetroot', emoji: '🟣', category: 'vegetable' },
  { id: 'sweetpotato', name: 'Patate douce', nameEn: 'Sweet potato', emoji: '🍠', category: 'vegetable' },
  { id: 'avocado', name: 'Avocat', nameEn: 'Avocado', emoji: '🥑', category: 'vegetable' },
  { id: 'olives', name: 'Olives', nameEn: 'Olives', emoji: '🫒', category: 'vegetable' },
  { id: 'ginger', name: 'Gingembre', nameEn: 'Ginger', emoji: '🫚', category: 'vegetable' },

  // VIANDES (meat) - tous uniques
  { id: 'chicken', name: 'Poulet', nameEn: 'Chicken', emoji: '🍗', category: 'meat' },
  { id: 'beef', name: 'Bœuf', nameEn: 'Beef', emoji: '🥩', category: 'meat' },
  { id: 'pork', name: 'Porc', nameEn: 'Pork', emoji: '🥓', category: 'meat' },
  { id: 'lamb', name: 'Agneau', nameEn: 'Lamb', emoji: '🍖', category: 'meat' },
  { id: 'duck', name: 'Canard', nameEn: 'Duck', emoji: '🦆', category: 'meat' },
  { id: 'turkey', name: 'Dinde', nameEn: 'Turkey', emoji: '🦃', category: 'meat' },
  { id: 'bacon', name: 'Bacon', nameEn: 'Bacon', emoji: '🥓', category: 'meat' },
  { id: 'ham', name: 'Jambon', nameEn: 'Ham', emoji: '🍖', category: 'meat' },
  { id: 'sausage', name: 'Saucisse', nameEn: 'Sausage', emoji: '🌭', category: 'meat' },
  { id: 'groundmeat', name: 'Viande hachée', nameEn: 'Ground meat', emoji: '🧆', category: 'meat' },
  { id: 'rabbit', name: 'Lapin', nameEn: 'Rabbit', emoji: '🐰', category: 'meat' },
  { id: 'veal', name: 'Veau', nameEn: 'Veal', emoji: '🥩', category: 'meat' },
  { id: 'ribs', name: 'Côtes', nameEn: 'Ribs', emoji: '🍖', category: 'meat' },
  { id: 'liver', name: 'Foie', nameEn: 'Liver', emoji: '🫀', category: 'meat' },

  // POISSONS ET FRUITS DE MER (seafood) - tous uniques
  { id: 'fish', name: 'Poisson', nameEn: 'Fish', emoji: '🐟', category: 'seafood' },
  { id: 'shrimp', name: 'Crevettes', nameEn: 'Shrimp', emoji: '🦐', category: 'seafood' },
  { id: 'salmon', name: 'Saumon', nameEn: 'Salmon', emoji: '🐠', category: 'seafood' },
  { id: 'tuna', name: 'Thon', nameEn: 'Tuna', emoji: '🐟', category: 'seafood' },
  { id: 'mussels', name: 'Moules', nameEn: 'Mussels', emoji: '🦪', category: 'seafood' },
  { id: 'squid', name: 'Calamar', nameEn: 'Squid', emoji: '🦑', category: 'seafood' },
  { id: 'crab', name: 'Crabe', nameEn: 'Crab', emoji: '🦀', category: 'seafood' },
  { id: 'lobster', name: 'Homard', nameEn: 'Lobster', emoji: '🦞', category: 'seafood' },
  { id: 'scallops', name: 'Coquilles St-Jacques', nameEn: 'Scallops', emoji: '🦪', category: 'seafood' },
  { id: 'cod', name: 'Cabillaud', nameEn: 'Cod', emoji: '🐠', category: 'seafood' },
  { id: 'sardines', name: 'Sardines', nameEn: 'Sardines', emoji: '🐟', category: 'seafood' },
  { id: 'anchovies', name: 'Anchois', nameEn: 'Anchovies', emoji: '🐡', category: 'seafood' },
  { id: 'trout', name: 'Truite', nameEn: 'Trout', emoji: '🎣', category: 'seafood' },
  { id: 'halibut', name: 'Flétan', nameEn: 'Halibut', emoji: '🐟', category: 'seafood' },

  // PRODUITS LAITIERS (dairy) - tous uniques
  { id: 'cheese', name: 'Fromage', nameEn: 'Cheese', emoji: '🧀', category: 'dairy' },
  { id: 'cream', name: 'Crème', nameEn: 'Cream', emoji: '🥛', category: 'dairy' },
  { id: 'milk', name: 'Lait', nameEn: 'Milk', emoji: '🥛', category: 'dairy' },
  { id: 'butter', name: 'Beurre', nameEn: 'Butter', emoji: '🧈', category: 'dairy' },
  { id: 'yogurt', name: 'Yaourt', nameEn: 'Yogurt', emoji: '🥛', category: 'dairy' },
  { id: 'mozzarella', name: 'Mozzarella', nameEn: 'Mozzarella', emoji: '⚪', category: 'dairy' },
  { id: 'parmesan', name: 'Parmesan', nameEn: 'Parmesan', emoji: '🧀', category: 'dairy' },
  { id: 'feta', name: 'Feta', nameEn: 'Feta', emoji: '🧊', category: 'dairy' },
  { id: 'goatcheese', name: 'Chèvre', nameEn: 'Goat cheese', emoji: '🐐', category: 'dairy' },
  { id: 'ricotta', name: 'Ricotta', nameEn: 'Ricotta', emoji: '🥣', category: 'dairy' },
  { id: 'creamcheese', name: 'Cream cheese', nameEn: 'Cream cheese', emoji: '🧈', category: 'dairy' },
  { id: 'brie', name: 'Brie', nameEn: 'Brie', emoji: '🧀', category: 'dairy' },
  { id: 'gruyere', name: 'Gruyère', nameEn: 'Gruyère', emoji: '🧀', category: 'dairy' },
  { id: 'cheddar', name: 'Cheddar', nameEn: 'Cheddar', emoji: '🟠', category: 'dairy' },

  // PROTÉINES (protein) - tous uniques
  { id: 'egg', name: 'Œuf', nameEn: 'Egg', emoji: '🥚', category: 'protein' },
  { id: 'tofu', name: 'Tofu', nameEn: 'Tofu', emoji: '🧊', category: 'protein' },
  { id: 'lentils', name: 'Lentilles', nameEn: 'Lentils', emoji: '🫘', category: 'protein' },
  { id: 'chickpeas', name: 'Pois chiches', nameEn: 'Chickpeas', emoji: '🟤', category: 'protein' },
  { id: 'beans', name: 'Haricots', nameEn: 'Beans', emoji: '🫘', category: 'protein' },
  { id: 'kidneybeans', name: 'Haricots rouges', nameEn: 'Kidney beans', emoji: '🔴', category: 'protein' },
  { id: 'whitebeans', name: 'Haricots blancs', nameEn: 'White beans', emoji: '⚪', category: 'protein' },
  { id: 'tempeh', name: 'Tempeh', nameEn: 'Tempeh', emoji: '🟫', category: 'protein' },
  { id: 'seitan', name: 'Seitan', nameEn: 'Seitan', emoji: '🟤', category: 'protein' },
  { id: 'edamame', name: 'Edamame', nameEn: 'Edamame', emoji: '🫛', category: 'protein' },

  // FÉCULENTS (carbs) - tous uniques
  { id: 'pasta', name: 'Pâtes', nameEn: 'Pasta', emoji: '🍝', category: 'carbs' },
  { id: 'rice', name: 'Riz', nameEn: 'Rice', emoji: '🍚', category: 'carbs' },
  { id: 'bread', name: 'Pain', nameEn: 'Bread', emoji: '🍞', category: 'carbs' },
  { id: 'quinoa', name: 'Quinoa', nameEn: 'Quinoa', emoji: '🥣', category: 'carbs' },
  { id: 'couscous', name: 'Semoule', nameEn: 'Couscous', emoji: '🥣', category: 'carbs' },
  { id: 'noodles', name: 'Nouilles', nameEn: 'Noodles', emoji: '🍜', category: 'carbs' },
  { id: 'barley', name: 'Orge', nameEn: 'Barley', emoji: '🌾', category: 'carbs' },
  { id: 'oats', name: 'Flocons d\'avoine', nameEn: 'Oats', emoji: '🥣', category: 'carbs' },
  { id: 'flour', name: 'Farine', nameEn: 'Flour', emoji: '🧂', category: 'carbs' },
  { id: 'baguette', name: 'Baguette', nameEn: 'Baguette', emoji: '🥖', category: 'carbs' },
  { id: 'tortilla', name: 'Tortilla', nameEn: 'Tortilla', emoji: '🫓', category: 'carbs' },
  { id: 'croissant', name: 'Croissant', nameEn: 'Croissant', emoji: '🥐', category: 'carbs' },
  { id: 'polenta', name: 'Polenta', nameEn: 'Polenta', emoji: '🌽', category: 'carbs' },
  { id: 'bulgur', name: 'Boulgour', nameEn: 'Bulgur', emoji: '🌾', category: 'carbs' },

  // FRUITS (fruit) - tous uniques
  { id: 'apple', name: 'Pomme', nameEn: 'Apple', emoji: '🍎', category: 'fruit' },
  { id: 'banana', name: 'Banane', nameEn: 'Banana', emoji: '🍌', category: 'fruit' },
  { id: 'orange', name: 'Orange', nameEn: 'Orange', emoji: '🍊', category: 'fruit' },
  { id: 'lemon', name: 'Citron', nameEn: 'Lemon', emoji: '🍋', category: 'fruit' },
  { id: 'lime', name: 'Citron vert', nameEn: 'Lime', emoji: '🍏', category: 'fruit' },
  { id: 'strawberry', name: 'Fraise', nameEn: 'Strawberry', emoji: '🍓', category: 'fruit' },
  { id: 'raspberry', name: 'Framboise', nameEn: 'Raspberry', emoji: '🫐', category: 'fruit' },
  { id: 'blueberry', name: 'Myrtille', nameEn: 'Blueberry', emoji: '🟣', category: 'fruit' },
  { id: 'grape', name: 'Raisin', nameEn: 'Grape', emoji: '🍇', category: 'fruit' },
  { id: 'mango', name: 'Mangue', nameEn: 'Mango', emoji: '🥭', category: 'fruit' },
  { id: 'pineapple', name: 'Ananas', nameEn: 'Pineapple', emoji: '🍍', category: 'fruit' },
  { id: 'peach', name: 'Pêche', nameEn: 'Peach', emoji: '🍑', category: 'fruit' },
  { id: 'pear', name: 'Poire', nameEn: 'Pear', emoji: '🍐', category: 'fruit' },
  { id: 'cherry', name: 'Cerise', nameEn: 'Cherry', emoji: '🍒', category: 'fruit' },
  { id: 'kiwi', name: 'Kiwi', nameEn: 'Kiwi', emoji: '🥝', category: 'fruit' },
  { id: 'melon', name: 'Melon', nameEn: 'Melon', emoji: '🍈', category: 'fruit' },
  { id: 'watermelon', name: 'Pastèque', nameEn: 'Watermelon', emoji: '🍉', category: 'fruit' },
  { id: 'coconut', name: 'Noix de coco', nameEn: 'Coconut', emoji: '🥥', category: 'fruit' },
  { id: 'pomegranate', name: 'Grenade', nameEn: 'Pomegranate', emoji: '🔴', category: 'fruit' },
  { id: 'fig', name: 'Figue', nameEn: 'Fig', emoji: '🟤', category: 'fruit' },

  // HERBES ET ÉPICES (herbs) - tous uniques
  { id: 'basil', name: 'Basilic', nameEn: 'Basil', emoji: '🌿', category: 'herbs' },
  { id: 'parsley', name: 'Persil', nameEn: 'Parsley', emoji: '🌱', category: 'herbs' },
  { id: 'cilantro', name: 'Coriandre', nameEn: 'Cilantro', emoji: '🍃', category: 'herbs' },
  { id: 'thyme', name: 'Thym', nameEn: 'Thyme', emoji: '🌱', category: 'herbs' },
  { id: 'rosemary', name: 'Romarin', nameEn: 'Rosemary', emoji: '🌲', category: 'herbs' },
  { id: 'mint', name: 'Menthe', nameEn: 'Mint', emoji: '🌱', category: 'herbs' },
  { id: 'dill', name: 'Aneth', nameEn: 'Dill', emoji: '🌿', category: 'herbs' },
  { id: 'oregano', name: 'Origan', nameEn: 'Oregano', emoji: '🌱', category: 'herbs' },
  { id: 'tarragon', name: 'Estragon', nameEn: 'Tarragon', emoji: '🌿', category: 'herbs' },
  { id: 'chives', name: 'Ciboulette', nameEn: 'Chives', emoji: '🧅', category: 'herbs' },
  { id: 'bayleaf', name: 'Laurier', nameEn: 'Bay leaf', emoji: '🍂', category: 'herbs' },
  { id: 'sage', name: 'Sauge', nameEn: 'Sage', emoji: '🌿', category: 'herbs' },
  { id: 'cumin', name: 'Cumin', nameEn: 'Cumin', emoji: '🫚', category: 'herbs' },
  { id: 'paprika', name: 'Paprika', nameEn: 'Paprika', emoji: '🔴', category: 'herbs' },
  { id: 'turmeric', name: 'Curcuma', nameEn: 'Turmeric', emoji: '🟡', category: 'herbs' },
  { id: 'cinnamon', name: 'Cannelle', nameEn: 'Cinnamon', emoji: '🟤', category: 'herbs' },
  { id: 'chili', name: 'Piment', nameEn: 'Chili', emoji: '🌶️', category: 'herbs' },

  // SAUCES ET CONDIMENTS (condiments) - tous uniques
  { id: 'oliveoil', name: 'Huile d\'olive', nameEn: 'Olive oil', emoji: '🫒', category: 'condiments' },
  { id: 'soysauce', name: 'Sauce soja', nameEn: 'Soy sauce', emoji: '🟫', category: 'condiments' },
  { id: 'mustard', name: 'Moutarde', nameEn: 'Mustard', emoji: '🟡', category: 'condiments' },
  { id: 'mayo', name: 'Mayonnaise', nameEn: 'Mayonnaise', emoji: '🥛', category: 'condiments' },
  { id: 'ketchup', name: 'Ketchup', nameEn: 'Ketchup', emoji: '🍅', category: 'condiments' },
  { id: 'vinegar', name: 'Vinaigre', nameEn: 'Vinegar', emoji: '🫗', category: 'condiments' },
  { id: 'honey', name: 'Miel', nameEn: 'Honey', emoji: '🍯', category: 'condiments' },
  { id: 'pesto', name: 'Pesto', nameEn: 'Pesto', emoji: '🟢', category: 'condiments' },
  { id: 'tomatosauce', name: 'Sauce tomate', nameEn: 'Tomato sauce', emoji: '🍝', category: 'condiments' },
  { id: 'currypaste', name: 'Pâte de curry', nameEn: 'Curry paste', emoji: '🟠', category: 'condiments' },
  { id: 'sesameoil', name: 'Huile de sésame', nameEn: 'Sesame oil', emoji: '🟤', category: 'condiments' },
  { id: 'hotsauce', name: 'Sauce piquante', nameEn: 'Hot sauce', emoji: '🌶️', category: 'condiments' },
  { id: 'worcestershire', name: 'Worcestershire', nameEn: 'Worcestershire', emoji: '🟫', category: 'condiments' },

  // NOIX ET GRAINES (nuts) - tous uniques
  { id: 'walnuts', name: 'Noix', nameEn: 'Walnuts', emoji: '🌰', category: 'nuts' },
  { id: 'almonds', name: 'Amandes', nameEn: 'Almonds', emoji: '🥜', category: 'nuts' },
  { id: 'hazelnuts', name: 'Noisettes', nameEn: 'Hazelnuts', emoji: '🟤', category: 'nuts' },
  { id: 'peanuts', name: 'Cacahuètes', nameEn: 'Peanuts', emoji: '🥜', category: 'nuts' },
  { id: 'pine_nuts', name: 'Pignons', nameEn: 'Pine nuts', emoji: '⚪', category: 'nuts' },
  { id: 'cashews', name: 'Noix de cajou', nameEn: 'Cashews', emoji: '🟠', category: 'nuts' },
  { id: 'pistachios', name: 'Pistaches', nameEn: 'Pistachios', emoji: '🟢', category: 'nuts' },
  { id: 'sesame', name: 'Graines de sésame', nameEn: 'Sesame seeds', emoji: '🌾', category: 'nuts' },
  { id: 'sunflower_seeds', name: 'Graines de tournesol', nameEn: 'Sunflower seeds', emoji: '🌻', category: 'nuts' },
  { id: 'pumpkin_seeds', name: 'Graines de courge', nameEn: 'Pumpkin seeds', emoji: '🎃', category: 'nuts' },
  { id: 'chia', name: 'Graines de chia', nameEn: 'Chia seeds', emoji: '⚫', category: 'nuts' },
  { id: 'flax', name: 'Graines de lin', nameEn: 'Flax seeds', emoji: '🟤', category: 'nuts' },
  { id: 'pecans', name: 'Pécans', nameEn: 'Pecans', emoji: '🌰', category: 'nuts' },
  { id: 'macadamia', name: 'Noix de macadamia', nameEn: 'Macadamia nuts', emoji: '🥛', category: 'nuts' },
  { id: 'brazil_nuts', name: 'Noix du Brésil', nameEn: 'Brazil nuts', emoji: '🟤', category: 'nuts' },

  // AUTRES (others)
  { id: 'chocolate', name: 'Chocolat', nameEn: 'Chocolate', emoji: '🍫', category: 'others' },
  { id: 'vanilla', name: 'Vanille', nameEn: 'Vanilla', emoji: '🌸', category: 'others' },
  { id: 'sugar', name: 'Sucre', nameEn: 'Sugar', emoji: '🧂', category: 'others' },
  { id: 'salt', name: 'Sel', nameEn: 'Salt', emoji: '🧂', category: 'others' },
  { id: 'pepper_spice', name: 'Poivre', nameEn: 'Pepper', emoji: '🫚', category: 'others' },
  { id: 'yeast', name: 'Levure', nameEn: 'Yeast', emoji: '🍞', category: 'others' },
  { id: 'baking_powder', name: 'Levure chimique', nameEn: 'Baking powder', emoji: '🧁', category: 'others' },
  { id: 'stock', name: 'Bouillon', nameEn: 'Stock', emoji: '🥣', category: 'others' },
  { id: 'wine', name: 'Vin', nameEn: 'Wine', emoji: '🍷', category: 'others' },
  { id: 'beer', name: 'Bière', nameEn: 'Beer', emoji: '🍺', category: 'others' },
  { id: 'maple_syrup', name: 'Sirop d\'érable', nameEn: 'Maple syrup', emoji: '🍁', category: 'others' },
  { id: 'agave', name: 'Sirop d\'agave', nameEn: 'Agave syrup', emoji: '🌵', category: 'others' },
  { id: 'coconut_milk', name: 'Lait de coco', nameEn: 'Coconut milk', emoji: '🥥', category: 'others' },
  { id: 'almond_milk', name: 'Lait d\'amande', nameEn: 'Almond milk', emoji: '🥛', category: 'others' },
  { id: 'coconut_oil', name: 'Huile de coco', nameEn: 'Coconut oil', emoji: '🥥', category: 'others' },
  { id: 'vegetable_oil', name: 'Huile végétale', nameEn: 'Vegetable oil', emoji: '🫒', category: 'others' },
  { id: 'breadcrumbs', name: 'Chapelure', nameEn: 'Breadcrumbs', emoji: '🍞', category: 'others' },
  { id: 'cornstarch', name: 'Fécule de maïs', nameEn: 'Cornstarch', emoji: '🌽', category: 'others' },
  { id: 'baking_soda', name: 'Bicarbonate', nameEn: 'Baking soda', emoji: '🧂', category: 'others' },
  { id: 'capers', name: 'Câpres', nameEn: 'Capers', emoji: '🫒', category: 'others' },
  { id: 'sun_dried_tomatoes', name: 'Tomates séchées', nameEn: 'Sun-dried tomatoes', emoji: '🍅', category: 'others' },
  { id: 'pickles', name: 'Cornichons', nameEn: 'Pickles', emoji: '🥒', category: 'others' },
  { id: 'sauerkraut', name: 'Choucroute', nameEn: 'Sauerkraut', emoji: '🥬', category: 'others' },
  { id: 'kimchi', name: 'Kimchi', nameEn: 'Kimchi', emoji: '🥬', category: 'others' },
  { id: 'tahini', name: 'Tahini', nameEn: 'Tahini', emoji: '🥜', category: 'others' },
  { id: 'hummus', name: 'Houmous', nameEn: 'Hummus', emoji: '🫘', category: 'others' },
  { id: 'harissa', name: 'Harissa', nameEn: 'Harissa', emoji: '🌶️', category: 'others' },
  { id: 'sriracha', name: 'Sriracha', nameEn: 'Sriracha', emoji: '🌶️', category: 'others' },
  { id: 'tabasco', name: 'Tabasco', nameEn: 'Tabasco', emoji: '🌶️', category: 'others' },
  { id: 'fish_sauce', name: 'Sauce poisson', nameEn: 'Fish sauce', emoji: '🐟', category: 'others' },
  { id: 'oyster_sauce', name: 'Sauce huître', nameEn: 'Oyster sauce', emoji: '🦪', category: 'others' },
  { id: 'teriyaki', name: 'Teriyaki', nameEn: 'Teriyaki', emoji: '🫗', category: 'others' },
  { id: 'bbq_sauce', name: 'Sauce BBQ', nameEn: 'BBQ sauce', emoji: '🍖', category: 'others' },
  { id: 'mayonnaise', name: 'Mayonnaise', nameEn: 'Mayonnaise', emoji: '🥛', category: 'others' },
  { id: 'aioli', name: 'Aïoli', nameEn: 'Aioli', emoji: '🧄', category: 'others' },
  { id: 'tartar_sauce', name: 'Sauce tartare', nameEn: 'Tartar sauce', emoji: '🥒', category: 'others' },
  { id: 'guacamole', name: 'Guacamole', nameEn: 'Guacamole', emoji: '🥑', category: 'others' },
  { id: 'salsa', name: 'Salsa', nameEn: 'Salsa', emoji: '🍅', category: 'others' },
  { id: 'nutella', name: 'Nutella', nameEn: 'Nutella', emoji: '🍫', category: 'others' },
  { id: 'peanut_butter', name: 'Beurre de cacahuète', nameEn: 'Peanut butter', emoji: '🥜', category: 'others' },
  { id: 'jam', name: 'Confiture', nameEn: 'Jam', emoji: '🍓', category: 'others' },
  { id: 'maple_butter', name: 'Beurre d\'érable', nameEn: 'Maple butter', emoji: '🍁', category: 'others' },
  { id: 'cream_fresh', name: 'Crème fraîche', nameEn: 'Crème fraîche', emoji: '🥛', category: 'others' },
  { id: 'sour_cream', name: 'Crème sûre', nameEn: 'Sour cream', emoji: '🥛', category: 'others' },
  { id: 'cottage_cheese', name: 'Cottage cheese', nameEn: 'Cottage cheese', emoji: '🧀', category: 'others' },
  { id: 'labneh', name: 'Labneh', nameEn: 'Labneh', emoji: '🥛', category: 'others' },
  { id: 'prosciutto', name: 'Prosciutto', nameEn: 'Prosciutto', emoji: '🍖', category: 'others' },
  { id: 'salami', name: 'Salami', nameEn: 'Salami', emoji: '🌭', category: 'others' },
  { id: 'chorizo', name: 'Chorizo', nameEn: 'Chorizo', emoji: '🌭', category: 'others' },
  { id: 'pancetta', name: 'Pancetta', nameEn: 'Pancetta', emoji: '🥓', category: 'others' },
  { id: 'pepperoni', name: 'Pepperoni', nameEn: 'Pepperoni', emoji: '🌭', category: 'others' },
  { id: 'foie_gras', name: 'Foie gras', nameEn: 'Foie gras', emoji: '🥩', category: 'others' },
  { id: 'truffle', name: 'Truffe', nameEn: 'Truffle', emoji: '🍄', category: 'others' },
  { id: 'truffle_oil', name: 'Huile de truffe', nameEn: 'Truffle oil', emoji: '🍄', category: 'others' },
  { id: 'saffron', name: 'Safran', nameEn: 'Saffron', emoji: '🌸', category: 'others' },
  { id: 'cardamom', name: 'Cardamome', nameEn: 'Cardamom', emoji: '🫚', category: 'others' },
  { id: 'cloves', name: 'Clous de girofle', nameEn: 'Cloves', emoji: '🫚', category: 'others' },
  { id: 'nutmeg', name: 'Muscade', nameEn: 'Nutmeg', emoji: '🫚', category: 'others' },
  { id: 'star_anise', name: 'Badiane', nameEn: 'Star anise', emoji: '⭐', category: 'others' },
  { id: 'allspice', name: 'Quatre-épices', nameEn: 'Allspice', emoji: '🫚', category: 'others' },
  { id: 'garam_masala', name: 'Garam masala', nameEn: 'Garam masala', emoji: '🫚', category: 'others' },
  { id: 'curry_powder', name: 'Curry', nameEn: 'Curry powder', emoji: '🟠', category: 'others' },
  { id: 'ras_el_hanout', name: 'Ras el hanout', nameEn: 'Ras el hanout', emoji: '🫚', category: 'others' },
  { id: 'herbes_de_provence', name: 'Herbes de Provence', nameEn: 'Herbes de Provence', emoji: '🌿', category: 'others' },
  { id: 'italian_herbs', name: 'Herbes italiennes', nameEn: 'Italian herbs', emoji: '🌿', category: 'others' },
  { id: 'fleur_de_sel', name: 'Fleur de sel', nameEn: 'Fleur de sel', emoji: '🧂', category: 'others' },
  { id: 'smoked_paprika', name: 'Paprika fumé', nameEn: 'Smoked paprika', emoji: '🌶️', category: 'others' },
  { id: 'cayenne', name: 'Cayenne', nameEn: 'Cayenne', emoji: '🌶️', category: 'others' },
  { id: 'wasabi', name: 'Wasabi', nameEn: 'Wasabi', emoji: '🟢', category: 'others' },
  { id: 'miso', name: 'Miso', nameEn: 'Miso', emoji: '🟫', category: 'others' },
  { id: 'mirin', name: 'Mirin', nameEn: 'Mirin', emoji: '🍶', category: 'others' },
  { id: 'sake', name: 'Saké', nameEn: 'Sake', emoji: '🍶', category: 'others' },
  { id: 'rice_vinegar', name: 'Vinaigre de riz', nameEn: 'Rice vinegar', emoji: '🫗', category: 'others' },
  { id: 'apple_cider_vinegar', name: 'Vinaigre de cidre', nameEn: 'Apple cider vinegar', emoji: '🍎', category: 'others' },
  { id: 'balsamic', name: 'Balsamique', nameEn: 'Balsamic', emoji: '🫗', category: 'others' },
  { id: 'dijon', name: 'Moutarde de Dijon', nameEn: 'Dijon mustard', emoji: '🟡', category: 'others' },
  { id: 'whole_grain_mustard', name: 'Moutarde à l\'ancienne', nameEn: 'Whole grain mustard', emoji: '🟡', category: 'others' },
]

const INGREDIENT_CATEGORIES = [
  { id: 'all', icon: ChefHat, label: { fr: 'Tous', en: 'All' } },
  { id: 'meat', icon: Drumstick, label: { fr: 'Viandes', en: 'Meat' } },
  { id: 'seafood', icon: Fish, label: { fr: 'Poissons', en: 'Seafood' } },
  { id: 'vegetable', icon: Carrot, label: { fr: 'Légumes', en: 'Vegetables' } },
  { id: 'fruit', icon: Apple, label: { fr: 'Fruits', en: 'Fruits' } },
  { id: 'dairy', icon: Milk, label: { fr: 'Laitages', en: 'Dairy' } },
  { id: 'protein', icon: Egg, label: { fr: 'Protéines', en: 'Protein' } },
  { id: 'carbs', icon: UtensilsCrossed, label: { fr: 'Féculents', en: 'Carbs' } },
  { id: 'herbs', icon: Leaf, label: { fr: 'Herbes', en: 'Herbs' } },
  { id: 'condiments', icon: Flame, label: { fr: 'Sauces', en: 'Sauces' } },
  { id: 'nuts', icon: Sparkles, label: { fr: 'Noix', en: 'Nuts' } },
  { id: 'others', icon: Sparkles, label: { fr: 'Autres', en: 'Others' } },
]

export function CookingHero({
  onGenerate,
  isLoading,
  selectedIngredients,
  onToggleIngredient,
  onClearAll,
  isAuthenticated,
  onSignUp
}: CookingHeroProps) {
  const { language } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch - this is a standard pattern
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  
  const t = (key: string) => {
    const translations: Record<string, { fr: string; en: string }> = {
      title: { fr: 'Qu\'avez-vous dans votre cuisine ?', en: 'What\'s in your kitchen?' },
      subtitle: { fr: 'Sélectionnez vos ingrédients pour découvrir des recettes', en: 'Select your ingredients to discover recipes' },
      searchPlaceholder: { fr: 'Rechercher un ingrédient...', en: 'Search for an ingredient...' },
      quickSelect: { fr: 'Sélection rapide', en: 'Quick select' },
      selected: { fr: 'Ingrédients sélectionnés', en: 'Selected ingredients' },
      generate: { fr: 'Générer mes recettes', en: 'Generate my recipes' },
      generateCount: { fr: 'Générer ({count} ingrédients)', en: 'Generate ({count} ingredients)' },
      minIngredients: { fr: 'Sélectionnez au moins 3 ingrédients', en: 'Select at least 3 ingredients' },
      clearAll: { fr: 'Tout effacer', en: 'Clear all' },
      orSignUp: { fr: 'ou créez un compte pour plus de recettes', en: 'or create an account for more recipes' },
      inspiration: { fr: 'Besoin d\'inspiration ?', en: 'Need inspiration?' },
      popularCombos: { fr: 'Combinaisons populaires', en: 'Popular combos' }
    }
    return translations[key]?.[language as 'fr' | 'en'] || key
  }

  const filteredIngredients = useMemo(() => {
    return QUICK_INGREDIENTS.filter(ing => {
      const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ing.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ing.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === 'all' || ing.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, activeCategory])

  const canGenerate = selectedIngredients.length >= 3

  const popularCombos = [
    { name: language === 'fr' ? 'Poulet rôti' : 'Roast chicken', ingredients: ['chicken', 'onion', 'garlic', 'potato'] },
    { name: language === 'fr' ? 'Pâtes carbonara' : 'Carbonara pasta', ingredients: ['pasta', 'egg', 'cheese', 'cream'] },
    { name: language === 'fr' ? 'Riz sauté' : 'Fried rice', ingredients: ['rice', 'egg', 'onion', 'carrot'] },
  ]

  // Show placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-terracotta/5" />
        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          <div className="text-center mb-8">
            <div className="h-8 w-32 mx-auto bg-muted rounded-full animate-pulse mb-4" />
            <div className="h-10 w-96 mx-auto bg-muted rounded animate-pulse mb-3" />
            <div className="h-6 w-80 mx-auto bg-muted rounded animate-pulse" />
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="h-12 bg-muted rounded animate-pulse mb-4" />
            <div className="flex gap-2 mb-6 justify-center">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-9 w-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
            {/* Slot picker skeleton */}
            <div className="h-48 md:h-56 flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-terracotta/5" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-terracotta/10 rounded-full blur-2xl opacity-50" />
      
      <div className="container mx-auto px-4 py-8 md:py-12 relative">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {language === 'fr' ? 'Proposé par IA' : 'AI-powered'}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Selected Ingredients Display */}
        <AnimatePresence>
          {selectedIngredients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      {t('selected')} ({selectedIngredients.length})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3 mr-1" />
                      {t('clearAll')}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedIngredients.map((ing) => (
                      <Badge
                        key={ing.id}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm bg-background border cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => onToggleIngredient(ing)}
                      >
                        <span className="mr-1.5">{ing.emoji}</span>
                        {language === 'en' && ing.nameEn ? ing.nameEn : ing.name}
                        <X className="w-3 h-3 ml-1.5 opacity-50" />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Category Filter */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg bg-background border-2 focus:border-primary transition-colors"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {INGREDIENT_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className="shrink-0 gap-1.5"
              >
                <cat.icon className="w-4 h-4" />
                {cat.label[language as 'fr' | 'en']}
              </Button>
            ))}
          </div>
        </div>

        {/* Ingredient Slot Picker */}
        <div className="max-w-4xl mx-auto mb-8">
          <IngredientSlotPicker
            ingredients={filteredIngredients}
            selectedIngredients={selectedIngredients}
            onToggleIngredient={onToggleIngredient}
            language={language as 'fr' | 'en'}
          />
        </div>

        {/* Generate Button */}
        <div className="text-center mb-8 relative">
          {/* Confetti burst effect */}
          {isLoading && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 1,
                    scale: 0,
                    x: '50%',
                    y: '0%',
                    rotate: 0
                  }}
                  animate={{ 
                    opacity: [1, 1, 0],
                    scale: [0, 1, 0.5],
                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                    y: `${(Math.random() - 0.5) * 100}%`,
                    rotate: Math.random() * 720 - 360
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.02,
                    ease: "easeOut"
                  }}
                  className="absolute left-1/2 top-1/2 w-3 h-3"
                  style={{
                    backgroundColor: ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#f97316', '#a78bfa', '#22d3ee'][i % 7],
                    borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '0' : '2px',
                    transform: `rotate(${Math.random() * 45}deg)`
                  }}
                />
              ))}
            </div>
          )}
          
          <motion.div
            whileHover={canGenerate && !isLoading ? { scale: 1.02 } : {}}
            whileTap={canGenerate && !isLoading ? { scale: 0.98 } : {}}
          >
            <Button
              size="lg"
              disabled={!canGenerate || isLoading}
              onClick={onGenerate}
              className={`
                px-10 py-7 text-lg font-bold rounded-full
                transition-all duration-300 relative overflow-hidden
                ${canGenerate 
                  ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50' 
                  : 'bg-muted text-muted-foreground'
                }
              `}
              style={canGenerate ? {
                backgroundSize: '200% 200%',
                animation: 'gradient 3s ease infinite'
              } : {}}
            >
              {/* Animated shine */}
              {canGenerate && !isLoading && (
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
              )}
              
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  {language === 'fr' ? 'Cuisson en cours...' : 'Cooking up recipes...'}
                  <PartyPopper className="w-5 h-5 ml-2" />
                </>
              ) : canGenerate ? (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  {t('generateCount').replace('{count}', String(selectedIngredients.length))}
                  <ArrowRight className="w-5 h-5 ml-2" />
                  <Zap className="w-4 h-4 ml-1 text-yellow-300" />
                </>
              ) : (
                <>
                  <UtensilsCrossed className="w-5 h-5 mr-2" />
                  {t('minIngredients')}
                </>
              )}
            </Button>
          </motion.div>
          
          {!isAuthenticated && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground mt-4"
            >
              {language === 'fr' ? '🎁 Première recette gratuite ! ' : '🎁 First recipe free! '}
              <button 
                onClick={onSignUp}
                className="text-primary hover:underline font-medium"
              >
                {t('orSignUp')}
              </button>
            </motion.p>
          )}
        </div>

        {/* Popular Combinations */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-center text-sm font-medium text-muted-foreground mb-3">
            {t('popularCombos')}
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {popularCombos.map((combo, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  onClearAll()
                  combo.ingredients.forEach(ingId => {
                    const ingredient = QUICK_INGREDIENTS.find(i => i.id === ingId)
                    if (ingredient) {
                      onToggleIngredient(ingredient)
                    }
                  })
                }}
                className="gap-1.5"
              >
                {combo.name}
                <ArrowRight className="w-3 h-3 opacity-50" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  )
}
