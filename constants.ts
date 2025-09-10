
import type { UserSettings } from './types';

export const APP_NAME = 'GlucoSnap AI';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  a1cTarget: 6.5,
  calorieTarget: 2000,
};

export const A1C_ZONES = {
  goal: { max: 6.5, color: '#10B981' }, // Green-500
  near: { max: 7.5, color: '#F59E0B' }, // Amber-500
  high: { max: Infinity, color: '#EF4444' }, // Red-500
};
