import { ipcMain, BrowserWindow, dialog } from 'electron'
import koffi from 'koffi'
import path from 'path'
import log from 'electron-log'

// Store loaded libraries
const libraries: Record<string, any> = {}

export function setupDllService(win: BrowserWindow) {
    // 1. Load a DLL file
    ipcMain.handle('dll:load', async (_, dllPath: string) => {
        try {
            // If path is not absolute, assume it's in resources or relative to app
            // For safety, we might want to restrict paths, but for "direct call" flexibility we allow user input
            const lib = koffi.load(dllPath)
            libraries[dllPath] = lib
            log.info(`DLL loaded: ${dllPath}`)
            return { success: true, message: 'Loaded successfully' }
        } catch (error: any) {
            log.error(`Failed to load DLL: ${error.message}`)
            return { success: false, message: error.message }
        }
    })

    // 2. Call a function from the loaded DLL
    // Note: This is a generic "unsafe" wrapper. In production, you should define specific IPC handlers
    // for specific DLL functions to ensure types and safety.
    // This example assumes a simple function signature: int add(int a, int b)
    ipcMain.handle('dll:call-example', async (_, dllPath: string, funcName: string, ...args: any[]) => {
        try {
            const lib = libraries[dllPath]
            if (!lib) {
                throw new Error('DLL not loaded')
            }

            // Example: Define a function "add" that takes two integers and returns an integer
            // In a real generic implementation, you'd need to pass type info from the renderer,
            // which is complex. Here we demonstrate a hardcoded signature for demo purposes.
            // Or we can allow user to pass signature definition dynamically (Advanced).
            
            // Let's implement a dynamic definition approach for demonstration
            // Format: returnType, functionName, [argTypes...]
            // For this demo, we will just simulate calling a standard "add" function if it exists,
            // or rely on a predefined signature map.
            
            // DEMO SPECIFIC: predefined signature for 'add'
            if (funcName === 'add') {
                const func = lib.func('int add(int, int)')
                const result = func(...args)
                return { success: true, result }
            }
            
            // Generic fallback (User must register signature first - omitted for simplicity)
            return { success: false, message: `Function ${funcName} not defined in bridge. Please define signature in main/services/dll.ts` }

        } catch (error: any) {
            log.error(`DLL Call Error: ${error.message}`)
            return { success: false, message: error.message }
        }
    })
    
    // 3. User selects a DLL file
    ipcMain.handle('dll:select-file', async () => {
        const result = await dialog.showOpenDialog(win, {
            properties: ['openFile'],
            filters: [
                { name: 'Dynamic Libraries', extensions: ['dll', 'dylib', 'so'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        })
        return result.filePaths[0] || null
    })
}
