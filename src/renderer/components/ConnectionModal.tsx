import React, { useState, useEffect } from 'react';
import { GlassPanel } from './GlassPanel';
import { useNetworkCheck } from '../hooks/useNetworkCheck';

interface ConnectionModalProps {
  initialIp: string;
  initialPort: number;
  onConnect: (ip: string, port: number) => void;
  onClose: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ initialIp, initialPort, onConnect, onClose }) => {
  const [ip, setIp] = useState(initialIp);
  const [port, setPort] = useState(initialPort > 0 ? initialPort.toString() : '');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const { status: netStatus, settingIp, checkNetwork, setLocalIp } = useNetworkCheck();

  // Update local state if props change
  useEffect(() => {
    setIp(initialIp);
    setPort(initialPort > 0 ? initialPort.toString() : '');
  }, [initialIp, initialPort]);

  // 打开诊断时自动检查网络
  useEffect(() => {
    if (showDiagnostics && !netStatus.lastChecked) {
      checkNetwork();
    }
  }, [showDiagnostics, netStatus.lastChecked, checkNetwork]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const portNum = parseInt(port, 10);
    const safeIp = ip.trim();
    if (safeIp && !isNaN(portNum)) {
      onConnect(safeIp, portNum);
    }
  };

  const handleSetIp = async () => {
    const result = await setLocalIp();
    if (!result.success) {
      alert(result.message);
    }
  };

  const statusIcon = (ok: boolean) => (
    <span className={`material-icons text-sm ${ok ? 'text-emerald-500' : 'text-red-500'}`}>
      {ok ? 'check_circle' : 'cancel'}
    </span>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <GlassPanel className="w-full max-w-lg p-6 border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-icons text-red-500">wifi_off</span>
            连接失败
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 backdrop-blur-md transition-all flex items-center justify-center active:scale-95 shadow-sm"
          >
            <span className="material-icons text-sm text-slate-700 dark:text-slate-200">close</span>
          </button>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
          经过多次尝试仍无法连接到服务器。请确认网络连接和服务器地址是否正确。
        </p>

        {/* 网络诊断面板 */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-icons text-base">network_check</span>
              网络诊断
            </span>
            <span className="material-icons text-base transition-transform" style={{ transform: showDiagnostics ? 'rotate(180deg)' : 'none' }}>
              expand_more
            </span>
          </button>

          {showDiagnostics && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
              {/* WiFi 状态 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusIcon(netStatus.wifiOk)}
                  <span className="text-xs text-slate-600 dark:text-slate-400">无线连接</span>
                </div>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {netStatus.ssid || '未连接'}
                </span>
              </div>

              {/* 目标 WiFi */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-icons text-sm text-slate-400">wifi</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">目标热点</span>
                </div>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {netStatus.targetSsid} (密码: 88888888)
                </span>
              </div>

              {/* IP 地址 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusIcon(netStatus.ipOk)}
                  <span className="text-xs text-slate-600 dark:text-slate-400">本机 IP</span>
                </div>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {netStatus.localIp || '未获取'}
                </span>
              </div>

              {/* 目标 IP */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-icons text-sm text-slate-400">dns</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">目标网段</span>
                </div>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  192.168.4.x
                </span>
              </div>

              {/* 状态消息 */}
              <div className={`text-xs p-2 rounded ${
                netStatus.wifiOk && netStatus.ipOk 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
              }`}>
                {netStatus.message}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => checkNetwork()}
                  disabled={netStatus.checking}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  <span className={`material-icons text-sm ${netStatus.checking ? 'animate-spin' : ''}`}>
                    {netStatus.checking ? 'sync' : 'refresh'}
                  </span>
                  {netStatus.checking ? '检查中...' : '刷新'}
                </button>
                <button
                  type="button"
                  onClick={handleSetIp}
                  disabled={settingIp}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs disabled:opacity-50 transition-colors"
                  title="自动设置本机 IP 为 192.168.4.100（仅 Windows）"
                >
                  <span className={`material-icons text-sm ${settingIp ? 'animate-spin' : ''}`}>
                    {settingIp ? 'sync' : 'settings_ethernet'}
                  </span>
                  {settingIp ? '设置中...' : '设置 IP'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-900 dark:text-slate-500 mb-1">IP 地址</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-white focus:border-primary outline-none transition-colors font-mono text-sm"
                placeholder="192.168.4.1"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-900 dark:text-slate-500 mb-1">端口号</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-white focus:border-primary outline-none transition-colors font-mono text-sm"
                placeholder="10001"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all shadow-lg hover:shadow-blue-500/30 border border-blue-600 ring-1 ring-inset ring-white/50 active:scale-95 flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <span className="material-icons text-sm">refresh</span>
            重试连接
          </button>
        </form>
      </GlassPanel>
    </div>
  );
};
