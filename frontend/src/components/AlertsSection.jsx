import { AlertTriangle, AlertCircle } from 'lucide-react';

export function AlertsSection({ alerts }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-gray-900 mb-4">Recent Alerts</h3>
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No alerts at this time</p>
            <p className="text-gray-400">All systems normal</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-2 ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {alert.severity === 'critical' ? (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-white ${
                        alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                    >
                      {alert.sensor}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        alert.severity === 'critical'
                          ? 'bg-red-200 text-red-700'
                          : 'bg-yellow-200 text-yellow-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p
                    className={
                      alert.severity === 'critical' ? 'text-red-900' : 'text-yellow-900'
                    }
                  >
                    {alert.message}
                  </p>
                  <p
                    className={`mt-1 ${
                      alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`}
                  >
                    {alert.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
