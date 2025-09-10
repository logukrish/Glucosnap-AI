
export interface A1cReading {
  id: string;
  value: number;
  date: string; // ISO string
  notes?: string;
}

export interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  photo?: string; // base64 data URL
  items: MealItem[];
  date: string; // ISO string
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface UserSettings {
  a1cTarget: number;
  calorieTarget: number;
}

export type View = 'dashboard' | 'a1c' | 'meal' | 'history';
