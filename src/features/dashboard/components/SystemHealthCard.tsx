import React from 'react';
import type { SystemHealth } from '../dashboard.types';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface SystemHealthCardProps {
  data: SystemHealth;
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-base font-semibold leading-6 text-gray-900">System Health</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.services.map((service) => (
            <div key={service.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
              <div className="flex items-center space-x-3">
                {service.status === 'OK' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {service.status === 'DEGRADED' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                {service.status === 'DOWN' && <XCircle className="h-5 w-5 text-red-500" />}
                {service.status === 'UNKNOWN' && <HelpCircle className="h-5 w-5 text-gray-400" />}
                <div>
                  <p className="text-sm font-medium text-gray-900">{service.label}</p>
                  <p className="text-xs text-gray-500">{service.message}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">{service.latencyMs}</span>
                <span className="text-xs text-gray-500 ml-1">ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
