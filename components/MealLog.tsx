import React, { useState, useCallback } from 'react';
import { analyzeMealPhoto } from '../services/geminiService';
import type { HealthData } from '../hooks/useHealthData';
import type { MealItem, View } from '../types';
import { CameraIcon, SparklesIcon, TrashIcon, ArrowUturnLeftIcon } from './icons';

interface MealLogProps {
  healthData: HealthData;
  setView: (view: View) => void;
}

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

export const MealLog: React.FC<MealLogProps> = ({ healthData, setView }) => {
  const [image, setImage] = useState<{file: File, preview: string} | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MealItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage({file: file, preview: URL.createObjectURL(file)});
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    try {
      const base64 = await toBase64(image.file);
      const result = await analyzeMealPhoto(base64, image.file.type);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [image]);

  const handleSaveMeal = async () => {
    if (!analysisResult || !analysisResult.length) return;
    setIsSaving(true);
    try {
        await healthData.addMeal({ photo: image?.preview, items: analysisResult });
        // Reset state and navigate to history to see the new entry
        setImage(null);
        setAnalysisResult(null);
        setView('history');
    } catch(err) {
        console.error("Failed to save meal:", err);
        setError("Could not save the meal. Please try again.");
    } finally {
        setIsSaving(false);
    }
  };

  const resetState = () => {
    setImage(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  }

  const handleItemChange = (index: number, field: keyof MealItem, value: string) => {
    if (!analysisResult) return;
    const updatedItems = [...analysisResult];
    const numericValue = parseFloat(value);
    updatedItems[index] = { ...updatedItems[index], [field]: isNaN(numericValue) ? value : numericValue };
    setAnalysisResult(updatedItems);
  };
  
  const removeItem = (index: number) => {
    if (!analysisResult) return;
    setAnalysisResult(analysisResult.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Log a Meal</h1>
        <p className="mt-1 text-gray-600">Upload a photo and let AI analyze your food.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        {!image && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <CameraIcon className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Upload a photo of your meal</h3>
            <p className="text-gray-500 mt-1">We'll identify the items and estimate nutrition.</p>
            <input
              type="file"
              accept="image/*"
              id="meal-photo-upload"
              className="sr-only"
              onChange={handleFileChange}
            />
            <label htmlFor="meal-photo-upload" className="mt-6 cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-md font-semibold shadow-sm hover:bg-blue-700 transition-colors">
              Choose Image
            </label>
          </div>
        )}

        {image && !analysisResult && (
          <div className="text-center space-y-4">
            <img src={image.preview} alt="Meal preview" className="max-h-80 w-auto mx-auto rounded-lg shadow-lg" />
            {isLoading ? (
                 <div className="flex flex-col items-center justify-center pt-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-lg text-gray-600 font-semibold">Analyzing your meal...</p>
                    <p className="text-sm text-gray-500">This may take a moment.</p>
                </div>
            ) : (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <button onClick={resetState} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                        <ArrowUturnLeftIcon className="h-5 w-5"/> Change Photo
                    </button>
                    <button onClick={handleAnalyze} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md font-semibold shadow-sm hover:bg-blue-700 transition-colors">
                         <SparklesIcon className="h-5 w-5"/> Analyze with AI
                    </button>
                </div>
            )}
          </div>
        )}

        {error && <p className="text-red-600 text-center font-medium">{error}</p>}
        
        {analysisResult && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center">Review Your Meal</h2>
                <div className="space-y-4">
                    {analysisResult.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border flex flex-col sm:flex-row gap-4 items-start">
                            <div className="flex-grow grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <input value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="col-span-2 sm:col-span-1 p-2 border rounded bg-gray-700 text-white border-gray-600 placeholder-gray-400" placeholder="Item Name"/>
                                <input type="number" value={item.calories} onChange={e => handleItemChange(index, 'calories', e.target.value)} className="p-2 border rounded bg-gray-700 text-white border-gray-600 placeholder-gray-400" placeholder="Calories"/>
                                <input type="number" value={item.protein} onChange={e => handleItemChange(index, 'protein', e.target.value)} className="p-2 border rounded bg-gray-700 text-white border-gray-600 placeholder-gray-400" placeholder="Protein (g)"/>
                                <input type="number" value={item.carbs} onChange={e => handleItemChange(index, 'carbs', e.target.value)} className="p-2 border rounded bg-gray-700 text-white border-gray-600 placeholder-gray-400" placeholder="Carbs (g)"/>
                                <input type="number" value={item.fat} onChange={e => handleItemChange(index, 'fat', e.target.value)} className="p-2 border rounded bg-gray-700 text-white border-gray-600 placeholder-gray-400" placeholder="Fat (g)"/>
                            </div>
                            <button onClick={() => removeItem(index)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors self-start sm:self-center">
                                <TrashIcon className="h-5 w-5"/>
                            </button>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-center items-center gap-4 pt-4">
                    <button onClick={resetState} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                        <ArrowUturnLeftIcon className="h-5 w-5"/> Start Over
                    </button>
                    <button onClick={handleSaveMeal} disabled={isSaving} className="px-6 py-2 bg-green-600 text-white rounded-md font-semibold shadow-sm hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed">
                        {isSaving ? 'Saving...' : 'Save Meal'}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};