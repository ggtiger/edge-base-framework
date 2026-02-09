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

// 过渡动画组件
const SplashTransition: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // 进度条动画
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    // 1.5秒后开始淡出
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // 2秒后完成
    const completeTimer = setTimeout(() => {
      onCompleteRef.current();
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, []); // 移除依赖，使用 ref

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 动态背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* 网格线 */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
        
        {/* 流动光线 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent animate-flow-down" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-400/50 to-transparent animate-flow-down delay-1" />
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent animate-flow-down delay-2" />
        </div>
        
        {/* 动态光晕 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/30 rounded-full blur-[100px] animate-float-delay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-slow" />
        
        {/* 粒子效果 */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        {/* 圆形波纹 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[400px] h-[400px] border border-cyan-500/20 rounded-full animate-ripple" />
          <div className="absolute inset-0 w-[400px] h-[400px] border border-blue-500/20 rounded-full animate-ripple delay-1" />
          <div className="absolute inset-0 w-[400px] h-[400px] border border-indigo-500/20 rounded-full animate-ripple delay-2" />
        </div>
      </div>

      {/* 主内容 */}
      <div className="relative z-10 text-center">
        {/* 旋转 Logo */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 animate-spin-slow opacity-60 blur-lg" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 animate-spin-reverse opacity-40 blur-md" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-2xl ring-2 ring-cyan-400/30">
            <span className="material-icons text-5xl text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.9)] animate-pulse">
              precision_manufacturing
            </span>
          </div>
          {/* 多层旋转光环 */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400/50 animate-spin" />
          <div className="absolute inset-[-6px] rounded-full border-2 border-transparent border-b-blue-400 border-l-blue-400/50 animate-spin-reverse" />
          <div className="absolute inset-[-12px] rounded-full border border-transparent border-t-indigo-400/30 animate-spin-slow" />
        </div>

        {/* 标题 */}
        <h1 className="text-4xl font-display font-bold text-white tracking-[0.4em] mb-3 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
          RUIPUXI
        </h1>
        <p className="text-sm text-cyan-200/90 tracking-[0.2em] mb-12 uppercase" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          FOUR WHEEL ALIGNMENT CALIBRATION SYSTEM
        </p>

        {/* 进度条 */}
        <div className="w-72 mx-auto">
          <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden backdrop-blur-sm border border-cyan-500/20">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full transition-all duration-100 relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full blur-sm" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
          <p className="text-xs text-cyan-300/70 mt-4 tracking-wider animate-pulse">
            正在初始化系统模块...
          </p>
        </div>
      </div>

      {/* 底部版权 */}
      <div className="absolute bottom-6 text-xs text-cyan-300/40 tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        © 2026 RUIPUXI TECHNOLOGY
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes flow-down {
          0% { opacity: 0; transform: translateY(-100%); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes particle {
          0% { opacity: 0; transform: translateY(0) scale(0); }
          50% { opacity: 1; transform: translateY(-50px) scale(1); }
          100% { opacity: 0; transform: translateY(-100px) scale(0); }
        }
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 3s linear infinite; }
        .animate-flow-down { animation: flow-down 3s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-particle { animation: particle 5s ease-in-out infinite; }
        .animate-ripple { animation: ripple 4s ease-out infinite; }
        .delay-1 { animation-delay: 1s; }
        .delay-2 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

interface CalibrationProps {
  onBack: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const MAX_RETRIES = 10;

const Calibration: React.FC<CalibrationProps> = ({ onBack, theme, onToggleTheme }) => {
  const [showSplash, setShowSplash] = useState(true);
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
    <>
      {/* 过渡动画 */}
      {showSplash && <SplashTransition onComplete={() => setShowSplash(false)} />}
      
      <div className={`h-screen w-screen flex flex-col font-sans tech-background text-slate-900 dark:text-slate-200 overflow-hidden relative transition-opacity duration-300 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
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
    </>
  );
};

export default Calibration;
