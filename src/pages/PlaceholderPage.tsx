import React from 'react';
import { useLocation } from 'react-router-dom';

export const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const title = location.pathname
    .split('/')
    .pop()
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="flex h-[80vh] items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-500 mb-8">
          This module is currently under development. Please check back later.
        </p>
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm">
          Coming Soon
        </div>
      </div>
    </div>
  );
};
