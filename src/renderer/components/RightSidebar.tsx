import React, { useState } from 'react';
import { GlassPanel } from './GlassPanel';
import { NumericKeypad } from './NumericKeypad';

type StepStatus = 'idle' | 'running' | 'done';

interface RightSidebarProps {
  isConnected: boolean;
  freeMeasure: { toe: string; camber: string };
  onChangeFreeMeasure: (next: { toe: string; camber: string }) => void;
  setpoints: string[];
  onChangeSetpoints: (next: string[]) => void;
  step: number;
  stepStatus: StepStatus[];
  activeDirection: 'forward' | 'reverse' | null;
  paramsLocked: boolean;
  kingpin: string;
  onChangeKingpin: (next: string) => void;
  onLockParams: () => void;
  onCancel: () => void;
  onStartForward: () => void;
  onStartReverse: () => void;
  onSkipForward: () => void;
  onSkipReverse: () => void;
  onStopForward: () => void;
  onStopReverse: () => void;
  onStartManualToe: () => void;
  onStartManualCamber: () => void;
  disabled: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isConnected,
  freeMeasure,
  onChangeFreeMeasure,
  setpoints,
  onChangeSetpoints,
  step,
  stepStatus,
  activeDirection,
  paramsLocked,
  kingpin,
  onChangeKingpin,
  onLockParams,
  onCancel,
  onStartForward,
  onStartReverse,
  onSkipForward,
  onSkipReverse,
  onStopForward,
  onStopReverse,
  onStartManualToe,
  onStartManualCamber,
  disabled,
}) => {

  // Keypad State
  const [keypadConfig, setKeypadConfig] = useState<{
    isOpen: boolean;
    title: string;
    value: string;
    onConfirm: (val: string) => void;
  }>({
    isOpen: false,
    title: '',
    value: '',
    onConfirm: () => {},
  });

  const openKeypad = (title: string, value: string, onConfirm: (val: string) => void) => {
    setKeypadConfig({
      isOpen: true,
      title,
      value,
      onConfirm: (val) => {
        onConfirm(val);
        setKeypadConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const inputClassForStep = (index: number) => {
    const status = stepStatus[index] ?? 'idle';
    const isCurrent = step === index + 1;
    const base =
      'bg-slate-50 dark:bg-slate-900 border rounded text-xs py-1.5 px-2 text-center font-display focus:border-primary outline-none transition-all cursor-pointer';

    if (status === 'done') {
      return `${base} border-emerald-500/80 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.45)]`;
    }
    if (status === 'running') {
      return `${base} border-2 border-red-600 dark:border-red-500 bg-red-600/90 text-white shadow-[0_0_18px_rgba(239,68,68,0.8)] animate-pulse`;
    }
    if (isCurrent) {
      return `${base} border-2 border-blue-500 dark:border-blue-400 bg-blue-500/5 text-slate-900 dark:text-slate-100 shadow-[0_0_12px_rgba(59,130,246,0.45)]`;
    }
    return `${base} border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800`;
  };

  const canOperate = isConnected && !disabled;
  const anyRunning = stepStatus.some(s => s === 'running');
  const allDone = stepStatus.length > 0 && stepStatus.every(s => s === 'done');
  const canStartForward =
    canOperate &&
    !anyRunning &&
    (allDone || !activeDirection || activeDirection === 'forward');
  const canStartReverse =
    canOperate &&
    !anyRunning &&
    (allDone || !activeDirection || activeDirection === 'reverse');
  const canControlForward = canOperate && anyRunning && activeDirection === 'forward';
  const canControlReverse = canOperate && anyRunning && activeDirection === 'reverse';

  return (
    <div className="col-span-3 flex flex-col gap-4 h-full relative">
      <NumericKeypad 
        isOpen={keypadConfig.isOpen}
        title={keypadConfig.title}
        initialValue={keypadConfig.value}
        onConfirm={keypadConfig.onConfirm}
        onClose={() => setKeypadConfig(prev => ({ ...prev, isOpen: false }))}
      />
      
      {/* Free Measure */}
      <GlassPanel className="p-4">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-blue-500 rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                <span className="text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400">自由测量 / FREE MEASURE</span>
            </div>
            <span className="material-icons text-xs text-slate-600">tune</span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-xs w-10 opacity-70 font-medium shrink-0 text-slate-700 dark:text-slate-300">前束°</label>
            <input 
              type="text" 
              value={freeMeasure.toe}
              readOnly
              onClick={() =>
                openKeypad('自由测量 - 前束', freeMeasure.toe, (val) => onChangeFreeMeasure({ ...freeMeasure, toe: val }))
              }
              placeholder="0.00" 
              className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm h-8 px-2 font-display focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer hover:border-blue-500/50 text-slate-900 dark:text-white"
            />
            <button
              disabled={!canOperate}
              onClick={onStartManualToe}
              className={`flex items-center justify-center px-4 py-1.5 text-white text-xs rounded border transition-all shrink-0 active:scale-95 backdrop-blur-md ring-1 ring-inset gap-1 ${
                canOperate
                  ? 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-lg hover:shadow-xl border-blue-500 ring-white/20'
                  : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed ring-transparent'
              }`}
            >
              <span className="material-icons text-[14px]">play_arrow</span>
              启动
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs w-10 opacity-70 font-medium shrink-0 text-slate-700 dark:text-slate-300">外倾°</label>
            <input 
              type="text" 
              value={freeMeasure.camber}
              readOnly
              onClick={() =>
                openKeypad('自由测量 - 外倾', freeMeasure.camber, (val) => onChangeFreeMeasure({ ...freeMeasure, camber: val }))
              }
              placeholder="0.00" 
              className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm h-8 px-2 font-display focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer hover:border-blue-500/50 text-slate-900 dark:text-white"
            />
            <button
              disabled={!canOperate}
              onClick={onStartManualCamber}
              className={`flex items-center justify-center px-4 py-1.5 text-white text-xs rounded border transition-all shrink-0 active:scale-95 backdrop-blur-md ring-1 ring-inset gap-1 ${
                canOperate
                  ? 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-lg hover:shadow-xl border-blue-500 ring-white/20'
                  : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed ring-transparent'
              }`}
            >
              <span className="material-icons text-[14px]">play_arrow</span>
              启动
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* Fixed Measure */}
      <GlassPanel className="p-4 flex-grow flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
           <div className="flex items-center gap-2">
               <div className="w-1 h-3 bg-indigo-500 rounded-sm shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
               <span className="text-[10px] font-bold tracking-widest text-slate-400">定值测量 / FIXED MEASURE</span>
           </div>
           <span className="material-icons text-xs text-slate-600">straighten</span>
        </div>
        
        {/* Value Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6 flex-shrink-0">
          {setpoints.map((val, i) => (
             <input 
               key={i}
               type="text" 
               value={val}
               readOnly
               onClick={() => {
                 if (paramsLocked) return;
                 openKeypad(`定值测量 - ${i + 1}`, val, (newVal) => {
                   const newArr = [...setpoints];
                   newArr[i] = newVal;
                   onChangeSetpoints(newArr);
                 });
               }}
               placeholder={`A ${i + 1}`} 
               className={`${inputClassForStep(i)} ${paramsLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
             />
          ))}
        </div>

        {/* Controls - Top Group */}
        <div className="flex flex-col gap-3">
          {/* Forward */}
          <div className="flex flex-col gap-1 shrink-0">
            <div className="flex items-center gap-1.5 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">正程测量</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={!canStartForward}
                onClick={onStartForward}
                className={`flex items-center justify-center py-2 border rounded text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap active:scale-95 backdrop-blur-md ring-1 ring-inset gap-1 ${
                  canStartForward
                    ? 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border-blue-600 shadow-lg hover:shadow-xl ring-white/50'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-300 border-slate-400 dark:border-slate-600 opacity-50 cursor-not-allowed ring-transparent'
                }`}
              >
                <span className="material-icons text-[14px]">play_circle</span>
                启动
              </button>
              <button
                disabled={!canControlForward}
                onClick={onSkipForward}
                className={`flex items-center justify-center py-2 border rounded text-[10px] sm:text-xs transition-all shadow-md active:scale-95 backdrop-blur-md ring-1 ring-inset gap-1 ${
                  canControlForward
                    ? 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-lg ring-white/60 dark:ring-white/10'
                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed ring-transparent'
                }`}
              >
                <span className="material-icons text-[14px]">skip_next</span>
                跳过
              </button>
              <button
                disabled={!canControlForward}
                onClick={onStopForward}
                className={`flex items-center justify-center py-2 border rounded text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap shadow-md active:scale-95 backdrop-blur-md ring-1 ring-inset gap-1 ${
                  canControlForward
                    ? 'bg-gradient-to-b from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 text-red-800 dark:text-red-500 border-red-300 dark:border-red-500/50 hover:bg-red-200 dark:hover:bg-red-600 hover:text-red-900 dark:hover:text-white shadow-lg ring-red-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-300 dark:border-slate-700 opacity-50 cursor-not-allowed ring-transparent'
                }`}
              >
                <span className="material-icons text-[14px]">stop_circle</span>
                停止
              </button>
            </div>
          </div>
          
          {/* Backward */}
          <div className="flex flex-col gap-1 shrink-0">
            <div className="flex items-center gap-1.5 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]"></span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">回程测量</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={!canStartReverse}
                onClick={onStartReverse}
                className={`flex items-center justify-center py-2 border rounded text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap active:scale-95 backdrop-blur-md ring-1 ring-inset gap-1 ${
                  canStartReverse
                    ? 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border-blue-600 shadow-lg hover:shadow-xl ring-white/50'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-300 border-slate-400 dark:border-slate-600 opacity-50 cursor-not-allowed ring-transparent'
                }`}
              >
                <span className="material-icons text-[14px]">play_circle_filled</span>
                启动
              </button>
              <button
                disabled={!canControlReverse}
                onClick={onSkipReverse}
                className={`flex items-center justify-center py-2 border rounded text-[10px] sm:text-xs transition-all shadow-md active:scale-95 backdrop-blur-md ring-1 ring-inset gap-1 ${
                  canControlReverse
                    ? 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-lg ring-white/60 dark:ring-white/10'
                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed ring-transparent'
                }`}
              >
                <span className="material-icons text-[14px]">skip_next</span>
                跳过
              </button>
              <button
                disabled={!canControlReverse}
                onClick={onStopReverse}
                className={`flex items-center justify-center py-2 border rounded text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap shadow-md gap-1 ${
                  canControlReverse
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-500 border-red-400 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-600 hover:text-red-900 dark:hover:text-white hover:border-red-500 dark:hover:border-red-500'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-300 dark:border-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="material-icons text-[14px]">stop_circle</span>
                停止
              </button>
            </div>
          </div>
        </div>

        {/* Spacer to push bottom controls down */}
        <div className="flex-grow"></div>

        {/* Bottom Controls Group */}
        <div className="flex flex-col gap-4 mt-auto">
          {/* Settings/Cancel */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-200 dark:border-slate-700/50 shrink-0">
            <button
              disabled={!isConnected}
              onClick={onLockParams}
              className={`flex items-center justify-center py-2 border rounded text-xs transition shadow-md gap-1 ${
                isConnected
                  ? 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                  : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="material-icons text-[14px]">{paramsLocked ? 'lock_open' : 'settings'}</span>
              {paramsLocked ? '解锁' : '设置'}
            </button>
            <button
              onClick={onCancel}
              className="flex items-center justify-center py-2 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-300 dark:border-slate-700/50 text-slate-900 dark:text-slate-300 rounded text-xs hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition shadow-lg active:scale-95 backdrop-blur-md ring-1 ring-inset ring-white/60 dark:ring-white/10 gap-1"
            >
              <span className="material-icons text-[14px]">close</span>
              取消
            </button>
          </div>

          {/* Kingpin Simulation */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold opacity-70 whitespace-nowrap">主销模拟°:</label>
              <input 
                type="text" 
                value={kingpin}
                readOnly
                onClick={() => openKeypad('主销模拟', kingpin, onChangeKingpin)}
                className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm py-1 px-2 font-display focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:border-blue-500/50 transition-all"
              />
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};
