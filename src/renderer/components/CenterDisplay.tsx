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

type CenterAction = 'hm' | 'angle0' | 'zero';

interface CenterDisplayProps {
  mode: Mode;
  activeWheel: WheelId | null;
  onSelectWheel: (wheel: WheelId) => void;
  measurements: Measurements;
  onAction: (action: CenterAction) => void;
}

export const CenterDisplay: React.FC<CenterDisplayProps> = ({
  mode,
  activeWheel,
  onSelectWheel,
  measurements,
  onAction,
}) => {

  const wheels: { id: WheelId; label: string }[] = [
    { id: 'FL', label: '左前' },
    { id: 'FR', label: '右前' },
    { id: 'RL', label: '左后' },
    { id: 'RR', label: '右后' },
  ];

  const formatAngle = (v: string) => {
    const n = Number(v);
    if (Number.isFinite(n)) return `${n.toFixed(2)}°`;
    if (!v.trim()) return '--.--°';
    return `${v.trim()}°`;
  };

  const frontLeft = mode === 'QS' ? measurements.qzq : mode === 'WQ' ? measurements.wzq : '';
  const frontRight = mode === 'QS' ? measurements.qyq : mode === 'WQ' ? measurements.wyq : '';
  const rearLeft = mode === 'QS' ? measurements.qzh : mode === 'WQ' ? measurements.wzh : '';
  const rearRight = mode === 'QS' ? measurements.qyh : mode === 'WQ' ? measurements.wyh : '';

  const commonBoxStyle = "bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-cyan-200 dark:border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded";
  const numberBoxStyle = `${commonBoxStyle} text-cyan-700 dark:text-cyan-400 text-center font-display text-xs py-1.5 px-3 min-w-[80px] tracking-wider pointer-events-auto`;
  const wheelBoxStyle = `${commonBoxStyle} w-6 md:w-8 h-24 md:h-32`;

  return (
    <div className="col-span-6 flex flex-col h-full min-h-0">
      <GlassPanel className="flex flex-col h-full overflow-hidden relative border border-slate-200 dark:border-white/5">
        {/* Top Wheel Selectors */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-white/10 backdrop-blur-sm z-20 flex-shrink-0">
          {wheels.map((wheel) => (
            <button
              key={wheel.id}
              onClick={() => onSelectWheel(wheel.id)}
              className={`flex items-center justify-center py-2 border rounded text-xs font-bold tracking-wide transition-all shadow-md
                ${activeWheel === wheel.id 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/40' 
                  : 'bg-white text-slate-900 border-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:border-blue-500/50 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-blue-500/50'
                }`}
            >
              {wheel.label}
            </button>
          ))}
        </div>

        {/* Main Visualization Area */}
        <div className="flex-grow flex items-center justify-center p-8 relative overflow-hidden group">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-grid-pattern"></div>
          
          {/* Decorative Corner Brackets */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-primary/20 rounded-tl-lg"></div>
          <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-primary/20 rounded-tr-lg"></div>
          <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-primary/20 rounded-bl-lg"></div>
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-primary/20 rounded-br-lg"></div>

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
            <div className="absolute top-4 inset-x-0 flex gap-4 justify-center z-20 pointer-events-none">
              <div className={numberBoxStyle}>
                {formatAngle(frontLeft)}
              </div>
              <div className={numberBoxStyle}>
                {formatAngle(frontRight)}
              </div>
            </div>

             {/* Wheel Indicators (Visual boxes near wheels) */}
            <div className="absolute inset-y-0 left-[16%] md:left-[22%] flex flex-col justify-between py-[15%] md:py-[10%] pointer-events-none">
                <div className={wheelBoxStyle}></div>
                <div className={wheelBoxStyle}></div>
            </div>
            <div className="absolute inset-y-0 right-[16%] md:right-[22%] flex flex-col justify-between py-[15%] md:py-[10%] pointer-events-none">
                <div className={wheelBoxStyle}></div>
                <div className={wheelBoxStyle}></div>
            </div>

            {/* Rear */}
            <div className="absolute bottom-4 inset-x-0 flex gap-4 justify-center z-20 pointer-events-none">
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
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-white/10 backdrop-blur-sm z-20 flex-shrink-0">
          <button
            onClick={() => onAction('hm')}
            className="flex items-center justify-center py-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-500 dark:hover:border-slate-600 transition-all shadow-md hover:shadow-lg"
          >
            外倾丝杆复位
          </button>
          <button
            onClick={() => onAction('angle0')}
            className="flex items-center justify-center py-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-500 dark:hover:border-slate-600 transition-all shadow-md hover:shadow-lg"
          >
            回零
          </button>
          <button
            onClick={() => onAction('zero')}
            className="flex items-center justify-center py-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-500 dark:hover:border-slate-600 transition-all shadow-md hover:shadow-lg"
          >
            置零
          </button>
        </div>
      </GlassPanel>
    </div>
  );
};
