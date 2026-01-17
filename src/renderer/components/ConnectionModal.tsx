import React, { useState, useEffect } from 'react';
import { GlassPanel } from './GlassPanel';

interface ConnectionModalProps {
  initialIp: string;
  initialPort: number;
  onConnect: (ip: string, port: number) => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ initialIp, initialPort, onConnect }) => {
  const [ip, setIp] = useState(initialIp);
  const [port, setPort] = useState(initialPort.toString());

  // Update local state if props change (though typically this modal unmounts on success)
  useEffect(() => {
    setIp(initialIp);
    setPort(initialPort.toString());
  }, [initialIp, initialPort]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const portNum = parseInt(port, 10);
    if (ip && !isNaN(portNum)) {
      onConnect(ip, portNum);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <GlassPanel className="w-full max-w-md p-6 border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-icons text-red-500">wifi_off</span>
          连接失败
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          经过多次尝试仍无法连接到服务器。请确认服务器地址和端口号是否正确，然后重试。
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">IP 地址</label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary outline-none transition-colors font-mono text-sm"
              placeholder="127.0.0.1"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">端口号</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary outline-none transition-colors font-mono text-sm"
              placeholder="10001"
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-primary hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-icons text-sm">refresh</span>
            重试连接
          </button>
        </form>
      </GlassPanel>
    </div>
  );
};
