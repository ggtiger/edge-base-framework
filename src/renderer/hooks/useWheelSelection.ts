import { useState, useCallback } from 'react';
import type { WheelId } from '../utils/calibrationProtocol';

export function useWheelSelection() {
  const [selectedWheels, setSelectedWheels] = useState<Record<WheelId, boolean>>({
    FL: false,
    FR: false,
    RL: false,
    RR: false,
  });
  const [activeWheel, setActiveWheel] = useState<WheelId | null>(null);

  const toggleWheel = useCallback((wheel: WheelId, paramsLocked: boolean) => {
    if (paramsLocked) return;
    setSelectedWheels(prev => ({ ...prev, [wheel]: !prev[wheel] }));
  }, []);

  const linkFront = useCallback((paramsLocked: boolean) => {
    if (paramsLocked) return;
    setSelectedWheels(prev => {
      const next = { ...prev };
      const willSelect = !(prev.FL && prev.FR);
      next.FL = willSelect;
      next.FR = willSelect;
      return next;
    });
  }, []);

  const linkRear = useCallback((paramsLocked: boolean) => {
    if (paramsLocked) return;
    setSelectedWheels(prev => {
      const next = { ...prev };
      const willSelect = !(prev.RL && prev.RR);
      next.RL = willSelect;
      next.RR = willSelect;
      return next;
    });
  }, []);

  const linkLeft = useCallback((paramsLocked: boolean) => {
    if (paramsLocked) return;
    setSelectedWheels(prev => {
      const next = { ...prev };
      const willSelect = !(prev.FL && prev.RL);
      next.FL = willSelect;
      next.RL = willSelect;
      return next;
    });
  }, []);

  const linkRight = useCallback((paramsLocked: boolean) => {
    if (paramsLocked) return;
    setSelectedWheels(prev => {
      const next = { ...prev };
      const willSelect = !(prev.FR && prev.RR);
      next.FR = willSelect;
      next.RR = willSelect;
      return next;
    });
  }, []);

  return {
    selectedWheels,
    activeWheel,
    setActiveWheel,
    toggleWheel,
    linkFront,
    linkRear,
    linkLeft,
    linkRight,
  };
}
