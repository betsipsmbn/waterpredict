import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { SensorCard } from './SensorCard';
import { SensorChart } from './SensorChart';
import { AlertsSection } from './AlertsSection';
import { SensorAnalytics } from './SensorAnalytics';
import { useSettings } from '../context/SettingsContext';
import { sendTelegramNotification, formatAlertMessage } from '../utils/telegramNotifications';

export function MainDashboard({ user, onLogout, onNavigate }) {
  const [currentReadings, setCurrentReadings] = useState({
    pH: 0,
    tds: 0,
    temperature: 0,
    status: '',
    suggest: '',
    timestamp: null
  });

  const isNormalWaterStatus = (status) => {
    if (!status) return false;
    const normalizedStatus = String(status).trim().toLowerCase();
    return normalizedStatus === 'normal';
  };

  const [historicalData, setHistoricalData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [error, setError] = useState(null);

  const { thresholds, telegramSettings } = useSettings();
  const [sentAlerts, setSentAlerts] = useState(new Set());

  // Function to calculate individual sensor status based on values and thresholds
  const getSensorStatus = (sensorType, value) => {
    switch (sensorType) {
      case 'pH':
        if (value < thresholds.phMin - 0.5 || value > thresholds.phMax + 0.5) return 'critical';
        if (value < thresholds.phMin || value > thresholds.phMax) return 'warning';
        return 'normal';
      case 'tds':
        if (value > thresholds.tdsMax + 100) return 'critical';
        if (value > thresholds.tdsMax) return 'warning';
        return 'normal';
      case 'temperature':
        if (value < thresholds.temperatureMin - 3 || value > thresholds.temperatureMax + 3) return 'critical';
        if (value < thresholds.temperatureMin || value > thresholds.temperatureMax) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  // Function to calculate trend based on historical data
  const getSensorTrend = (sensorType) => {
    if (historicalData.length < 2) return 'stable';
    
    const recentData = historicalData.slice(-6); // Last 6 readings
    const values = recentData.map(d => d[sensorType]);
    
    if (values.length < 2) return 'stable';
    
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const changePercent = Math.abs(change / firstValue) * 100;
    
    if (changePercent < 2) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  };

  // Function to fetch latest sensor data from backend
  const fetchLatestSensorData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/DataSensorLatest`, {
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
        // DataSensorLatest returns array with latest row in first index
        const sensorData = Array.isArray(result.data) ? result.data[0] : result.data;

        if (!sensorData) {
          throw new Error('No latest sensor data found in response');
        }

        const phValue = Number(sensorData.water_ph ?? sensorData.ph) || 0;
        const tdsValue = Number(sensorData.water_tds ?? sensorData.tds) || 0;
        const temperatureValue = Number(sensorData.water_suhu ?? sensorData.temperature) || 0;

        setCurrentReadings({
          pH: phValue,
          tds: tdsValue,
          temperature: temperatureValue,
          status: sensorData.water_status || sensorData.status || '',
          suggest: sensorData.water_suggest || sensorData.suggest || '',
          timestamp: sensorData.water_timestamp || sensorData.timestamp || ''
        });
        setError(null);
      } else {
        throw new Error(result.message || 'No sensor data available');
      }
    } catch (error) {
      console.error('Error fetching latest sensor data:', error);
      setError(error.message);
      // Keep using last known values or defaults on error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch 24 hours historical data for chart
  const fetch24HourData = async () => {
    try {
      setIsLoadingChart(true);
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/ListDataSensor24Hours`, {
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
        // Convert database format to chart format
        const chartData = result.data.map(item => ({
          timestamp: new Date(item.water_timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          pH: Number(item.water_ph) || 7.0,
          tds: Number(item.water_tds) || 250,
          temperature: Number(item.water_suhu) || 25.0,
        })).reverse(); // Reverse to show chronological order
        
        setHistoricalData(chartData);
      }
    } catch (error) {
      console.error('Error fetching 24 hour data:', error);
    } finally {
      setIsLoadingChart(false);
    }
  };



  // Function to generate alerts based on current sensor readings and thresholds
  const generateAlerts = (readings, thresholds) => {
    const alerts = [];
    const timestamp = readings.timestamp || new Date().toLocaleString();
    const backendStatus = readings.status || '';

    // Only show alert UI when backend marks water as not normal.
    if (!backendStatus || isNormalWaterStatus(backendStatus)) {
      return [];
    }

    const outOfThresholdParameters = [];

    if (readings.pH > 0) {
      const phStatus = getSensorStatus('pH', readings.pH);
      if (phStatus !== 'normal') {
        outOfThresholdParameters.push(
          `pH ${readings.pH.toFixed(2)} (recommended ${thresholds.phMin} - ${thresholds.phMax})`
        );
      }
    }

    if (readings.tds > 0) {
      const tdsStatus = getSensorStatus('tds', readings.tds);
      if (tdsStatus !== 'normal') {
        outOfThresholdParameters.push(
          `TDS ${readings.tds.toFixed(0)} ppm (max ${thresholds.tdsMax} ppm)`
        );
      }
    }

    if (readings.temperature > 0) {
      const temperatureStatus = getSensorStatus('temperature', readings.temperature);
      if (temperatureStatus !== 'normal') {
        outOfThresholdParameters.push(
          `Temperature ${readings.temperature.toFixed(1)}°C (recommended ${thresholds.temperatureMin}°C - ${thresholds.temperatureMax}°C)`
        );
      }
    }

    const unmatchedParametersText = outOfThresholdParameters.length > 0
      ? outOfThresholdParameters.join(', ')
      : 'No threshold mismatch detected from the current values.';

    const suggestionText = readings.suggest
      ? ` Suggestion: ${readings.suggest}`
      : '';

    alerts.push({
      id: `alert-water-status-${Date.now()}`,
      timestamp,
      sensor: 'Water Quality',
      message: `Status ${backendStatus}. ${unmatchedParametersText}.${suggestionText}`,
      severity: outOfThresholdParameters.length > 1 ? 'critical' : 'warning',
    });

    return alerts.slice(0, 1); // Keep only the most recent alert
  };

  // Initialize data and start fetching real sensor data
  useEffect(() => {
    // Fetch real data from all endpoints
    fetchLatestSensorData();
    fetch24HourData();
  }, []);

  // Fetch real-time updates from backend - Latest sensor data (10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestSensorData(); // Update sensor cards every 10 seconds
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Fetch real-time updates from backend - Historical data (1 minute)
  useEffect(() => {
    const interval = setInterval(() => {
      fetch24HourData(); // Update chart data every minute
    }, 60000); // Fetch every 60 seconds (1 minute)

    return () => clearInterval(interval);
  }, []);

  // Update alerts based on current readings and thresholds
  useEffect(() => {
    if (currentReadings.timestamp && !isLoading) {
      const newAlerts = generateAlerts(currentReadings, thresholds);
      setAlerts(newAlerts);
    }
  }, [currentReadings, thresholds, isLoading]);

  // Monitor thresholds and send Telegram alerts
  useEffect(() => {
    if (!telegramSettings.enabled) return;

    const checkThreshold = (sensor, value, min, max) => {
      const timestamp = new Date().toLocaleString();
      let status = null;
      let alertKey = '';

      if (sensor === 'pH') {
        if (value < thresholds.phMin || value > thresholds.phMax) {
          status = value < thresholds.phMin - 0.5 || value > thresholds.phMax + 0.5 ? 'critical' : 'warning';
          alertKey = `pH-${status}-${Math.floor(Date.now() / 60000)}`; // Group by minute
        }
      } else if (sensor === 'TDS') {
        if (value > thresholds.tdsMax) {
          status = value > thresholds.tdsMax + 50 ? 'critical' : 'warning';
          alertKey = `TDS-${status}-${Math.floor(Date.now() / 60000)}`;
        }
      } else if (sensor === 'Temperature') {
        if (value < thresholds.temperatureMin || value > thresholds.temperatureMax) {
          status = value < thresholds.temperatureMin - 2 || value > thresholds.temperatureMax + 2 ? 'critical' : 'warning';
          alertKey = `Temperature-${status}-${Math.floor(Date.now() / 60000)}`;
        }
      }

      // Send Telegram alert if threshold breached and not already sent
      if (status && !sentAlerts.has(alertKey)) {
        setSentAlerts(prev => new Set(prev).add(alertKey));
        
        sendTelegramNotification(
          telegramSettings,
          formatAlertMessage(sensor, value, status, timestamp)
        );
      }
    };

    // Check current readings against thresholds
    checkThreshold('pH', currentReadings.pH, thresholds.phMin, thresholds.phMax);
    checkThreshold('TDS', currentReadings.tds, undefined, thresholds.tdsMax);
    checkThreshold('Temperature', currentReadings.temperature, thresholds.temperatureMin, thresholds.temperatureMax);

    // Clear old alert keys every 5 minutes to allow re-alerting
    const clearOldAlerts = setInterval(() => {
      setSentAlerts(new Set());
    }, 5 * 60 * 1000);

    return () => clearInterval(clearOldAlerts);
  }, [currentReadings, thresholds, telegramSettings, sentAlerts]);

  return (
    <div className="flex min-h-screen">
      <Navigation user={user} currentPage="dashboard" onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Connection Error: </strong>
                <span className="block sm:inline">
                  Unable to fetch real-time data from sensors. {error}
                </span>
                <button 
                  onClick={() => {setError(null); fetchLatestSensorData();}}
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  <span className="sr-only">Retry</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading sensor data...</span>
              </div>
            )}

            {/* Sensor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SensorCard
                title="pH Level"
                value={isLoading ? "..." : currentReadings.pH.toFixed(2)}
                unit=""
                icon="droplet"
                status={getSensorStatus('pH', currentReadings.pH)}
                trend={getSensorTrend('pH')}
              />
              <SensorCard
                title="TDS"
                value={isLoading ? "..." : currentReadings.tds.toFixed(0)}
                unit="ppm"
                icon="activity"
                status={getSensorStatus('tds', currentReadings.tds)}
                trend={getSensorTrend('tds')}
              />
              <SensorCard
                title="Temperature"
                value={isLoading ? "..." : currentReadings.temperature.toFixed(1)}
                unit="°C"
                icon="thermometer"
                status={getSensorStatus('temperature', currentReadings.temperature)}
                trend={getSensorTrend('temperature')}
              />
            </div>

            {/* Chart and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {isLoadingChart ? (
                  <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading chart data...</span>
                  </div>
                ) : (
                  <SensorChart data={historicalData} />
                )}
              </div>
              <div>
                <AlertsSection alerts={alerts} />
              </div>
            </div>



            {/* Sensor Analytics */}
            {/* <SensorAnalytics 
              data={historicalData} 
              currentReadings={currentReadings}
              waterSuggestion={currentReadings.suggest}
            /> */}
          </div>
        </main>
      </div>
    </div>
  );
}
