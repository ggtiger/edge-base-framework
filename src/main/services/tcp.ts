import { ipcMain, BrowserWindow } from 'electron'
import net from 'net'
import log from 'electron-log'

let client: net.Socket | null = null

export function setupTcpService(win: BrowserWindow) {
    // Configure log
    log.transports.file.level = 'info'
    
    ipcMain.on('tcp:connect', (_, host: string, port: number) => {
        if (client) {
            client.destroy()
        }

        client = new net.Socket()

        client.connect(port, host, () => {
            const msg = `Connected to ${host}:${port}`
            win.webContents.send('tcp:status-change', 'Connected')
            log.info(msg)
        })

        client.on('data', (data) => {
            log.info(`TCP Rx: ${data.toString('hex')}`) // Log raw hex or string
            
            try {
                const json = JSON.parse(data.toString())
                win.webContents.send('tcp:data-received', JSON.stringify(json))
            } catch (e) {
                win.webContents.send('tcp:data-received', data.toString())
            }
        })

        client.on('close', () => {
            win.webContents.send('tcp:status-change', 'Closed')
            log.info('TCP Connection closed')
            // Reconnect logic could go here (e.g. setTimeout to connect again)
        })

        client.on('error', (err) => {
            const msg = `TCP Error: ${err.message}`
            win.webContents.send('tcp:status-change', msg)
            log.error(msg)
        })
    })

    ipcMain.on('tcp:disconnect', () => {
        if (client) {
            client.end()
            client.destroy()
            client = null
            log.info('TCP Disconnected by user')
        }
    })

    ipcMain.on('tcp:send', (_, data: string) => {
        if (client) {
            client.write(data)
            log.info(`TCP Tx: ${data}`)
        }
    })
}
