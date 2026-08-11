// ============================================================
// refreshments-data.js — EDIT THIS FILE to add, remove, or reprice
// snacks and drinks. Each item can have one or more `sizes`;
// each size has its own price.
// ============================================================

const refreshments = [
  // -------------------- POPCORN --------------------
  {
    id: "popcorn",
    name: "Classic Popcorn",
    icon: "🍿",
    description: "Perfect movie companion",
    sizes: [
      { id: "regular", label: "Regular", price: 120 },
      { id: "large", label: "Large", price: 180 },
    ],
  },

  // -------------------- CHIPS & PACKAGED SNACKS --------------------
  {
    id: "lays",
    name: "Lay's Classic Salted",
    icon: "🥔",
    description: "Crispy, salty and crunchy",
    sizes: [
      { id: "small", label: "Small", price: 20 },
      { id: "large", label: "Large", price: 50 },
    ],
  },
  {
    id: "kurkure",
    name: "Kurkure Masala Munch",
    icon: "🌶️",
    description: "Masaledaar crunchy snack",
    sizes: [
      { id: "small", label: "Small", price: 20 },
      { id: "large", label: "Large", price: 50 },
    ],
  },
  {
    id: "too_yumm",
    name: "Too Yumm! Chips",
    icon: "🥔",
    description: "Crunchy and flavourful",
    sizes: [
      { id: "small", label: "Small", price: 20 },
      { id: "large", label: "Large", price: 50 },
    ],
  },
  {
    id: "aloo_bhujia",
    name: "Aloo Bhujia",
    icon: "🥨",
    description: "Classic spicy Indian snack",
    sizes: [
      { id: "small", label: "Small", price: 30 },
      { id: "large", label: "Large", price: 80 },
    ],
  },

  // -------------------- HOT SNACKS --------------------
  {
    id: "veg_puff",
    name: "Veg Puff Patty",
    icon: "🥐",
    description: "Flaky pastry with spicy veggie filling",
    sizes: [
      { id: "single", label: "1 Piece", price: 50 },
      { id: "double", label: "2 Pieces", price: 90 },
    ],
  },


  // -------------------- INSTANT / COMFORT FOOD --------------------
  {
    id: "maggi",
    name: "Masala Maggi",
    icon: "🍜",
    description: "Hot, spicy and comforting",
    sizes: [
      { id: "regular", label: "Regular", price: 80 },
      { id: "large", label: "Large", price: 120 },
    ],
  },
  {
    id: "cheese_maggi",
    name: "Cheese Maggi",
    icon: "🍜",
    description: "Masala Maggi loaded with cheese",
    sizes: [
      { id: "regular", label: "Regular", price: 110 },
      { id: "large", label: "Large", price: 150 },
    ],
  },

  // -------------------- NACHOS & DIPS --------------------
  {
    id: "nachos",
    name: "Nachos & Cheese",
    icon: "🧀",
    description: "Crisp nachos, warm cheese dip",
    sizes: [
      { id: "regular", label: "Regular", price: 150 },
      { id: "large", label: "Large", price: 210 },
    ],
  },
  {
    id: "nachos_salsa",
    name: "Nachos & Salsa",
    icon: "🌮",
    description: "Crunchy nachos with fresh salsa",
    sizes: [
      { id: "regular", label: "Regular", price: 140 },
      { id: "large", label: "Large", price: 200 },
    ],
  },

  // -------------------- DRINKS --------------------
  {
    id: "coke",
    name: "Coke",
    icon: "🥤",
    description: "Ice-cold and fizzy",
    sizes: [
      { id: "regular", label: "Regular", price: 70 },
      { id: "large", label: "Large", price: 100 },
    ],
  },
  {
    id: "limca",
    name: "Limca",
    icon: "🥤",
    description: "Zesty lime freshness",
    sizes: [
      { id: "regular", label: "Regular", price: 70 },
      { id: "large", label: "Large", price: 100 },
    ],
  },
  {
    id: "sprite",
    name: "Sprite",
    icon: "🥤",
    description: "Cool and refreshing lemon-lime fizz",
    sizes: [
      { id: "regular", label: "Regular", price: 70 },
      { id: "large", label: "Large", price: 100 },
    ],
  },
  {
    id: "fanta",
    name: "Fanta",
    icon: "🥤",
    description: "Sweet and refreshing orange fizz",
    sizes: [
      { id: "regular", label: "Regular", price: 70 },
      { id: "large", label: "Large", price: 100 },
    ],
  },
  {
    id: "coldcoffee",
    name: "Cold Coffee",
    icon: "☕",
    description: "Rich, chilled, and creamy",
    sizes: [
      { id: "regular", label: "Regular", price: 140 },
      { id: "large", label: "Large", price: 190 },
    ],
  },
  {
    id: "masala_chai",
    name: "Masala Chai",
    icon: "☕",
    description: "Hot Indian tea with aromatic spices",
    sizes: [
      { id: "regular", label: "Regular", price: 60 },
      { id: "large", label: "Large", price: 90 },
    ],
  },
  {
    id: "mineral_water",
    name: "Mineral Water",
    icon: "💧",
    description: "Chilled bottled water",
    sizes: [
      { id: "small", label: "500ml", price: 30 },
      { id: "large", label: "1L", price: 50 },
    ],
  },

  // -------------------- SWEETS --------------------

  {
    id: "icecream",
    name: "Ice Cream",
    icon: "🍦",
    description: "Creamy and chilled",
    sizes: [
      { id: "single", label: "1 Scoop", price: 80 },
      { id: "double", label: "2 Scoops", price: 130 },
    ],
  },
  {
    id: "chocolate",
    name: "Chocolate Bar",
    icon: "🍫",
    description: "Perfect little movie-time treat",
    sizes: [
      { id: "regular", label: "Regular", price: 60 },
      { id: "large", label: "Large", price: 120 },
    ],
  },
];

export { refreshments };