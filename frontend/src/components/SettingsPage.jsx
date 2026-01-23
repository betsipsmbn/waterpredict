import { useState } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { Save, Bell, Sliders, Send } from 'lucide-react';
import { sendTelegramNotification, formatTestMessage } from '../utils/telegramNotifications';
import { useSettings } from '../context/SettingsContext';

export function SettingsPage({ user, onLogout, onNavigate }) {
  const { thresholds, setThresholds, telegramSettings, setTelegramSettings } = useSettings();

  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [localTelegramSettings, setLocalTelegramSettings] = useState(telegramSettings);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    alertFrequency: 'immediate',
  });

  const [systemSettings, setSystemSettings] = useState({
    sampleRate: 5,
    dataRetention: 30,
    autoBackup: true,
  });

  const [saved, setSaved] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    
    // Save to context
    setThresholds(localThresholds);
    setTelegramSettings(localTelegramSettings);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestTelegramNotification = () => {
    if (!localTelegramSettings.botToken || !localTelegramSettings.chatId) {
      alert('Please enter both Bot Token and Chat ID');
      return;
    }

    // Send actual Telegram notification
    sendTelegramNotification(
      {
        botToken: localTelegramSettings.botToken,
        chatId: localTelegramSettings.chatId,
      },
      formatTestMessage()
    ).then((success) => {
      if (success) {
        setTestNotificationSent(true);
        setTimeout(() => setTestNotificationSent(false), 3000);
      } else {
        alert('Failed to send test notification. Please check your Bot Token and Chat ID.');
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      <Navigation user={user} currentPage="settings" onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-6">
            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <Save className="w-5 h-5" />
                Settings saved successfully!
              </div>
            )}

            {/* Threshold Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Sliders className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-gray-900">Threshold Settings</h2>
                  <p className="text-gray-600">Configure acceptable ranges for water quality parameters</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* pH Thresholds */}
                <div className="space-y-4">
                  <h3 className="text-gray-900">pH Level</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Minimum pH</label>
                      <input
                        type="number"
                        step="0.1"
                        value={localThresholds.phMin}
                        onChange={(e) => setLocalThresholds({ ...localThresholds, phMin: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Maximum pH</label>
                      <input
                        type="number"
                        step="0.1"
                        value={localThresholds.phMax}
                        onChange={(e) => setLocalThresholds({ ...localThresholds, phMax: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* TDS Threshold */}
                <div className="space-y-4">
                  <h3 className="text-gray-900">TDS (Total Dissolved Solids)</h3>
                  <div>
                    <label className="block text-gray-700 mb-2">Maximum TDS (ppm)</label>
                    <input
                      type="number"
                      value={localThresholds.tdsMax}
                      onChange={(e) => setLocalThresholds({ ...localThresholds, tdsMax: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Temperature Thresholds */}
                <div className="space-y-4">
                  <h3 className="text-gray-900">Temperature</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Minimum Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={localThresholds.temperatureMin}
                        onChange={(e) => setLocalThresholds({ ...localThresholds, temperatureMin: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Maximum Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={localThresholds.temperatureMax}
                        onChange={(e) => setLocalThresholds({ ...localThresholds, temperatureMax: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-gray-900">Notification Settings</h2>
                  <p className="text-gray-600">Manage how you receive alerts</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-gray-900">Email Alerts</p>
                    <p className="text-gray-600">Receive alerts via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailAlerts}
                    onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-gray-900">SMS Alerts</p>
                    <p className="text-gray-600">Receive alerts via SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsAlerts}
                    onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-gray-900">Push Notifications</p>
                    <p className="text-gray-600">Receive push notifications in browser</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.pushNotifications}
                    onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <div>
                  <label className="block text-gray-700 mb-2">Alert Frequency</label>
                  <select
                    value={notifications.alertFrequency}
                    onChange={(e) => setNotifications({ ...notifications, alertFrequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="hourly">Hourly Digest</option>
                    <option value="daily">Daily Summary</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Telegram Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-gray-900">Telegram Bot Integration</h2>
                  <p className="text-gray-600">Configure Telegram bot for real-time alerts</p>
                </div>
                {localTelegramSettings.enabled && localTelegramSettings.botToken && localTelegramSettings.chatId && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Active</span>
                  </div>
                )}
              </div>

              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 mb-2">How to set up Telegram Bot:</p>
                <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Open Telegram and search for @BotFather</li>
                  <li>Send /newbot and follow the instructions</li>
                  <li>Copy the Bot Token provided by BotFather</li>
                  <li>Start a chat with your bot and send any message</li>
                  <li>Visit: https://api.telegram.org/bot[YOUR_BOT_TOKEN]/getUpdates</li>
                  <li>Copy your Chat ID from the response</li>
                </ol>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-gray-900">Enable Telegram Alerts</p>
                    <p className="text-gray-600">Send alerts to a Telegram chat</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localTelegramSettings.enabled}
                    onChange={(e) => setLocalTelegramSettings({ ...localTelegramSettings, enabled: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <div>
                  <label className="block text-gray-700 mb-2">Bot Token</label>
                  <input
                    type="text"
                    value={localTelegramSettings.botToken}
                    onChange={(e) => setLocalTelegramSettings({ ...localTelegramSettings, botToken: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  />
                  <p className="text-gray-600 mt-1">Get from @BotFather on Telegram</p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Chat ID</label>
                  <input
                    type="text"
                    value={localTelegramSettings.chatId}
                    onChange={(e) => setLocalTelegramSettings({ ...localTelegramSettings, chatId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123456789"
                  />
                  <p className="text-gray-600 mt-1">Your Telegram chat or group ID</p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleTestTelegramNotification}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                    Test Notification
                  </button>
                </div>

                {testNotificationSent && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Test notification sent successfully!
                  </div>
                )}
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-gray-900">System Configuration</h2>
                <p className="text-gray-600">General system settings</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Sample Rate (minutes)</label>
                  <input
                    type="number"
                    value={systemSettings.sampleRate}
                    onChange={(e) => setSystemSettings({ ...systemSettings, sampleRate: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <p className="text-gray-600 mt-1">How often sensors take readings</p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Data Retention (days)</label>
                  <input
                    type="number"
                    value={systemSettings.dataRetention}
                    onChange={(e) => setSystemSettings({ ...systemSettings, dataRetention: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <p className="text-gray-600 mt-1">How long to keep historical data</p>
                </div>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-gray-900">Automatic Backup</p>
                    <p className="text-gray-600">Enable automatic daily backups</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.autoBackup}
                    onChange={(e) => setSystemSettings({ ...systemSettings, autoBackup: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save Settings
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
