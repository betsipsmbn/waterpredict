export async function sendTelegramNotification(config, message) {
  if (!config.botToken || !config.chatId) {
    console.error('Telegram bot token or chat ID is missing');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to send Telegram notification:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

export function formatAlertMessage(sensor, value, status, timestamp) {
  const emoji = status === 'critical' ? '🚨' : '⚠️';
  const statusText = status === 'critical' ? 'CRITICAL ALERT' : 'Warning Alert';
  
  let unit = '';
  if (sensor === 'TDS') unit = ' ppm';
  if (sensor === 'Temperature') unit = ' °C';

  return `${emoji} <b>${statusText}</b>

📊 <b>Sensor:</b> ${sensor}
📈 <b>Value:</b> ${value}${unit}
⏰ <b>Time:</b> ${timestamp}

Water Quality Monitoring System`;
}

export function formatTestMessage() {
  return `🔔 <b>Test Notification</b>

This is a test message from your IoT Water Quality Monitoring System.

✅ Telegram integration is working correctly!

You will receive real-time alerts when water quality parameters exceed configured thresholds.`;
}
