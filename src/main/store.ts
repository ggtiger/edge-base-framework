type ElectronStoreCtor = typeof import('electron-store').default

const electronStoreModule = require('electron-store') as any
const Store = (typeof electronStoreModule === 'function'
    ? electronStoreModule
    : typeof electronStoreModule?.default === 'function'
      ? electronStoreModule.default
      : typeof electronStoreModule?.default?.default === 'function'
        ? electronStoreModule.default.default
        : null) as ElectronStoreCtor | null

if (!Store) throw new Error('electron-store import failed')

interface StoreSchema {
    windowBounds: {
        width: number
        height: number
        x?: number
        y?: number
    }
    tcpConfig: {
        host: string
        port: number
    }
}

const store = new Store<StoreSchema>({
    defaults: {
        windowBounds: { width: 1024, height: 768 },
        tcpConfig: { host: '', port: 0 }
    }
})

export default store
