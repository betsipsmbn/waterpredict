import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function SensorChart({ data }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-gray-900 mb-4">Historical Sensor Data (24 Hours)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="pH" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
            name="pH Level"
          />
          <Line 
            type="monotone" 
            dataKey="tds" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
            name="TDS (ppm)"
          />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={false}
            name="Temperature (°C)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
