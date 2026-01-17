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
      'bg-slate-50 dark:bg-slate-900 border rounded text-xs py-1.5 px-2 text-center font-display focus:border-primary outline-none transition-all cursor-pointer hover:border-blue-500/50';

    if (status === 'done') {
      return `${base} border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.15)]`;
    }
    if (status === 'running' || isCurrent) {
      return `${base} border-red-600/80 dark:border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.18)]`;
    }
    return `${base} border-slate-300 dark:border-slate-700 hover:bg-slate-800`;
  };

  const canOperate = isConnected && !disabled;

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
                <span className="text-[10px] font-bold tracking-widest text-slate-400">自由测量 / FREE MEASURE</span>
            </div>
            <span className="material-icons text-xs text-slate-600">tune</span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-xs w-10 opacity-70 font-medium shrink-0">前束°</label>
            <input 
              type="text" 
              value={freeMeasure.toe}
              readOnly
              onClick={() =>
                openKeypad('自由测量 - 前束', freeMeasure.toe, (val) => onChangeFreeMeasure({ ...freeMeasure, toe: val }))
              }
              placeholder="0.00" 
              className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm h-8 px-2 font-display focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer hover:border-blue-500/50"
            />
            <button
              disabled={!canOperate}
              onClick={onStartManualToe}
              className={`px-4 py-1.5 text-white text-xs rounded border transition-all shrink-0 ${
                canOperate
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)] border-blue-400/50'
                  : 'bg-slate-700 border-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              启动
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs w-10 opacity-70 font-medium shrink-0">外倾°</label>
            <input 
              type="text" 
              value={freeMeasure.camber}
              readOnly
              onClick={() =>
                openKeypad('自由测量 - 外倾', freeMeasure.camber, (val) => onChangeFreeMeasure({ ...freeMeasure, camber: val }))
              }
              placeholder="0.00" 
              className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm h-8 px-2 font-display focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer hover:border-blue-500/50"
            />
            <button
              disabled={!canOperate}
              onClick={onStartManualCamber}
              className={`px-4 py-1.5 text-white text-xs rounded border transition-all shrink-0 ${
                canOperate
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)] border-blue-400/50'
                  : 'bg-slate-700 border-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
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
               placeholder={`Val ${i + 1}`} 
               className={`${inputClassForStep(i)} ${paramsLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
             />
          ))}
        </div>

        {/* Controls - Top Group */}
        <div className="flex flex-col gap-3">
          {/* Forward */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <button
              disabled={!canOperate}
              onClick={onStartForward}
              className={`py-2 border rounded text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                canOperate
                  ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                  : 'bg-slate-700 text-slate-300 border-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              启动正测
            </button>
            <button
              disabled={!canOperate}
              onClick={onSkipForward}
              className={`py-2 border rounded text-[10px] sm:text-xs transition-all ${
                canOperate
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              跳过
            </button>
            <button
              disabled={!canOperate}
              onClick={onStopForward}
              className={`py-2 border rounded text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                canOperate
                  ? 'bg-red-900/20 text-red-500 border-red-500/30 hover:bg-red-600 hover:text-white hover:border-red-500'
                  : 'bg-slate-800 text-slate-600 border-slate-700 opacity-50 cursor-not-allowed'
              }`}
            >
              停止正测
            </button>
          </div>
          
          {/* Backward */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <button
              disabled={!canOperate}
              onClick={onStartReverse}
              className={`py-2 border rounded text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                canOperate
                  ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                  : 'bg-slate-700 text-slate-300 border-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              启动回测
            </button>
            <button
              disabled={!canOperate}
              onClick={onSkipReverse}
              className={`py-2 border rounded text-[10px] sm:text-xs transition-all ${
                canOperate
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              跳过
            </button>
            <button
              disabled={!canOperate}
              onClick={onStopReverse}
              className={`py-2 border rounded text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                canOperate
                  ? 'bg-red-900/20 text-red-500 border-red-500/30 hover:bg-red-600 hover:text-white hover:border-red-500'
                  : 'bg-slate-800 text-slate-600 border-slate-700 opacity-50 cursor-not-allowed'
              }`}
            >
              停止回测
            </button>
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
              className={`py-2 border rounded text-xs transition shadow-sm ${
                isConnected
                  ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              {paramsLocked ? '解锁' : '设置'}
            </button>
            <button
              onClick={onCancel}
              className="py-2 bg-transparent border border-slate-700/50 text-slate-500 rounded text-xs hover:bg-slate-800 hover:text-slate-300 transition"
            >
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
                className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm py-1 px-2 font-display focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:border-blue-500/50 transition-all"
              />
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};
