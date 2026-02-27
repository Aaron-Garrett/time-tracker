const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  updateExcel: (data) => ipcRenderer.invoke('update-excel', data),
});