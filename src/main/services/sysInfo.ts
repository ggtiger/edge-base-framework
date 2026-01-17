import { ipcMain } from 'electron'
import si from 'systeminformation'

export function setupSysInfoService() {
    ipcMain.handle('sys:get-info', async () => {
        try {
            const [cpuTemp, mem, net, disk] = await Promise.all([
                si.cpuTemperature(),
                si.mem(),
                si.networkInterfaces(),
                si.fsSize()
            ])
            
            // Find main interface (first one that is not internal)
            const mainNet = Array.isArray(net) ? net.find(n => !n.internal) : net
            
            return {
                cpuTemp: cpuTemp.main,
                memUsage: ((mem.active / mem.total) * 100).toFixed(2),
                ip: mainNet && typeof mainNet !== 'string' && 'ip4' in mainNet ? mainNet.ip4 : 'N/A',
                mac: mainNet && typeof mainNet !== 'string' && 'mac' in mainNet ? mainNet.mac : 'N/A',
                diskUsage: disk.length > 0 ? disk[0].use.toFixed(2) : 'N/A'
            }
        } catch (error) {
            console.error('Error getting sys info:', error)
            return null
        }
    })
}
