import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { MetricValue } from '../dashboard.types';

interface MetricCardProps {
  title: string;
  metric?: MetricValue;
  description?: string;
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, metric, description, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  const { value = 0, deltaPercent = 0, deltaLabel = '' } = metric || {};
  const isPositive = deltaPercent >= 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
      {(deltaPercent !== 0 || deltaLabel) && (
        <div className="mt-2 flex items-center text-sm">
          {deltaPercent !== 0 && (
            <span className={`inline-flex items-center font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4" /> : <ArrowDownRight className="self-center flex-shrink-0 h-4 w-4" />}
              {Math.abs(deltaPercent)}%
            </span>
          )}
          <span className="ml-2 text-gray-500">{deltaLabel}</span>
        </div>
      )}
      {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
    </div>
  );
};
