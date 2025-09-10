
import React from 'react';
import type { HealthData } from '../hooks/useHealthData';
import type { View } from '../types';
import { CameraIcon, PlusIcon, SparklesIcon } from './icons';

interface DashboardProps {
  healthData: HealthData;
  setView: (view: View) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; unit: string; icon: React.ReactNode; }> = ({ title, value, unit, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-start space-x-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500">{unit}</p>
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ healthData, setView }) => {
  const { todaysCalorieIntake, settings, latestA1c } = healthData;
  const caloriesRemaining = settings.calorieTarget - todaysCalorieIntake;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Welcome Back!</h1>
        <p className="mt-2 text-lg text-gray-600">Here's your health summary for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard 
            title="Calories Consumed Today" 
            value={todaysCalorieIntake} 
            unit={`of ${settings.calorieTarget} kcal`}
            icon={<SparklesIcon className="h-6 w-6"/>}
          />
          <StatCard 
            title="Latest HbA1c" 
            value={latestA1c ? latestA1c.value : 'N/A'} 
            unit={`% (Target: <${settings.a1cTarget}%)`}
            icon={<span className="font-bold text-xl">A1c</span>}
          />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          onClick={() => setView('meal')}
          className="group flex flex-col items-center justify-center p-6 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1"
        >
          <CameraIcon className="h-12 w-12 mb-3 text-blue-200 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-semibold">Log Meal with Photo</span>
          <span className="text-sm text-blue-100">Use AI to analyze your food</span>
        </button>
        <button
          onClick={() => setView('a1c')}
          className="group flex flex-col items-center justify-center p-6 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-md hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
        >
          <PlusIcon className="h-12 w-12 mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="text-xl font-semibold">Add New A1c Reading</span>
          <span className="text-sm text-gray-500">Keep your log up to date</span>
        </button>
      </div>
    </div>
  );
};
