import { app, BrowserWindow, shell, ipcMain, Tray, Menu, nativeImage, screen } from 'electron'
import path from 'path'
import { release } from 'os'
import { setupTcpService } from './services/tcp'
import { setupSysInfoService } from './services/sysInfo'
import { setupUpdateService } from './services/update'
import { setupSerialService } from './services/serial'
import { setupDllService } from './services/dll'

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
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

  win = new BrowserWindow({
    title: 'Four Wheel Alignment Calibration System',
    icon: path.join(__dirname, '../../icon.png'),
    width: width,
    height: height,
    center: true, // 居中显示
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
        //win.show()
        win.setFullScreen(true)
        // 通知渲染进程全屏状态变化
        win.webContents.send('fullscreen-changed', true)
      }
    }, remainingTime)
  })

  // 加载页面
  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../../dist/index.html'))
  } else {
    const url = process.env['VITE_DEV_SERVER_URL']
    win.loadURL(url!)
  }

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

app.whenReady().then(async () => {
    // 并行创建 splash 和主窗口，加快启动速度
    const splashPromise = createSplash()
    const windowPromise = createWindow()
    
    await Promise.all([splashPromise, windowPromise])
    
    createTray()
    
    // 延迟初始化服务，不阻塞启动
    setImmediate(() => {
        setupTcpService(win!)
        setupSysInfoService()
        setupUpdateService(win!)
        setupSerialService(win!)
        setupDllService(win!)
    })
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
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
