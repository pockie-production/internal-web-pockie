import React from 'react';
import { Search, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const env = import.meta.env.VITE_APP_ENV || 'DEV';

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex-1 flex items-center max-w-xl">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search users, campaigns, vouchers..."
          />
        </div>
      </div>
      <div className="ml-6 flex items-center space-x-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {env}
        </span>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.profile?.displayName || user?.profile?.fullName || user?.email}
            </p>
            <p className="text-xs text-gray-500">{user?.roles?.[0]}</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
