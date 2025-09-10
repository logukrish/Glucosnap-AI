import React, { useState } from 'react';
import type { HealthData } from '../hooks/useHealthData';
import { A1cChart } from './A1cChart';

interface A1cLogProps {
  healthData: HealthData;
}

export const A1cLog: React.FC<A1cLogProps> = ({ healthData }) => {
  const { a1cReadings, addA1cReading, settings } = healthData;
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (!numericValue || numericValue <= 0 || numericValue > 25) {
      alert('Please enter a valid HbA1c value (e.g., 4.0 to 25.0).');
      return;
    }
    setIsSaving(true);
    try {
        await addA1cReading({ value: numericValue, date: new Date(date).toISOString(), notes });
        setValue('');
        setNotes('');
        setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
        console.error("Failed to save A1c reading:", error);
        alert("There was an error saving your reading. Please try again.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold text-gray-900">HbA1c History</h1>
        <p className="mt-1 text-gray-600">Track your long-term glucose control.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">HbA1c Trend</h2>
        <A1cChart readings={a1cReadings} target={settings.a1cTarget} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Reading</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="a1c-value" className="block text-sm font-medium text-gray-700">HbA1c Value (%)</label>
              <input
                type="number"
                id="a1c-value"
                step="0.1"
                min="3"
                max="25"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label htmlFor="a1c-date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="a1c-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 [color-scheme:dark]"
                required
              />
            </div>
             <div>
              <label htmlFor="a1c-notes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea
                id="a1c-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400"
                placeholder="e.g., Lab test result, feeling great!"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Reading'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Readings</h2>
          <div className="space-y-3 h-96 overflow-y-auto pr-2">
            {a1cReadings.length > 0 ? (
              a1cReadings.map(r => (
                <div key={r.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-blue-700">{r.value}%</span>
                    <span className="text-sm text-gray-500">{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                  {r.notes && <p className="text-sm text-gray-600 mt-1">{r.notes}</p>}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No readings yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};