import Store from 'electron-store'

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
        tcpConfig: { host: '127.0.0.1', port: 8080 }
    }
})

export default store
