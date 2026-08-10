// ============================================================
// refreshments-data.js — EDIT THIS FILE to add, remove, or reprice
// snacks and drinks. Each item can have one or more `sizes`;
// each size has its own price.
// ============================================================

const refreshments = [
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
    id: "browniesundae",
    name: "Brownie Sundae",
    icon: "🍨",
    description: "Warm brownie, cold ice cream",
    sizes: [{ id: "regular", label: "Regular", price: 160 }],
  },
];

export { refreshments };
