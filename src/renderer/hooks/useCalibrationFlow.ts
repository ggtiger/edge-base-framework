import { useState, useCallback, useRef } from 'react';
import type { Mode, WheelId, Measurements } from '../utils/calibrationProtocol';
import {
  normalizeAngleText,
  validateSetpoints,
  parseInboundData,
} from '../utils/calibrationProtocol';

export type StepStatus = 'idle' | 'running' | 'done';

export function useCalibrationFlow(
  isTcpConnected: boolean,
  sendTcpCmd: (cmd: string) => void
) {
  const [mode, setMode] = useState<Mode>(null);
  const [measurements, setMeasurements] = useState<Measurements>({
    qzq: '',
    qyq: '',
    qzh: '',
    qyh: '',
    wzq: '',
    wyq: '',
    wzh: '',
    wyh: '',
  });
  const [sensorOk, setSensorOk] = useState<boolean | null>(null);
  const [statusrc, setStatusrc] = useState<number | null>(null);

  const [freeMeasure, setFreeMeasure] = useState({ toe: '', camber: '' });
  const [setpoints, setSetpoints] = useState<string[]>(Array(6).fill(''));
  const [kingpin, setKingpin] = useState('0.00');

  const [paramsLocked, setParamsLocked] = useState(false);
  const [step, setStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepStatus[]>(Array(6).fill('idle'));
  const [pls, setPls] = useState('');
  const [sendEnabled, setSendEnabled] = useState(false);

  // 处理入站数据的方法
  const handleInboundData = useCallback((data: string) => {
    const parsed = parseInboundData(data);

    if (parsed.sensorOk !== null) setSensorOk(parsed.sensorOk);
    if (parsed.statusrc !== null) setStatusrc(parsed.statusrc);
    if (Object.keys(parsed.measurements).length > 0) {
      setMeasurements(prev => ({ ...prev, ...parsed.measurements }));
    }
    if (parsed.isAck) setSendEnabled(false);
  }, []);

  const resetFlow = useCallback(() => {
    setSendEnabled(false);
    setParamsLocked(false);
    setStep(0);
    setStepStatus(Array(6).fill('idle'));
    setPls('');
    setSetpoints(Array(6).fill(''));
  }, []);

  const setAndToggleParamsLock = useCallback(() => {
    const normalized = setpoints.map(v => normalizeAngleText(v));
    setSetpoints(normalized);

    if (!paramsLocked) {
      if (!validateSetpoints(normalized)) return;
      setParamsLocked(true);
      return;
    }

    setParamsLocked(false);
  }, [setpoints, paramsLocked]);

  const startStep = useCallback(
    (direction: 'forward' | 'reverse', selectedWheels: Record<WheelId, boolean>) => {
      if (!isTcpConnected) return;
      if (!mode) return;
      if (!paramsLocked) return;
      if (!Object.values(selectedWheels).some(Boolean)) return;

      setStep(prev => {
        const next =
          direction === 'forward'
            ? prev === 0
              ? 1
              : Math.min(prev + 1, 6)
            : prev <= 1
              ? 1
              : prev - 1;

        const sp = normalizeAngleText(setpoints[next - 1] ?? '');
        const nextPls = `${mode}:Angle${sp}`;

        setPls(nextPls);
        setStepStatus(prevStatus => {
          const copy = [...prevStatus];
          copy[next - 1] = 'running';
          return copy;
        });
        setSendEnabled(true);

        return next;
      });
    },
    [isTcpConnected, mode, paramsLocked, setpoints]
  );

  const skipStep = useCallback(
    (direction: 'forward' | 'reverse') => {
      if (!paramsLocked) return;
      setStep(prev => {
        const next =
          direction === 'forward'
            ? prev === 0
              ? 1
              : Math.min(prev + 1, 6)
            : prev <= 1
              ? 1
              : prev - 1;

        setStepStatus(prevStatus => {
          const copy = [...prevStatus];
          if (prev >= 1 && prev <= 6) copy[prev - 1] = 'done';
          copy[next - 1] = 'idle';
          return copy;
        });

        return next;
      });
    },
    [paramsLocked]
  );

  const stopStep = useCallback(() => {
    setSendEnabled(false);
    setStepStatus(prevStatus => {
      if (step < 1 || step > 6) return prevStatus;
      const copy = [...prevStatus];
      if (copy[step - 1] === 'running') copy[step - 1] = 'idle';
      return copy;
    });
  }, [step]);

  const handleAction = useCallback(
    (action: 'hm' | 'angle0' | 'zero') => {
      if (!isTcpConnected) return;
      if (!mode) return;

      if (action === 'angle0') {
        setPls(`${mode}:Angle0`);
        setSendEnabled(true);
        return;
      }

      if (action === 'zero') {
        setPls(`${mode}_ZERO`);
        setSendEnabled(true);
        return;
      }

      if (action === 'hm') {
        setPls(`${mode}_HM`);
        setSendEnabled(true);
      }
    },
    [isTcpConnected, mode]
  );

  const startManualToe = useCallback(() => {
    if (!isTcpConnected) return;
    const value = normalizeAngleText(freeMeasure.toe);
    setFreeMeasure(prev => ({ ...prev, toe: value }));
    const nextPls = `QS:Angle${value}`;
    setMode('QS');
    setPls(nextPls);
    setSendEnabled(true);
  }, [isTcpConnected, freeMeasure.toe]);

  const startManualCamber = useCallback(() => {
    if (!isTcpConnected) return;
    const value = normalizeAngleText(freeMeasure.camber);
    setFreeMeasure(prev => ({ ...prev, camber: value }));
    const nextPls = `WQ:Angle${value}`;
    setMode('WQ');
    setPls(nextPls);
    setSendEnabled(true);
  }, [isTcpConnected, freeMeasure.camber]);

  return {
    mode,
    setMode,
    measurements,
    sensorOk,
    statusrc,
    freeMeasure,
    setFreeMeasure,
    setpoints,
    setSetpoints,
    kingpin,
    setKingpin,
    paramsLocked,
    step,
    stepStatus,
    pls,
    sendEnabled,
    setSendEnabled,
    resetFlow,
    setAndToggleParamsLock,
    startStep,
    skipStep,
    stopStep,
    handleAction,
    startManualToe,
    startManualCamber,
    handleInboundData, // 导出数据处理方法
  };
}
