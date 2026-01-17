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

    // App Ready
    notifyAppReady: () => void
  }
}

declare module "*.svg" {
  const content: string;
  export default content;
}
