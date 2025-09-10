
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { A1cLog } from './components/A1cLog';
import { MealLog } from './components/MealLog';
import { History } from './components/History';
import { useHealthData } from './hooks/useHealthData';
import type { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  // FIX: The `healthData` object was missing the `isLoading` property because it was destructured.
  // This caused a type mismatch when passing `healthData` to child components which expect the full `HealthData` type.
  // The fix is to use the full object returned by `useHealthData` and access `isLoading` from it.
  const healthData = useHealthData();

  const renderView = () => {
    if (healthData.isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-lg text-gray-700">Loading your health data...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard healthData={healthData} setView={setCurrentView} />;
      case 'a1c':
        return <A1cLog healthData={healthData} />;
      case 'meal':
        return <MealLog healthData={healthData} setView={setCurrentView} />;
      case 'history':
        return <History healthData={healthData} />;
      default:
        return <Dashboard healthData={healthData} setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header currentView={currentView} setView={setCurrentView} />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {renderView()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>&copy; 2024 GlucoSnap AI. This is not medical advice. Consult a healthcare professional.</p>
      </footer>
    </div>
  );
};

export default App;
