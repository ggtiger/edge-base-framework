import React, { useState, useEffect } from 'react'

// Define SystemInfo interface
interface SystemInfo {
  ip: string;
  mac: string;
  cpuTemp: number;
  memUsage: number;
  diskUsage: number;
}

interface DashboardProps {
  onOpenCalibration: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onOpenCalibration }) => {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null)
  const [tcpConfig, setTcpConfig] = useState({ host: '127.0.0.1', port: 8080 })
  const [tcpMessage, setTcpMessage] = useState('Hello from FWACS')
  const [tcpLogs, setTcpLogs] = useState<string[]>([])
  const [dllPath, setDllPath] = useState('')
  const [dllFunc, setDllFunc] = useState('add')
  const [dllArgs, setDllArgs] = useState('1, 2')
  const [dllResult, setDllResult] = useState('')
  const [updateStatus, setUpdateStatus] = useState('')

  const refreshSysInfo = async () => {
    try {
      const info = await window.electronAPI.getSysInfo()
      setSysInfo(info)
    } catch (error) {
      console.error(error)
    }
  }

  const connectTcp = () => {
    window.electronAPI.connectTcp(tcpConfig.host, tcpConfig.port)
    setTcpLogs(prev => [...prev, `Connecting to ${tcpConfig.host}:${tcpConfig.port}...`])
  }

  const disconnectTcp = () => {
    window.electronAPI.disconnectTcp()
  }

  const sendTcp = () => {
    window.electronAPI.sendTcp(tcpMessage)
    setTcpLogs(prev => [...prev, `Sent: ${tcpMessage}`])
  }

  const selectDll = async () => {
    const path = await window.electronAPI.selectDll()
    if (path) setDllPath(path)
  }

  const loadDll = async () => {
    if (!dllPath) return
    const res = await window.electronAPI.loadDll(dllPath)
    setDllResult(res.success ? 'Loaded successfully' : `Error: ${res.message}`)
  }

  const callDll = async () => {
    if (!dllPath) return
    const args = dllArgs.split(',').map(s => {
      const trimmed = s.trim()
      return isNaN(Number(trimmed)) ? trimmed : Number(trimmed)
    })
    const res = await window.electronAPI.callDll(dllPath, dllFunc, ...args)
    setDllResult(res.success ? `Result: ${res.result}` : `Error: ${res.message}`)
  }

  const checkUpdate = () => {
    window.electronAPI.checkUpdate()
    setUpdateStatus('Checking...')
  }

  const toggleFullscreen = () => {
    window.electronAPI.toggleFullscreen()
  }

  useEffect(() => {
    refreshSysInfo()

    const handleTcpData = (data: string) => {
      setTcpLogs(prev => [...prev, `Received: ${data}`])
    }
    const handleUpdateStatus = (status: string) => setUpdateStatus(status)

    const cleanupTcp = window.electronAPI.onTcpData(handleTcpData)
    window.electronAPI.onUpdateStatus(handleUpdateStatus)

    return () => {
      cleanupTcp()
    }
  }, [])

  return (
    <div className="dashboard-layout">
      <div className="container">
        <h1>Four Wheel Alignment Calibration System</h1>
        
        <div className="grid">
          {/* System Info Card */}
          <div className="card">
            <h2>Four Wheel Alignment Calibration System Status</h2>
            {sysInfo && (
              <div>
                <p><strong>IP:</strong> {sysInfo.ip}</p>
                <p><strong>MAC:</strong> {sysInfo.mac}</p>
                <p><strong>CPU Temp:</strong> {sysInfo.cpuTemp}°C</p>
                <p><strong>Memory:</strong> {sysInfo.memUsage}%</p>
                <p><strong>Disk:</strong> {sysInfo.diskUsage}%</p>
              </div>
            )}
            <button onClick={refreshSysInfo}>Refresh Info</button>
          </div>

          {/* Navigation Card */}
          <div className="card">
            <h2>Navigation</h2>
            <button onClick={onOpenCalibration} className="nav-btn">
               Open Calibration System
            </button>
          </div>

          {/* TCP Control Card */}
          <div className="card">
            <h2>FWACS TCP Client</h2>
            <div className="form-group">
              <input 
                value={tcpConfig.host} 
                onChange={e => setTcpConfig({...tcpConfig, host: e.target.value})} 
                placeholder="Host" 
              />
              <input 
                type="number" 
                value={tcpConfig.port} 
                onChange={e => setTcpConfig({...tcpConfig, port: Number(e.target.value)})} 
                placeholder="Port" 
              />
              <button onClick={connectTcp}>Connect</button>
              <button onClick={disconnectTcp}>Disconnect</button>
            </div>
            <div className="form-group">
               <input 
                 value={tcpMessage} 
                 onChange={e => setTcpMessage(e.target.value)} 
                 placeholder="Message" 
               />
               <button onClick={sendTcp}>Send</button>
            </div>
            <div className="logs">
              {tcpLogs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
          </div>

          {/* DLL Test Card */}
          <div className="card">
            <h2>DLL Invocation (Koffi)</h2>
            <div className="form-group">
              <input value={dllPath} placeholder="Select DLL file..." readOnly />
              <button onClick={selectDll}>Select File</button>
              <button onClick={loadDll}>Load DLL</button>
            </div>
            <div className="form-group">
               <input 
                 value={dllFunc} 
                 onChange={e => setDllFunc(e.target.value)} 
                 placeholder="Func Name (e.g. add)" 
               />
               <input 
                 value={dllArgs} 
                 onChange={e => setDllArgs(e.target.value)} 
                 placeholder="Args (e.g. 1, 2)" 
               />
               <button onClick={callDll}>Call</button>
            </div>
            <div>Result: {dllResult}</div>
          </div>
        </div>
        
        <div className="footer">
          <button onClick={checkUpdate}>Check for Updates</button>
          <button onClick={toggleFullscreen} style={{ marginLeft: '10px' }}>Toggle Fullscreen</button>
          {updateStatus && <span>{updateStatus}</span>}
        </div>
      </div>
      
      <style>{`
        /* Reset body to allow full screen views */
        body { margin: 0; padding: 0; font-family: sans-serif; }

        /* Dashboard specific styles */
        .dashboard-layout {
          background: #f0f2f5;
          min-height: 100vh;
          padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
        .logs { background: #333; color: #0f0; padding: 10px; height: 150px; overflow-y: auto; font-family: monospace; font-size: 12px; margin-top: 10px; border-radius: 4px; }
        .footer { margin-top: 20px; text-align: center; }
        .nav-btn {
            background: #3b82f6;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
            margin-top: 10px;
        }
        .nav-btn:hover {
            background: #2563eb;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
