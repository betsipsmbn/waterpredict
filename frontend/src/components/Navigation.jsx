import { LayoutDashboard, Activity, Bell, Settings, Users } from 'lucide-react';

export function Navigation({ user, currentPage, onNavigate }) {
  //console.log('Navigation - User role:', user.role); // Debug log
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'sensors', label: 'Sensor Data', icon: Activity, adminOnly: false },
    { id: 'alerts', label: 'Alerts', icon: Bell, adminOnly: false },
    { id: 'settings', label: 'Settings', icon: Settings, adminOnly: false },
    { id: 'users', label: 'User Management', icon: Users, adminOnly: true },
  ];

  return (
    <nav className="bg-white w-64 border-r border-gray-200 min-h-screen p-4">
      <div className="space-y-2">
        {menuItems.map((item) => {
          if (item.adminOnly && user.role !== 'admin') return null;
          
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
