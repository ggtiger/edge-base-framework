import { useState, useCallback } from 'react';

export interface NetworkStatus {
  checking: boolean;
  wifiOk: boolean;
  ipOk: boolean;
  ssid: string | null;
  localIp: string | null;
  targetSsid: string;
  targetIp: string;
  serverAddress: string;
  message: string;
  lastChecked: number | null;
}

export interface NetworkConfig {
  targetSsid: string;
  targetIp: string;
  targetSubnet: string;
  serverIp: string;
  serverPort: number;
  wifiPassword: string;
}

const initialStatus: NetworkStatus = {
  checking: false,
  wifiOk: false,
  ipOk: false,
  ssid: null,
  localIp: null,
  targetSsid: 'XDESIN',
  targetIp: '192.168.4.100',
  serverAddress: '192.168.4.1:10001',
  message: '未检查',
  lastChecked: null,
};

export function useNetworkCheck() {
  const [status, setStatus] = useState<NetworkStatus>(initialStatus);
  const [settingIp, setSettingIp] = useState(false);

  // 检查网络状态
  const checkNetwork = useCallback(async () => {
    if (!window.electronAPI?.checkNetwork) {
      setStatus(prev => ({
        ...prev,
        message: '网络检查功能不可用（非 Electron 环境）',
      }));
      return null;
    }

    setStatus(prev => ({ ...prev, checking: true }));
    
    try {
      const result = await window.electronAPI.checkNetwork();
      setStatus({
        checking: false,
        wifiOk: result.wifiOk,
        ipOk: result.ipOk,
        ssid: result.ssid,
        localIp: result.localIp,
        targetSsid: result.targetSsid,
        targetIp: result.targetIp,
        serverAddress: result.serverAddress,
        message: result.message,
        lastChecked: Date.now(),
      });
      return result;
    } catch (e: any) {
      setStatus(prev => ({
        ...prev,
        checking: false,
        message: `检查失败: ${e.message}`,
      }));
      return null;
    }
  }, []);

  // 设置本地 IP（仅 Windows）
  const setLocalIp = useCallback(async () => {
    if (!window.electronAPI?.setLocalIp) {
      return { success: false, message: '功能不可用' };
    }

    setSettingIp(true);
    try {
      const result = await window.electronAPI.setLocalIp();
      if (result.success) {
        // 设置成功后重新检查
        await checkNetwork();
      }
      return result;
    } catch (e: any) {
      return { success: false, message: e.message };
    } finally {
      setSettingIp(false);
    }
  }, [checkNetwork]);

  // 获取网络配置
  const getConfig = useCallback(async (): Promise<NetworkConfig | null> => {
    if (!window.electronAPI?.getNetworkConfig) {
      return null;
    }
    try {
      return await window.electronAPI.getNetworkConfig();
    } catch {
      return null;
    }
  }, []);

  return {
    status,
    settingIp,
    checkNetwork,
    setLocalIp,
    getConfig,
  };
}
