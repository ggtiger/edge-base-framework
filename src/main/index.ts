import { app, BrowserWindow, shell, ipcMain, Tray, Menu, nativeImage, screen } from 'electron'
import path from 'path'
import { release } from 'os'
import log from 'electron-log'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import { ensureBootConfigExists, readBootConfig, setupBootConfigService } from './services/bootConfig'
import { setupTcpService } from './services/tcp'
import { setupSysInfoService } from './services/sysInfo'
import { setupUpdateService } from './services/update'
import { setupSerialService } from './services/serial'
import { setupDllService } from './services/dll'
import { setupNetworkService } from './services/network'
import { getRendererUpdateInfo, installRendererUpdateFromUrl, loadRenderer, setupRendererUpdateService } from './services/rendererUpdate'
import store from './store'

log.transports.file.level = 'info'
log.transports.console.level = 'info'
process.on('uncaughtException', (err) => {
  log.error('uncaughtException', err)
})
process.on('unhandledRejection', (reason) => {
  log.error('unhandledRejection', reason)
})

function ensureWritableUserDataPath() {
  const original = app.getPath('userData')
  const testFile = path.join(original, '.writable')
  try {
    fs.mkdirSync(original, { recursive: true })
    fs.writeFileSync(testFile, '1')
    fs.rmSync(testFile, { force: true })
    return
  } catch {
    const fallback = path.join(app.getPath('temp'), `${app.getName()}-userData`)
    try {
      fs.mkdirSync(fallback, { recursive: true })
      app.setPath('userData', fallback)
      log.warn('userData not writable, using temp fallback', { original, fallback })
    } catch (e) {
      log.error('userData fallback failed', e)
    }
  }
}

ensureWritableUserDataPath()

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  log.warn('requestSingleInstanceLock failed, exiting')
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
let splash: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
const startupEpochMs = Date.now()
let splashCreatedAt = 0
const SPLASH_MIN_DISPLAY_MS = 2000 // Splash 最小显示时间

async function setSplashStatus(message: string) {
  if (!splash) return
  const msg = typeof message === 'string' ? message : ''
  try {
    await splash.webContents.executeJavaScript(`window.setSplashStatus && window.setSplashStatus(${JSON.stringify(msg)})`, true)
  } catch {}
}

async function setSplashProgress(percent: number, message?: string) {
  if (!splash) return
  const pct = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0
  const msg = typeof message === 'string' ? message : ''
  try {
    await splash.webContents.executeJavaScript(
      `window.setSplashProgress && window.setSplashProgress(${pct}, ${JSON.stringify(msg)})`,
      true,
    )
  } catch {}
}

function compareSemver(a: string, b: string) {
  const pa = a.split('.').map((x) => Number.parseInt(x, 10))
  const pb = b.split('.').map((x) => Number.parseInt(x, 10))
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = Number.isFinite(pa[i]) ? pa[i] : 0
    const nb = Number.isFinite(pb[i]) ? pb[i] : 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

async function fetchJson(url: string, timeoutMs: number) {
  const urlObj = new URL(url)
  const mod = urlObj.protocol === 'https:' ? https : urlObj.protocol === 'http:' ? http : null
  if (!mod) throw new Error(`Unsupported URL protocol: ${urlObj.protocol}`)

  return await new Promise<any>((resolve, reject) => {
    const req = mod.get(urlObj, (res) => {
      const statusCode = res.statusCode ?? 0
      if (statusCode < 200 || statusCode >= 300) {
        res.resume()
        reject(new Error(`HTTP ${statusCode}`))
        return
      }
      let raw = ''
      res.setEncoding('utf-8')
      res.on('data', (chunk) => {
        raw += chunk
      })
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw))
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout'))
    })
  })
}

async function runBootVersionCheck() {
  const envUrl = typeof process.env['FWACS_VERSION_CHECK_URL'] === 'string' ? process.env['FWACS_VERSION_CHECK_URL'].trim() : ''
  const cfg = await readBootConfig()
  const fileUrl = typeof cfg?.versionCheckUrl === 'string' ? cfg.versionCheckUrl.trim() : ''
  const checkUrl = envUrl || fileUrl
  if (!checkUrl) return

  const info = await getRendererUpdateInfo()
  const appVersion = app.getVersion()
  const rendererVersion = info.rendererVersion
  const rawName = app.getName()
  const appKey = typeof rawName === 'string' ? rawName.replace(/[^A-Za-z0-9_]/g, '_') : ''

  await setSplashProgress(5, `Checking version... (app ${appVersion}, ui ${rendererVersion})`)

  const urlObj = new URL(checkUrl)
  urlObj.searchParams.set('appVersion', appVersion)
  urlObj.searchParams.set('rendererVersion', rendererVersion)
  urlObj.searchParams.set('platform', process.platform)
  urlObj.searchParams.set('arch', process.arch)
  if (appKey) {
    urlObj.searchParams.set('appKey', appKey)
  }

  log.info('version check: request', {
    url: urlObj.toString(),
    envUrl,
    fileUrl,
    appVersion,
    rendererVersion,
    appKey,
    platform: process.platform,
    arch: process.arch,
  })

  type CheckResponse =
    | { updateType: 'none' }
    | { updateType: 'hot'; url: string; sha256?: string; version?: string }
    | { updateType: 'installer'; url?: string; version?: string }

  let resp: CheckResponse | null = null
  try {
    const timeoutMs = Number.isFinite(cfg?.versionCheckTimeoutMs) ? Math.max(1000, Math.floor(cfg!.versionCheckTimeoutMs!)) : 6000
    const rawResp = await fetchJson(urlObj.toString(), timeoutMs)
    log.info('version check: raw response', rawResp)
    const payload =
      rawResp && typeof rawResp === 'object' && 'data' in (rawResp as any)
        ? (rawResp as any).data
        : rawResp
    resp = payload as CheckResponse
    log.info('version check: parsed payload', resp)
  } catch (e) {
    log.warn('version check failed', e)
    await setSplashProgress(10, 'Version check failed, continuing...')
    return
  }

  if (!resp || resp.updateType === 'none') {
    log.info('version check: no update', resp)
    await setSplashProgress(15, 'No updates, starting...')
    return
  }

  if (resp.updateType === 'installer') {
    log.info('version check: installer update (renderer hot update not used)', resp)
    await setSplashProgress(15, 'Installer update available, starting...')
    return
  }

  const updateUrl = typeof resp.url === 'string' ? resp.url.trim() : ''
  if (!updateUrl) {
    log.warn('version check: update response missing url', resp)
    await setSplashProgress(15, 'Update response invalid, starting...')
    return
  }

  const remoteVersionRaw =
    typeof (resp as any).rendererVersion === 'string'
      ? (resp as any).rendererVersion
      : typeof resp.version === 'string'
        ? resp.version
        : ''
  const remoteVersion = remoteVersionRaw.trim()
  if (remoteVersion && compareSemver(remoteVersion, rendererVersion) <= 0) {
    log.info('version check: UI already latest, skip hot update', {
      remoteVersion,
      rendererVersion,
    })
    await setSplashProgress(15, `UI already latest (${rendererVersion}), starting...`)
    return
  }

  log.info('version check: start hot update download', {
    updateUrl,
    remoteVersion,
    rendererVersion,
  })

  await setSplashProgress(20, `Downloading hot update${remoteVersion ? ` (${remoteVersion})` : ''}...`)

  try {
    await installRendererUpdateFromUrl(
      { url: updateUrl, sha256: resp.sha256, rendererVersion: remoteVersion || undefined },
      (downloaded, total) => {
        const pct = total && total > 0 ? Math.floor((downloaded / total) * 70) + 20 : 25
        setSplashProgress(pct, 'Downloading hot update...')
      },
    )
    await setSplashProgress(95, 'Installing hot update...')
  } catch (e) {
    log.error('hot update failed', e)
    await setSplashProgress(15, 'Hot update failed, starting...')
  }
}

/**
 * 创建 Splash 启动画面窗口
 */
async function createSplash() {
  splashCreatedAt = Date.now()
  splash = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false
    }
  })

  // 等待内容加载完成后再显示
  splash.once('ready-to-show', () => {
    if (!app.isPackaged) console.log(`[startup] splash ready-to-show ${Date.now() - startupEpochMs}ms`)
    splash?.show()
  })

  await splash.loadFile(path.join(app.getAppPath(), 'splash.html'))
  if (!app.isPackaged) console.log(`[startup] splash loaded ${Date.now() - startupEpochMs}ms`)
}

/**
 * 创建主窗口
 */
async function createWindow() {
  // 获取屏幕尺寸
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  let rendererReady = false
  let fallbackTimer: NodeJS.Timeout | null = null

  win = new BrowserWindow({
    title: 'Four Wheel Alignment Calibration System',
    icon: path.join(__dirname, '../../icon.png'),
    width: width,
    height: height,
    center: true, // 居中显示
    autoHideMenuBar: true,
    frame: true,
    fullscreen: false,
    fullscreenable: true, // 允许全屏
    show: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false, // 禁用后台节流，加快隐藏窗口的渲染
    },
  })

  // ready-to-show 时不显示窗口，等待 renderer-ready
  win.once('ready-to-show', () => {
    if (!app.isPackaged) console.log(`[startup] main ready-to-show ${Date.now() - startupEpochMs}ms`)
  })

  // 监听渲染进程就绪信号
  ipcMain.once('app:renderer-ready', () => {
    rendererReady = true
    if (fallbackTimer) {
      clearTimeout(fallbackTimer)
      fallbackTimer = null
    }
    if (!app.isPackaged) console.log(`[startup] renderer-ready ${Date.now() - startupEpochMs}ms`)
    
    // 确保 splash 至少显示指定时间
    const elapsed = Date.now() - splashCreatedAt
    const remainingTime = Math.max(0, SPLASH_MIN_DISPLAY_MS - elapsed)
    
    if (!app.isPackaged) console.log(`[startup] splash displayed for ${elapsed}ms, waiting ${remainingTime}ms more`)
    
    setTimeout(() => {
      // 1. 先关闭 splash
      if (splash) {
        splash.close()
        splash = null
      }
      // 2. 显示主窗口并设置全屏
      if (win && !win.isVisible()) {
        win.setFullScreen(true)
        win.show()
        // 通知渲染进程全屏状态变化
        win.webContents.send('fullscreen-changed', true)
      }
    }, remainingTime)
  })

  fallbackTimer = setTimeout(() => {
    if (rendererReady) return
    log.warn('renderer-ready timeout, showing window')
    if (splash) {
      splash.close()
      splash = null
    }
    if (win && !win.isVisible()) {
      win.setFullScreen(true)
      win.show()
      win.webContents.send('fullscreen-changed', true)
    }
  }, 8000)

  // 加载页面
  await loadRenderer(win)

  win.webContents.once('did-finish-load', () => {
    if (!app.isPackaged) console.log(`[startup] did-finish-load ${Date.now() - startupEpochMs}ms`)
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  
  // 最小化时隐藏到托盘
  // @ts-ignore
  win.on('minimize', (event: any) => {
    event.preventDefault()
    win?.hide()
  })

  // 关闭时隐藏到托盘（生产环境）
  win.on('close', (event: any) => {
    if (!app.isPackaged) {
      return true
    }
    if (!isQuitting) {
      event.preventDefault()
      win?.hide()
      return false
    }
    return true
  })
}

// Tray Setup
function createTray() {
    try {
        tray = new Tray(nativeImage.createEmpty()) 
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Show App', click: () => win?.show() },
            { label: 'Quit', click: () => {
                console.log('[Tray] Quitting app...')
                isQuitting = true
                app.quit()
            }}
        ])
        tray.setToolTip('FWACS')
        tray.setContextMenu(contextMenu)
        
        tray.on('double-click', () => {
            win?.show()
        })
    } catch (e) {
        console.error("Tray creation failed", e)
    }
}

ipcMain.handle('win:minimize', () => win?.minimize())
ipcMain.handle('app:quit', () => {
    console.log('[app:quit] Quitting app...')
    isQuitting = true
    app.quit()
})
ipcMain.handle('win:toggle-fullscreen', () => {
    console.log('[win:toggle-fullscreen] Current fullscreen:', win?.isFullScreen())
    if (win) {
        const newState = !win.isFullScreen()
        console.log('[win:toggle-fullscreen] Setting to:', newState)
        win.setFullScreen(newState)
        return newState // 返回新状态
    }
    return false
})

ipcMain.handle('win:is-fullscreen', () => {
    return win?.isFullScreen() ?? false
})

ipcMain.handle('tcp:get-config', () => {
    const cfg = store.get('tcpConfig')
    const host = typeof cfg?.host === 'string' ? cfg.host.trim() : ''
    const portNum = typeof cfg?.port === 'number' ? cfg.port : Number(cfg?.port)
    const port = Number.isFinite(portNum) && portNum > 0 && portNum <= 65535 ? Math.floor(portNum) : 0
    return { host, port }
})

ipcMain.handle('tcp:set-config', (_event, host: string, port: number) => {
    const safeHost = typeof host === 'string' ? host.trim() : ''
    const portNum = typeof port === 'number' ? port : Number(port)
    const safePort = Number.isFinite(portNum) && portNum > 0 && portNum <= 65535 ? Math.floor(portNum) : 0
    store.set('tcpConfig', { host: safeHost, port: safePort })
    return { host: safeHost, port: safePort }
})

app.whenReady().then(async () => {
    try {
        await createSplash()
        await setSplashProgress(1, 'Initializing...')
        await ensureBootConfigExists()
        await runBootVersionCheck()
        await createWindow()
        
        createTray()
        
        setImmediate(() => {
            setupTcpService(win!)
            setupSysInfoService()
            setupUpdateService(win!)
            setupSerialService(win!)
            setupDllService(win!)
            setupNetworkService(win!)
            setupRendererUpdateService(win!)
            setupBootConfigService()
        })
    } catch (e) {
        log.error('startup failed', e)
        app.quit()
    }
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    if (!win.isVisible()) win.show()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
