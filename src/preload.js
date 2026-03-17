'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, minimal API to the renderer process.
// contextIsolation keeps Node.js fully out of the renderer world.
contextBridge.exposeInMainWorld('tradeAPI', {
  loadTrades: () => ipcRenderer.invoke('trades:load'),
  saveTrades: (trades) => ipcRenderer.invoke('trades:save', trades)
});
