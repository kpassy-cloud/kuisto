import { NextRequest, NextResponse } from 'next/server'

// Ingredient database for search - same as cooking-hero.tsx
const ingredientDatabase = [
  // LÉGUMES (vegetable)
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

  // VIANDES (meat)
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

  // POISSONS ET FRUITS DE MER (seafood)
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

  // PRODUITS LAITIERS (dairy)
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

  // PROTÉINES (protein)
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

  // FÉCULENTS (carbs)
  { id: 'pasta', name: 'Pâtes', nameEn: 'Pasta', emoji: '🍝', category: 'carbs' },
  { id: 'rice', name: 'Riz', nameEn: 'Rice', emoji: '🍚', category: 'carbs' },
  { id: 'bread', name: 'Pain', nameEn: 'Bread', emoji: '🍞', category: 'carbs' },
  { id: 'quinoa', name: 'Quinoa', nameEn: 'Quinoa', emoji: '🥣', category: 'carbs' },
  { id: 'couscous', name: 'Semoule', nameEn: 'Couscous', emoji: '🥣', category: 'carbs' },
  { id: 'noodles', name: 'Nouilles', nameEn: 'Noodles', emoji: '🍜', category: 'carbs' },
  { id: 'barley', name: 'Orge', nameEn: 'Barley', emoji: '🌾', category: 'carbs' },
  { id: 'oats', name: "Flocons d'avoine", nameEn: 'Oats', emoji: '🥣', category: 'carbs' },
  { id: 'flour', name: 'Farine', nameEn: 'Flour', emoji: '🧂', category: 'carbs' },
  { id: 'baguette', name: 'Baguette', nameEn: 'Baguette', emoji: '🥖', category: 'carbs' },
  { id: 'tortilla', name: 'Tortilla', nameEn: 'Tortilla', emoji: '🫓', category: 'carbs' },
  { id: 'croissant', name: 'Croissant', nameEn: 'Croissant', emoji: '🥐', category: 'carbs' },
  { id: 'polenta', name: 'Polenta', nameEn: 'Polenta', emoji: '🌽', category: 'carbs' },
  { id: 'bulgur', name: 'Boulgour', nameEn: 'Bulgur', emoji: '🌾', category: 'carbs' },

  // FRUITS (fruit)
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

  // HERBES ET ÉPICES (herbs)
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

  // SAUCES ET CONDIMENTS (condiments)
  { id: 'oliveoil', name: "Huile d'olive", nameEn: 'Olive oil', emoji: '🫒', category: 'condiments' },
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

  // NOIX ET GRAINES (nuts)
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
  { id: 'maple_syrup', name: "Sirop d'érable", nameEn: 'Maple syrup', emoji: '🍁', category: 'others' },
  { id: 'agave', name: "Sirop d'agave", nameEn: 'Agave syrup', emoji: '🌵', category: 'others' },
  { id: 'coconut_milk', name: 'Lait de coco', nameEn: 'Coconut milk', emoji: '🥥', category: 'others' },
  { id: 'almond_milk', name: "Lait d'amande", nameEn: 'Almond milk', emoji: '🥛', category: 'others' },
  { id: 'coconut_oil', name: 'Huile de coco', nameEn: 'Coconut oil', emoji: '🥥', category: 'others' },
  { id: 'vegetable_oil', name: 'Huile végétale', nameEn: 'Vegetable oil', emoji: '🫒', category: 'others' },
  { id: 'breadcrumbs', name: 'Chapelure', nameEn: 'Breadcrumbs', emoji: '🍞', category: 'others' },
  { id: 'cornstarch', name: 'Fécule de maïs', nameEn: 'Cornstarch', emoji: '🌽', category: 'others' },
  { id: 'baking_soda', name: 'Bicarbonate', nameEn: 'Baking soda', emoji: '🧂', category: 'others' },
]

// Category labels for display
const categoryLabels: Record<string, { fr: string; en: string }> = {
  vegetable: { fr: 'Légumes', en: 'Vegetables' },
  meat: { fr: 'Viandes', en: 'Meat' },
  seafood: { fr: 'Poissons', en: 'Seafood' },
  dairy: { fr: 'Laitages', en: 'Dairy' },
  protein: { fr: 'Protéines', en: 'Protein' },
  carbs: { fr: 'Féculents', en: 'Carbs' },
  fruit: { fr: 'Fruits', en: 'Fruits' },
  herbs: { fr: 'Herbes', en: 'Herbs' },
  condiments: { fr: 'Sauces', en: 'Sauces' },
  nuts: { fr: 'Noix', en: 'Nuts' },
  others: { fr: 'Autres', en: 'Others' },
}

// GET /api/search - Search ingredients (no database required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.toLowerCase() || ''

    if (q.length < 1) {
      return NextResponse.json({ results: [] })
    }

    // Search ingredients locally (no database needed)
    const ingredientResults = ingredientDatabase
      .filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.nameEn?.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      )
      .slice(0, 15)
      .map(item => ({
        id: item.id,
        name: item.name,
        nameEn: item.nameEn,
        type: 'ingredient' as const,
        emoji: item.emoji,
        category: item.category,
        categoryLabel: categoryLabels[item.category] || { fr: item.category, en: item.category }
      }))

    return NextResponse.json({ 
      results: ingredientResults,
      total: ingredientResults.length 
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 })
  }
}
