import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, TrendingUp, Tag, Landmark, Megaphone, BarChart3, ShieldAlert, Gamepad2 } from 'lucide-react';
import { trackInternalEvent } from '../../lib/analytics';

const MENU_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/ekyc-review', label: 'eKYC Review', icon: UserCheck },
  { path: '/trends', label: 'Trends', icon: TrendingUp },
  { path: '/vouchers', label: 'Vouchers', icon: Tag },
  { path: '/banks', label: 'Banks', icon: Landmark },
  { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { path: '/gamification', label: 'Gamification', icon: Gamepad2 },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/audit-logs', label: 'Audit Logs', icon: ShieldAlert },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-gray-800">Pockie Internal</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => trackInternalEvent({
                eventName: 'sidebar_navigation_click',
                page: location.pathname,
                feature: 'internal_dashboard',
                payload: { targetPath: item.path, label: item.label },
              })}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
