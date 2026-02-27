const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

// Listen for timeEntries from React
ipcMain.handle('update-excel', async (event, timeEntries) => {
  const documentsPath = app.getPath("documents");
  const filePath = path.join(documentsPath, "TimeTracker.xlsx");

  let workbook;

  if (fs.existsSync(filePath)) {
    workbook = xlsx.readFile(filePath);
  } else {
    workbook = xlsx.utils.book_new();
  }

  const sheetName = getISOWeek(new Date());

  let existingData = [];

  // Load existing sheet data if it exists
  if (workbook.SheetNames.includes(sheetName)) {
    const existingSheet = workbook.Sheets[sheetName];
    existingData = xlsx.utils.sheet_to_json(existingSheet);
  }

  // Convert existing entries to a unique key set (to prevent duplicates)
  const existingKeys = new Set(
    existingData.map(row => `${row.Activity}-${row.Start}`)
  );

  // Process new entries
  const newRows = timeEntries
    .filter(entry => entry.endTime) // only completed entries
    .map(entry => {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);

      const durationMinutes = (end - start) / (1000 * 60);

      return {
        Activity: entry.activity,
        Start: start.toISOString(),
        End: end.toISOString(),
        DurationMinutes: Number(durationMinutes.toFixed(2))
      };
    })
    .filter(row => !existingKeys.has(`${row.Activity}-${row.Start}`));

  const updatedData = [...existingData, ...newRows];

  const worksheet = xlsx.utils.json_to_sheet(updatedData);

  workbook.Sheets[sheetName] = worksheet;

  if (!workbook.SheetNames.includes(sheetName)) {
    workbook.SheetNames.push(sheetName);
  }

  xlsx.writeFile(workbook, filePath);

  return `Workbook updated. Added ${newRows.length} new entries.`;
});

function getISOWeek(date) {
  const tmpDate = new Date(date.valueOf());
  const dayNum = (date.getDay() + 6) % 7;
  tmpDate.setDate(tmpDate.getDate() - dayNum + 3);
  const firstThursday = tmpDate.valueOf();
  tmpDate.setMonth(0, 1);
  if (tmpDate.getDay() !== 4) {
    tmpDate.setMonth(0, 1 + ((4 - tmpDate.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - tmpDate) / 604800000);
  return `${date.getFullYear()}-W${weekNumber}`;
}