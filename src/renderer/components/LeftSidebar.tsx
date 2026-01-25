import React from 'react';
import { GlassPanel } from './GlassPanel';

type Mode = 'QS' | 'WQ' | null;
type WheelId = 'FL' | 'FR' | 'RL' | 'RR';

/** 传感器状态 (4个传感器) */
type SensorStatus = [boolean, boolean, boolean, boolean];
/** 回原点状态：0=未动作, 1=进行中, 2=完成 */
type HomingStatus = [0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2];

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
  onLinkLeft: () => void;
  onLinkRight: () => void;
  disabled: boolean;
  // 传感器和回原点状态
  sensorStatus: SensorStatus;
  homingStatus: HomingStatus;
  homingInProgress: boolean;
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
  onLinkLeft,
  onLinkRight,
  disabled,
  sensorStatus,
  homingStatus,
  homingInProgress,
}) => {
  const systemOnline = tcpStatus === 'Connected';
  const sensorText = sensorOk == null ? 'UNKNOWN' : sensorOk ? 'OK' : 'NG';

  const sensorLabels = ['FL', 'FR', 'RL', 'RR'];
  const homingLabels = ['M1', 'M2', 'M3', 'M4'];

  const getHomingColor = (status: 0 | 1 | 2) => {
    if (status === 0) return 'bg-slate-400';
    if (status === 1) return 'bg-amber-500 animate-pulse';
    return 'bg-emerald-500';
  };

  return (
    <div className="col-span-3 flex flex-col gap-3 h-full min-h-0">
      {/* State Panel */}
      <GlassPanel className="flex-shrink-0 relative overflow-hidden">
         {/* Subtle background animation */}
         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-50"></div>
         
         <div className="p-3 flex flex-col gap-2 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400">状态监控 / STATUS</span>
                </div>
            </div>

            {/* Status Grid - 2x2 */}
            <div className="grid grid-cols-2 gap-2">
                {/* System */}
                <div className="bg-white/40 dark:bg-slate-800/40 rounded-lg p-2 border border-white/20 dark:border-white/5 backdrop-blur-md shadow-inner flex items-center gap-2">
                    <span className="relative flex h-2 w-2 shrink-0">
                        {systemOnline ? (
                          <>
                            <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${trafficPulse ? 'animate-ping' : ''}`}></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        )}
                    </span>
                    <span className={`text-[9px] font-bold ${systemOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                      {systemOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                </div>

                {/* Link */}
                <div className="bg-white/40 dark:bg-slate-800/40 rounded-lg p-2 border border-white/20 dark:border-white/5 backdrop-blur-md shadow-inner flex items-center gap-2">
                    <span className={`material-icons text-[10px] ${linkStable ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 dark:text-slate-600'}`}>sensors</span>
                    <span className={`text-[9px] font-bold ${linkStable ? 'text-blue-800 dark:text-blue-400' : 'text-slate-900 dark:text-slate-500'}`}>
                      {linkStable ? 'ACTIVE' : 'IDLE'}
                    </span>
                </div>

                {/* 传感器 */}
                <div className="bg-white/40 dark:bg-slate-800/40 rounded-lg p-2 border border-white/20 dark:border-white/5 backdrop-blur-md shadow-inner flex items-center gap-2">
                    <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold shrink-0">SENSOR</span>
                    <div className="flex gap-1">
                        {sensorStatus.map((ok, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} title={sensorLabels[i]}></div>
                        ))}
                    </div>
                </div>

                {/* 回原点 */}
                <div className="bg-white/40 dark:bg-slate-800/40 rounded-lg p-2 border border-white/20 dark:border-white/5 backdrop-blur-md shadow-inner flex items-center gap-2">
                    <span className={`text-[8px] text-slate-500 dark:text-slate-400 font-bold shrink-0 ${homingInProgress ? 'animate-pulse text-amber-500' : ''}`}>HOME</span>
                    <div className="flex gap-1">
                        {homingStatus.map((status, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${getHomingColor(status)}`} title={homingLabels[i]}></div>
                        ))}
                    </div>
                </div>
            </div>
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
           <div className="grid grid-cols-2 gap-3 mb-2 shrink-0 z-10">
               <button
                 disabled={disabled}
                 onClick={() => onSelectMode('QS')}
                 className={`relative group overflow-hidden h-10 rounded-lg border transition-all active:scale-95 backdrop-blur-md ring-1 ring-inset ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                   mode === 'QS'
                     ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 border-indigo-600 dark:border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)] ring-white/30'
                     : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-800/60 dark:to-slate-900/60 border-slate-400 dark:border-slate-500 ring-white/80 dark:ring-white/20 hover:border-indigo-500/60 shadow-lg hover:shadow-indigo-500/20'
                 }`}
               >
                 {mode === 'QS' ? (
                   <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/50 shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
                 ) : (
                   <div className="absolute inset-0 bg-indigo-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                 )}
                 <div className="relative flex items-center justify-center gap-2 h-full">
                   <span className={`material-icons text-xs transition-colors ${mode === 'QS' ? 'text-white' : 'text-slate-900 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>straighten</span>
                   <span className={`text-[10px] font-bold transition-colors tracking-wider ${mode === 'QS' ? 'text-white' : 'text-slate-900 dark:text-slate-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'}`}>前束 / TOE</span>
                 </div>
               </button>
               <button
                 disabled={disabled}
                 onClick={() => onSelectMode('WQ')}
                 className={`relative group overflow-hidden h-10 rounded-lg border transition-all active:scale-95 backdrop-blur-md ring-1 ring-inset ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                   mode === 'WQ'
                     ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 border-indigo-600 dark:border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)] ring-white/30'
                     : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-800/60 dark:to-slate-900/60 border-slate-400 dark:border-slate-500 ring-white/80 dark:ring-white/20 hover:border-indigo-500/60 shadow-lg hover:shadow-indigo-500/20'
                 }`}
               >
                 {mode === 'WQ' ? (
                   <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/50 shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
                 ) : (
                   <div className="absolute inset-0 bg-indigo-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                 )}
                 <div className="relative flex items-center justify-center gap-2 h-full">
                   <span className={`material-icons text-xs transition-colors ${mode === 'WQ' ? 'text-white' : 'text-slate-900 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>settings_overscan</span>
                   <span className={`text-[10px] font-bold transition-colors tracking-wider ${mode === 'WQ' ? 'text-white' : 'text-slate-900 dark:text-slate-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'}`}>外倾 / CAM</span>
                 </div>
               </button>
           </div>

           {/* Car Visualization */}
           <div className="flex-grow flex flex-col justify-center items-center relative perspective-[1000px] min-h-0 py-2">
               
               {/* Decorative Background Elements */}
               <div className="absolute inset-0 flex items-center justify-center -z-20">
                  <div className="w-px h-full bg-gradient-to-b from-indigo-500/20 via-slate-500/5 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent opacity-30"></div>
               </div>

               {/* Connection Line from Top */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-indigo-500/40 to-transparent -z-10"></div>

               {/* Car Outline (Abstract) - 使用 aspect-ratio 保持比例 */}
               <div className="absolute w-[55%] aspect-[11/16] max-h-[90%] border border-slate-700/20 dark:border-slate-700/30 rounded-[2rem] -z-10 flex items-center justify-center">
                   <div className="w-full h-full bg-slate-800/5 backdrop-blur-[1px] rounded-[2rem]"></div>
                   {/* Internal chassis detail */}
                   <div className="absolute inset-x-[15%] top-[8%] bottom-[8%] border-x border-dashed border-slate-500/10"></div>
                   <div className="absolute inset-y-[12%] left-0 right-0 border-y border-dashed border-slate-500/10"></div>
               </div>

               {/* Wheels Container - 自适应高度 */}
               <div className="w-[85%] max-w-[280px] h-full max-h-[320px] relative flex-shrink-0" style={{ aspectRatio: '10/13' }}>
                   
                   {/* Front Axle Line */}
                   <div className="absolute top-[15%] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent flex items-center justify-center">
                        {/* Front Link Button */}
                        <button
                          disabled={disabled}
                          onClick={onLinkFront}
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-400 dark:border-slate-500 ring-1 ring-inset ring-white/80 dark:ring-white/20 backdrop-blur-md flex items-center justify-center transition-all z-20 group shadow-lg active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:border-indigo-500 hover:shadow-[0_0_10px_rgba(99,102,241,0.4)]'}`}
                        >
                            <span className="material-icons text-[10px] sm:text-xs text-slate-700 group-hover:text-indigo-600 transition-colors">link</span>
                        </button>
                   </div>

                   {/* Rear Axle Line */}
                   <div className="absolute bottom-[15%] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent flex items-center justify-center">
                        {/* Rear Link Button */}
                        <button
                          disabled={disabled}
                          onClick={onLinkRear}
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-400 dark:border-slate-500 ring-1 ring-inset ring-white/80 dark:ring-white/20 backdrop-blur-md flex items-center justify-center transition-all z-20 group shadow-lg active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:border-indigo-500 hover:shadow-[0_0_10px_rgba(99,102,241,0.4)]'}`}
                        >
                            <span className="material-icons text-[10px] sm:text-xs text-slate-700 group-hover:text-indigo-600 transition-colors">link</span>
                        </button>
                   </div>

                   {/* Left Link Button (Vertical) */}
                   <div className="absolute left-[10%] top-[15%] bottom-[15%] w-[1px] bg-gradient-to-b from-transparent via-slate-600/30 to-transparent flex items-center justify-center">
                        <button
                          disabled={disabled}
                          onClick={onLinkLeft}
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-400 dark:border-slate-500 ring-1 ring-inset ring-white/80 dark:ring-white/20 backdrop-blur-md flex items-center justify-center transition-all z-20 group shadow-lg active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:border-indigo-500 hover:shadow-[0_0_10px_rgba(99,102,241,0.4)]'}`}
                        >
                            <span className="material-icons text-[10px] sm:text-xs text-slate-700 group-hover:text-indigo-600 transition-colors rotate-90">link</span>
                        </button>
                   </div>

                   {/* Right Link Button (Vertical) */}
                   <div className="absolute right-[10%] top-[15%] bottom-[15%] w-[1px] bg-gradient-to-b from-transparent via-slate-600/30 to-transparent flex items-center justify-center">
                        <button
                          disabled={disabled}
                          onClick={onLinkRight}
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-400 dark:border-slate-500 ring-1 ring-inset ring-white/80 dark:ring-white/20 backdrop-blur-md flex items-center justify-center transition-all z-20 group shadow-lg active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:border-indigo-500 hover:shadow-[0_0_10px_rgba(99,102,241,0.4)]'}`}
                        >
                            <span className="material-icons text-[10px] sm:text-xs text-slate-700 group-hover:text-indigo-600 transition-colors rotate-90">link</span>
                        </button>
                   </div>

                    {/* FL Wheel */}
                    <button
                      disabled={disabled}
                      onClick={() => onToggleWheel('FL')}
                      className={`absolute top-0 left-0 w-[22%] h-[30%] group transition-all active:scale-95 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-1'}`}
                    >
                        <div className={`w-full h-full border rounded-lg relative overflow-hidden backdrop-blur-md transition-all ${
                          selectedWheels.FL 
                            ? 'bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 border-blue-400 dark:border-blue-500 ring-1 ring-inset ring-white/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                            : 'bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-400 dark:border-slate-500 ring-1 ring-inset ring-white/80 dark:ring-white/20 shadow-lg group-hover:border-blue-500 group-hover:shadow-blue-500/30'
                        }`}>
                            <div className={`absolute inset-0 flex flex-col justify-between py-1 ${selectedWheels.FL ? 'opacity-30' : 'opacity-20'}`}>
                                {[...Array(6)].map((_, i) => <div key={i} className={`h-[2px] w-full ${selectedWheels.FL ? 'bg-white' : 'bg-slate-400'}`}></div>)}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-[10px] sm:text-xs font-bold font-display ${selectedWheels.FL ? 'text-white' : 'text-slate-900 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>FL</span>
                            </div>
                            {/* Status Dot */}
                            <div className={`absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${selectedWheels.FL ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'}`}></div>
                        </div>
                    </button>

                    {/* FR Wheel */}
                    <button
                      disabled={disabled}
                      onClick={() => onToggleWheel('FR')}
                      className={`absolute top-0 right-0 w-[22%] h-[30%] group transition-all active:scale-95 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-1'}`}
                    >
                        <div className={`w-full h-full border rounded-lg relative overflow-hidden backdrop-blur-md transition-all ${
                          selectedWheels.FR 
                            ? 'bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 border-blue-400 dark:border-blue-500 ring-1 ring-inset ring-white/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                            : 'bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-400 dark:border-slate-500 ring-1 ring-inset ring-white/80 dark:ring-white/20 shadow-lg group-hover:border-blue-500 group-hover:shadow-blue-500/30'
                        }`}>
                             <div className={`absolute inset-0 flex flex-col justify-between py-1 ${selectedWheels.FR ? 'opacity-30' : 'opacity-20'}`}>
                                {[...Array(6)].map((_, i) => <div key={i} className={`h-[2px] w-full ${selectedWheels.FR ? 'bg-white' : 'bg-slate-400'}`}></div>)}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-[10px] sm:text-xs font-bold font-display ${selectedWheels.FR ? 'text-white' : 'text-slate-900 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>FR</span>
                            </div>
                            <div className={`absolute top-1 left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${selectedWheels.FR ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'}`}></div>
                        </div>
                    </button>

                    {/* Center Hub */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38%] aspect-square">
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Rotating Rings */}
                            <div className="absolute inset-0 border border-slate-400 dark:border-slate-700/50 rounded-full animate-[spin_8s_linear_infinite]"></div>
                            <div className="absolute inset-[10%] border border-slate-400 dark:border-slate-700/30 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
                            
                            {/* Core Button */}
                            <button className="w-[60%] aspect-square rounded-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-red-300 dark:border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)] group hover:scale-105 hover:bg-red-500/10 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all z-10 active:scale-95 ring-1 ring-inset ring-white/60 dark:ring-white/10 backdrop-blur-md">
                                <span className="text-[8px] sm:text-[10px] font-bold text-red-700 dark:text-red-500 group-hover:text-red-800 dark:group-hover:text-white transition-colors tracking-widest">CENTER</span>
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
                      className={`absolute bottom-0 left-0 w-[22%] h-[30%] group transition-all active:scale-95 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:translate-y-1'}`}
                    >
                        <div className={`w-full h-full border rounded-lg relative overflow-hidden backdrop-blur-md transition-all ${
                          selectedWheels.RL 
                            ? 'bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 border-blue-400 dark:border-blue-500 ring-1 ring-inset ring-white/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                            : 'bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-400 dark:border-slate-500 ring-1 ring-inset ring-white/80 dark:ring-white/20 shadow-lg group-hover:border-blue-500 group-hover:shadow-blue-500/30'
                        }`}>
                             <div className={`absolute inset-0 flex flex-col justify-between py-1 ${selectedWheels.RL ? 'opacity-30' : 'opacity-20'}`}>
                                {[...Array(6)].map((_, i) => <div key={i} className={`h-[2px] w-full ${selectedWheels.RL ? 'bg-white' : 'bg-slate-400'}`}></div>)}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-[10px] sm:text-xs font-bold font-display ${selectedWheels.RL ? 'text-white' : 'text-slate-900 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>RL</span>
                            </div>
                            <div className={`absolute bottom-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${selectedWheels.RL ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'}`}></div>
                        </div>
                    </button>

                    {/* RR Wheel */}
                    <button
                      disabled={disabled}
                      onClick={() => onToggleWheel('RR')}
                      className={`absolute bottom-0 right-0 w-[22%] h-[30%] group transition-all active:scale-95 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:translate-y-1'}`}
                    >
                        <div className={`w-full h-full border rounded-lg relative overflow-hidden backdrop-blur-md transition-all ${
                          selectedWheels.RR 
                            ? 'bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 border-blue-400 dark:border-blue-500 ring-1 ring-inset ring-white/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                            : 'bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-400 dark:border-slate-500 ring-1 ring-inset ring-white/80 dark:ring-white/20 shadow-lg group-hover:border-blue-500 group-hover:shadow-blue-500/30'
                        }`}>
                             <div className={`absolute inset-0 flex flex-col justify-between py-1 ${selectedWheels.RR ? 'opacity-30' : 'opacity-20'}`}>
                                {[...Array(6)].map((_, i) => <div key={i} className={`h-[2px] w-full ${selectedWheels.RR ? 'bg-white' : 'bg-slate-400'}`}></div>)}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-[10px] sm:text-xs font-bold font-display ${selectedWheels.RR ? 'text-white' : 'text-slate-900 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>RR</span>
                            </div>
                            <div className={`absolute bottom-1 left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${selectedWheels.RR ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'}`}></div>
                        </div>
                    </button>

                </div>
            </div>
          </div>
      </GlassPanel>
    </div>
  );
};
