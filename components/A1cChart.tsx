
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import type { A1cReading } from '../types';
import { A1C_ZONES } from '../constants';

interface A1cChartProps {
  readings: A1cReading[];
  target: number;
}

type TimeView = '3m' | '6m' | '1y' | 'all';

export const A1cChart: React.FC<A1cChartProps> = ({ readings, target }) => {
  const [timeView, setTimeView] = useState<TimeView>('1y');

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    switch (timeView) {
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // A very early date
        break;
    }

    return readings
      .filter(r => new Date(r.date) >= startDate)
      .map(r => ({
        ...r,
        date: new Date(r.date).getTime(),
      }))
      .sort((a, b) => a.date - b.date);
  }, [readings, timeView]);

  const yDomain = useMemo(() => {
    if (filteredData.length === 0) return [4, 10];
    const values = filteredData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return [Math.floor(min - 1), Math.ceil(max + 1)];
  }, [filteredData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-bold">{`Value: ${payload[0].value}%`}</p>
          <p className="text-sm text-gray-600">{`Date: ${new Date(label).toLocaleDateString()}`}</p>
        </div>
      );
    }
    return null;
  };
  
  const TimeViewButton: React.FC<{view: TimeView, label: string}> = ({view, label}) => (
      <button 
        className={`px-3 py-1 text-sm rounded-md transition-colors ${timeView === view ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        onClick={() => setTimeView(view)}
        >
            {label}
        </button>
  );

  return (
    <div>
        <div className="flex justify-end gap-2 mb-4">
            <TimeViewButton view="3m" label="3M" />
            <TimeViewButton view="6m" label="6M" />
            <TimeViewButton view="1y" label="1Y" />
            <TimeViewButton view="all" label="All" />
        </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
            <XAxis
              dataKey="date"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis domain={yDomain} stroke="#6b7280" tick={{ fontSize: 12 }} label={{ value: 'HbA1c (%)', angle: -90, position: 'insideLeft', offset: 10, fill: '#374151' }}/>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
            
            <ReferenceArea y1={0} y2={A1C_ZONES.goal.max} fill={A1C_ZONES.goal.color} fillOpacity={0.1} label={{ value: "In Target", position: "insideTopLeft", fill: A1C_ZONES.goal.color, fontSize: 12, dy: 10, dx: 10 }} />
            <ReferenceArea y1={A1C_ZONES.goal.max} y2={A1C_ZONES.near.max} fill={A1C_ZONES.near.color} fillOpacity={0.1} label={{ value: "Near Target", position: "insideTopLeft", fill: A1C_ZONES.near.color, fontSize: 12, dy: 10, dx: 10 }}/>
            <ReferenceArea y1={A1C_ZONES.near.max} y2={25} fill={A1C_ZONES.high.color} fillOpacity={0.1} label={{ value: "High", position: "insideTopLeft", fill: A1C_ZONES.high.color, fontSize: 12, dy: 10, dx: 10 }}/>

            <Line type="monotone" dataKey="value" name="HbA1c" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, fill: "#3B82F6" }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
