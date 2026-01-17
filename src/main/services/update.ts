import { ipcMain, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

export function setupUpdateService(win: BrowserWindow) {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    
    // Check for updates
    ipcMain.on('update:check', () => {
        autoUpdater.checkForUpdatesAndNotify()
    })
    
    autoUpdater.on('checking-for-update', () => {
        win.webContents.send('update:status', 'Checking for update...')
    })
    
    autoUpdater.on('update-available', () => {
        win.webContents.send('update:status', 'Update available.')
    })
    
    autoUpdater.on('update-not-available', () => {
        win.webContents.send('update:status', 'Update not available.')
    })
    
    autoUpdater.on('error', (err) => {
        win.webContents.send('update:status', 'Error in auto-updater. ' + err)
    })
    
    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
        win.webContents.send('update:status', log_message)
    })
    
    autoUpdater.on('update-downloaded', () => {
        win.webContents.send('update:status', 'Update downloaded')
    })
}
