import type { A1cReading, Meal, MealItem } from '../types';

// Seed data for demonstration purposes if localStorage is empty
const SEED_A1C_READINGS: A1cReading[] = [
  { id: '1', value: 7.8, date: new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Annual check-up' },
  { id: '2', value: 7.2, date: new Date(Date.now() - 290 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Follow-up test' },
  { id: '3', value: 6.9, date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Feeling better' },
  { id: '4', value: 6.6, date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), notes: 'On track' },
  { id: '5', value: 6.4, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Goal achieved!' },
];

const SEED_MEALS: Meal[] = [
    {
        id: 'm1',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{ name: 'Grilled Chicken Salad', calories: 450, carbs: 20, protein: 40, fat: 25 }],
        totalCalories: 450, totalCarbs: 20, totalProtein: 40, totalFat: 25,
    },
    {
        id: 'm2',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{ name: 'Oatmeal with Berries', calories: 350, carbs: 60, protein: 10, fat: 8 }],
        totalCalories: 350, totalCarbs: 60, totalProtein: 10, totalFat: 8,
    },
     {
        id: 'm3',
        date: new Date().toISOString(),
        items: [{ name: 'Salmon with Quinoa', calories: 550, carbs: 40, protein: 45, fat: 25 }, { name: 'Steamed Broccoli', calories: 50, carbs: 10, protein: 5, fat: 1 }],
        totalCalories: 600, totalCarbs: 50, totalProtein: 50, totalFat: 26,
    }
];

const A1C_STORAGE_KEY = 'gluco_snap_a1c';
const MEALS_STORAGE_KEY = 'gluco_snap_meals';

// --- A1c API ---

export const getA1cReadings = async (): Promise<A1cReading[]> => {
    try {
        const data = localStorage.getItem(A1C_STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        } else {
            // If no data, initialize with seed data
            localStorage.setItem(A1C_STORAGE_KEY, JSON.stringify(SEED_A1C_READINGS));
            return SEED_A1C_READINGS;
        }
    } catch (error) {
        console.error("Failed to fetch A1c readings:", error);
        return [];
    }
};

export const saveA1cReading = async (reading: Omit<A1cReading, 'id'>): Promise<A1cReading> => {
    const newReading = { ...reading, id: new Date().toISOString() };
    const allReadings = await getA1cReadings();
    const updatedReadings = [...allReadings, newReading];
    localStorage.setItem(A1C_STORAGE_KEY, JSON.stringify(updatedReadings));
    return newReading;
};


// --- Meals API ---

export const getMeals = async (): Promise<Meal[]> => {
     try {
        const data = localStorage.getItem(MEALS_STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        } else {
            // If no data, initialize with seed data
            localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(SEED_MEALS));
            return SEED_MEALS;
        }
    } catch (error) {
        console.error("Failed to fetch meals:", error);
        return [];
    }
};

export const saveMeal = async (mealData: { photo?: string; items: MealItem[] }): Promise<Meal> => {
    const totals = mealData.items.reduce((acc, item) => ({
        totalCalories: acc.totalCalories + (item.calories || 0),
        totalProtein: acc.totalProtein + (item.protein || 0),
        totalCarbs: acc.totalCarbs + (item.carbs || 0),
        totalFat: acc.totalFat + (item.fat || 0),
    }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });

    const newMeal: Meal = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        photo: mealData.photo,
        items: mealData.items,
        ...totals
    };

    const allMeals = await getMeals();
    const updatedMeals = [newMeal, ...allMeals];
    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
    return newMeal;
};