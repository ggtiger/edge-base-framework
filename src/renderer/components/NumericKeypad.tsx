import React, { useEffect, useState } from 'react';
import { GlassPanel } from './GlassPanel';

interface NumericKeypadProps {
  isOpen: boolean;
  initialValue?: string;
  title?: string;
  onClose: () => void;
  onConfirm: (value: string) => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  isOpen,
  initialValue = '',
  title = '输入数值',
  onClose,
  onConfirm
}) => {
  const [value, setValue] = useState(initialValue);

  // Reset value when opening
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue || '');
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleNumber = (num: string) => {
    if (value === '0' && num !== '.') {
      setValue(num);
    } else {
      setValue(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setValue(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setValue('');
  };

  const handleDot = () => {
    if (!value.includes('.')) {
      setValue(prev => (prev === '' ? '0.' : prev + '.'));
    }
  };

  const handleToggleSign = () => {
    if (!value) {
      setValue('-');
      return;
    }
    if (value.startsWith('-')) {
      setValue(prev => prev.slice(1));
    } else {
      setValue(prev => '-' + prev);
    }
  };

  const displayValue = value;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative">
        <GlassPanel className="w-80 p-6 shadow-[0_0_50px_rgba(59,130,246,0.2)] border-blue-500/30">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-blue-500 rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                <span className="text-xs font-bold tracking-widest text-slate-700 dark:text-slate-300 uppercase">{title}</span>
            </div>
            <button 
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-700 border border-slate-400 dark:border-slate-600 backdrop-blur-md transition-all shadow-sm active:scale-95 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ring-1 ring-inset ring-white/80 dark:ring-white/20"
            >
              <span className="material-icons text-sm">close</span>
            </button>
          </div>

          {/* Display */}
          <div className="mb-6 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-lg p-4 text-right relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            <span className="text-2xl font-display font-bold tracking-wider text-slate-900 dark:text-white relative z-10">
              {displayValue}
              <span className="animate-pulse text-blue-500">_</span>
            </span>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <KeyButton onClick={() => handleNumber('7')}>7</KeyButton>
            <KeyButton onClick={() => handleNumber('8')}>8</KeyButton>
            <KeyButton onClick={() => handleNumber('9')}>9</KeyButton>
            <ActionButton onClick={handleBackspace} icon="backspace" color="red" />

            {/* Row 2 */}
            <KeyButton onClick={() => handleNumber('4')}>4</KeyButton>
            <KeyButton onClick={() => handleNumber('5')}>5</KeyButton>
            <KeyButton onClick={() => handleNumber('6')}>6</KeyButton>
            <ActionButton onClick={handleClear} label="C" color="orange" />

            {/* Row 3 */}
            <KeyButton onClick={() => handleNumber('1')}>1</KeyButton>
            <KeyButton onClick={() => handleNumber('2')}>2</KeyButton>
            <KeyButton onClick={() => handleNumber('3')}>3</KeyButton>
            
            {/* Enter Button (Spans 2 rows vertically) */}
            <button 
                onClick={() => onConfirm(value)}
                className="row-span-2 rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border border-blue-600 ring-1 ring-inset ring-white/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95 transition-all flex items-center justify-center group backdrop-blur-md"
            >
                <span className="material-icons group-hover:scale-110 transition-transform">keyboard_return</span>
            </button>

            {/* Row 4 */}
            <KeyButton onClick={handleToggleSign}>+/-</KeyButton>
            <KeyButton onClick={() => handleNumber('0')}>0</KeyButton>
            <KeyButton onClick={handleDot}>.</KeyButton>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

const KeyButton: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
  <button 
    onClick={onClick}
    className="h-12 rounded-lg bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-400 dark:border-slate-700 hover:from-blue-50 hover:to-blue-100 dark:hover:from-slate-700 dark:hover:to-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 ring-1 ring-inset ring-white/80 dark:ring-white/5 text-slate-900 dark:text-slate-200 font-display font-bold text-lg active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center justify-center backdrop-blur-md"
  >
    {children}
  </button>
);

const ActionButton: React.FC<{ onClick: () => void; icon?: string; label?: string; color: 'red' | 'orange' }> = ({ onClick, icon, label, color }) => {
    const colorClasses = color === 'red' 
        ? 'bg-gradient-to-b from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-red-400 dark:border-red-900/30 text-red-700 dark:text-red-400 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-900/40 shadow-sm' 
        : 'bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 border-orange-400 dark:border-orange-900/30 text-orange-700 dark:text-orange-400 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-900/40 shadow-sm';
    
    return (
        <button 
            onClick={onClick}
            className={`h-12 rounded-lg border ${colorClasses} font-bold active:scale-95 transition-all flex items-center justify-center shadow-md hover:shadow-lg backdrop-blur-md ring-1 ring-inset ring-white/50`}
        >
            {icon ? <span className="material-icons text-sm">{icon}</span> : label}
        </button>
    );
};
