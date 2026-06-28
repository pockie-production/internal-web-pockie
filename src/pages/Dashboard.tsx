import { useAuthStore } from '../store/authStore';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-primary-600">Pockie Internal</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-slate-700">
                  <UserIcon className="w-4 h-4 mr-2" />
                  {user?.profile?.fullName || user?.email}
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                    {user?.roles?.[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-slate-200 rounded-lg h-96 flex items-center justify-center bg-white">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
              <p className="mt-2 text-slate-500">
                Chào mừng bạn đến với Pockie Internal Console.<br />
                Giao diện tính năng sẽ được cập nhật sau.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
