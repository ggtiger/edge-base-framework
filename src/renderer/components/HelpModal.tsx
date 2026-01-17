import React, { useEffect, useState } from 'react';

interface HelpSlide {
  title: string;
  src: string;
}

interface HelpModalProps {
  slides: HelpSlide[];
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ slides, onClose }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft') {
        setIndex(prev => Math.max(0, prev - 1));
      }
      if (e.key === 'ArrowRight') {
        setIndex(prev => Math.min(slides.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [slides.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="material-icons text-blue-400">help</span>
            <div
              className="min-w-0"
              style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}
            >
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {slides[index]?.title ?? '帮助'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{`${index + 1} / ${slides.length}`}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center justify-center border border-slate-200 dark:border-slate-700"
          >
            <span className="material-icons text-sm text-slate-700 dark:text-slate-200">close</span>
          </button>
        </div>

        <div className="bg-black/20">
          <div className="w-full aspect-video flex items-center justify-center">
            <img
              src={slides[index]?.src}
              alt={slides[index]?.title ?? 'help'}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={() => setIndex(prev => Math.max(0, prev - 1))}
            disabled={index <= 0}
            className={`px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium border ${
              index <= 0
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800/50 dark:text-slate-500 dark:border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700'
            }`}
          >
            <span className="material-icons text-sm">chevron_left</span>
            上一页
          </button>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="material-icons text-sm">keyboard</span>
            ESC 关闭 · ←/→ 翻页
          </div>

          <button
            onClick={() => setIndex(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={index >= slides.length - 1}
            className={`px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium border ${
              index >= slides.length - 1
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800/50 dark:text-slate-500 dark:border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700'
            }`}
          >
            下一页
            <span className="material-icons text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
