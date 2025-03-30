export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Dish {
  _id: string;
  name: string;
  photo: string;
  price: number;
  ingredients: Ingredient[];
  created_at?: string;
  updated_at?: string;
}

export interface Menu {
  _id: string;
  name: string;
  description: string;
  dishes: Dish[];
  created_at?: string;
  updated_at?: string;
}

export interface OptimizationResult {
  daily_specials: {
    dish: Dish;
    cost: number;
    profit: number;
  }[];
  cost_optimizations: {
    dish: Dish;
    original_cost: number;
    optimized_cost: number;
    savings: number;
  }[];
  new_dishes: {
    name: string;
    ingredients: Ingredient[];
    estimated_cost: number;
    estimated_profit: number;
  }[];
} 