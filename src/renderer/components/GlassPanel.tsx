import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '' }) => {
  return (
    <div className={`glass-panel rounded-xl dark:bg-panel-dark/80 ${className}`}>
      {children}
    </div>
  );
};