/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface Window {
  electronAPI: {
    // TCP
    connectTcp: (host: string, port: number) => void
    disconnectTcp: () => void
    sendTcp: (data: string) => void
    onTcpData: (callback: (data: string) => void) => () => void
    onTcpStatus: (callback: (status: string) => void) => () => void
    getTcpConfig: () => Promise<{ host: string; port: number }>
    setTcpConfig: (host: string, port: number) => Promise<{ host: string; port: number }>

    // Serial
    openSerial: (path: string, baudRate: number) => void
    closeSerial: () => void
    onSerialData: (callback: (data: string) => void) => void
    onSerialStatus: (callback: (status: string) => void) => void

    // System Info
    getSysInfo: () => Promise<any>

    // Update
    checkUpdate: () => void
    onUpdateStatus: (callback: (status: string) => void) => void
    getBootConfig: () => Promise<{ versionCheckUrl?: string; versionCheckTimeoutMs?: number }>
    setBootConfig: (next: { versionCheckUrl?: string; versionCheckTimeoutMs?: number }) => Promise<{ versionCheckUrl?: string; versionCheckTimeoutMs?: number }>
    patchBootConfig: (patch: { versionCheckUrl?: string; versionCheckTimeoutMs?: number }) => Promise<{ versionCheckUrl?: string; versionCheckTimeoutMs?: number }>
    openBootConfigLocation: () => Promise<{ ok: true }>
    getRendererUpdateInfo: () => Promise<{
      active: 'bundled' | 'custom'
      customIndexHtmlPath?: string
      updateRoot: string
      activeDirName?: string
      appVersion: string
      rendererVersion: string
    }>
    installRendererUpdateFromUrl: (url: string, sha256?: string, rendererVersion?: string) => Promise<{ ok: true; installId: string; updateRoot: string; indexHtml: string; rendererVersion: string | null }>
    revertRendererUpdate: () => Promise<{ ok: boolean }>
    reloadRenderer: () => Promise<{ ok: true }>
    onRendererUpdateStatus: (callback: (status: string) => void) => () => void
    onRendererUpdateProgress: (callback: (progress: { downloaded: number; total?: number }) => void) => () => void

    // Window Control
    minimize: () => Promise<void>
    quitApp: () => Promise<void>
    toggleFullscreen: () => Promise<boolean>
    isFullscreen: () => Promise<boolean>
    onFullscreenChanged: (callback: (isFullscreen: boolean) => void) => void

    // DLL
    selectDll: () => Promise<string | null>
    loadDll: (path: string) => Promise<{ success: boolean; message: string }>
    callDll: (path: string, func: string, ...args: any[]) => Promise<{ success: boolean; result?: any; message?: string }>

    // Network
    checkWifi: () => Promise<{ connected: boolean; ssid: string | null; localIp: string | null }>
    setLocalIp: () => Promise<{ success: boolean; message: string; localIp?: string }>
    checkNetwork: () => Promise<{
      wifiOk: boolean
      ipOk: boolean
      ssid: string | null
      localIp: string | null
      targetSsid: string
      targetIp: string
      serverAddress: string
      message: string
    }>
    getNetworkConfig: () => Promise<{
      targetSsid: string
      targetIp: string
      targetSubnet: string
      serverIp: string
      serverPort: number
      wifiPassword: string
    }>

    // App Ready
    notifyAppReady: () => void
  }
}

declare module "*.svg" {
  const content: string;
  export default content;
}
