import { useState, useMemo, useEffect } from 'react';
import type { A1cReading, Meal, MealItem, UserSettings } from '../types';
import { DEFAULT_USER_SETTINGS } from '../constants';
import * as api from '../services/api';

export const useHealthData = () => {
  const [a1cReadings, setA1cReadings] = useState<A1cReading[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [settings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from the "backend" (localStorage) on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [fetchedA1c, fetchedMeals] = await Promise.all([
            api.getA1cReadings(),
            api.getMeals()
        ]);
        setA1cReadings(fetchedA1c);
        setMeals(fetchedMeals);
      } catch (error) {
          console.error("Failed to load health data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addA1cReading = async (reading: Omit<A1cReading, 'id'>) => {
    const newReading = await api.saveA1cReading(reading);
    setA1cReadings(prev => [...prev, newReading].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const addMeal = async (mealData: { photo?: string; items: MealItem[] }) => {
    const newMeal = await api.saveMeal(mealData);
    setMeals(prev => [newMeal, ...prev]);
  };

  const todaysMeals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return meals.filter(meal => new Date(meal.date) >= today);
  }, [meals]);

  const todaysCalorieIntake = useMemo(() => {
    return todaysMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  }, [todaysMeals]);

  const latestA1c = useMemo(() => {
    return [...a1cReadings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
  }, [a1cReadings]);
  
  const allReadings = useMemo(() => {
    return [...a1cReadings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [a1cReadings]);

  const allMeals = useMemo(() => {
    return [...meals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meals]);

  return {
    a1cReadings: allReadings,
    meals: allMeals,
    settings,
    addA1cReading,
    addMeal,
    todaysCalorieIntake,
    latestA1c,
    isLoading,
  };
};

export type HealthData = ReturnType<typeof useHealthData>;