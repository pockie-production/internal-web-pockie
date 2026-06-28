import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SimpleLineChartProps {
  title: string;
  data: any[];
  dataKey: string;
  nameKey: string;
  stroke?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ title, data, dataKey, nameKey, stroke = '#3b82f6' }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-[400px] flex flex-col">
      <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6">{title}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
