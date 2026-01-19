/**
 * 校准协议相关的工具函数
 */

export type Mode = 'QS' | 'WQ' | null;
export type WheelId = 'FL' | 'FR' | 'RL' | 'RR';

export type Measurements = {
  qzq: string;
  qyq: string;
  qzh: string;
  qyh: string;
  wzq: string;
  wyq: string;
  wzh: string;
  wyh: string;
};

/**
 * 计算继电器控制码
 */
export function computeRelayrc(mode: Mode, wheels: Record<WheelId, boolean>): number {
  let relayrc = 0;
  if (wheels.FL) relayrc += 1;
  if (wheels.FR) relayrc += 2;
  if (wheels.RL) relayrc += 4;
  if (wheels.RR) relayrc += 8;
  if (mode === 'QS') relayrc += 16;
  if (mode === 'WQ') relayrc += 32;
  return relayrc;
}

/**
 * 构建控制命令
 */
export function buildCommand(
  mode: Exclude<Mode, null>,
  pls: string,
  selectedWheels: Record<WheelId, boolean>
): string {
  const relayrc = computeRelayrc(mode, selectedWheels);
  const relayBinary = relayrc.toString(2);
  return `${mode}:Relay${relayBinary}${pls}`;
}

/**
 * 转换为数字或 null
 */
export function toNumberOrNull(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * 标准化角度文本
 */
export function normalizeAngleText(v: string): string {
  const n = toNumberOrNull(v);
  if (n === null) return v.trim();
  return n.toFixed(2);
}

/**
 * 获取模式对应的测量值键名
 */
export function getModeMeasurementKey(
  mode: Exclude<Mode, null>,
  wheel: WheelId
): keyof Measurements {
  if (mode === 'QS') {
    if (wheel === 'FL') return 'qzq';
    if (wheel === 'FR') return 'qyq';
    if (wheel === 'RL') return 'qzh';
    return 'qyh';
  }
  if (wheel === 'FL') return 'wzq';
  if (wheel === 'FR') return 'wyq';
  if (wheel === 'RL') return 'wzh';
  return 'wyh';
}

/**
 * 获取第一个选中的车轮
 */
export function getFirstSelectedWheel(wheels: Record<WheelId, boolean>): WheelId | null {
  if (wheels.FL) return 'FL';
  if (wheels.FR) return 'FR';
  if (wheels.RL) return 'RL';
  if (wheels.RR) return 'RR';
  return null;
}

/**
 * 验证设定点
 */
export function validateSetpoints(vals: string[]): boolean {
  if (vals.some(v => v.trim() === '')) return false;

  return vals.every(v => {
    const n = toNumberOrNull(v.trim());
    if (n === null) return false;
    return n >= -90 && n <= 90;
  });
}

/**
 * 解析入站数据
 */
export function parseInboundData(raw: string): {
  sensorOk: boolean | null;
  statusrc: number | null;
  measurements: Partial<Measurements>;
  isAck: boolean;
} {
  const str = raw.replace(/\0/g, '').trim();
  let sensorOk: boolean | null = null;
  let statusrc: number | null = null;
  const measurements: Partial<Measurements> = {};
  let isAck = false;

  // 传感器状态
  if (str.includes('SensorNG')) sensorOk = false;
  if (str.includes('SensorOK')) sensorOk = true;

  // 状态码
  const statusMatch = str.match(/ST_status\s*([0-9]+)/i) ?? str.match(/ST_status([0-9]+)/i);
  if (statusMatch?.[1] != null) {
    const n = Number(statusMatch[1]);
    if (Number.isFinite(n)) {
      statusrc = n;
    }
  }

  // 测量值
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
    measurements.qzq = str.slice(pos.qzq + 3, pos.qyq).trim();
    measurements.qyq = str.slice(pos.qyq + 3, pos.qzh).trim();
    measurements.qzh = str.slice(pos.qzh + 3, pos.qyh).trim();
    measurements.qyh = str.slice(pos.qyh + 3, pos.wzq).trim();
    measurements.wzq = str.slice(pos.wzq + 3, pos.wyq).trim();
    measurements.wyq = str.slice(pos.wyq + 3, pos.wzh).trim();
    measurements.wzh = str.slice(pos.wzh + 3, pos.wyh).trim();
    measurements.wyh = str.slice(pos.wyh + 3, pos.pos10).trim();
  }

  if (sensorOk === null && statusrc === 0 && hasAll) {
    sensorOk = true;
  }

  // ACK 检测
  isAck =
    str.includes('QSRECVOK') ||
    str.includes('QS_HMOK') ||
    str.includes('QS_ZEROOK') ||
    str.includes('WQ_ZEROOK') ||
    str.includes('WQ_HMOK') ||
    str.includes('WQRECVOK');

  return { sensorOk, statusrc, measurements, isAck };
}
