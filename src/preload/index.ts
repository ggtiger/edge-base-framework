import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // TCP
  connectTcp: (host: string, port: number) => ipcRenderer.send('tcp:connect', host, port),
  disconnectTcp: () => ipcRenderer.send('tcp:disconnect'),
  sendTcp: (data: string) => ipcRenderer.send('tcp:send', data),
  onTcpData: (callback: (data: string) => void) => {
    const subscription = (_: any, data: string) => callback(data)
    ipcRenderer.on('tcp:data-received', subscription)
    return () => {
      ipcRenderer.removeListener('tcp:data-received', subscription)
    }
  },
  onTcpStatus: (callback: (status: string) => void) => {
    const subscription = (_: any, status: string) => callback(status)
    ipcRenderer.on('tcp:status-change', subscription)
    return () => {
      ipcRenderer.removeListener('tcp:status-change', subscription)
    }
  },
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
  getBootConfig: () => ipcRenderer.invoke('bootConfig:get'),
  setBootConfig: (next: { versionCheckUrl?: string; versionCheckTimeoutMs?: number }) => ipcRenderer.invoke('bootConfig:set', next),
  patchBootConfig: (patch: { versionCheckUrl?: string; versionCheckTimeoutMs?: number }) => ipcRenderer.invoke('bootConfig:patch', patch),
  openBootConfigLocation: () => ipcRenderer.invoke('bootConfig:open-location'),
  getRendererUpdateInfo: () => ipcRenderer.invoke('rendererUpdate:get-info'),
  installRendererUpdateFromUrl: (url: string, sha256?: string, rendererVersion?: string) => ipcRenderer.invoke('rendererUpdate:install-from-url', { url, sha256, rendererVersion }),
  revertRendererUpdate: () => ipcRenderer.invoke('rendererUpdate:revert'),
  reloadRenderer: () => ipcRenderer.invoke('rendererUpdate:reload'),
  onRendererUpdateStatus: (callback: (status: string) => void) => {
    const subscription = (_: any, status: string) => callback(status)
    ipcRenderer.on('rendererUpdate:status', subscription)
    return () => {
      ipcRenderer.removeListener('rendererUpdate:status', subscription)
    }
  },
  onRendererUpdateProgress: (callback: (progress: { downloaded: number; total?: number }) => void) => {
    const subscription = (_: any, progress: { downloaded: number; total?: number }) => callback(progress)
    ipcRenderer.on('rendererUpdate:progress', subscription)
    return () => {
      ipcRenderer.removeListener('rendererUpdate:progress', subscription)
    }
  },
  
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
