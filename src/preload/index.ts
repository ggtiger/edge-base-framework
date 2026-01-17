import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // TCP
  connectTcp: (host: string, port: number) => ipcRenderer.send('tcp:connect', host, port),
  disconnectTcp: () => ipcRenderer.send('tcp:disconnect'),
  sendTcp: (data: string) => ipcRenderer.send('tcp:send', data),
  onTcpData: (callback: (data: string) => void) => ipcRenderer.on('tcp:data-received', (_, data) => callback(data)),
  onTcpStatus: (callback: (status: string) => void) => ipcRenderer.on('tcp:status-change', (_, status) => callback(status)),
  getTcpConfig: () => ipcRenderer.invoke('tcp:get-config'),
  setTcpConfig: (host: string, port: number) => ipcRenderer.invoke('tcp:set-config', host, port),

  // Serial
  openSerial: (path: string, baudRate: number) => ipcRenderer.send('serial:open', path, baudRate),
  closeSerial: () => ipcRenderer.send('serial:close'),
  onSerialData: (callback: (data: string) => void) => ipcRenderer.on('serial:data', (_, data) => callback(data)),
  onSerialStatus: (callback: (status: string) => void) => ipcRenderer.on('serial:status', (_, status) => callback(status)),

  // System Info
  getSysInfo: () => ipcRenderer.invoke('sys:get-info'),
  
  // Update
  checkUpdate: () => ipcRenderer.send('update:check'),
  onUpdateStatus: (callback: (status: string) => void) => ipcRenderer.on('update:status', (_, status) => callback(status)),
  
  // Window Control
  minimize: () => ipcRenderer.invoke('win:minimize'),
  quitApp: () => ipcRenderer.invoke('app:quit'),
  toggleFullscreen: () => ipcRenderer.invoke('win:toggle-fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('win:is-fullscreen'),
  onFullscreenChanged: (callback: (isFullscreen: boolean) => void) => {
    ipcRenderer.on('fullscreen-changed', (_, isFullscreen) => callback(isFullscreen))
  },

  // DLL
  selectDll: () => ipcRenderer.invoke('dll:select-file'),
  loadDll: (path: string) => ipcRenderer.invoke('dll:load', path),
  callDll: (path: string, func: string, ...args: any[]) => ipcRenderer.invoke('dll:call-example', path, func, ...args),

  // App Ready
  notifyAppReady: () => ipcRenderer.send('app:renderer-ready')
})
