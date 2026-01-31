import { ipcMain, BrowserWindow } from 'electron'
import net from 'net'
import log from 'electron-log'

let client: net.Socket | null = null
let receiveBuffer = '' // 消息缓冲区（以\n为分隔符）

function resetState() {
    receiveBuffer = ''
}

export function setupTcpService(win: BrowserWindow) {
    // Configure log
    log.transports.file.level = 'info'
    
    ipcMain.on('tcp:connect', (_, host: string, port: number) => {
        if (client) {
            client.destroy()
        }

        resetState()
        client = new net.Socket()

        client.connect(port, host, () => {
            const msg = `Connected to ${host}:${port}`
            win.webContents.send('tcp:status-change', 'Connected')
            log.info(msg)
        })

        client.on('data', (data) => {
            // 将数据追加到缓冲区
            receiveBuffer += data.toString()
            
            // 以\n为分隔符解析完整消息
            let newlineIndex: number
            while ((newlineIndex = receiveBuffer.indexOf('\n')) !== -1) {
                const message = receiveBuffer.slice(0, newlineIndex).trim()
                receiveBuffer = receiveBuffer.slice(newlineIndex + 1)
                
                if (message) {
                    log.info(`TCP Rx: ${message}`)
                    
                    try {
                        const json = JSON.parse(message)
                        win.webContents.send('tcp:data-received', JSON.stringify(json))
                    } catch (e) {
                        win.webContents.send('tcp:data-received', message)
                    }
                }
            }
        })

        client.on('close', () => {
            win.webContents.send('tcp:status-change', 'Closed')
            log.info('TCP Connection closed')
            resetState()
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
            resetState()
            log.info('TCP Disconnected by user')
        }
    })

    ipcMain.on('tcp:send', (_, data: string) => {
        if (!client) {
            log.warn('TCP not connected, command dropped:', data)
            return
        }
        
        // 直接发送命令（确保以\n结尾）
        const dataToSend = data.endsWith('\n') ? data : data + '\n'
        client.write(dataToSend)
        log.info(`TCP Tx: ${data}`)
    })
    
    // 清空缓冲区
    ipcMain.on('tcp:clear-queue', () => {
        log.info('TCP buffer cleared')
        resetState()
    })
}
