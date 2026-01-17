import { ipcMain, BrowserWindow } from 'electron'
import { SerialPort } from 'serialport'
import log from 'electron-log'

let port: SerialPort | null = null

export function setupSerialService(win: BrowserWindow) {
    ipcMain.on('serial:open', (_, path: string, baudRate: number) => {
        if (port && port.isOpen) {
            port.close()
        }

        port = new SerialPort({ path, baudRate, autoOpen: false })

        port.open((err) => {
            if (err) {
                const msg = `Error opening serial port: ${err.message}`
                win.webContents.send('serial:status', msg)
                log.error(msg)
                return
            }
            win.webContents.send('serial:status', 'Opened')
            log.info(`Serial Port Opened: ${path} @ ${baudRate}`)
        })

        port.on('data', (data) => {
            log.info(`Serial Rx: ${data.toString('hex')}`)
            win.webContents.send('serial:data', data.toString())
        })
        
        port.on('error', (err) => {
            log.error(`Serial Error: ${err.message}`)
            win.webContents.send('serial:status', `Error: ${err.message}`)
        })
    })

    ipcMain.on('serial:close', () => {
        if (port && port.isOpen) {
            port.close((err) => {
                if(err) log.error(`Error closing port: ${err.message}`)
                else log.info('Serial Port Closed')
            })
        }
    })
}
