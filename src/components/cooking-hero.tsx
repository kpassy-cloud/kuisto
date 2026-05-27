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
  Plus, X, ArrowRight, Loader2
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { soundEffects } from '@/lib/sounds'
import { IngredientSlotPicker } from '@/components/ingredient-slot-picker'

interface Ingredient {
  id: string
  name: string
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
  { id: 'tomato', name: 'Tomate', emoji: '🍅', category: 'vegetable' },
  { id: 'onion', name: 'Oignon', emoji: '🧅', category: 'vegetable' },
  { id: 'garlic', name: 'Ail', emoji: '🧄', category: 'vegetable' },
  { id: 'potato', name: 'Pomme de terre', emoji: '🥔', category: 'vegetable' },
  { id: 'carrot', name: 'Carotte', emoji: '🥕', category: 'vegetable' },
  { id: 'pepper', name: 'Poivron', emoji: '🫑', category: 'vegetable' },
  { id: 'mushroom', name: 'Champignon', emoji: '🍄', category: 'vegetable' },
  { id: 'zucchini', name: 'Courgette', emoji: '🥒', category: 'vegetable' },
  { id: 'eggplant', name: 'Aubergine', emoji: '🍆', category: 'vegetable' },
  { id: 'broccoli', name: 'Brocoli', emoji: '🥦', category: 'vegetable' },
  { id: 'spinach', name: 'Épinards', emoji: '🥬', category: 'vegetable' },
  { id: 'cucumber', name: 'Concombre', emoji: '🥗', category: 'vegetable' },
  { id: 'celery', name: 'Céleri', emoji: '🌿', category: 'vegetable' },
  { id: 'cabbage', name: 'Chou', emoji: '🥗', category: 'vegetable' },
  { id: 'lettuce', name: 'Laitue', emoji: '🥬', category: 'vegetable' },
  { id: 'leek', name: 'Poireau', emoji: '🧅', category: 'vegetable' },
  { id: 'pumpkin', name: 'Citrouille', emoji: '🎃', category: 'vegetable' },
  { id: 'squash', name: 'Courge', emoji: '🟧', category: 'vegetable' },
  { id: 'peas', name: 'Pois', emoji: '🫛', category: 'vegetable' },
  { id: 'greenbeans', name: 'Haricots verts', emoji: '🫛', category: 'vegetable' },
  { id: 'corn', name: 'Maïs', emoji: '🌽', category: 'vegetable' },
  { id: 'asparagus', name: 'Asperges', emoji: '🌱', category: 'vegetable' },
  { id: 'artichoke', name: 'Artichaut', emoji: '🌻', category: 'vegetable' },
  { id: 'cauliflower', name: 'Chou-fleur', emoji: '⚪', category: 'vegetable' },
  { id: 'radish', name: 'Radis', emoji: '🔴', category: 'vegetable' },
  { id: 'beetroot', name: 'Betterave', emoji: '🟣', category: 'vegetable' },
  { id: 'sweetpotato', name: 'Patate douce', emoji: '🍠', category: 'vegetable' },
  { id: 'avocado', name: 'Avocat', emoji: '🥑', category: 'vegetable' },
  { id: 'olives', name: 'Olives', emoji: '🫒', category: 'vegetable' },
  { id: 'ginger', name: 'Gingembre', emoji: '🫚', category: 'vegetable' },

  // VIANDES (meat) - tous uniques
  { id: 'chicken', name: 'Poulet', emoji: '🍗', category: 'meat' },
  { id: 'beef', name: 'Bœuf', emoji: '🥩', category: 'meat' },
  { id: 'pork', name: 'Porc', emoji: '🥓', category: 'meat' },
  { id: 'lamb', name: 'Agneau', emoji: '🍖', category: 'meat' },
  { id: 'duck', name: 'Canard', emoji: '🦆', category: 'meat' },
  { id: 'turkey', name: 'Dinde', emoji: '🦃', category: 'meat' },
  { id: 'bacon', name: 'Bacon', emoji: '🥓', category: 'meat' },
  { id: 'ham', name: 'Jambon', emoji: '🍖', category: 'meat' },
  { id: 'sausage', name: 'Saucisse', emoji: '🌭', category: 'meat' },
  { id: 'groundmeat', name: 'Viande hachée', emoji: '🧆', category: 'meat' },
  { id: 'rabbit', name: 'Lapin', emoji: '🐰', category: 'meat' },
  { id: 'veal', name: 'Veau', emoji: '🥩', category: 'meat' },
  { id: 'ribs', name: 'Côtes', emoji: '🍖', category: 'meat' },
  { id: 'liver', name: 'Foie', emoji: '🫀', category: 'meat' },

  // POISSONS ET FRUITS DE MER (seafood) - tous uniques
  { id: 'fish', name: 'Poisson', emoji: '🐟', category: 'seafood' },
  { id: 'shrimp', name: 'Crevettes', emoji: '🦐', category: 'seafood' },
  { id: 'salmon', name: 'Saumon', emoji: '🐠', category: 'seafood' },
  { id: 'tuna', name: 'Thon', emoji: '🐟', category: 'seafood' },
  { id: 'mussels', name: 'Moules', emoji: '🦪', category: 'seafood' },
  { id: 'squid', name: 'Calamar', emoji: '🦑', category: 'seafood' },
  { id: 'crab', name: 'Crabe', emoji: '🦀', category: 'seafood' },
  { id: 'lobster', name: 'Homard', emoji: '🦞', category: 'seafood' },
  { id: 'scallops', name: 'Coquilles St-Jacques', emoji: '🦪', category: 'seafood' },
  { id: 'cod', name: 'Cabillaud', emoji: '🐠', category: 'seafood' },
  { id: 'sardines', name: 'Sardines', emoji: '🐟', category: 'seafood' },
  { id: 'anchovies', name: 'Anchois', emoji: '🐡', category: 'seafood' },
  { id: 'trout', name: 'Truite', emoji: '🎣', category: 'seafood' },
  { id: 'halibut', name: 'Flétan', emoji: '🐟', category: 'seafood' },

  // PRODUITS LAITIERS (dairy) - tous uniques
  { id: 'cheese', name: 'Fromage', emoji: '🧀', category: 'dairy' },
  { id: 'cream', name: 'Crème', emoji: '🥛', category: 'dairy' },
  { id: 'milk', name: 'Lait', emoji: '🥛', category: 'dairy' },
  { id: 'butter', name: 'Beurre', emoji: '🧈', category: 'dairy' },
  { id: 'yogurt', name: 'Yaourt', emoji: '🥛', category: 'dairy' },
  { id: 'mozzarella', name: 'Mozzarella', emoji: '⚪', category: 'dairy' },
  { id: 'parmesan', name: 'Parmesan', emoji: '🧀', category: 'dairy' },
  { id: 'feta', name: 'Feta', emoji: '🧊', category: 'dairy' },
  { id: 'goatcheese', name: 'Chèvre', emoji: '🐐', category: 'dairy' },
  { id: 'ricotta', name: 'Ricotta', emoji: '🥣', category: 'dairy' },
  { id: 'creamcheese', name: 'Cream cheese', emoji: '🧈', category: 'dairy' },
  { id: 'brie', name: 'Brie', emoji: '🧀', category: 'dairy' },
  { id: 'gruyere', name: 'Gruyère', emoji: '🧀', category: 'dairy' },
  { id: 'cheddar', name: 'Cheddar', emoji: '🟠', category: 'dairy' },

  // PROTÉINES (protein) - tous uniques
  { id: 'egg', name: 'Œuf', emoji: '🥚', category: 'protein' },
  { id: 'tofu', name: 'Tofu', emoji: '🧊', category: 'protein' },
  { id: 'lentils', name: 'Lentilles', emoji: '🫘', category: 'protein' },
  { id: 'chickpeas', name: 'Pois chiches', emoji: '🟤', category: 'protein' },
  { id: 'beans', name: 'Haricots', emoji: '🫘', category: 'protein' },
  { id: 'kidneybeans', name: 'Haricots rouges', emoji: '🔴', category: 'protein' },
  { id: 'whitebeans', name: 'Haricots blancs', emoji: '⚪', category: 'protein' },
  { id: 'tempeh', name: 'Tempeh', emoji: '🟫', category: 'protein' },
  { id: 'seitan', name: 'Seitan', emoji: '🟤', category: 'protein' },
  { id: 'edamame', name: 'Edamame', emoji: '🫛', category: 'protein' },

  // FÉCULENTS (carbs) - tous uniques
  { id: 'pasta', name: 'Pâtes', emoji: '🍝', category: 'carbs' },
  { id: 'rice', name: 'Riz', emoji: '🍚', category: 'carbs' },
  { id: 'bread', name: 'Pain', emoji: '🍞', category: 'carbs' },
  { id: 'quinoa', name: 'Quinoa', emoji: '🥣', category: 'carbs' },
  { id: 'couscous', name: 'Semoule', emoji: '🥣', category: 'carbs' },
  { id: 'noodles', name: 'Nouilles', emoji: '🍜', category: 'carbs' },
  { id: 'barley', name: 'Orge', emoji: '🌾', category: 'carbs' },
  { id: 'oats', name: 'Flocons d\'avoine', emoji: '🥣', category: 'carbs' },
  { id: 'flour', name: 'Farine', emoji: '🧂', category: 'carbs' },
  { id: 'baguette', name: 'Baguette', emoji: '🥖', category: 'carbs' },
  { id: 'tortilla', name: 'Tortilla', emoji: '🫓', category: 'carbs' },
  { id: 'croissant', name: 'Croissant', emoji: '🥐', category: 'carbs' },
  { id: 'polenta', name: 'Polenta', emoji: '🌽', category: 'carbs' },
  { id: 'bulgur', name: 'Boulgour', emoji: '🌾', category: 'carbs' },

  // FRUITS (fruit) - tous uniques
  { id: 'apple', name: 'Pomme', emoji: '🍎', category: 'fruit' },
  { id: 'banana', name: 'Banane', emoji: '🍌', category: 'fruit' },
  { id: 'orange', name: 'Orange', emoji: '🍊', category: 'fruit' },
  { id: 'lemon', name: 'Citron', emoji: '🍋', category: 'fruit' },
  { id: 'lime', name: 'Citron vert', emoji: '🍏', category: 'fruit' },
  { id: 'strawberry', name: 'Fraise', emoji: '🍓', category: 'fruit' },
  { id: 'raspberry', name: 'Framboise', emoji: '🫐', category: 'fruit' },
  { id: 'blueberry', name: 'Myrtille', emoji: '🟣', category: 'fruit' },
  { id: 'grape', name: 'Raisin', emoji: '🍇', category: 'fruit' },
  { id: 'mango', name: 'Mangue', emoji: '🥭', category: 'fruit' },
  { id: 'pineapple', name: 'Ananas', emoji: '🍍', category: 'fruit' },
  { id: 'peach', name: 'Pêche', emoji: '🍑', category: 'fruit' },
  { id: 'pear', name: 'Poire', emoji: '🍐', category: 'fruit' },
  { id: 'cherry', name: 'Cerise', emoji: '🍒', category: 'fruit' },
  { id: 'kiwi', name: 'Kiwi', emoji: '🥝', category: 'fruit' },
  { id: 'melon', name: 'Melon', emoji: '🍈', category: 'fruit' },
  { id: 'watermelon', name: 'Pastèque', emoji: '🍉', category: 'fruit' },
  { id: 'coconut', name: 'Noix de coco', emoji: '🥥', category: 'fruit' },
  { id: 'pomegranate', name: 'Grenade', emoji: '🔴', category: 'fruit' },
  { id: 'fig', name: 'Figue', emoji: '🟤', category: 'fruit' },

  // HERBES ET ÉPICES (herbs) - tous uniques
  { id: 'basil', name: 'Basilic', emoji: '🌿', category: 'herbs' },
  { id: 'parsley', name: 'Persil', emoji: '🌱', category: 'herbs' },
  { id: 'cilantro', name: 'Coriandre', emoji: '🍃', category: 'herbs' },
  { id: 'thyme', name: 'Thym', emoji: '🌱', category: 'herbs' },
  { id: 'rosemary', name: 'Romarin', emoji: '🌲', category: 'herbs' },
  { id: 'mint', name: 'Menthe', emoji: '🌱', category: 'herbs' },
  { id: 'dill', name: 'Aneth', emoji: '🌿', category: 'herbs' },
  { id: 'oregano', name: 'Origan', emoji: '🌱', category: 'herbs' },
  { id: 'tarragon', name: 'Estragon', emoji: '🌿', category: 'herbs' },
  { id: 'chives', name: 'Ciboulette', emoji: '🧅', category: 'herbs' },
  { id: 'bayleaf', name: 'Laurier', emoji: '🍂', category: 'herbs' },
  { id: 'sage', name: 'Sauge', emoji: '🌿', category: 'herbs' },
  { id: 'cumin', name: 'Cumin', emoji: '🫚', category: 'herbs' },
  { id: 'paprika', name: 'Paprika', emoji: '🔴', category: 'herbs' },
  { id: 'turmeric', name: 'Curcuma', emoji: '🟡', category: 'herbs' },
  { id: 'cinnamon', name: 'Cannelle', emoji: '🟤', category: 'herbs' },
  { id: 'chili', name: 'Piment', emoji: '🌶️', category: 'herbs' },

  // SAUCES ET CONDIMENTS (condiments) - tous uniques
  { id: 'oliveoil', name: 'Huile d\'olive', emoji: '🫒', category: 'condiments' },
  { id: 'soysauce', name: 'Sauce soja', emoji: '🟫', category: 'condiments' },
  { id: 'mustard', name: 'Moutarde', emoji: '🟡', category: 'condiments' },
  { id: 'mayo', name: 'Mayonnaise', emoji: '🥛', category: 'condiments' },
  { id: 'ketchup', name: 'Ketchup', emoji: '🍅', category: 'condiments' },
  { id: 'vinegar', name: 'Vinaigre', emoji: '🫗', category: 'condiments' },
  { id: 'honey', name: 'Miel', emoji: '🍯', category: 'condiments' },
  { id: 'pesto', name: 'Pesto', emoji: '🟢', category: 'condiments' },
  { id: 'tomatosauce', name: 'Sauce tomate', emoji: '🍝', category: 'condiments' },
  { id: 'currypaste', name: 'Pâte de curry', emoji: '🟠', category: 'condiments' },
  { id: 'sesameoil', name: 'Huile de sésame', emoji: '🟤', category: 'condiments' },
  { id: 'hotsauce', name: 'Sauce piquante', emoji: '🌶️', category: 'condiments' },
  { id: 'worcestershire', name: 'Worcestershire', emoji: '🟫', category: 'condiments' },

  // NOIX ET GRAINES (nuts) - tous uniques
  { id: 'walnuts', name: 'Noix', emoji: '🌰', category: 'nuts' },
  { id: 'almonds', name: 'Amandes', emoji: '🥜', category: 'nuts' },
  { id: 'hazelnuts', name: 'Noisettes', emoji: '🟤', category: 'nuts' },
  { id: 'peanuts', name: 'Cacahuètes', emoji: '🥜', category: 'nuts' },
  { id: 'pine_nuts', name: 'Pignons', emoji: '⚪', category: 'nuts' },
  { id: 'cashews', name: 'Noix de cajou', emoji: '🟠', category: 'nuts' },
  { id: 'pistachios', name: 'Pistaches', emoji: '🟢', category: 'nuts' },
  { id: 'sesame', name: 'Graines de sésame', emoji: '🌾', category: 'nuts' },
  { id: 'sunflower_seeds', name: 'Graines de tournesol', emoji: '🌻', category: 'nuts' },
  { id: 'pumpkin_seeds', name: 'Graines de courge', emoji: '🎃', category: 'nuts' },
  { id: 'chia', name: 'Graines de chia', emoji: '⚫', category: 'nuts' },
  { id: 'flax', name: 'Graines de lin', emoji: '🟤', category: 'nuts' },
  { id: 'pecans', name: 'Pécans', emoji: '🌰', category: 'nuts' },
  { id: 'macadamia', name: 'Noix de macadamia', emoji: '🥛', category: 'nuts' },
  { id: 'brazil_nuts', name: 'Noix du Brésil', emoji: '🟤', category: 'nuts' },

  // AUTRES (others)
  { id: 'chocolate', name: 'Chocolat', emoji: '🍫', category: 'others' },
  { id: 'vanilla', name: 'Vanille', emoji: '🌸', category: 'others' },
  { id: 'sugar', name: 'Sucre', emoji: '🧂', category: 'others' },
  { id: 'salt', name: 'Sel', emoji: '🧂', category: 'others' },
  { id: 'pepper_spice', name: 'Poivre', emoji: '🫚', category: 'others' },
  { id: 'yeast', name: 'Levure', emoji: '🍞', category: 'others' },
  { id: 'baking_powder', name: 'Levure chimique', emoji: '🧁', category: 'others' },
  { id: 'stock', name: 'Bouillon', emoji: '🥣', category: 'others' },
  { id: 'wine', name: 'Vin', emoji: '🍷', category: 'others' },
  { id: 'beer', name: 'Bière', emoji: '🍺', category: 'others' },
  { id: 'maple_syrup', name: 'Sirop d\'érable', emoji: '🍁', category: 'others' },
  { id: 'agave', name: 'Sirop d\'agave', emoji: '🌵', category: 'others' },
  { id: 'coconut_milk', name: 'Lait de coco', emoji: '🥥', category: 'others' },
  { id: 'almond_milk', name: 'Lait d\'amande', emoji: '🥛', category: 'others' },
  { id: 'coconut_oil', name: 'Huile de coco', emoji: '🥥', category: 'others' },
  { id: 'vegetable_oil', name: 'Huile végétale', emoji: '🫒', category: 'others' },
  { id: 'breadcrumbs', name: 'Chapelure', emoji: '🍞', category: 'others' },
  { id: 'cornstarch', name: 'Fécule de maïs', emoji: '🌽', category: 'others' },
  { id: 'baking_soda', name: 'Bicarbonate', emoji: '🧂', category: 'others' },
  { id: 'capers', name: 'Câpres', emoji: '🫒', category: 'others' },
  { id: 'sun_dried_tomatoes', name: 'Tomates séchées', emoji: '🍅', category: 'others' },
  { id: 'pickles', name: 'Cornichons', emoji: '🥒', category: 'others' },
  { id: 'sauerkraut', name: 'Choucroute', emoji: '🥬', category: 'others' },
  { id: 'kimchi', name: 'Kimchi', emoji: '🥬', category: 'others' },
  { id: 'tahini', name: 'Tahini', emoji: '🥜', category: 'others' },
  { id: 'hummus', name: 'Houmous', emoji: '🫘', category: 'others' },
  { id: 'harissa', name: 'Harissa', emoji: '🌶️', category: 'others' },
  { id: 'sriracha', name: 'Sriracha', emoji: '🌶️', category: 'others' },
  { id: 'tabasco', name: 'Tabasco', emoji: '🌶️', category: 'others' },
  { id: 'fish_sauce', name: 'Sauce poisson', emoji: '🐟', category: 'others' },
  { id: 'oyster_sauce', name: 'Sauce huître', emoji: '🦪', category: 'others' },
  { id: 'teriyaki', name: 'Teriyaki', emoji: '🫗', category: 'others' },
  { id: 'bbq_sauce', name: 'Sauce BBQ', emoji: '🍖', category: 'others' },
  { id: 'mayonnaise', name: 'Mayonnaise', emoji: '🥛', category: 'others' },
  { id: 'aioli', name: 'Aïoli', emoji: '🧄', category: 'others' },
  { id: 'tartar_sauce', name: 'Sauce tartare', emoji: '🥒', category: 'others' },
  { id: 'guacamole', name: 'Guacamole', emoji: '🥑', category: 'others' },
  { id: 'salsa', name: 'Salsa', emoji: '🍅', category: 'others' },
  { id: 'nutella', name: 'Nutella', emoji: '🍫', category: 'others' },
  { id: 'peanut_butter', name: 'Beurre de cacahuète', emoji: '🥜', category: 'others' },
  { id: 'jam', name: 'Confiture', emoji: '🍓', category: 'others' },
  { id: 'maple_butter', name: 'Beurre d\'érable', emoji: '🍁', category: 'others' },
  { id: 'cream_fresh', name: 'Crème fraîche', emoji: '🥛', category: 'others' },
  { id: 'sour_cream', name: 'Crème sûre', emoji: '🥛', category: 'others' },
  { id: 'cottage_cheese', name: 'Cottage cheese', emoji: '🧀', category: 'others' },
  { id: 'labneh', name: 'Labneh', emoji: '🥛', category: 'others' },
  { id: 'prosciutto', name: 'Prosciutto', emoji: '🍖', category: 'others' },
  { id: 'salami', name: 'Salami', emoji: '🌭', category: 'others' },
  { id: 'chorizo', name: 'Chorizo', emoji: '🌭', category: 'others' },
  { id: 'pancetta', name: 'Pancetta', emoji: '🥓', category: 'others' },
  { id: 'pepperoni', name: 'Pepperoni', emoji: '🌭', category: 'others' },
  { id: 'foie_gras', name: 'Foie gras', emoji: '🥩', category: 'others' },
  { id: 'truffle', name: 'Truffe', emoji: '🍄', category: 'others' },
  { id: 'truffle_oil', name: 'Huile de truffe', emoji: '🍄', category: 'others' },
  { id: 'saffron', name: 'Safran', emoji: '🌸', category: 'others' },
  { id: 'cardamom', name: 'Cardamome', emoji: '🫚', category: 'others' },
  { id: 'cloves', name: 'Clous de girofle', emoji: '🫚', category: 'others' },
  { id: 'nutmeg', name: 'Muscade', emoji: '🫚', category: 'others' },
  { id: 'star_anise', name: 'Badiane', emoji: '⭐', category: 'others' },
  { id: 'allspice', name: 'Quatre-épices', emoji: '🫚', category: 'others' },
  { id: 'garam_masala', name: 'Garam masala', emoji: '🫚', category: 'others' },
  { id: 'curry_powder', name: 'Curry', emoji: '🟠', category: 'others' },
  { id: 'ras_el_hanout', name: 'Ras el hanout', emoji: '🫚', category: 'others' },
  { id: 'herbes_de_provence', name: 'Herbes de Provence', emoji: '🌿', category: 'others' },
  { id: 'italian_herbs', name: 'Herbes italiennes', emoji: '🌿', category: 'others' },
  { id: 'fleur_de_sel', name: 'Fleur de sel', emoji: '🧂', category: 'others' },
  { id: 'smoked_paprika', name: 'Paprika fumé', emoji: '🌶️', category: 'others' },
  { id: 'cayenne', name: 'Cayenne', emoji: '🌶️', category: 'others' },
  { id: 'wasabi', name: 'Wasabi', emoji: '🟢', category: 'others' },
  { id: 'miso', name: 'Miso', emoji: '🟫', category: 'others' },
  { id: 'mirin', name: 'Mirin', emoji: '🍶', category: 'others' },
  { id: 'sake', name: 'Saké', emoji: '🍶', category: 'others' },
  { id: 'rice_vinegar', name: 'Vinaigre de riz', emoji: '🫗', category: 'others' },
  { id: 'apple_cider_vinegar', name: 'Vinaigre de cidre', emoji: '🍎', category: 'others' },
  { id: 'balsamic', name: 'Balsamique', emoji: '🫗', category: 'others' },
  { id: 'dijon', name: 'Moutarde de Dijon', emoji: '🟡', category: 'others' },
  { id: 'whole_grain_mustard', name: 'Moutarde à l\'ancienne', emoji: '🟡', category: 'others' },
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
                        {ing.name}
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
        <div className="text-center mb-8">
          <Button
            size="lg"
            disabled={!canGenerate || isLoading}
            onClick={onGenerate}
            className={`
              px-8 py-6 text-lg font-semibold
              bg-gradient-to-r from-primary to-primary/90 
              hover:from-primary/90 hover:to-primary
              shadow-lg shadow-primary/30
              transition-all duration-300
              ${canGenerate ? 'animate-pulse-slow' : ''}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {language === 'fr' ? 'Génération en cours...' : 'Generating...'}
              </>
            ) : canGenerate ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {t('generateCount').replace('{count}', String(selectedIngredients.length))}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                <UtensilsCrossed className="w-5 h-5 mr-2" />
                {t('minIngredients')}
              </>
            )}
          </Button>
          
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-3">
              {language === 'fr' ? 'Première recette gratuite ! ' : 'First recipe free! '}
              <button 
                onClick={onSignUp}
                className="text-primary hover:underline font-medium"
              >
                {t('orSignUp')}
              </button>
            </p>
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
    </section>
  )
}
