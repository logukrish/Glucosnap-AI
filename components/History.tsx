import React, { useMemo } from 'react';
import type { HealthData } from '../hooks/useHealthData';
import type { Meal, A1cReading } from '../types';
import { ChartBarIcon, SparklesIcon } from './icons';

interface HistoryProps {
  healthData: HealthData;
}

// Fix: Redefined HistoryItem as a discriminated union for proper type narrowing.
type HistoryItem = (Meal & { type: 'meal' }) | (A1cReading & { type: 'a1c' });

export const History: React.FC<HistoryProps> = ({ healthData }) => {
  const { meals, a1cReadings } = healthData;

  const combinedHistory = useMemo(() => {
    const mealHistory: HistoryItem[] = meals.map(m => ({ ...m, type: 'meal' }));
    const a1cHistory: HistoryItem[] = a1cReadings.map(r => ({ ...r, type: 'a1c' }));
    
    return [...mealHistory, ...a1cHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meals, a1cReadings]);
  
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Date,Value,Units,Items,Calories,Protein(g),Carbs(g),Fat(g),Notes\r\n";
    
    combinedHistory.forEach(item => {
        const date = new Date(item.date).toLocaleString();
        if (item.type === 'a1c') {
            const row = `A1c,${date},${item.value},%,,,,,"${item.notes || ''}"`;
            csvContent += row + "\r\n";
        } else {
            const items = item.items.map(i => i.name).join('; ');
            const row = `Meal,${date},,,,${item.totalCalories},${item.totalProtein},${item.totalCarbs},${item.totalFat},"${items}"`;
            csvContent += row + "\r\n";
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gluco_snap_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Log History</h1>
            <p className="mt-1 text-gray-600">A complete timeline of your logged data.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-green-700 transition-colors"
        >
          Export to CSV
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md space-y-4">
        {combinedHistory.length > 0 ? (
          combinedHistory.map(item => (
            <div key={`${item.type}-${item.id}`} className="p-4 border border-gray-200 rounded-lg">
              {item.type === 'a1c' && (
                <div className="flex items-start space-x-4">
                    <div className="bg-red-100 text-red-600 p-3 rounded-full"><ChartBarIcon className="h-6 w-6"/></div>
                    <div>
                        <p className="font-bold text-lg text-gray-800">HbA1c Reading: {item.value}%</p>
                        <p className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</p>
                        {item.notes && <p className="mt-1 text-sm text-gray-600 italic">"{item.notes}"</p>}
                    </div>
                </div>
              )}
              {item.type === 'meal' && (
                <div className="flex items-start space-x-4">
                    {item.photo ? (
                        <img src={item.photo} alt="Meal" className="h-20 w-20 rounded-md object-cover"/>
                    ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-blue-100 text-blue-600 rounded-md">
                            <SparklesIcon className="h-8 w-8"/>
                        </div>
                    )}
                    <div className="flex-grow">
                        <p className="font-bold text-lg text-gray-800">Meal Logged</p>
                        <p className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</p>
                        <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                           {item.items.map((food, idx) => <li key={idx}>{food.name} ({food.calories} kcal)</li>)}
                        </ul>
                         <div className="mt-2 text-xs grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-gray-600">
                            <span><b>Calories:</b> {item.totalCalories}</span>
                            <span><b>Protein:</b> {item.totalProtein}g</span>
                            <span><b>Carbs:</b> {item.totalCarbs}g</span>
                            <span><b>Fat:</b> {item.totalFat}g</span>
                        </div>
                    </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">Your history is empty. Start by logging a meal or an A1c reading.</p>
        )}
      </div>
    </div>
  );
};