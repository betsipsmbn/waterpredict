import { Download, FileSpreadsheet, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { exportToCSV, exportToExcel } from '../utils/exportData';

export function SensorLogsTable({ logs }) {
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const getStatusBadge = (status) => {
    const colors = {
      normal: 'bg-green-100 text-green-700',
      'Normal': 'bg-green-100 text-green-700',
      'tidak layak': 'bg-red-100 text-red-700',
      'Tidak Layak': 'bg-red-100 text-red-700',
      // Keep legacy statuses for backward compatibility
      warning: 'bg-yellow-100 text-yellow-700',
      critical: 'bg-red-100 text-red-700',
    };

    const displayStatus = status === 'normal' || status === 'Normal' ? 'Normal' : 
                         status === 'tidak layak' || status === 'Tidak Layak' ? 'Tidak Layak' : 
                         status;

    return (
      <span className={`px-3 py-1 rounded-full ${colors[status] || colors['normal']}`}>
        {displayStatus}
      </span>
    );
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(log => {
        const logStatus = (log.status || 'Normal').trim();
        const filterStatus = selectedStatus.trim();
        
        // Handle case variations and normalize status
        const normalizedLogStatus = logStatus.toLowerCase() === 'normal' ? 'Normal' : 
                                   logStatus.toLowerCase() === 'tidak layak' ? 'Tidak Layak' : 
                                   logStatus;
        
        return normalizedLogStatus === filterStatus;
      });
    }

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate + 'T23:59:59') : null;

        if (start && logDate < start) return false;
        if (end && logDate > end) return false;
        return true;
      });
    }

    return filtered;
  };

  const filteredLogs = filterLogs();

  const handleExportCSV = () => {
    exportToCSV(filteredLogs, `sensor-logs-${startDate || 'all'}-to-${endDate || 'all'}.csv`);
  };

  const handleExportExcel = () => {
    exportToExcel(filteredLogs, `sensor-logs-${startDate || 'all'}-to-${endDate || 'all'}.xlsx`);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedStatus('all');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900">Sensor Logs</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Normal">Normal</option>
                  <option value="Tidak Layak">Tidak Layak</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing {filteredLogs.length} of {logs.length} logs
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Timestamp</th>
              <th className="px-6 py-3 text-left text-gray-700">pH</th>
              <th className="px-6 py-3 text-left text-gray-700">TDS</th>
              <th className="px-6 py-3 text-left text-gray-700">Temperature</th>
              <th className="px-6 py-3 text-left text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-gray-700">Suggest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-600">{log.timestamp}</td>
                <td className="px-6 py-4 text-gray-900">{log.pH}</td>
                <td className="px-6 py-4 text-gray-900">{log.tds} ppm</td>
                <td className="px-6 py-4 text-gray-900">{log.temperature} °C</td>
                <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={log.suggest}>
                  {log.suggest || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
