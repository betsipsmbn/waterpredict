import { useState } from 'react';
import { Droplets, User, LogOut, ChevronDown } from 'lucide-react';

export function Header({ user, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">Water Quality Monitor</h1>
            <p className="text-gray-500">Real-time IoT Dashboard</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-gray-900">{user.username}</p>
              <p className="text-gray-500 capitalize">{user.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
