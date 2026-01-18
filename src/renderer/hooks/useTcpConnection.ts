import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_HOST = '';
const DEFAULT_PORT = 0;
const MAX_RETRIES = 10;

export type TcpLog = {
  direction: 'TX' | 'RX' | 'SYS';
  content: string;
  timestamp: number;
};

export function useTcpConnection(onDataReceived?: (data: string) => void) {
  const [connectionSettings, setConnectionSettings] = useState({ ip: DEFAULT_HOST, port: DEFAULT_PORT });
  const [retryCount, setRetryCount] = useState(0);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [testRunning, setTestRunning] = useState(false);
  const [tcpStatus, setTcpStatus] = useState<string>('Disconnected');
  const [lastRxAt, setLastRxAt] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [trafficPulse, setTrafficPulse] = useState(false);
  const [tcpLogs, setTcpLogs] = useState<TcpLog[]>([]);

  const trafficPulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRxAtRef = useRef<number | null>(null);

  const isTcpConnected = tcpStatus === 'Connected';
  const linkStable = isTcpConnected && lastRxAt !== null && Date.now() - lastRxAt < 2500;

  const addTcpLog = useCallback((direction: 'TX' | 'RX' | 'SYS', content: string) => {
    setTcpLogs(prev => [{ direction, content, timestamp: Date.now() }, ...prev].slice(0, 100));
  }, []);

  const sendTcpCmd = useCallback((cmd: string) => {
    if (window.electronAPI) {
      window.electronAPI.sendTcp(cmd);
    } else {
      console.warn('Electron API missing, cannot send TCP command:', cmd);
    }
    addTcpLog('TX', cmd);
  }, [addTcpLog]);

  const startTest = useCallback((next?: { ip: string; port: number }) => {
    const ip = next?.ip ?? connectionSettings.ip;
    const port = next?.port ?? connectionSettings.port;

    if (!ip || ip.trim() === '' || !Number.isFinite(port) || port <= 0) {
      setTestRunning(false);
      setTcpStatus('Disconnected');
      setRetryCount(0);
      setShowConnectionModal(true);
      return;
    }

    setTestRunning(true);
    setTcpStatus('Connecting');
    addTcpLog('SYS', `Connecting to ${ip}:${port}...`);
    
    if (window.electronAPI) {
      window.electronAPI.setTcpConfig?.(ip, port);
      window.electronAPI.connectTcp(ip, port);
    } else {
      console.warn('Electron API missing, cannot connect TCP');
      setTcpStatus('Disconnected (H5 Mode)');
    }
    
    setRetryCount(1);
    setShowConnectionModal(false);
  }, [connectionSettings, addTcpLog]);

  const stopTest = useCallback(() => {
    setTestRunning(false);
    setTcpStatus('Disconnected');
    setRetryCount(0);
    setShowConnectionModal(false);
    setLastRxAt(null);
    setLatencyMs(null);
    setTrafficPulse(false);
    lastRxAtRef.current = null;
    if (trafficPulseTimerRef.current) {
      clearTimeout(trafficPulseTimerRef.current);
      trafficPulseTimerRef.current = null;
    }
    addTcpLog('SYS', 'Disconnecting...');
    if (window.electronAPI) {
      window.electronAPI.disconnectTcp();
    }
  }, [addTcpLog]);

  // 加载初始配置
  useEffect(() => {
    if (!window.electronAPI?.getTcpConfig) return;

    let cancelled = false;
    window.electronAPI
      .getTcpConfig()
      .then(cfg => {
        if (cancelled) return;
        if (!cfg) return;
        const host = typeof cfg.host === 'string' ? cfg.host.trim() : DEFAULT_HOST;
        const port = Number.isFinite(cfg.port) ? cfg.port : DEFAULT_PORT;
        setConnectionSettings({ ip: host, port });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // TCP 状态和数据监听
  useEffect(() => {
    if (!window.electronAPI) {
      console.warn('Electron API not available (H5 mode)');
      return;
    }

    const removeStatusListener = window.electronAPI.onTcpStatus((status) => {
      setTcpStatus(status);
      addTcpLog('SYS', `Status: ${status}`);
    });

    const removeDataListener = window.electronAPI.onTcpData((data) => {
      const now = Date.now();
      if (lastRxAtRef.current !== null) {
        const diff = now - lastRxAtRef.current;
        setLatencyMs(prev => {
          if (prev === null) return diff;
          return Math.round(prev * 0.7 + diff * 0.3);
        });
      }
      lastRxAtRef.current = now;
      setLastRxAt(now);
      setTrafficPulse(true);
      if (trafficPulseTimerRef.current) clearTimeout(trafficPulseTimerRef.current);
      trafficPulseTimerRef.current = setTimeout(() => {
        setTrafficPulse(false);
      }, 160);
      addTcpLog('RX', data);

      // 调用外部数据处理回调
      if (onDataReceived) {
        onDataReceived(data);
      }
    });

    return () => {
      removeStatusListener();
      removeDataListener();
      if (trafficPulseTimerRef.current) {
        clearTimeout(trafficPulseTimerRef.current);
        trafficPulseTimerRef.current = null;
      }
    };
  }, [addTcpLog, onDataReceived]);

  // 重试逻辑
  useEffect(() => {
    if (!testRunning) return;
    if (tcpStatus === 'Connected') {
      setRetryCount(0);
      setShowConnectionModal(false);
      return;
    }

    if (showConnectionModal) return;

    if (retryCount <= 0) {
      if (
        tcpStatus === 'Disconnected' ||
        tcpStatus === 'Closed' ||
        tcpStatus.includes('Error') ||
        tcpStatus.startsWith('TCP Error')
      ) {
        setRetryCount(1);
        return;
      }
      return;
    }

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
        if (window.electronAPI) {
          window.electronAPI.connectTcp(connectionSettings.ip, connectionSettings.port);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tcpStatus, retryCount, showConnectionModal, connectionSettings, testRunning]);

  // 心跳
  useEffect(() => {
    if (!isTcpConnected) return;
    if (!testRunning) return;
    const interval = setInterval(() => {
      sendTcpCmd('S1F1');
    }, 1000);
    return () => clearInterval(interval);
  }, [isTcpConnected, testRunning, sendTcpCmd]);

  return {
    connectionSettings,
    setConnectionSettings,
    retryCount,
    showConnectionModal,
    setShowConnectionModal,
    testRunning,
    tcpStatus,
    isTcpConnected,
    linkStable,
    latencyMs,
    trafficPulse,
    tcpLogs,
    startTest,
    stopTest,
    sendTcpCmd,
    addTcpLog,
  };
}
