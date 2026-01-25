import React from 'react';
import { GlassPanel } from './GlassPanel';
import chassisSvg from '../assets/images/chassis.svg';

type Mode = 'QS' | 'WQ' | null;
type WheelId = 'FL' | 'FR' | 'RL' | 'RR';

type Measurements = {
  qzq: string;
  qyq: string;
  qzh: string;
  qyh: string;
  wzq: string;
  wyq: string;
  wzh: string;
  wyh: string;
};

type CenterAction = 'hm' | 'angle0' | 'zero' | 'homing';

interface CenterDisplayProps {
  mode: Mode;
  activeWheel: WheelId | null;
  onSelectWheel: (wheel: WheelId) => void;
  measurements: Measurements;
  onAction: (action: CenterAction) => void;
  homingInProgress: boolean;
  onCancelHoming?: () => void;
}

export const CenterDisplay: React.FC<CenterDisplayProps> = ({
  mode,
  activeWheel,
  onSelectWheel,
  measurements,
  onAction,
  homingInProgress,
  onCancelHoming,
}) => {

  const wheels: { id: WheelId; label: string; icon: string }[] = [
    { id: 'FL', label: '左前', icon: 'north_west' },
    { id: 'FR', label: '右前', icon: 'north_east' },
    { id: 'RL', label: '左后', icon: 'south_west' },
    { id: 'RR', label: '右后', icon: 'south_east' },
  ];

  const formatAngle = (v: string) => {
    if(mode === 'WQ'||!mode){
        return '--.--°';
    }
    const n = Number(v);
    if (Number.isFinite(n)) return `${n.toFixed(2)}°`;
    if (!v.trim()) return '--.--°';
    return `${v.trim()}°`;
  };
  const wformatAngle = (v: string) => {
      if(mode === 'QS'||!mode){
        return '--.--°';
      }
      const n = Number(v);
      if (Number.isFinite(n)) return `${n.toFixed(2)}°`;
      if (!v.trim()) return '--.--°';
      return `${v.trim()}°`;
    };
  const frontLeft = mode === 'QS' ? measurements.qzq : mode === 'WQ' ? measurements.wzq : '';
  const frontRight = mode === 'QS' ? measurements.qyq : mode === 'WQ' ? measurements.wyq : '';
  const rearLeft = mode === 'QS' ? measurements.qzh : mode === 'WQ' ? measurements.wzh : '';
  const rearRight = mode === 'QS' ? measurements.qyh : mode === 'WQ' ? measurements.wyh : '';

  // 基础样式
  const baseBoxStyle = "backdrop-blur-md rounded transition-all duration-300";
  const commonBoxStyle = "bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-cyan-200 dark:border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded";
  // 主题样式
  const cyanTheme = "bg-white/90 dark:bg-slate-900/80 border border-cyan-200 dark:border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]";
  // 模仿 LeftSidebar 按钮的激活样式：bg-indigo-50 border-indigo-500/60
  const activeTheme = "bg-indigo-100 dark:bg-indigo-500/20 border-2 border-indigo-500 dark:border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]";

  // 根据模式动态计算样式
  const wheelBoxStyle = `${commonBoxStyle}${baseBoxStyle} ${mode === 'WQ' ? activeTheme : cyanTheme} w-6 md:w-8 h-24 md:h-20 flex items-center justify-center text-cyan-700 dark:text-cyan-400 text-center text-xs font-display [writing-mode:vertical-rl]`;
  const numberBoxStyle = `${commonBoxStyle} ${baseBoxStyle} ${mode === 'QS' ? activeTheme : cyanTheme} text-cyan-700 dark:text-cyan-400 text-center font-display text-xs py-1.5 px-3 min-w-[80px] tracking-wider pointer-events-auto`;
  // const numberBoxStyle = `${baseBoxStyle} ${mode === 'QS' ? activeTheme : cyanTheme} w-24 md:w-20 h-8 md:h-8 text-center text-xs md:text-sm font-bold text-slate-900 dark:text-white`;
  return (
    <div className="col-span-6 flex flex-col h-full min-h-0">
      <GlassPanel className="flex flex-col h-full min-h-0 overflow-hidden relative border border-slate-200 dark:border-white/5 shadow-2xl">
        {/* Top Wheel Selectors */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-white/40 dark:bg-slate-800/40 border-b border-white/20 dark:border-white/5 backdrop-blur-md z-20 flex-shrink-0 shadow-sm">
          {wheels.map((wheel) => (
            <button
              key={wheel.id}
              onClick={() => onSelectWheel(wheel.id)}
              className={`flex items-center justify-center py-2 border rounded text-xs font-bold tracking-wide transition-all active:scale-95 backdrop-blur-md ring-1 ring-inset gap-2
                ${activeWheel === wheel.id 
                  ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white border-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-white/50' 
                  : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-400 border-slate-400 dark:border-slate-600 shadow-lg ring-white/80 dark:ring-white/20 hover:shadow-blue-500/20 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-white'
                }`}
            >
              <span className="material-icons text-base">{wheel.icon}</span>
              {wheel.label}
            </button>
          ))}
        </div>

        {/* Main Visualization Area */}
        <div className="flex-grow flex items-center justify-center p-4 relative overflow-hidden group min-h-0">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-grid-pattern"></div>
          
          {/* Decorative Corner Brackets */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/20 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/20 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/20 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/20 rounded-br-lg"></div>

          {/* Visualization Container */}
          <div className="relative w-full h-full flex items-center justify-center">
            
            {/* Car Image (SVG) */}
            <img 
              alt="Automobile Chassis Top View" 
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] opacity-90 transform transition-transform duration-700 hover:scale-105" 
              src={chassisSvg}
            />

            {/* Overlays: Measurements */}
            {/* Front */}
            <div className="absolute top-[6px] inset-x-0 flex gap-24 justify-center z-20 pointer-events-none">
              <div className={numberBoxStyle}>
                {formatAngle(frontLeft)}
              </div>
              <div className={numberBoxStyle}>
                {formatAngle(frontRight)}
              </div>
            </div>

             {/* Wheel Indicators (Visual boxes near wheels) */}
            <div className="absolute inset-y-0 left-[calc(16%_-_10px)] md:left-[calc(22%_-_10px)] flex flex-col justify-between py-[15%] md:py-[10%] pointer-events-none">
                <div className={wheelBoxStyle}>
                   {wformatAngle(frontLeft)}
                </div>
                <div className={wheelBoxStyle}>
                   {wformatAngle(rearLeft)}
                </div>
            </div>
            <div className="absolute inset-y-0 right-[calc(16%_-_10px)] md:right-[calc(22%_-_10px)] flex flex-col justify-between py-[15%] md:py-[10%] pointer-events-none">
                <div className={wheelBoxStyle}>
                  {wformatAngle(frontRight)}
                </div>
                <div className={wheelBoxStyle}>
                  {wformatAngle(rearRight)}
                </div>
            </div>

            {/* Rear */}
            <div className="absolute bottom-[6px] inset-x-0 flex gap-24 justify-center z-20 pointer-events-none">
              <div className={numberBoxStyle}>
                {formatAngle(rearLeft)}
              </div>
              <div className={numberBoxStyle}>
                {formatAngle(rearRight)}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-white/40 dark:bg-slate-800/40 border-t border-white/20 dark:border-white/5 backdrop-blur-md z-20 flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => onAction('hm')}
            className="flex items-center justify-center py-2 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-300 dark:border-slate-600 rounded text-xs font-bold text-slate-900 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-lg active:scale-95 backdrop-blur-md ring-1 ring-inset ring-white/60 dark:ring-white/10 hover:shadow-blue-500/20 transition-all gap-1"
          >
            <span className="material-icons text-sm">restart_alt</span>
            外倾复位
          </button>
          <button
            onClick={() => homingInProgress ? onCancelHoming?.() : onAction('homing')}
            className={`flex items-center justify-center py-2 border rounded text-xs font-bold shadow-lg active:scale-95 backdrop-blur-md ring-1 ring-inset transition-all gap-1 ${
              homingInProgress
                ? 'bg-amber-500 hover:bg-red-500 text-white border-amber-600 hover:border-red-600 animate-pulse ring-white/20 cursor-pointer'
                : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white ring-white/60 dark:ring-white/10 hover:shadow-blue-500/20'
            }`}
          >
            <span className={`material-icons text-sm ${homingInProgress ? 'animate-spin' : ''}`}>{homingInProgress ? 'sync' : 'settings_backup_restore'}</span>
            {homingInProgress ? '点击取消' : '回原点'}
          </button>
          <button
            onClick={() => onAction('zero')}
            className="flex items-center justify-center py-2 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-300 dark:border-slate-600 rounded text-xs font-bold text-slate-900 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-lg active:scale-95 backdrop-blur-md ring-1 ring-inset ring-white/60 dark:ring-white/10 hover:shadow-blue-500/20 transition-all gap-1"
          >
            <span className="material-icons text-sm">exposure_zero</span>
            置零
          </button>
        </div>
      </GlassPanel>
    </div>
  );
};
