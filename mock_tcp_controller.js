const net = require('net');

function createInitialState() {
  return {
    mode: null,
    relayBits: 0,
    selectedWheels: { FL: false, FR: false, RL: false, RR: false },
    measurements: {
      qzq: 0,
      qyq: 0,
      qzh: 0,
      qyh: 0,
      wzq: 0,
      wyq: 0,
      wzh: 0,
      wyh: 0,
    },
    targets: {
      qzq: 0,
      qyq: 0,
      qzh: 0,
      qyh: 0,
      wzq: 0,
      wyq: 0,
      wzh: 0,
      wyh: 0,
    },
    moving: false,
    lastCommandType: null,
    lastCommandMode: null,
    ackPending: null,
    ackDelayTicks: 0,
    statusrc: 0,
    speedFactor: 0.2,
    // 传感器状态：1=在位, 0=离位
    sensorStatus: [1, 1, 1, 1],
    sensorFaultTicks: 0,
    // 回原点状态：0=待机, 1=进行中, 2=完成
    homingStatus: [0, 0, 0, 0],
    homingInProgress: false,
    homingTicks: 0,
    homingTimeout: false,
    linkDropTicks: 0,
    frameCounter: 0,
  };
}

function decodeRelay(bits) {
  const n = parseInt(bits, 2);
  const result = {
    value: n,
    wheels: {
      FL: (n & 1) !== 0,
      FR: (n & 2) !== 0,
      RL: (n & 4) !== 0,
      RR: (n & 8) !== 0,
    },
    mode: (n & 16) !== 0 ? 'QS' : (n & 32) !== 0 ? 'WQ' : null,
  };
  return result;
}

function parseCommand(raw) {
  const cmd = raw.trim();
  if (!cmd) return null;

  // 心跳命令
  if (cmd === 'S1F1') {
    return { kind: 'heartbeat' };
  }

  // 回原点命令
  if (cmd === 'START_HOMING') {
    return { kind: 'homing' };
  }

  // 状态同步命令
  if (cmd === 'SYNC_STATUS') {
    return { kind: 'sync' };
  }

  // 零点校准命令: QS_ZERO 或 WQ_ZERO
  if (cmd === 'QS_ZERO' || cmd === 'WQ_ZERO') {
    return {
      kind: 'control',
      mode: cmd.startsWith('QS') ? 'QS' : 'WQ',
      cmdType: 'zero',
      relayBits: '111111', // 全部轮位
    };
  }

  // 丝杆复位命令: QS_HM 或 WQ_HM
  if (cmd === 'QS_HM' || cmd === 'WQ_HM') {
    return {
      kind: 'control',
      mode: cmd.startsWith('QS') ? 'QS' : 'WQ',
      cmdType: 'hm',
      relayBits: '111111',
    };
  }

  // 归零命令: QS:Angle0 或 WQ:Angle0
  const angle0Match = cmd.match(/^(QS|WQ):Angle0$/);
  if (angle0Match) {
    return {
      kind: 'control',
      mode: angle0Match[1],
      cmdType: 'angle',
      angle: 0,
      relayBits: '111111',
    };
  }

  // 角度控制命令: {QS|WQ}:Relay{bits}Angle{value}
  const angleMatch = cmd.match(/^(QS|WQ):Relay(\d+)Angle(-?[\d.]+)$/);
  if (angleMatch) {
    return {
      kind: 'control',
      mode: angleMatch[1],
      relayBits: angleMatch[2],
      cmdType: 'angle',
      angle: parseFloat(angleMatch[3]),
    };
  }

  // JOG点动命令: {QS|WQ}:Relay{bits}JOG{±value}
  const jogMatch = cmd.match(/^(QS|WQ):Relay(\d+)JOG(-?[\d.]+)$/);
  if (jogMatch) {
    return {
      kind: 'control',
      mode: jogMatch[1],
      relayBits: jogMatch[2],
      cmdType: 'jog',
      jogStep: parseFloat(jogMatch[3]),
    };
  }

  return null;
}

function updateTargets(state, parsed) {
  const decoded = decodeRelay(parsed.relayBits);
  state.relayBits = decoded.value;
  state.selectedWheels = decoded.wheels;
  state.mode = decoded.mode || parsed.mode || state.mode;
  state.lastCommandMode = state.mode;
  state.lastCommandType = parsed.cmdType;
  state.moving = false;

  // 角度控制
  if (parsed.cmdType === 'angle' && typeof parsed.angle === 'number' && state.mode) {
    state.speedFactor = 0.15;
    const target = parsed.angle;
    const keys = [];
    if (state.mode === 'QS') {
      if (state.selectedWheels.FL) keys.push('qzq');
      if (state.selectedWheels.FR) keys.push('qyq');
      if (state.selectedWheels.RL) keys.push('qzh');
      if (state.selectedWheels.RR) keys.push('qyh');
    } else if (state.mode === 'WQ') {
      if (state.selectedWheels.FL) keys.push('wzq');
      if (state.selectedWheels.FR) keys.push('wyq');
      if (state.selectedWheels.RL) keys.push('wzh');
      if (state.selectedWheels.RR) keys.push('wyh');
    }
    keys.forEach(k => {
      state.targets[k] = target;
    });
    state.moving = keys.length > 0;
    state.ackPending = state.mode + 'RECVOK';
    state.ackDelayTicks = Math.floor(Math.random() * 6) + 2;
  }
  // JOG点动
  else if (parsed.cmdType === 'jog' && typeof parsed.jogStep === 'number' && state.mode) {
    state.speedFactor = 0.3;
    const keys = [];
    if (state.mode === 'QS') {
      if (state.selectedWheels.FL) keys.push('qzq');
      if (state.selectedWheels.FR) keys.push('qyq');
      if (state.selectedWheels.RL) keys.push('qzh');
      if (state.selectedWheels.RR) keys.push('qyh');
    } else if (state.mode === 'WQ') {
      if (state.selectedWheels.FL) keys.push('wzq');
      if (state.selectedWheels.FR) keys.push('wyq');
      if (state.selectedWheels.RL) keys.push('wzh');
      if (state.selectedWheels.RR) keys.push('wyh');
    }
    keys.forEach(k => {
      state.targets[k] = state.measurements[k] + parsed.jogStep;
    });
    state.moving = keys.length > 0;
    state.ackPending = state.mode + 'RECVOK';
    state.ackDelayTicks = Math.floor(Math.random() * 3) + 1;
  }
  // 零点校准
  else if (parsed.cmdType === 'zero' && state.mode) {
    // 将当前位置设为零点
    const keys = state.mode === 'QS'
      ? ['qzq', 'qyq', 'qzh', 'qyh']
      : ['wzq', 'wyq', 'wzh', 'wyh'];
    keys.forEach(k => {
      state.measurements[k] = 0;
      state.targets[k] = 0;
    });
    state.ackPending = state.mode + '_ZEROOK';
    state.ackDelayTicks = Math.floor(Math.random() * 3) + 1;
  }
  // 丝杆复位
  else if (parsed.cmdType === 'hm' && state.mode) {
    state.speedFactor = 0.06;
    const keys = state.mode === 'QS'
      ? ['qzq', 'qyq', 'qzh', 'qyh']
      : ['wzq', 'wyq', 'wzh', 'wyh'];
    keys.forEach(k => {
      state.targets[k] = 0;
    });
    state.moving = true;
    state.ackPending = state.mode + '_HMOK';
    state.ackDelayTicks = Math.floor(Math.random() * 10) + 5;
  }
  else {
    state.moving = false;
    state.ackPending = null;
  }
}

function startHoming(state) {
  state.homingInProgress = true;
  state.homingStatus = [1, 1, 1, 1]; // 全部开始回原点
  state.homingTicks = 0;
  state.homingTimeout = false;
}

function tickHoming(state) {
  if (!state.homingInProgress) return;

  state.homingTicks += 1;

  // 模拟回原点超时（小概率）
  if (state.homingTicks > 100 && Math.random() < 0.01) {
    state.homingTimeout = true;
    state.homingInProgress = false;
    state.homingStatus = [0, 0, 0, 0];
    return;
  }

  // 模拟各电机逐个完成
  const completionTicks = [15, 20, 25, 30];
  for (let i = 0; i < 4; i++) {
    if (state.homingStatus[i] === 1 && state.homingTicks >= completionTicks[i]) {
      state.homingStatus[i] = 2; // 完成
    }
  }

  // 检查是否全部完成
  if (state.homingStatus.every(s => s === 2)) {
    state.homingInProgress = false;
  }
}

function stepValue(current, target, factor) {
  const diff = target - current;
  if (Math.abs(diff) < 0.005) return target;
  return current + diff * factor;
}

function jitter(value) {
  const noise = (Math.random() - 0.5) * 0.02;
  const next = value + noise;
  return Math.round(next * 1000) / 1000;
}

function tickState(state) {
  // 处理回原点
  tickHoming(state);

  // 模拟传感器状态变化
  if (state.sensorFaultTicks > 0) {
    state.sensorFaultTicks -= 1;
    if (state.sensorFaultTicks === 0) {
      // 恢复传感器
      state.sensorStatus = [1, 1, 1, 1];
    }
  } else if (Math.random() < 0.01) {
    // 随机产生传感器故障
    const faultIdx = Math.floor(Math.random() * 4);
    state.sensorStatus[faultIdx] = 0;
    state.sensorFaultTicks = 30 + Math.floor(Math.random() * 30);
  }

  if (!state.moving) {
    state.statusrc = 0;
    Object.keys(state.measurements).forEach(k => {
      const target = state.targets[k];
      if (typeof target === 'number') {
        state.measurements[k] = target;
      } else {
        state.measurements[k] = jitter(state.measurements[k]);
      }
    });
    return;
  }

  let anyMoving = false;
  Object.keys(state.measurements).forEach(k => {
    const current = state.measurements[k];
    const target = state.targets[k];
    if (typeof target !== 'number') {
      state.measurements[k] = jitter(current);
      return;
    }
    const next = stepValue(current, target, state.speedFactor);
    const distance = Math.abs(next - target);
    if (distance <= 0.005) {
      state.measurements[k] = target;
    } else {
      state.measurements[k] = jitter(next);
      anyMoving = true;
    }
  });
  state.statusrc = anyMoving ? 1 : 0;
  state.moving = anyMoving;
}

// 构建标准数据帧
function buildDataFrame(state) {
  const m = state.measurements;
  const status = state.statusrc;
  return '_ST_status' + status +
    'qzq' + m.qzq.toFixed(2) +
    'qyq' + m.qyq.toFixed(2) +
    'qzh' + m.qzh.toFixed(2) +
    'qyh' + m.qyh.toFixed(2) +
    'wzq' + m.wzq.toFixed(2) +
    'wyq' + m.wyq.toFixed(2) +
    'wzh' + m.wzh.toFixed(2) +
    'wyh' + m.wyh.toFixed(2) +
    'ND';
}

// 构建传感器状态消息
function buildSensorFrame(state) {
  return 'SENSOR,' + state.sensorStatus.join(',');
}

// 构建回原点状态消息
function buildHomingFrame(state) {
  return 'HOMING_STATUS,' + state.homingStatus.join(',');
}

function handleConnection(socket) {
  socket.setEncoding('ascii');
  const state = createInitialState();
  let sensorSendCounter = 0;

  const timer = setInterval(() => {
    tickState(state);

    if (state.linkDropTicks > 0) {
      state.linkDropTicks -= 1;
      return;
    }

    // 小概率链路中断
    if (Math.random() < 0.01) {
      state.linkDropTicks = 10 + Math.floor(Math.random() * 20);
      return;
    }

    state.frameCounter += 1;

    // 发送标准数据帧
    let frame = buildDataFrame(state);

    // 附加命令完成消息
    if (!state.moving && state.ackPending) {
      if (state.ackDelayTicks > 0) {
        state.ackDelayTicks -= 1;
      } else {
        frame += state.ackPending;
        state.ackPending = null;
      }
    }

    socket.write(frame + '\n');

    // 定期发送传感器状态（每10帧）
    sensorSendCounter += 1;
    if (sensorSendCounter >= 10) {
      sensorSendCounter = 0;
      socket.write(buildSensorFrame(state) + '\n');
    }

    // 回原点进行中时发送状态
    if (state.homingInProgress) {
      socket.write(buildHomingFrame(state) + '\n');
    }

    // 回原点超时
    if (state.homingTimeout) {
      socket.write('_HOMING_TIMEOUT\n');
      state.homingTimeout = false;
    }

  }, 200);

  socket.on('data', chunk => {
    const lines = chunk.toString('ascii').trim().split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parsed = parseCommand(trimmed);
      if (!parsed) {
        console.log('Unknown command:', trimmed);
        return;
      }

      console.log('Received:', parsed.kind, trimmed);

      if (parsed.kind === 'heartbeat') {
        if (state.linkDropTicks > 0) return;
        socket.write(buildDataFrame(state) + '\n');
      }
      else if (parsed.kind === 'homing') {
        startHoming(state);
        socket.write(buildHomingFrame(state) + '\n');
      }
      else if (parsed.kind === 'sync') {
        socket.write(buildDataFrame(state) + '\n');
        socket.write(buildSensorFrame(state) + '\n');
        if (state.homingInProgress) {
          socket.write(buildHomingFrame(state) + '\n');
        }
      }
      else if (parsed.kind === 'control') {
        updateTargets(state, parsed);
      }
    });
  });

  socket.on('close', () => {
    console.log('Client disconnected');
    clearInterval(timer);
  });

  socket.on('error', (err) => {
    console.log('Socket error:', err.message);
    clearInterval(timer);
  });
}

function startServer(port) {
  const server = net.createServer(handleConnection);
  server.listen(port, '0.0.0.0', () => {
    const addr = server.address();
    if (addr && typeof addr === 'object') {
      console.log('Mock TCP controller listening on ' + addr.address + ':' + addr.port);
      console.log('Protocol: TCP通信协议.md v1.1');
      console.log('Supported commands:');
      console.log('  - {QS|WQ}:Relay{bits}Angle{value}  角度控制');
      console.log('  - {QS|WQ}:Relay{bits}JOG{±step}    JOG点动');
      console.log('  - START_HOMING                     回原点');
      console.log('  - SYNC_STATUS                      状态同步');
      console.log('  - {QS|WQ}_ZERO                     零点校准');
      console.log('  - {QS|WQ}_HM                       丝杆复位');
      console.log('  - {QS|WQ}:Angle0                   归零');
    }
  });
}

const port = process.env.MOCK_TCP_PORT ? parseInt(process.env.MOCK_TCP_PORT, 10) : 10001;
startServer(port);
