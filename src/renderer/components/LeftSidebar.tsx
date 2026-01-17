import React from 'react';
import { GlassPanel } from './GlassPanel';

type Mode = 'QS' | 'WQ' | null;
type WheelId = 'FL' | 'FR' | 'RL' | 'RR';

interface LeftSidebarProps {
  tcpStatus: string;
  linkStable: boolean;
  trafficPulse: boolean;
  sensorOk: boolean | null;
  mode: Mode;
  onSelectMode: (mode: Exclude<Mode, null>) => void;
  selectedWheels: Record<WheelId, boolean>;
  onToggleWheel: (wheel: WheelId) => void;
  onLinkFront: () => void;
  onLinkRear: () => void;
  disabled: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  tcpStatus,
  linkStable,
  trafficPulse,
  sensorOk,
  mode,
  onSelectMode,
  selectedWheels,
  onToggleWheel,
  onLinkFront,
  onLinkRear,
  disabled,
}) => {
  const systemOnline = tcpStatus === 'Connected';
  const sensorText = sensorOk == null ? 'UNKNOWN' : sensorOk ? 'OK' : 'NG';

  return (
    <div className="col-span-3 flex flex-col gap-4 h-full">
      {/* State Panel - Simplified and cleaner */}
      <GlassPanel className="flex-shrink-0 relative overflow-hidden flex flex-col">
         {/* Subtle background animation */}
         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-50"></div>
         
         <div className="p-4 flex flex-col gap-4 relative z-10">
            {/* Header with less visual weight */}
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400">状态监控 / STATUS MONITOR</span>
                </div>
                <div className="flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                    <span className="w-1 h-1 rounded-full bg-slate-400/60 dark:bg-slate-600 opacity-50"></span>
                    <span className="w-1 h-1 rounded-full bg-slate-400/40 dark:bg-slate-600 opacity-25"></span>
                </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* System Status */}
                <div className="bg-white dark:bg-slate-900/40 rounded-lg p-3 border border-slate-400 dark:border-white/5 flex flex-col justify-between gap-2 group hover:border-blue-500 dark:hover:border-blue-500/20 transition-all shadow-sm">
                    <span className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold">System</span>
                    <div className="flex items-center gap-2">
                         <span className="relative flex h-2 w-2">
                            {systemOnline ? (
                              <>
                                <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${trafficPulse ? 'animate-ping' : ''}`}></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </>
                            ) : (
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            )}
                        </span>
                        <span
                          className={`text-xs font-bold font-display ${systemOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}
                        >
                          {systemOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </div>
                </div>

                {/* Link Status */}
                <div className="bg-white dark:bg-slate-900/40 rounded-lg p-3 border border-slate-400 dark:border-white/5 flex flex-col justify-between gap-2 group hover:border-blue-500 dark:hover:border-blue-500/20 transition-all shadow-sm">
                    <span className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold">Link</span>
                    <div className="flex items-center gap-2">
                        <span className={`material-icons text-[10px] ${linkStable ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 dark:text-slate-600'}`}>sensors</span>
                        <span className={`text-xs font-bold font-display ${linkStable ? 'text-blue-800 dark:text-blue-400' : 'text-slate-900 dark:text-slate-500'}`}>
                          {linkStable ? 'ACTIVE' : 'IDLE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Button - More integrated */}
             <button className="w-full relative group overflow-hidden rounded-lg bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500/50 transition-all duration-300 shadow-md">
                <div className={`absolute inset-0 bg-gradient-to-r ${sensorOk ? 'from-emerald-100 to-emerald-50 dark:from-emerald-600/80 dark:to-emerald-500/80' : 'from-red-100 to-red-50 dark:from-red-600/80 dark:to-red-500/80'} translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out`}></div>
                <div className="flex items-center justify-center gap-2 py-2 relative z-10">
                    <span className="text-[10px] font-bold tracking-[0.15em] text-slate-900 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{`SENSOR: ${sensorText}`}</span>
                    <div className="w-5 h-5 rounded bg-slate-100 dark:bg-black/20 flex items-center justify-center group-hover:bg-white/50 transition-colors border border-slate-200 dark:border-transparent">
                        <span className={`material-icons text-xs ${sensorOk ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'} group-hover:text-slate-900 dark:group-hover:text-white transition-colors ${trafficPulse ? 'animate-pulse' : ''}`}>sensors</span>
                    </div>
                </div>
            </button>
         </div>
      </GlassPanel>

      {/* Logic Panel - The "Car" Visualization */}
      <GlassPanel className="flex-grow flex flex-col relative overflow-hidden min-h-0">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
          
          <div className="p-4 flex flex-col h-full relative z-10">
             {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
               <div className="flex items-center gap-2">
                   <div className="w-1 h-3 bg-indigo-500 rounded-sm shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                   <span className="text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400">对齐逻辑 / ALIGNMENT LOGIC</span>
               </div>
           </div>

           {/* Mode Selection Grid */}
           <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
               <button
                 disabled={disabled}
                 onClick={() => onSelectMode('QS')}
                 className={`relative group overflow-hidden h-10 rounded-lg border transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                   mode === 'QS'
                     ? 'bg-indigo-50 border-indigo-500/60 dark:bg-indigo-600/10 dark:border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                     : 'bg-white dark:bg-slate-800/50 border-slate-400 dark:border-slate-700/50 hover:border-indigo-500/60 shadow-md'
                 }`}
               >
                 {mode === 'QS' ? (
                   <div className="absolute bottom-0 left-0 h-[2px] w-full bg-indigo-500 shadow-[0_0_5px_#6366f1]"></div>
                 ) : (
                   <div className="absolute inset-0 bg-indigo-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                 )}
                 <div className="relative flex items-center justify-center gap-2 h-full">
                   <span className={`material-icons text-xs transition-colors ${mode === 'QS' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>straighten</span>
                   <span className={`text-[10px] font-bold transition-colors tracking-wider ${mode === 'QS' ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'}`}>前束 / TOE</span>
                 </div>
               </button>
               <button
                 disabled={disabled}
                 onClick={() => onSelectMode('WQ')}
                 className={`relative group overflow-hidden h-10 rounded-lg border transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                   mode === 'WQ'
                     ? 'bg-indigo-50 border-indigo-500/60 dark:bg-indigo-600/10 dark:border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                     : 'bg-white dark:bg-slate-800/50 border-slate-400 dark:border-slate-700/50 hover:border-indigo-500/60 shadow-md'
                 }`}
               >
                 {mode === 'WQ' ? (
                   <div className="absolute bottom-0 left-0 h-[2px] w-full bg-indigo-500 shadow-[0_0_5px_#6366f1]"></div>
                 ) : (
                   <div className="absolute inset-0 bg-indigo-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                 )}
                 <div className="relative flex items-center justify-center gap-2 h-full">
                   <span className={`material-icons text-xs transition-colors ${mode === 'WQ' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>settings_overscan</span>
                   <span className={`text-[10px] font-bold transition-colors tracking-wider ${mode === 'WQ' ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'}`}>外倾 / CAM</span>
                 </div>
               </button>
           </div>

           {/* Car Visualization */}
           <div className="flex-grow flex flex-col justify-center items-center relative perspective-[1000px]">
               
               {/* Central Chassis/Body Hint */}
               <div className="absolute inset-x-8 top-0 bottom-0 border-x border-slate-700/20 -z-10"></div>
               <div className="absolute inset-y-8 left-0 right-0 border-y border-slate-700/20 -z-10"></div>
               
               {/* Car Outline (Abstract) */}
               <div className="absolute w-32 h-48 border border-slate-700/30 rounded-3xl -z-10 flex items-center justify-center">
                   <div className="w-full h-full bg-slate-800/5 backdrop-blur-[1px] rounded-3xl"></div>
               </div>

               {/* Wheels Container */}
               <div className="w-full h-64 relative max-w-[240px]">
                   
                   {/* Front Axle Line */}
                   <div className="absolute top-[15%] left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent flex items-center justify-center">
                        {/* Front Link Button */}
                        <button
                          disabled={disabled}
                          onClick={onLinkFront}
                          className={`w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 flex items-center justify-center transition-all z-20 group shadow-md ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:border-indigo-500 hover:shadow-[0_0_10px_rgba(99,102,241,0.4)]'}`}
                        >
                            <span className="material-icons text-[10px] text-slate-700 group-hover:text-indigo-600 transition-colors">link</span>
                        </button>
                   </div>

                   {/* Rear Axle Line */}
                   <div className="absolute bottom-[15%] left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent flex items-center justify-center">
                        {/* Rear Link Button */}
                        <button
                          disabled={disabled}
                          onClick={onLinkRear}
                          className={`w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 flex items-center justify-center transition-all z-20 group shadow-md ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:border-indigo-500 hover:shadow-[0_0_10px_rgba(99,102,241,0.4)]'}`}
                        >
                            <span className="material-icons text-[10px] text-slate-700 group-hover:text-indigo-600 transition-colors">link</span>
                        </button>
                   </div>

                    {/* FL Wheel */}
                    <button
                      disabled={disabled}
                      onClick={() => onToggleWheel('FL')}
                      className={`absolute top-0 left-0 w-12 h-20 group transition-transform ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-1'}`}
                    >
                        <div className={`w-full h-full border rounded-lg relative overflow-hidden shadow-lg transition-all ${
                          selectedWheels.FL 
                            ? 'bg-blue-600 dark:bg-blue-600 border-blue-500 shadow-blue-500/40' 
                            : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600/50 group-hover:shadow-blue-500/20 group-hover:border-blue-500/50'
                        }`}>
                            <div className={`absolute inset-0 flex flex-col justify-between py-1 ${selectedWheels.FL ? 'opacity-30' : 'opacity-20'}`}>
                                {[...Array(6)].map((_, i) => <div key={i} className={`h-[2px] w-full ${selectedWheels.FL ? 'bg-white' : 'bg-slate-400'}`}></div>)}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-[10px] font-bold font-display ${selectedWheels.FL ? 'text-white' : 'text-slate-900 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>FL</span>
                            </div>
                            {/* Status Dot */}
                            <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${selectedWheels.FL ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'}`}></div>
                        </div>
                    </button>

                    {/* FR Wheel */}
                    <button
                      disabled={disabled}
                      onClick={() => onToggleWheel('FR')}
                      className={`absolute top-0 right-0 w-12 h-20 group transition-transform ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-1'}`}
                    >
                        <div className={`w-full h-full border rounded-lg relative overflow-hidden shadow-lg transition-all ${
                          selectedWheels.FR 
                            ? 'bg-blue-600 dark:bg-blue-600 border-blue-500 shadow-blue-500/40' 
                            : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600/50 group-hover:shadow-blue-500/20 group-hover:border-blue-500/50'
                        }`}>
                             <div className={`absolute inset-0 flex flex-col justify-between py-1 ${selectedWheels.FR ? 'opacity-30' : 'opacity-20'}`}>
                                {[...Array(6)].map((_, i) => <div key={i} className={`h-[2px] w-full ${selectedWheels.FR ? 'bg-white' : 'bg-slate-400'}`}></div>)}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-[10px] font-bold font-display ${selectedWheels.FR ? 'text-white' : 'text-slate-900 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>FR</span>
                            </div>
                            <div className={`absolute top-1 left-1 w-1.5 h-1.5 rounded-full ${selectedWheels.FR ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'}`}></div>
                        </div>
                    </button>

                    {/* Center Hub */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            {/* Rotating Rings */}
                            <div className="absolute inset-0 border border-slate-400 dark:border-slate-700/50 rounded-full animate-[spin_8s_linear_infinite]"></div>
                            <div className="absolute inset-2 border border-slate-400 dark:border-slate-700/30 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
                            
                            {/* Core Button - Restore CENTER text and Red Color */}
                            <button className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-900 border border-red-300 dark:border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)] group hover:scale-105 hover:bg-red-500/10 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all z-10">
                                <span className="text-[10px] font-bold text-red-700 dark:text-red-500 group-hover:text-red-800 dark:group-hover:text-white transition-colors tracking-widest">CENTER</span>
                            </button>
                            
                            {/* Connecting Beams */}
                            <div className="absolute w-full h-[1px] bg-slate-400/30 dark:bg-slate-700/20 rotate-45"></div>
                            <div className="absolute w-full h-[1px] bg-slate-400/30 dark:bg-slate-700/20 -rotate-45"></div>
                        </div>
                    </div>

                    {/* RL Wheel */}
                    <button
                      disabled={disabled}
                      onClick={() => onToggleWheel('RL')}
                      className={`absolute bottom-0 left-0 w-12 h-20 group transition-transform ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:translate-y-1'}`}
                    >
                        <div className={`w-full h-full border rounded-lg relative overflow-hidden shadow-lg transition-all ${
                          selectedWheels.RL 
                            ? 'bg-blue-600 dark:bg-blue-600 border-blue-500 shadow-blue-500/40' 
                            : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600/50 group-hover:shadow-blue-500/20 group-hover:border-blue-500/50'
                        }`}>
                             <div className={`absolute inset-0 flex flex-col justify-between py-1 ${selectedWheels.RL ? 'opacity-30' : 'opacity-20'}`}>
                                {[...Array(6)].map((_, i) => <div key={i} className={`h-[2px] w-full ${selectedWheels.RL ? 'bg-white' : 'bg-slate-400'}`}></div>)}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-[10px] font-bold font-display ${selectedWheels.RL ? 'text-white' : 'text-slate-900 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>RL</span>
                            </div>
                            <div className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ${selectedWheels.RL ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'}`}></div>
                        </div>
                    </button>

                    {/* RR Wheel */}
                    <button
                      disabled={disabled}
                      onClick={() => onToggleWheel('RR')}
                      className={`absolute bottom-0 right-0 w-12 h-20 group transition-transform ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:translate-y-1'}`}
                    >
                        <div className={`w-full h-full border rounded-lg relative overflow-hidden shadow-lg transition-all ${
                          selectedWheels.RR 
                            ? 'bg-blue-600 dark:bg-blue-600 border-blue-500 shadow-blue-500/40' 
                            : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600/50 group-hover:shadow-blue-500/20 group-hover:border-blue-500/50'
                        }`}>
                             <div className={`absolute inset-0 flex flex-col justify-between py-1 ${selectedWheels.RR ? 'opacity-30' : 'opacity-20'}`}>
                                {[...Array(6)].map((_, i) => <div key={i} className={`h-[2px] w-full ${selectedWheels.RR ? 'bg-white' : 'bg-slate-400'}`}></div>)}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-[10px] font-bold font-display ${selectedWheels.RR ? 'text-white' : 'text-slate-900 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>RR</span>
                            </div>
                            <div className={`absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full ${selectedWheels.RR ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'}`}></div>
                        </div>
                    </button>

                </div>
            </div>
          </div>
      </GlassPanel>
    </div>
  );
};
