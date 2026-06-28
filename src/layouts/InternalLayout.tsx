import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../shared/components/Sidebar';
import { Topbar } from '../shared/components/Topbar';

export const InternalLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#F7F8FA] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
