const os = require('os');
const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');
const { ratio } = require('./helper');

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld('path', {
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld('node', {
  dirname: path.join(__dirname, 'renderer'),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});
contextBridge.exposeInMainWorld('help', {
  ratio: (w, h) => ratio(w, h)
})