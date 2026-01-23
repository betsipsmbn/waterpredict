import { Droplet, Activity, Thermometer, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function SensorCard({ title, value, unit, icon, status, trend }) {
  const IconComponent = icon === 'droplet' ? Droplet : icon === 'activity' ? Activity : Thermometer;
  const TrendIcon = trend === 'increasing' ? TrendingUp : trend === 'decreasing' ? TrendingDown : Minus;

  const statusColors = {
    normal: 'bg-green-50 text-green-600 border-green-200',
    warning: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    critical: 'bg-red-50 text-red-600 border-red-200',
  };

  const iconColors = {
    normal: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    critical: 'bg-red-100 text-red-600',
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 p-6 ${statusColors[status]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconColors[status]}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <TrendIcon className="w-4 h-4" />
        </div>
      </div>
      
      <div>
        <p className="text-gray-600 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-gray-900">{value}</span>
          {unit && <span className="text-gray-600">{unit}</span>}
        </div>
        <div className="mt-2">
          <span className={`inline-block px-2 py-1 rounded text-white ${
            status === 'normal' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            {status === 'normal' ? 'Normal' : status === 'warning' ? 'Warning' : 'Critical'}
          </span>
        </div>
      </div>
    </div>
  );
}
