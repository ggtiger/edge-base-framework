import React from 'react';

interface TcpLogViewerProps {
  logs: { direction: 'TX' | 'RX' | 'SYS'; content: string; timestamp: number }[];
}

export const TcpLogViewer: React.FC<TcpLogViewerProps> = ({ logs }) => {
  const latestLog = logs[0];

  return (
    <div className="relative group h-full flex items-center">
      {/* Handle / Title Bar */}
      <div className="h-full flex items-center gap-2 px-3 cursor-pointer hover:bg-gradient-to-b hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all border-l border-slate-400 dark:border-slate-600">
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${latestLog ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`}></div>
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">TCP</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[9px] text-slate-500 dark:text-slate-400 font-mono min-w-[20px] text-center">{logs.length}</span>
        </div>
        
        {latestLog ? (
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-300 dark:border-slate-600 pl-2 ml-1 w-[240px]">
             <span className={`text-[9px] font-bold px-1 rounded shrink-0 ${latestLog.direction === 'TX' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : latestLog.direction === 'RX' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>
                {latestLog.direction}
             </span>
             <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono flex-1">
                {latestLog.content}
             </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-300 dark:border-slate-600 pl-2 ml-1 w-[240px]">
             <span className="text-[10px] text-slate-400 italic">等待数据...</span>
          </div>
        )}
      </div>
      
      {/* Content - Popover */}
      <div className="absolute bottom-full left-0 mb-0 w-[600px] max-w-[90vw] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 translate-y-2 group-hover:translate-y-0 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-[9999]">
        <div className="h-8 flex items-center justify-between px-3 bg-slate-800/80 border-b border-slate-700/50">
             <span className="text-[10px] font-bold text-slate-400 font-sans">通信日志 (最新在前)</span>
             <div className="flex items-center gap-2 text-[9px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>RX</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>TX</span>
            </div>
        </div>
        <div className="h-64 overflow-y-auto p-2 flex flex-col gap-0.5 font-mono text-xs">
            {logs.length === 0 && <div className="text-slate-500 italic p-2 text-center mt-10">No communication logs recorded yet...</div>}
            {logs.map((log, i) => (
            <div key={i} className={`flex items-start gap-2 p-1 rounded hover:bg-white/5 transition-colors ${log.direction === 'TX' ? 'text-amber-100/90' : log.direction === 'RX' ? 'text-emerald-100/90' : 'text-slate-400'}`}>
                <span className="opacity-40 text-[10px] whitespace-nowrap w-16 text-right font-light">
                    {new Date(log.timestamp).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.{new Date(log.timestamp).getMilliseconds().toString().padStart(3, '0')}
                </span>
                <span className={`text-[9px] font-bold px-1 rounded ${log.direction === 'TX' ? 'bg-amber-500/20 text-amber-400' : log.direction === 'RX' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20'}`}>
                    {log.direction}
                </span>
                <span className="break-all font-light tracking-tight">{log.content}</span>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};
