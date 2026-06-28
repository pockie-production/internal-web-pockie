import React from 'react';
import type { ActionQueueItem } from '../dashboard.types';
import { Link } from 'react-router-dom';

interface ActionQueueCardProps {
  title: string;
  items: ActionQueueItem[];
}

export const ActionQueueCard: React.FC<ActionQueueCardProps> = ({ title, items }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-base font-semibold leading-6 text-gray-900">{title}</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500 text-sm">All caught up! No items in queue.</li>
          ) : (
            items.map((item) => (
              <li key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                    {item.severity && (
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        item.severity === 'warning' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                        item.severity === 'danger' ? 'bg-red-50 text-red-800 ring-red-600/20' :
                        item.severity === 'success' ? 'bg-green-50 text-green-800 ring-green-600/20' :
                        'bg-blue-50 text-blue-800 ring-blue-600/20'
                      }`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    )}
                    <Link
                      to={item.actionHref}
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      {item.actionLabel}
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};
