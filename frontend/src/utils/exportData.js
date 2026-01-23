export function exportToCSV(logs, filename = 'sensor-logs.csv') {
  const headers = ['Timestamp', 'Sensor Type', 'Value', 'Status'];
  const rows = logs.map(log => [
    log.timestamp,
    log.sensor,
    log.value.toString(),
    log.status
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
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

export function exportToExcel(logs, filename = 'sensor-logs.xlsx') {
  // Create Excel-compatible XML format
  const headers = ['Timestamp', 'Sensor Type', 'Value', 'Status'];
  const rows = logs.map(log => [
    log.timestamp,
    log.sensor,
    log.value.toString(),
    log.status
  ]);

  let excelContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Sensor Logs">
  <Table>
   <Row>
    ${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}
   </Row>
   ${rows.map(row => `<Row>
    ${row.map(cell => `<Cell><Data ss:Type="String">${cell}</Data></Cell>`).join('')}
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
