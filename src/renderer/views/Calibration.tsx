import React, { useMemo, useRef, useState, useEffect } from 'react';
import { LeftSidebar } from '../components/LeftSidebar';
import { CenterDisplay } from '../components/CenterDisplay';
import { RightSidebar } from '../components/RightSidebar';
import { ConnectionModal } from '../components/ConnectionModal';

interface CalibrationProps {
  onBack: () => void;
}

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

type StepStatus = 'idle' | 'running' | 'done';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 10001;
const MAX_RETRIES = 10;

const Calibration: React.FC<CalibrationProps> = ({ onBack }) => {
  const [time, setTime] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [connectionSettings, setConnectionSettings] = useState({ ip: DEFAULT_HOST, port: DEFAULT_PORT });
  const [retryCount, setRetryCount] = useState(0);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const [tcpStatus, setTcpStatus] = useState<string>('Disconnected');
  const [lastRxAt, setLastRxAt] = useState<number | null>(null);

  const [sensorOk, setSensorOk] = useState<boolean | null>(null);
  const [statusrc, setStatusrc] = useState<number | null>(null);
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

  const [mode, setMode] = useState<Mode>(null);
  const [selectedWheels, setSelectedWheels] = useState<Record<WheelId, boolean>>({
    FL: false,
    FR: false,
    RL: false,
    RR: false,
  });
  const [activeWheel, setActiveWheel] = useState<WheelId | null>(null);

  const [freeMeasure, setFreeMeasure] = useState({ toe: '', camber: '' });
  const [setpoints, setSetpoints] = useState<string[]>(Array(6).fill(''));
  const [kingpin, setKingpin] = useState('0.00');

  const [paramsLocked, setParamsLocked] = useState(false);
  const [step, setStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepStatus[]>(Array(6).fill('idle'));
  const [pls, setPls] = useState('');
  const [sendEnabled, setSendEnabled] = useState(false);

  const stateRef = useRef({
    mode,
    step,
    paramsLocked,
    selectedWheels,
    setpoints,
    measurements,
    statusrc,
  });

  useEffect(() => {
    stateRef.current = {
      mode,
      step,
      paramsLocked,
      selectedWheels,
      setpoints,
      measurements,
      statusrc,
    };
  }, [mode, step, paramsLocked, selectedWheels, setpoints, measurements, statusrc]);

  const isTcpConnected = useMemo(() => tcpStatus === 'Connected', [tcpStatus]);

  const linkStable = useMemo(() => {
    if (!isTcpConnected) return false;
    if (!lastRxAt) return false;
    return Date.now() - lastRxAt < 2500;
  }, [isTcpConnected, lastRxAt]);

  const computeRelayrc = (nextMode: Mode, wheels: Record<WheelId, boolean>) => {
    let relayrc = 0;
    if (wheels.FL) relayrc += 1;
    if (wheels.FR) relayrc += 2;
    if (wheels.RL) relayrc += 4;
    if (wheels.RR) relayrc += 8;
    if (nextMode === 'QS') relayrc += 16;
    if (nextMode === 'WQ') relayrc += 32;
    return relayrc;
  };

  const buildCommand = (nextMode: Exclude<Mode, null>, nextPls: string) => {
    const relayrc = computeRelayrc(nextMode, selectedWheels);
    const relayBinary = relayrc.toString(2);
    return `${nextMode}:Relay${relayBinary}${nextPls}`;
  };

  const toNumberOrNull = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const normalizeAngleText = (v: string) => {
    const n = toNumberOrNull(v);
    if (n === null) return v.trim();
    return n.toFixed(2);
  };

  const getModeMeasurementKey = (nextMode: Exclude<Mode, null>, wheel: WheelId): keyof Measurements => {
    if (nextMode === 'QS') {
      if (wheel === 'FL') return 'qzq';
      if (wheel === 'FR') return 'qyq';
      if (wheel === 'RL') return 'qzh';
      return 'qyh';
    }
    if (wheel === 'FL') return 'wzq';
    if (wheel === 'FR') return 'wyq';
    if (wheel === 'RL') return 'wzh';
    return 'wyh';
  };

  const getFirstSelectedWheel = (wheels: Record<WheelId, boolean>): WheelId | null => {
    if (wheels.FL) return 'FL';
    if (wheels.FR) return 'FR';
    if (wheels.RL) return 'RL';
    if (wheels.RR) return 'RR';
    return null;
  };

  const resetFlow = () => {
    setSendEnabled(false);
    setParamsLocked(false);
    setStep(0);
    setStepStatus(Array(6).fill('idle'));
    setPls('');
    setSetpoints(Array(6).fill(''));
  };

  const validateSetpoints = (vals: string[]) => {
    if (!isTcpConnected) return false;
    if (!mode) return false;
    if (!Object.values(selectedWheels).some(Boolean)) return false;
    if (vals.some(v => v.trim() === '')) return false;

    return vals.every(v => {
      const n = toNumberOrNull(v.trim());
      if (n === null) return false;
      return n >= -90 && n <= 90;
    });
  };

  const startStep = (direction: 'forward' | 'reverse') => {
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
  };

  const skipStep = (direction: 'forward' | 'reverse') => {
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
  };

  const stopStep = () => {
    setSendEnabled(false);
    setStepStatus(prevStatus => {
      if (step < 1 || step > 6) return prevStatus;
      const copy = [...prevStatus];
      if (copy[step - 1] === 'running') copy[step - 1] = 'idle';
      return copy;
    });
  };

  const setAndToggleParamsLock = () => {
    const normalized = setpoints.map(v => normalizeAngleText(v));
    setSetpoints(normalized);

    if (!paramsLocked) {
      if (!validateSetpoints(normalized)) return;
      setParamsLocked(true);
      return;
    }

    setParamsLocked(false);
  };

  const toggleWheel = (wheel: WheelId) => {
    if (paramsLocked) return;
    setSelectedWheels(prev => ({ ...prev, [wheel]: !prev[wheel] }));
    setActiveWheel(wheel);
  };

  const linkFront = () => {
    if (paramsLocked) return;
    setSelectedWheels(prev => {
      const next = { ...prev };
      const willSelect = !(prev.FL && prev.FR);
      next.FL = willSelect;
      next.FR = willSelect;
      return next;
    });
  };

  const linkRear = () => {
    if (paramsLocked) return;
    setSelectedWheels(prev => {
      const next = { ...prev };
      const willSelect = !(prev.RL && prev.RR);
      next.RL = willSelect;
      next.RR = willSelect;
      return next;
    });
  };

  const parseInbound = (
    raw: string,
    snapshot: {
      mode: Mode;
      step: number;
      paramsLocked: boolean;
      selectedWheels: Record<WheelId, boolean>;
      setpoints: string[];
      measurements: Measurements;
      statusrc: number | null;
    }
  ) => {
    const str = raw.replace(/\0/g, '').trim();
    let nextStatusrc: number | null = snapshot.statusrc;
    let nextMeasurements: Measurements | null = null;

    if (str.includes('SensorNG')) setSensorOk(false);
    if (str.includes('SensorOK')) setSensorOk(true);

    const statusMatch = str.match(/ST_status\s*([0-9]+)/i) ?? str.match(/ST_status([0-9]+)/i);
    if (statusMatch?.[1] != null) {
      const n = Number(statusMatch[1]);
      if (Number.isFinite(n)) {
        nextStatusrc = n;
        setStatusrc(n);
      }
    }

    const pos = {
      pos1: str.indexOf('ST_status'),
      pos10: str.indexOf('ND'),
      qzq: str.indexOf('qzq'),
      qyq: str.indexOf('qyq'),
      qzh: str.indexOf('qzh'),
      qyh: str.indexOf('qyh'),
      wzq: str.indexOf('wzq'),
      wyq: str.indexOf('wyq'),
      wzh: str.indexOf('wzh'),
      wyh: str.indexOf('wyh'),
    };

    const hasAll =
      pos.pos1 >= 0 &&
      pos.pos10 > pos.pos1 &&
      pos.qzq >= 0 &&
      pos.qyq > pos.qzq &&
      pos.qzh > pos.qyq &&
      pos.qyh > pos.qzh &&
      pos.wzq > pos.qyh &&
      pos.wyq > pos.wzq &&
      pos.wzh > pos.wyq &&
      pos.wyh > pos.wzh &&
      pos.pos10 > pos.wyh;

    if (hasAll) {
      const next: Measurements = {
        qzq: str.slice(pos.qzq + 3, pos.qyq).trim(),
        qyq: str.slice(pos.qyq + 3, pos.qzh).trim(),
        qzh: str.slice(pos.qzh + 3, pos.qyh).trim(),
        qyh: str.slice(pos.qyh + 3, pos.wzq).trim(),
        wzq: str.slice(pos.wzq + 3, pos.wyq).trim(),
        wyq: str.slice(pos.wyq + 3, pos.wzh).trim(),
        wzh: str.slice(pos.wzh + 3, pos.wyh).trim(),
        wyh: str.slice(pos.wyh + 3, pos.pos10).trim(),
      };

      nextMeasurements = next;
      setMeasurements(prev => ({ ...prev, ...next }));
    }

    const isAck =
      str.includes('QSRECVOK') ||
      str.includes('QS_HMOK') ||
      str.includes('QS_ZEROOK') ||
      str.includes('WQ_ZEROOK') ||
      str.includes('WQ_HMOK') ||
      str.includes('WQRECVOK');

    if (isAck) setSendEnabled(false);

    const canCheckDone =
      snapshot.mode != null &&
      snapshot.step >= 1 &&
      snapshot.step <= 6 &&
      snapshot.paramsLocked &&
      Object.values(snapshot.selectedWheels).some(Boolean);

    if (canCheckDone) {
      const wheel = getFirstSelectedWheel(snapshot.selectedWheels);
      if (wheel && snapshot.mode) {
        const key = getModeMeasurementKey(snapshot.mode, wheel);
        const actualText = (nextMeasurements?.[key] ?? snapshot.measurements[key] ?? '').toString();
        const targetText = snapshot.setpoints[snapshot.step - 1] ?? '';

        const actualNum = toNumberOrNull(actualText);
        const targetNum = toNumberOrNull(targetText);
        const okByNumber =
          actualNum != null && targetNum != null ? Math.abs(actualNum - targetNum) < 0.005 : false;
        const okByText = actualText.trim() !== '' && actualText.trim() === targetText.trim();

        if ((okByNumber || okByText) && (nextStatusrc ?? 1) === 0) {
          setStepStatus(prevStatus => {
            const copy = [...prevStatus];
            copy[snapshot.step - 1] = 'done';
            return copy;
          });
          setSendEnabled(false);
        }
      }
    }
  };

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
    
    // Clock update logic
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19);
      setTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // 获取初始全屏状态
    window.electronAPI?.isFullscreen().then(setIsFullscreen);
    
    // 监听全屏状态变化
    window.electronAPI?.onFullscreenChanged(setIsFullscreen);

    // Notify main process that Calibration view is fully rendered
    // Use requestAnimationFrame to ensure DOM is painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (window.electronAPI?.notifyAppReady) {
          window.electronAPI.notifyAppReady();
          console.log('[Calibration] Notified main process - fully rendered');
        }
      });
    });

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initial connection attempt when settings change
    window.electronAPI.connectTcp(connectionSettings.ip, connectionSettings.port);
    setRetryCount(1);
    setShowConnectionModal(false);
  }, [connectionSettings]);

  useEffect(() => {
    window.electronAPI.onTcpStatus((status) => {
      setTcpStatus(status);
    });
    window.electronAPI.onTcpData((data) => {
      setLastRxAt(Date.now());
      parseInbound(data, stateRef.current);
    });
  }, []);

  // Retry logic
  useEffect(() => {
    if (tcpStatus === 'Connected') {
      setRetryCount(0);
      setShowConnectionModal(false);
      return;
    }

    if (showConnectionModal) return;
    if (retryCount <= 0) return;

    if (retryCount >= MAX_RETRIES) {
      setShowConnectionModal(true);
      return;
    }

    if (
      tcpStatus === 'Disconnected' ||
      tcpStatus === 'Closed' ||
      tcpStatus.includes('Error') ||
      tcpStatus.startsWith('TCP Error')
    ) {
      const timer = setTimeout(() => {
        setRetryCount(c => c + 1);
        window.electronAPI.connectTcp(connectionSettings.ip, connectionSettings.port);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tcpStatus, retryCount, showConnectionModal, connectionSettings]);

  useEffect(() => {
    if (!isTcpConnected) return;
    const interval = setInterval(() => {
      window.electronAPI.sendTcp('S1F1');
    }, 1000);
    return () => clearInterval(interval);
  }, [isTcpConnected]);

  useEffect(() => {
    if (!isTcpConnected) return;
    if (!sendEnabled) return;
    if (!mode) return;
    if (!pls) return;

    const interval = setInterval(() => {
      const cmd = buildCommand(mode, pls);
      window.electronAPI.sendTcp(cmd);
    }, 200);

    return () => clearInterval(interval);
  }, [isTcpConnected, mode, pls, selectedWheels, sendEnabled]);

  const handleToggleFullscreen = async () => {
    const newState = await window.electronAPI.toggleFullscreen();
    setIsFullscreen(newState);
  };

  const displayedIp = useMemo(() => connectionSettings.ip, [connectionSettings.ip]);
  const displayedLatency = useMemo(() => {
    if (!linkStable) return '--';
    return '12ms';
  }, [linkStable]);

  const statusText = useMemo(() => {
    if (tcpStatus === 'Connected') return `已连接 - 延迟 ${displayedLatency}`;
    if (showConnectionModal) return `连接失败（已重试 ${MAX_RETRIES} 次）`;
    
    // Ensure numbers are treated as numbers for display
    const current = Number(retryCount);
    const max = Number(MAX_RETRIES);
    
    if (current > 0 && current < max) {
      return `正在重连 (${current} / ${max})...`;
    }
    
    if (tcpStatus === 'Disconnected') return '未连接';
    if (tcpStatus === 'Closed') return '连接已关闭';
    if (tcpStatus.startsWith('TCP Error')) return '连接错误';
    return tcpStatus;
  }, [tcpStatus, retryCount, displayedLatency, showConnectionModal]);

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-background-dark text-slate-200 overflow-hidden relative">
      {showConnectionModal && (
        <ConnectionModal
          initialIp={connectionSettings.ip}
          initialPort={connectionSettings.port}
          onConnect={(ip, port) => setConnectionSettings({ ip, port })}
        />
      )}
      
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex justify-between items-center shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
             <span className="material-icons text-white text-xl">precision_manufacturing</span>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-wider text-white leading-none">
              Four Wheel Alignment <span className="text-primary text-sm align-top ml-1">V2.0</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-display tracking-[0.2em] mt-1">Calibration System</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition flex items-center gap-2 text-sm font-medium border border-transparent hover:border-slate-600"
          >
            <span className="material-icons text-sm">home</span> 主页
          </button>
          <button 
            onClick={handleToggleFullscreen}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition flex items-center gap-2 text-sm font-medium border border-transparent hover:border-slate-600"
          >
            <span className="material-icons text-sm">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span> 
            {isFullscreen ? '退出全屏' : '全屏'}
          </button>
          <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition flex items-center gap-2 text-sm font-medium border border-transparent hover:border-slate-600">
            <span className="material-icons text-sm">help_outline</span> 帮助
          </button>
          <button 
            onClick={() => window.electronAPI.quitApp()}
            className="px-4 py-2 bg-accent-red/10 text-accent-red border border-accent-red/20 rounded hover:bg-accent-red hover:text-white transition flex items-center gap-2 text-sm font-medium group shadow-[0_0_10px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          >
            <span className="material-icons text-sm group-hover:rotate-90 transition-transform">power_settings_new</span> 关闭
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-6rem)] p-4 grid grid-cols-12 gap-4 overflow-hidden relative">
        <LeftSidebar
          tcpStatus={tcpStatus}
          linkStable={linkStable}
          sensorOk={sensorOk}
          mode={mode}
          onSelectMode={(m: 'QS' | 'WQ') => {
            if (paramsLocked) return;
            setMode(prev => (prev === m ? null : m));
          }}
          selectedWheels={selectedWheels}
          onToggleWheel={toggleWheel}
          onLinkFront={linkFront}
          onLinkRear={linkRear}
          disabled={paramsLocked}
        />
        <CenterDisplay
          mode={mode}
          activeWheel={activeWheel}
          onSelectWheel={(w) => setActiveWheel(w)}
          measurements={measurements}
          onAction={(action: 'hm' | 'angle0' | 'zero') => {
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
          }}
        />
        <RightSidebar
          isConnected={isTcpConnected}
          freeMeasure={freeMeasure}
          onChangeFreeMeasure={(next) => setFreeMeasure(next)}
          setpoints={setpoints}
          onChangeSetpoints={(next) => setSetpoints(next)}
          step={step}
          stepStatus={stepStatus}
          paramsLocked={paramsLocked}
          kingpin={kingpin}
          onChangeKingpin={(next) => setKingpin(next)}
          onLockParams={setAndToggleParamsLock}
          onCancel={resetFlow}
          onStartForward={() => startStep('forward')}
          onStartReverse={() => startStep('reverse')}
          onSkipForward={() => skipStep('forward')}
          onSkipReverse={() => skipStep('reverse')}
          onStopForward={stopStep}
          onStopReverse={stopStep}
          onStartManualToe={() => {
            if (!isTcpConnected) return;
            const value = normalizeAngleText(freeMeasure.toe);
            setFreeMeasure(prev => ({ ...prev, toe: value }));
            const nextPls = `QS:Angle${value}`;
            setMode('QS');
            setPls(nextPls);
            setSendEnabled(true);
          }}
          onStartManualCamber={() => {
            if (!isTcpConnected) return;
            const value = normalizeAngleText(freeMeasure.camber);
            setFreeMeasure(prev => ({ ...prev, camber: value }));
            const nextPls = `WQ:Angle${value}`;
            setMode('WQ');
            setPls(nextPls);
            setSendEnabled(true);
          }}
          disabled={false}
        />
      </main>

      {/* Footer */}
      <footer className="h-10 shrink-0 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between z-50 text-xs font-medium text-slate-500 overflow-hidden">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-800 border border-slate-700 shrink-0">
             <div className={`w-1.5 h-1.5 rounded-full ${linkStable ? 'bg-accent-green animate-pulse' : 'bg-accent-red'}`}></div>
             <span className="font-bold tracking-wide text-[10px] sm:text-xs whitespace-nowrap">{linkStable ? 'LINK: OK' : 'LINK: LOST'}</span>
          </div>
          <span className="text-slate-400 border-l border-slate-700 pl-3 whitespace-nowrap">
            {statusText}
          </span>
        </div>
        
        <div className="flex items-center gap-4 font-display tracking-wide shrink-0">
          <div className="hidden md:flex items-center gap-2 opacity-70">
             <span className="material-icons text-[10px]">my_location</span>
             <span>IP：{displayedIp}</span>
          </div>
          <div className="text-slate-500 w-32 sm:w-48 text-right truncate">
            {time || 'INITIALIZING...'}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Calibration;
