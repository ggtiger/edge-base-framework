import { useState, useCallback, useRef, useEffect } from 'react';
import type { Mode, WheelId, Measurements, SensorStatus, HomingStatus } from '../utils/calibrationProtocol';
import {
  normalizeAngleText,
  validateSetpoints,
  parseInboundData,
  buildHomingCommand,
  buildJogCommand,
} from '../utils/calibrationProtocol';

export type StepStatus = 'idle' | 'running' | 'done';

// 回原点超时时间（毫秒）
const HOMING_TIMEOUT_MS = 30000;

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
  
  // 新增：传感器状态 (4个传感器)
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>([false, false, false, false]);
  // 新增：回原点状态 (4个电机)
  const [homingStatus, setHomingStatus] = useState<HomingStatus>([0, 0, 0, 0]);
  // 新增：回原点是否进行中
  const [homingInProgress, setHomingInProgress] = useState(false);
  // 新增：JOG步距角度
  const [jogStepAngle, setJogStepAngle] = useState('1.00');
  
  // 回原点超时定时器
  const homingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 上一次收到 HOMING_STATUS 的时间
  const lastHomingUpdateRef = useRef<number>(0);

  const [freeMeasure, setFreeMeasure] = useState({ toe: '', camber: '' });
  const [setpoints, setSetpoints] = useState<string[]>(Array(6).fill(''));
  const [kingpin, setKingpin] = useState('0.00');

  const [paramsLocked, setParamsLocked] = useState(false);
  const [step, setStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepStatus[]>(Array(6).fill('idle'));
  const [pls, setPls] = useState('');
  const [sendEnabled, setSendEnabled] = useState(false);
  const [activeDirection, setActiveDirection] = useState<'forward' | 'reverse' | null>(null);

  // 清理回原点超时定时器
  const clearHomingTimeout = useCallback(() => {
    if (homingTimeoutRef.current) {
      clearTimeout(homingTimeoutRef.current);
      homingTimeoutRef.current = null;
    }
  }, []);

  // 取消回原点（连接断开/超时/手动取消）
  const cancelHoming = useCallback((reason?: string) => {
    clearHomingTimeout();
    setHomingInProgress(false);
    setHomingStatus([0, 0, 0, 0]);
    if (reason) {
      console.warn('Homing cancelled:', reason);
    }
  }, [clearHomingTimeout]);

  // 监听 TCP 连接状态，断开时重置回原点
  useEffect(() => {
    if (!isTcpConnected && homingInProgress) {
      cancelHoming('TCP disconnected');
    }
  }, [isTcpConnected, homingInProgress, cancelHoming]);

  // 回原点超时检测
  useEffect(() => {
    if (homingInProgress) {
      clearHomingTimeout();
      homingTimeoutRef.current = setTimeout(() => {
        if (homingInProgress) {
          cancelHoming('Timeout - no response for ' + (HOMING_TIMEOUT_MS / 1000) + 's');
        }
      }, HOMING_TIMEOUT_MS);
    } else {
      clearHomingTimeout();
    }

    return () => clearHomingTimeout();
  }, [homingInProgress, clearHomingTimeout, cancelHoming]);

  // 处理入站数据的方法
  const handleInboundData = useCallback((data: string) => {
    const parsed = parseInboundData(data);

    if (parsed.sensorOk !== null) setSensorOk(parsed.sensorOk);
    if (parsed.statusrc !== null) setStatusrc(parsed.statusrc);
    if (Object.keys(parsed.measurements).length > 0) {
      setMeasurements(prev => ({ ...prev, ...parsed.measurements }));
    }
    if (parsed.isAck) setSendEnabled(false);
    
    // 新增：处理传感器状态
    if (parsed.sensorStatus !== null) {
      setSensorStatus(parsed.sensorStatus);
    }
    
    // 新增：处理回原点状态
    if (parsed.homingStatus !== null) {
      setHomingStatus(parsed.homingStatus);
      lastHomingUpdateRef.current = Date.now();
      
      // 收到状态更新时重置超时定时器
      if (homingInProgress) {
        clearHomingTimeout();
        homingTimeoutRef.current = setTimeout(() => {
          cancelHoming('Timeout - no homing status update');
        }, HOMING_TIMEOUT_MS);
      }
      
      // 检查是否所有电机都完成回原点
      const allDone = parsed.homingStatus.every(s => s === 2);
      if (allDone && homingInProgress) {
        clearHomingTimeout();
        setHomingInProgress(false);
      }
    }
    
    // 新增：处理回原点超时（来自下位机）
    if (parsed.homingTimeout) {
      cancelHoming('Device reported timeout');
    }
  }, [homingInProgress, clearHomingTimeout, cancelHoming]);

  const resetFlow = useCallback(() => {
    setSendEnabled(false);
    setParamsLocked(false);
    setStep(0);
    setStepStatus(Array(6).fill('idle'));
    setPls('');
    setSetpoints(Array(6).fill(''));
    setActiveDirection(null);
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

      setActiveDirection(direction);
      setStep(prev => {
        let next = prev;
        const currentStatus = prev >= 1 && prev <= 6 ? stepStatus[prev - 1] : 'idle';

        if (direction === 'forward') {
          if (prev === 0) {
            next = 1;
          } else if (currentStatus === 'done') {
            next = Math.min(prev + 1, 6);
          } else {
            next = prev;
          }
        } else {
          if (prev <= 1) {
            next = 1;
          } else if (currentStatus === 'done') {
            next = prev - 1;
          } else {
            next = prev;
          }
        }

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
    [isTcpConnected, mode, paramsLocked, setpoints, stepStatus]
  );

  const skipStep = useCallback(
    (direction: 'forward' | 'reverse') => {
      if (!paramsLocked) return;
      setStep(prev => {
        if (prev === 0) return prev;

        let next = prev;
        if (direction === 'forward') {
          if (prev < 6) next = prev + 1;
        } else {
          if (prev > 1) next = prev - 1;
        }

        setStepStatus(prevStatus => {
          const copy = [...prevStatus];
          if (prev >= 1 && prev <= 6) copy[prev - 1] = 'done';
          if (next !== prev) {
            copy[next - 1] = 'idle';
          }
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

  const markCurrentStepDone = useCallback(() => {
    setStepStatus(prevStatus => {
      if (step < 1 || step > 6) return prevStatus;
      const copy = [...prevStatus];
      copy[step - 1] = 'done';
      return copy;
    });
  }, [step]);

  const handleAction = useCallback(
    (action: 'hm' | 'angle0' | 'zero' | 'homing') => {
      if (!isTcpConnected) return;

      // 新增：回原点动作（全局）
      if (action === 'homing') {
        sendTcpCmd(buildHomingCommand());
        setHomingInProgress(true);
        setHomingStatus([1, 1, 1, 1]); // 标记所有电机开始回原点
        return;
      }

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
    [isTcpConnected, mode, sendTcpCmd]
  );

  // 新增：JOG 点动控制
  const handleJog = useCallback(
    (direction: '+' | '-', selectedWheels: Record<WheelId, boolean>) => {
      if (!isTcpConnected || !mode) return;
      if (!Object.values(selectedWheels).some(Boolean)) return;
      
      const stepAngle = parseFloat(jogStepAngle) || 1.0;
      const cmd = buildJogCommand(mode, stepAngle, direction, selectedWheels);
      sendTcpCmd(cmd);
    },
    [isTcpConnected, mode, jogStepAngle, sendTcpCmd]
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
    // 新增导出
    sensorStatus,
    homingStatus,
    homingInProgress,
    cancelHoming,
    jogStepAngle,
    setJogStepAngle,
    // 原有导出
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
    activeDirection,
    resetFlow,
    setAndToggleParamsLock,
    startStep,
    skipStep,
    stopStep,
    handleAction,
    handleJog,
    startManualToe,
    startManualCamber,
    handleInboundData,
    markCurrentStepDone,
  };
}
