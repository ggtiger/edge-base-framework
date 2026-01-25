import React, { useMemo, useRef, useState, useEffect } from 'react';
import { LeftSidebar } from '../components/LeftSidebar';
import { CenterDisplay } from '../components/CenterDisplay';
import { RightSidebar } from '../components/RightSidebar';
import { ConnectionModal } from '../components/ConnectionModal';
import { TcpLogViewer } from '../components/TcpLogViewer';
import { HelpModal } from '../components/HelpModal';
import { useTcpConnection } from '../hooks/useTcpConnection';
import { useWheelSelection } from '../hooks/useWheelSelection';
import { useCalibrationFlow } from '../hooks/useCalibrationFlow';
import {
  buildCommand,
  getFirstSelectedWheel,
  getModeMeasurementKey,
  parseInboundData,
  toNumberOrNull,
  validateSetpoints,
} from '../utils/calibrationProtocol';
import help1 from '../assets/help/ScreenShot_1.png';
import help2 from '../assets/help/ScreenShot_2.png';
import help3 from '../assets/help/ScreenShot_3.png';
import help4 from '../assets/help/ScreenShot_4.png';

interface CalibrationProps {
  onBack: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const MAX_RETRIES = 10;

const Calibration: React.FC<CalibrationProps> = ({ onBack, theme, onToggleTheme }) => {
  const [time, setTime] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // TCP 连接管理
  const inboundHandlerRef = useRef<((data: string) => void) | null>(null);
  const tcp = useTcpConnection((data) => inboundHandlerRef.current?.(data));

  // 车轮选择
  const wheels = useWheelSelection();

  // 校准流程控制
  const flow = useCalibrationFlow(tcp.isTcpConnected, tcp.sendTcpCmd);

  const stateRef = useRef({
    mode: flow.mode,
    step: flow.step,
    paramsLocked: flow.paramsLocked,
    selectedWheels: wheels.selectedWheels,
    setpoints: flow.setpoints,
    measurements: flow.measurements,
    statusrc: flow.statusrc,
     stepStatus: flow.stepStatus,
  });

  useEffect(() => {
    stateRef.current = {
      mode: flow.mode,
      step: flow.step,
      paramsLocked: flow.paramsLocked,
      selectedWheels: wheels.selectedWheels,
      setpoints: flow.setpoints,
      measurements: flow.measurements,
      statusrc: flow.statusrc,
      stepStatus: flow.stepStatus,
    };
  }, [flow.mode, flow.step, flow.paramsLocked, wheels.selectedWheels, flow.setpoints, flow.measurements, flow.statusrc, flow.stepStatus]);

  useEffect(() => {
    inboundHandlerRef.current = (data: string) => {
      flow.handleInboundData(data);

      const snapshot = stateRef.current;
      const canCheckDone =
        snapshot.mode != null &&
        snapshot.step >= 1 &&
        snapshot.step <= 6 &&
        snapshot.paramsLocked &&
        Object.values(snapshot.selectedWheels).some(Boolean) &&
        snapshot.stepStatus?.[snapshot.step - 1] === 'running';

      if (!canCheckDone) return;

      const wheel = getFirstSelectedWheel(snapshot.selectedWheels);
      const mode = snapshot.mode;
      if (!wheel || !mode) return;

      const parsed = parseInboundData(data);
      const key = getModeMeasurementKey(mode, wheel);
      const actualText = (parsed.measurements[key] ?? snapshot.measurements[key] ?? '').toString();
      const targetText = snapshot.setpoints[snapshot.step - 1] ?? '';

      const actualNum = toNumberOrNull(actualText);
      const targetNum = toNumberOrNull(targetText);
      const okByNumber =
        actualNum != null && targetNum != null ? Math.abs(actualNum - targetNum) < 0.005 : false;
      const okByText = actualText.trim() !== '' && actualText.trim() === targetText.trim();
      const statusrc = parsed.statusrc ?? snapshot.statusrc ?? 1;

      if ((okByNumber || okByText) && statusrc === 0) {
        flow.setSendEnabled(false);
        flow.markCurrentStepDone();
      }
    };

    return () => {
      inboundHandlerRef.current = null;
    };
  }, [flow.handleInboundData, flow.setSendEnabled, flow.markCurrentStepDone]);

  // 时钟更新
  // 获取版本信息
  const [versionInfo, setVersionInfo] = useState<{ app: string; ui: string } | null>(null);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getRendererUpdateInfo().then(info => {
        setVersionInfo({ app: info.appVersion, ui: info.rendererVersion });
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19);
      setTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    if (window.electronAPI) {
      window.electronAPI.isFullscreen().then(setIsFullscreen).catch(console.error);
      window.electronAPI.onFullscreenChanged(setIsFullscreen);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.electronAPI.notifyAppReady();
          console.log('[Calibration] Notified main process - fully rendered');
        });
      });
    }

    return () => clearInterval(interval);
  }, []);

  // 定期发送命令
  useEffect(() => {
    if (!tcp.isTcpConnected) return;
    if (!flow.sendEnabled) return;
    if (!flow.pls) return;
    const mode = flow.mode;
    if (!mode) return;

    const interval = setInterval(() => {
      const cmd = buildCommand(mode, flow.pls, wheels.selectedWheels);
      tcp.sendTcpCmd(cmd);
    }, 200);

    return () => clearInterval(interval);
  }, [tcp.isTcpConnected, flow.mode, flow.pls, wheels.selectedWheels, flow.sendEnabled, tcp.sendTcpCmd]);

  const handleToggleFullscreen = async () => {
    const api = window.electronAPI;
    if (!api?.toggleFullscreen) return;
    const newState = await api.toggleFullscreen();
    setIsFullscreen(newState);
  };

  const displayedIp = useMemo(() => tcp.connectionSettings.ip, [tcp.connectionSettings.ip]);
  const displayedLatency = useMemo(() => {
    if (!tcp.linkStable) return '--';
    if (tcp.latencyMs == null) return '--';
    const value = Math.max(0, Math.min(9999, Math.round(tcp.latencyMs)));
    return `${value}ms`;
  }, [tcp.linkStable, tcp.latencyMs]);

  const statusText = useMemo(() => {
    if (tcp.tcpStatus === 'Connected') return `已连接 · 延迟 ${displayedLatency}`;
    if (tcp.showConnectionModal) return `连接失败（已重试 ${MAX_RETRIES} 次）`;

    const current = Number(tcp.retryCount);
    const max = Number(MAX_RETRIES);

    if (current > 0 && current < max) {
      return `正在重连 (${current}/${max})...`;
    }

    if (tcp.tcpStatus === 'Disconnected') return '未连接';
    if (tcp.tcpStatus === 'Closed') return '连接已关闭';
    if (tcp.tcpStatus.startsWith('TCP Error')) return '连接错误';
    return tcp.tcpStatus;
  }, [tcp.tcpStatus, tcp.retryCount, displayedLatency, tcp.showConnectionModal]);

  const statusLevel = useMemo(() => {
    if (tcp.tcpStatus === 'Connected' && tcp.linkStable) return 'ok';
    if (tcp.tcpStatus === 'Connected' && !tcp.linkStable) return 'warn';
    if (tcp.showConnectionModal) return 'error';
    const current = Number(tcp.retryCount);
    const max = Number(MAX_RETRIES);
    if (current > 0 && current < max) return 'warn';
    if (
      tcp.tcpStatus === 'Disconnected' ||
      tcp.tcpStatus === 'Closed'
    ) {
      return 'idle';
    }
    if (
      tcp.tcpStatus.includes('Error') ||
      tcp.tcpStatus.startsWith('TCP Error')
    ) {
      return 'error';
    }
    return 'idle';
  }, [tcp.tcpStatus, tcp.retryCount, tcp.linkStable, tcp.showConnectionModal]);

  const statusColorClass = useMemo(() => {
    if (statusLevel === 'ok') return 'text-emerald-700 dark:text-emerald-300';
    if (statusLevel === 'warn') return 'text-amber-700 dark:text-amber-300';
    if (statusLevel === 'error') return 'text-red-700 dark:text-red-300';
    return 'text-slate-700 dark:text-slate-200';
  }, [statusLevel]);

  const helpSlides = useMemo(() => {
    return [
      { title: '帮助 1/4', src: help1 },
      { title: '帮助 2/4', src: help2 },
      { title: '帮助 3/4', src: help3 },
      { title: '帮助 4/4', src: help4 },
    ];
  }, []);

  const handleLockParams = () => {
    if (!tcp.isTcpConnected) {
      window.alert('请先连接系统！！再进行启动');
      return;
    }
    if (!flow.mode) {
      window.alert('请先选择测量模式（前束 / 外倾）！');
      return;
    }
    if (!Object.values(wheels.selectedWheels).some(Boolean)) {
      window.alert('请至少选中一个轮位！');
      return;
    }
    if (!flow.paramsLocked) {
      if (!validateSetpoints(flow.setpoints)) {
        window.alert('请确保 A1-A6 已填写，且角度在 -90° ~ 90° 范围内！');
        return;
      }
    }
    flow.setAndToggleParamsLock();
  };

  const handleStartForward = () => {
    if (!tcp.isTcpConnected) {
      window.alert('请先连接系统！！再进行启动');
      return;
    }
    if (!flow.mode) {
      window.alert('请先选择测量模式（前束 / 外倾）！');
      return;
    }
    if (!flow.paramsLocked) {
      window.alert('请先设置参数！！再进行启动');
      return;
    }
    if (!Object.values(wheels.selectedWheels).some(Boolean)) {
      window.alert('请至少选中一个轮位！');
      return;
    }
    flow.startStep('forward', wheels.selectedWheels);
  };

  const handleStartReverse = () => {
    if (!tcp.isTcpConnected) {
      window.alert('请先连接系统！！再进行启动');
      return;
    }
    if (!flow.mode) {
      window.alert('请先选择测量模式（前束 / 外倾）！');
      return;
    }
    if (!flow.paramsLocked) {
      window.alert('请先设置参数！！再进行启动');
      return;
    }
    if (!Object.values(wheels.selectedWheels).some(Boolean)) {
      window.alert('请至少选中一个轮位！');
      return;
    }
    flow.startStep('reverse', wheels.selectedWheels);
  };

  const handleStartManualToe = () => {
    if (!tcp.isTcpConnected) {
      window.alert('请先连接系统！！再进行启动');
      return;
    }
    const raw = flow.freeMeasure.toe.trim();
    if (!raw) {
      window.alert('请输入角度值！');
      return;
    }
    const n = toNumberOrNull(raw);
    if (n === null || n < -90 || n > 90) {
      window.alert('角度必须为数字，且在 -90° ~ 90° 范围内！');
      return;
    }
    if (!Object.values(wheels.selectedWheels).some(Boolean)) {
      window.alert('请至少选中一个轮位！');
      return;
    }
    flow.startManualToe();
  };

  const handleStartManualCamber = () => {
    if (!tcp.isTcpConnected) {
      window.alert('请先连接系统！！再进行启动');
      return;
    }
    const raw = flow.freeMeasure.camber.trim();
    if (!raw) {
      window.alert('请输入角度值！');
      return;
    }
    const n = toNumberOrNull(raw);
    if (n === null || n < -90 || n > 90) {
      window.alert('角度必须为数字，且在 -90° ~ 90° 范围内！');
      return;
    }
    if (!Object.values(wheels.selectedWheels).some(Boolean)) {
      window.alert('请至少选中一个轮位！');
      return;
    }
    flow.startManualCamber();
  };

  const handleAction = (action: 'hm' | 'angle0' | 'zero' | 'homing') => {
    if (!tcp.isTcpConnected) {
      window.alert('请先连接系统！！再进行启动');
      return;
    }
    // 回原点不需要选择模式
    if (action === 'homing') {
      flow.handleAction(action);
      return;
    }
    if (!flow.mode) {
      window.alert('请先选择测量模式（前束 / 外倾）！');
      return;
    }
    flow.handleAction(action);
  };

  // JOG 点动处理
  const handleJogPositive = () => {
    if (!tcp.isTcpConnected) {
      window.alert('请先连接系统！！再进行操作');
      return;
    }
    if (!flow.mode) {
      window.alert('请先选择测量模式（前束 / 外倾）！');
      return;
    }
    if (!Object.values(wheels.selectedWheels).some(Boolean)) {
      window.alert('请至少选中一个轮位！');
      return;
    }
    flow.handleJog('+', wheels.selectedWheels);
  };

  const handleJogNegative = () => {
    if (!tcp.isTcpConnected) {
      window.alert('请先连接系统！！再进行操作');
      return;
    }
    if (!flow.mode) {
      window.alert('请先选择测量模式（前束 / 外倾）！');
      return;
    }
    if (!Object.values(wheels.selectedWheels).some(Boolean)) {
      window.alert('请至少选中一个轮位！');
      return;
    }
    flow.handleJog('-', wheels.selectedWheels);
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans tech-background text-slate-900 dark:text-slate-200 overflow-hidden relative">
      {tcp.showConnectionModal && (
        <ConnectionModal
          initialIp={tcp.connectionSettings.ip}
          initialPort={tcp.connectionSettings.port}
          onConnect={(ip, port) => {
            tcp.setConnectionSettings({ ip, port });
            tcp.startTest({ ip, port });
          }}
          onClose={() => tcp.stopTest()}
        />
      )}

      {showHelpModal && <HelpModal slides={helpSlides} onClose={() => setShowHelpModal(false)} />}

      {/* Header */}
      <header className="h-14 border-b border-white/60 dark:border-white/10 bg-gradient-to-r from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-xl px-6 flex justify-between items-center shrink-0 z-50 shadow-lg ring-1 ring-white/40 dark:ring-white/5 relative">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <span className="material-icons text-white text-xl">precision_manufacturing</span>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-wider text-slate-900 dark:text-white leading-none">
              Four Wheel Alignment 
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-slate-500 font-display tracking-[0.2em]">Calibration System</p>
              {versionInfo && (
                <>
                  <span className="w-px h-2 bg-slate-300 dark:bg-slate-600"></span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    App v{versionInfo.app} / UI v{versionInfo.ui}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => (tcp.testRunning ? tcp.stopTest() : tcp.startTest())}
            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm font-bold border shadow-lg backdrop-blur-md active:scale-95 ${
              tcp.testRunning
                ? 'bg-gradient-to-b from-red-50 to-red-100 text-red-700 border-red-400 hover:from-red-100 hover:to-red-200 hover:shadow-red-500/30 ring-1 ring-inset ring-white/50 dark:from-red-900/40 dark:to-red-900/60 dark:text-red-300 dark:border-red-500 dark:ring-white/20'
                : 'bg-gradient-to-b from-blue-50 to-blue-100 text-blue-700 border-blue-400 hover:from-blue-100 hover:to-blue-200 hover:shadow-blue-500/30 ring-1 ring-inset ring-white/50 dark:from-blue-900/40 dark:to-blue-900/60 dark:text-blue-300 dark:border-blue-500 dark:ring-white/20'
            }`}
          >
            <span className={`material-icons text-sm ${tcp.testRunning ? (tcp.trafficPulse ? 'animate-pulse' : '') : ''}`}>
              {tcp.testRunning ? 'stop' : 'play_arrow'}
            </span>
            {tcp.testRunning ? '停止测试' : '启动测试'}
          </button>
          <button
            onClick={onToggleTheme}
            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium border shadow-lg backdrop-blur-md active:scale-95 ${
              theme === 'dark'
                ? 'bg-gradient-to-b from-slate-700 to-slate-800 border-slate-500 text-blue-100 hover:from-slate-600 hover:to-slate-700 hover:border-blue-500 hover:shadow-blue-500/40 ring-1 ring-inset ring-white/20'
                : 'bg-gradient-to-b from-white to-slate-50 border-slate-400 text-slate-700 hover:from-white hover:to-amber-50 hover:border-amber-500 hover:text-amber-700 hover:shadow-amber-500/30 ring-1 ring-inset ring-white/80'
            }`}
          >
            <span className={`material-icons text-sm transition-transform duration-500 ${theme === 'dark' ? 'rotate-180 text-blue-300' : 'rotate-0 text-amber-500'}`}>
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            {theme === 'dark' ? '亮色模式' : '暗色模式'}
          </button>
          <button
            onClick={() => setShowHelpModal(true)}
            className="px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium border shadow-lg backdrop-blur-md active:scale-95 bg-gradient-to-b from-white to-slate-50 border-slate-400 text-slate-700 hover:from-white hover:to-slate-100 hover:border-slate-500 hover:shadow-slate-400/30 ring-1 ring-inset ring-white/80 dark:from-slate-800/60 dark:to-slate-800/80 dark:border-slate-500 dark:text-slate-300 dark:hover:from-slate-700/60 dark:hover:to-slate-700/80 dark:ring-white/20"
          >
            <span className="material-icons text-sm">help_outline</span> 帮助
          </button>
          <button
            onClick={() => void window.electronAPI?.quitApp?.()}
            className="px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium border shadow-lg backdrop-blur-md active:scale-95 bg-gradient-to-b from-red-50/20 to-red-50/40 border-red-300 text-red-600 hover:from-red-500 hover:to-red-600 hover:text-white hover:border-red-600 hover:shadow-red-500/40 ring-1 ring-inset ring-white/50 dark:from-red-900/20 dark:to-red-900/40 dark:border-red-500 dark:text-red-400 dark:ring-white/20"
          >
            <span className="material-icons text-sm group-hover:rotate-90 transition-transform">power_settings_new</span> 关闭
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 p-3 grid grid-cols-12 gap-3 overflow-hidden relative">
        <LeftSidebar
          tcpStatus={tcp.tcpStatus}
          linkStable={tcp.linkStable}
          trafficPulse={tcp.trafficPulse}
          sensorOk={flow.sensorOk}
          mode={flow.mode}
          onSelectMode={(m: 'QS' | 'WQ') => {
            if (flow.paramsLocked) return;
            flow.setMode(prev => (prev === m ? null : m));
          }}
          selectedWheels={wheels.selectedWheels}
          onToggleWheel={(w) => wheels.toggleWheel(w, flow.paramsLocked)}
          onLinkFront={() => wheels.linkFront(flow.paramsLocked)}
          onLinkRear={() => wheels.linkRear(flow.paramsLocked)}
          onLinkLeft={() => wheels.linkLeft(flow.paramsLocked)}
          onLinkRight={() => wheels.linkRight(flow.paramsLocked)}
          disabled={flow.paramsLocked}
          sensorStatus={flow.sensorStatus}
          homingStatus={flow.homingStatus}
          homingInProgress={flow.homingInProgress}
        />
        <CenterDisplay
          mode={flow.mode}
          activeWheel={wheels.activeWheel}
          onSelectWheel={(w) => wheels.setActiveWheel(w)}
          measurements={flow.measurements}
          onAction={handleAction}
          homingInProgress={flow.homingInProgress}
          onCancelHoming={() => flow.cancelHoming('User cancelled')}
        />
        <RightSidebar
          isConnected={tcp.isTcpConnected}
          freeMeasure={flow.freeMeasure}
          onChangeFreeMeasure={flow.setFreeMeasure}
          setpoints={flow.setpoints}
          onChangeSetpoints={flow.setSetpoints}
          step={flow.step}
          stepStatus={flow.stepStatus}
          activeDirection={flow.activeDirection}
          paramsLocked={flow.paramsLocked}
          kingpin={flow.kingpin}
          onChangeKingpin={flow.setKingpin}
          onLockParams={handleLockParams}
          onCancel={flow.resetFlow}
          onStartForward={handleStartForward}
          onStartReverse={handleStartReverse}
          onSkipForward={() => flow.skipStep('forward')}
          onSkipReverse={() => flow.skipStep('reverse')}
          onStopForward={flow.stopStep}
          onStopReverse={flow.stopStep}
          onStartManualToe={handleStartManualToe}
          onStartManualCamber={handleStartManualCamber}
          disabled={false}
          jogStepAngle={flow.jogStepAngle}
          onChangeJogStepAngle={flow.setJogStepAngle}
          onJogPositive={handleJogPositive}
          onJogNegative={handleJogNegative}
          hasMode={flow.mode !== null}
          hasSelectedWheel={Object.values(wheels.selectedWheels).some(Boolean)}
        />
      </main>

      {/* Footer */}
      <footer className="h-10 shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-50 text-xs font-medium text-slate-600 dark:text-slate-500">
        <div className="flex items-center shrink-0 h-7 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md overflow-visible shadow-sm">
          <div className="flex items-center gap-2 px-3 h-full shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${tcp.linkStable ? 'bg-accent-green animate-pulse' : 'bg-accent-red'}`}></div>
            <span className="font-bold tracking-wide text-[10px] sm:text-xs whitespace-nowrap text-slate-600 dark:text-slate-400">
              {tcp.linkStable ? 'LINK: OK' : 'LINK: LOST'}
            </span>
          </div>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-700"></div>

          <div className="px-2">
            <div
              className={`h-5 min-w-[90px] max-w-[150px] px-2 rounded-md flex items-center justify-start text-[11px] font-medium whitespace-nowrap transition-colors ${statusColorClass}`}
              style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}
            >
              {statusText}
            </div>
          </div>

          <TcpLogViewer logs={tcp.tcpLogs} />
        </div>

        <div className="flex items-center gap-4 font-display tracking-wide shrink-0">
          <div className="hidden md:flex items-center gap-2 opacity-70">
            <span className="material-icons text-[10px]">my_location</span>
            <span>
              IP：{displayedIp}:{tcp.connectionSettings.port}
            </span>
          </div>
          <div className="text-slate-600 dark:text-slate-500 w-32 sm:w-48 text-right truncate">
            {time || 'INITIALIZING...'}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Calibration;
