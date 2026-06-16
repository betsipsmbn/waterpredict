import { TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SensorAnalytics({ data, currentReadings, waterSuggestion }) {
  // Calculate statistics
  const calculateStats = (sensor) => {
    const values = data.map(d => d[sensor]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Simple linear regression for trend
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = avg;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += (i - xMean) ** 2;
    }
    
    const slope = numerator / denominator;
    const trend = slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable';
    
    // Predict next 6 readings
    const predictions = [];
    
    // Add last 6 actual readings
    for (let i = Math.max(0, data.length - 6); i < data.length; i++) {
      predictions.push({
        timestamp: data[i].timestamp,
        actual: data[i][sensor],
      });
    }
    
    // Add 6 future predictions
    const lastValue = values[values.length - 1];
    for (let i = 1; i <= 6; i++) {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + i);
      const predictedValue = lastValue + (slope * i);
      
      predictions.push({
        timestamp: futureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        predicted: predictedValue,
      });
    }
    
    return { avg, min, max, trend, predictions };
  };

  const phStats = calculateStats('pH');
  const tdsStats = calculateStats('tds');
  const tempStats = calculateStats('temperature');

  const StatCard = ({ title, current, avg, min, max, trend, unit, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-gray-900">{title}</h4>
        <div className={`flex items-center gap-1 px-2 py-1 rounded ${
          trend === 'increasing' ? 'bg-orange-100 text-orange-700' :
          trend === 'decreasing' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {trend === 'increasing' ? <TrendingUp className="w-4 h-4" /> :
           trend === 'decreasing' ? <TrendingDown className="w-4 h-4" /> :
           <Target className="w-4 h-4" />}
          <span className="capitalize">{trend}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600 mb-1">Current</p>
          <p className="text-gray-900">{current.toFixed(2)} {unit}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Average</p>
          <p className="text-gray-900">{avg.toFixed(2)} {unit}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Minimum</p>
          <p className="text-gray-900">{min.toFixed(2)} {unit}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Maximum</p>
          <p className="text-gray-900">{max.toFixed(2)} {unit}</p>
        </div>
      </div>
    </div>
  );

  const PredictionChart = ({ data, title, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h4 className="text-gray-900 mb-4">{title} - Trend Prediction</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            name="Actual"
            connectNulls
          />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke={color}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: color, r: 4 }}
            name="Predicted"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-4 text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5" style={{ backgroundColor: color }}></div>
          <span>Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: color }}></div>
          <span>Predicted</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-gray-900">Sensor Analytics & Predictions</h3>
            <p className="text-gray-600">Statistical analysis and 6-hour trend forecasts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="pH Level"
            current={currentReadings.pH}
            avg={phStats.avg}
            min={phStats.min}
            max={phStats.max}
            trend={phStats.trend}
            unit=""
            color="#3b82f6"
          />
          <StatCard 
            title="TDS"
            current={currentReadings.tds}
            avg={tdsStats.avg}
            min={tdsStats.min}
            max={tdsStats.max}
            trend={tdsStats.trend}
            unit="ppm"
            color="#10b981"
          />
          <StatCard 
            title="Temperature"
            current={currentReadings.temperature}
            avg={tempStats.avg}
            min={tempStats.min}
            max={tempStats.max}
            trend={tempStats.trend}
            unit="°C"
            color="#f59e0b"
          />
        </div>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PredictionChart 
          data={phStats.predictions}
          title="pH Level"
          color="#3b82f6"
        />
        <PredictionChart 
          data={tdsStats.predictions}
          title="TDS"
          color="#10b981"
        />
        <PredictionChart 
          data={tempStats.predictions}
          title="Temperature"
          color="#f59e0b"
        />
      </div> */}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h4 className="text-gray-900 mb-4">AI Insights & Recommendations</h4>
        <div className="space-y-3">
          {/* Water Suggestion from API */}
          {waterSuggestion && (
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-purple-900">
                <strong>AI Water Analysis:</strong> {waterSuggestion}
              </p>
            </div>
          )}
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-blue-900">
              <strong>pH Trend:</strong> {phStats.trend === 'increasing' ? 'Rising pH levels detected. Monitor for alkalinity.' : 
                                         phStats.trend === 'decreasing' ? 'Decreasing pH. Check for acidification.' : 
                                         'pH levels stable within normal range.'}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <p className="text-green-900">
              <strong>TDS Analysis:</strong> {tdsStats.trend === 'increasing' ? 'TDS concentration is rising. Consider filtration check.' : 
                                             tdsStats.trend === 'decreasing' ? 'TDS decreasing. Water purity improving.' : 
                                             'TDS levels maintaining steady state.'}
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <p className="text-orange-900">
              <strong>Temperature Trend:</strong> {tempStats.trend === 'increasing' ? 'Temperature rising. Check cooling systems.' : 
                                                   tempStats.trend === 'decreasing' ? 'Temperature dropping. Monitor for extreme cold.' : 
                                                   'Temperature stable and optimal.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
