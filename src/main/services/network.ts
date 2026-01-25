import { ipcMain, BrowserWindow } from 'electron'
import { exec, execSync } from 'child_process'
import log from 'electron-log'
import os from 'os'

const TARGET_SSID = 'XDESIN'
const TARGET_IP = '192.168.4.100'
const TARGET_SUBNET = '255.255.255.0'
const SERVER_IP = '192.168.4.1'
const SERVER_PORT = 10001

export interface NetworkCheckResult {
  success: boolean
  message: string
  ssid?: string
  localIp?: string
}

export interface WifiInfo {
  connected: boolean
  ssid: string | null
  localIp: string | null
}

/**
 * 检查 WiFi 连接状态
 */
async function checkWifiConnection(): Promise<WifiInfo> {
  const platform = os.platform()
  
  if (platform === 'win32') {
    return checkWifiWindows()
  } else if (platform === 'darwin') {
    return checkWifiMac()
  } else {
    return checkWifiLinux()
  }
}

/**
 * Windows: 检查 WiFi 连接
 */
function checkWifiWindows(): Promise<WifiInfo> {
  return new Promise((resolve) => {
    exec('netsh wlan show interfaces', { encoding: 'utf8' }, (err, stdout) => {
      if (err) {
        log.error('checkWifiWindows error:', err)
        resolve({ connected: false, ssid: null, localIp: null })
        return
      }

      // 解析 SSID
      const ssidMatch = stdout.match(/SSID\s*:\s*(.+)/i)
      const ssid = ssidMatch ? ssidMatch[1].trim() : null
      
      // 过滤掉 BSSID
      const cleanSsid = ssid && !ssid.toLowerCase().includes('bssid') ? ssid : null

      // 获取本地 IP
      const localIp = getLocalIpInSubnet('192.168.4')

      resolve({
        connected: !!cleanSsid,
        ssid: cleanSsid,
        localIp
      })
    })
  })
}

/**
 * macOS: 检查 WiFi 连接
 */
function checkWifiMac(): Promise<WifiInfo> {
  return new Promise((resolve) => {
    exec('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I', { encoding: 'utf8' }, (err, stdout) => {
      if (err) {
        log.error('checkWifiMac error:', err)
        resolve({ connected: false, ssid: null, localIp: null })
        return
      }

      // 解析 SSID
      const ssidMatch = stdout.match(/\s+SSID:\s*(.+)/i)
      const ssid = ssidMatch ? ssidMatch[1].trim() : null

      // 获取本地 IP
      const localIp = getLocalIpInSubnet('192.168.4')

      resolve({
        connected: !!ssid,
        ssid,
        localIp
      })
    })
  })
}

/**
 * Linux: 检查 WiFi 连接
 */
function checkWifiLinux(): Promise<WifiInfo> {
  return new Promise((resolve) => {
    exec('iwgetid -r', { encoding: 'utf8' }, (err, stdout) => {
      const ssid = err ? null : stdout.trim() || null
      const localIp = getLocalIpInSubnet('192.168.4')

      resolve({
        connected: !!ssid,
        ssid,
        localIp
      })
    })
  })
}

/**
 * 获取指定子网的本地 IP
 */
function getLocalIpInSubnet(subnet: string): string | null {
  const interfaces = os.networkInterfaces()
  
  for (const name of Object.keys(interfaces)) {
    const addrs = interfaces[name]
    if (!addrs) continue
    
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal && addr.address.startsWith(subnet)) {
        return addr.address
      }
    }
  }
  return null
}

/**
 * 设置本地 IP 地址 (仅 Windows)
 */
async function setLocalIp(): Promise<NetworkCheckResult> {
  const platform = os.platform()
  
  if (platform !== 'win32') {
    return {
      success: false,
      message: '自动设置 IP 仅支持 Windows 系统，请手动配置网络'
    }
  }

  // Windows WiFi 接口名称（支持中英文）
  const wifiInterfaces = ['无线局域网', 'WLAN', 'Wi-Fi', 'WiFi', 'Wireless Network Connection']
  
  for (const interfaceName of wifiInterfaces) {
    try {
      const cmd = `netsh interface ip set address "${interfaceName}" static ${TARGET_IP} ${TARGET_SUBNET}`
      log.info(`Trying to set IP on interface: ${interfaceName}`)
      
      execSync(cmd, { encoding: 'utf8', windowsHide: true })
      
      log.info(`Successfully set IP ${TARGET_IP} on interface ${interfaceName}`)
      return {
        success: true,
        message: `无线接口 IP 设置成功: ${TARGET_IP}`,
        localIp: TARGET_IP
      }
    } catch (e: any) {
      log.warn(`Failed to set IP on ${interfaceName}: ${e.message}`)
      continue
    }
  }

  return {
    success: false,
    message: '无线接口 IP 设置失败，可能需要管理员权限或接口名称不正确'
  }
}

/**
 * 完整的网络检查流程
 */
async function checkNetworkForConnection(): Promise<{
  wifiOk: boolean
  ipOk: boolean
  ssid: string | null
  localIp: string | null
  targetSsid: string
  targetIp: string
  serverAddress: string
  message: string
}> {
  const wifiInfo = await checkWifiConnection()
  
  const wifiOk = !!(wifiInfo.connected && wifiInfo.ssid?.toUpperCase().includes(TARGET_SSID.toUpperCase()))
  const ipOk = !!(wifiInfo.localIp && wifiInfo.localIp.startsWith('192.168.4.'))

  let message = ''
  if (!wifiInfo.connected) {
    message = '未连接到无线网络，请先连接到 XDESIN 热点'
  } else if (!wifiOk) {
    message = `当前连接的是 "${wifiInfo.ssid}"，请连接到 ${TARGET_SSID} 热点`
  } else if (!ipOk) {
    message = `IP 地址不在目标网段，当前: ${wifiInfo.localIp || '未知'}`
  } else {
    message = '网络检查通过'
  }

  return {
    wifiOk,
    ipOk,
    ssid: wifiInfo.ssid,
    localIp: wifiInfo.localIp,
    targetSsid: TARGET_SSID,
    targetIp: TARGET_IP,
    serverAddress: `${SERVER_IP}:${SERVER_PORT}`,
    message
  }
}

/**
 * 设置网络服务的 IPC 监听
 */
export function setupNetworkService(win: BrowserWindow) {
  // 检查 WiFi 连接状态
  ipcMain.handle('network:check-wifi', async () => {
    try {
      const info = await checkWifiConnection()
      log.info('WiFi check result:', info)
      return info
    } catch (e: any) {
      log.error('network:check-wifi error:', e)
      return { connected: false, ssid: null, localIp: null }
    }
  })

  // 设置本地 IP（仅 Windows）
  ipcMain.handle('network:set-local-ip', async () => {
    try {
      const result = await setLocalIp()
      log.info('Set local IP result:', result)
      return result
    } catch (e: any) {
      log.error('network:set-local-ip error:', e)
      return { success: false, message: e.message }
    }
  })

  // 完整网络检查
  ipcMain.handle('network:check-all', async () => {
    try {
      const result = await checkNetworkForConnection()
      log.info('Network check all result:', result)
      return result
    } catch (e: any) {
      log.error('network:check-all error:', e)
      return {
        wifiOk: false,
        ipOk: false,
        ssid: null,
        localIp: null,
        targetSsid: TARGET_SSID,
        targetIp: TARGET_IP,
        serverAddress: `${SERVER_IP}:${SERVER_PORT}`,
        message: `检查失败: ${e.message}`
      }
    }
  })

  // 获取网络配置
  ipcMain.handle('network:get-config', () => {
    return {
      targetSsid: TARGET_SSID,
      targetIp: TARGET_IP,
      targetSubnet: TARGET_SUBNET,
      serverIp: SERVER_IP,
      serverPort: SERVER_PORT,
      wifiPassword: '88888888'
    }
  })

  log.info('Network service initialized')
}
