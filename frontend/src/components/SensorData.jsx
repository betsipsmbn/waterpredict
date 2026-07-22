import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { SensorLogsTable } from './SensorLogsTable';

export function SensorData({ user, onLogout, onNavigate }) {
  const [sensorLogs, setSensorLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch sensor logs with optional filters
  const fetchSensorLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/ListDataSensor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        // Convert to component format - one row per timestamp with all sensor values
        const formattedLogs = result.data.map((item, index) => ({
          id: `log-${index}`,
          timestamp: item.water_timestamp ? new Date(item.water_timestamp).toLocaleString() : null,
          pH: Number(item.water_ph).toFixed(2),
          tds: Number(item.water_tds).toFixed(0),
          temperature: Number(item.water_suhu).toFixed(1),
          status: item.water_status || 'normal',
          suggest: item.water_suggest || ''
        }));
        
        setSensorLogs(formattedLogs);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching sensor logs:', error);
      setError(error.message);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchSensorLogs();
  }, []);

  // Auto-refresh sensor logs every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSensorLogs();
    }, 600000); // Refresh every 10 minutes

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchSensorLogs();
  };

  return (
    <div className="flex min-h-screen">
      <Navigation user={user} currentPage="sensors" onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sensor Data</h1>
                <p className="text-gray-600">Historical sensor readings and logs</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoadingLogs}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg 
                  className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                {isLoadingLogs ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">
                  Unable to fetch sensor data. {error}
                </span>
                <button 
                  onClick={() => {setError(null); fetchSensorLogs();}}
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  <span className="sr-only">Retry</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                    <p className="text-2xl font-semibold text-gray-900">{sensorLogs.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Normal</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {sensorLogs.filter(log => log.status === 'Normal').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tidak Normal</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {sensorLogs.filter(log => log.status === 'Tidak Normal').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Critical Status</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {sensorLogs.filter(log => log.status === 'critical').length}
                    </p>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Sensor Logs Table */}
            {isLoadingLogs ? (
              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading sensor logs...</span>
              </div>
            ) : (
              <SensorLogsTable logs={sensorLogs} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}