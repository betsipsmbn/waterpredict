export function exportToCSV(logs, filename = 'sensor-logs.csv') {
  const headers = ['Timestamp', 'pH', 'TDS (ppm)', 'Temperature (°C)', 'Status', 'Suggestion'];
  const rows = logs.map(log => [
    log.timestamp || '',
    log.pH || '',
    log.tds || '',
    log.temperature || '',
    log.status || '',
    (log.suggest || '').replace(/,/g, ';') // Replace commas to avoid CSV parsing issues
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')) // Quote all values to handle commas
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
