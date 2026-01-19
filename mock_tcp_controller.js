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
    sensorFaultTicks: 0,
    linkDropTicks: 0,
    heartbeatDelayTicks: 0,
    pendingHeartbeat: null,
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
  if (cmd === 'S1F1') {
    return { kind: 'heartbeat' };
  }
  const isQS = cmd.includes('QS:Relay');
  const isWQ = cmd.includes('WQ:Relay');
  if (!isQS && !isWQ) return null;
  const mode = isQS ? 'QS' : 'WQ';
  const idx = cmd.indexOf('Relay');
  if (idx < 0) return null;
  const afterRelay = cmd.slice(idx + 'Relay'.length);
  const nextModeIdx = afterRelay.search(/QS:|WQ:|QS_|WQ_/);
  const relayBits = nextModeIdx >= 0 ? afterRelay.slice(0, nextModeIdx) : afterRelay;
  let cmdType = null;
  let angle = null;
  const angleMatch = cmd.match(/(QS|WQ):Angle(-?[0-9.]+)/);
  if (angleMatch) {
    cmdType = 'angle';
    angle = parseFloat(angleMatch[2]);
  } else if (cmd.includes('QS_ZERO') || cmd.includes('WQ_ZERO')) {
    cmdType = 'zero';
  } else if (cmd.includes('QS_HM') || cmd.includes('WQ_HM')) {
    cmdType = 'hm';
  } else {
    cmdType = 'other';
  }
  return {
    kind: 'control',
    mode,
    relayBits: relayBits.trim(),
    cmdType,
    angle,
    raw,
  };
}

function updateTargets(state, parsed) {
  const decoded = decodeRelay(parsed.relayBits);
  state.relayBits = decoded.value;
  state.selectedWheels = decoded.wheels;
  state.mode = decoded.mode || parsed.mode || state.mode;
  state.lastCommandMode = state.mode;
  state.lastCommandType = parsed.cmdType;
  state.moving = false;
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
    state.ackDelayTicks = Math.floor(Math.random() * 6);
  } else if (parsed.cmdType === 'zero' && state.mode) {
    state.speedFactor = 0.1;
    const keys = state.mode === 'QS'
      ? ['qzq', 'qyq', 'qzh', 'qyh']
      : ['wzq', 'wyq', 'wzh', 'wyh'];
    keys.forEach(k => {
      state.targets[k] = 0;
    });
    state.moving = true;
    state.ackPending = state.mode + '_ZEROOK';
    state.ackDelayTicks = Math.floor(Math.random() * 8);
  } else if (parsed.cmdType === 'hm' && state.mode) {
    state.speedFactor = 0.06;
    state.moving = true;
    state.ackPending = state.mode + '_HMOK';
    state.ackDelayTicks = Math.floor(Math.random() * 10);
  } else {
    state.moving = false;
    state.ackPending = null;
  }
}

function stepValue(current, target) {
  const diff = target - current;
  if (Math.abs(diff) < 0.001) return target;
  return current + diff;
}

function jitter(value) {
  const noise = (Math.random() - 0.5) * 0.02;
  const next = value + noise;
  return Math.round(next * 1000) / 1000;
}

function tickState(state) {
  if (!state.mode) {
    state.statusrc = 0;
    return;
  }
  if (!state.moving) {
    state.statusrc = 0;
    if (state.sensorFaultTicks > 0) {
      state.sensorFaultTicks -= 1;
    } else if (Math.random() < 0.02) {
      state.sensorFaultTicks = 20 + Math.floor(Math.random() * 20);
    }
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
    const nextStep = stepValue(current, target);
    const stepSize = (nextStep - current) * state.speedFactor;
    const next = current + stepSize;
    const distance = Math.abs(next - target);
    if (distance <= 0.005) {
      state.measurements[k] = target;
    } else {
      state.measurements[k] = jitter(next);
      anyMoving = true;
    }
  });
  state.statusrc = anyMoving ? 1 : 0;
  if (!anyMoving && state.sensorFaultTicks > 0 && Math.random() < 0.3) {
    state.statusrc = 1;
  }
  state.moving = anyMoving;
}

function buildFrame(state, withSensorOk, extra) {
  const m = state.measurements;
  const status = state.statusrc;
  const prefix = ',0,0,0,0 </2;0;0;1;0;33;0;0;0;32000;0;0;/> _';
  let frame =
    prefix +
    'ST_status' +
    String(status) +
    'qzq' +
    m.qzq.toFixed(2) +
    'qyq' +
    m.qyq.toFixed(2) +
    'qzh' +
    m.qzh.toFixed(2) +
    'qyh' +
    m.qyh.toFixed(2) +
    'wzq' +
    m.wzq.toFixed(2) +
    'wyq' +
    m.wyq.toFixed(2) +
    'wzh' +
    m.wzh.toFixed(2) +
    'wyh' +
    m.wyh.toFixed(2) +
    'ND';
  if (extra) {
    frame += extra;
  }
  return frame;
}

function handleConnection(socket) {
  socket.setEncoding('ascii');
  const state = createInitialState();
  const timer = setInterval(() => {
    tickState(state);
    if (state.heartbeatDelayTicks > 0) {
      state.heartbeatDelayTicks -= 1;
      if (state.heartbeatDelayTicks === 0 && state.pendingHeartbeat && state.linkDropTicks === 0) {
        socket.write(state.pendingHeartbeat);
        state.pendingHeartbeat = null;
      }
    }
    if (state.linkDropTicks > 0) {
      state.linkDropTicks -= 1;
      return;
    }
    if (Math.random() < 0.02) {
      state.linkDropTicks = 15 + Math.floor(Math.random() * 25);
      return;
    }
    state.frameCounter += 1;
    const forceSensorError = state.frameCounter % 10 === 0;
    const withSensorOk = !forceSensorError && state.sensorFaultTicks === 0;
    let extra = null;
    if (!state.moving && state.ackPending) {
      if (state.ackDelayTicks > 0) {
        state.ackDelayTicks -= 1;
      } else if (Math.random() < 0.95) {
        extra = state.ackPending;
        state.ackPending = null;
      } else {
        state.ackPending = null;
      }
    }
    const frame = buildFrame(state, withSensorOk, extra);
    socket.write(frame);
  }, 200);
  socket.on('data', chunk => {
    const trimmed = chunk.toString('ascii').trim();
    if (!trimmed) return;
    const parsed = parseCommand(trimmed);
    if (!parsed) return;
    if (parsed.kind === 'heartbeat') {
      if (state.linkDropTicks > 0) return;
      const frame = buildFrame(state, true, null);
      if (Math.random() < 0.3) {
        state.heartbeatDelayTicks = 5 + Math.floor(Math.random() * 15);
        state.pendingHeartbeat = frame;
        return;
      }
      socket.write(frame);
    } else if (parsed.kind === 'control') {
      updateTargets(state, parsed);
    }
  });
  socket.on('close', () => {
    clearInterval(timer);
  });
  socket.on('error', () => {
    clearInterval(timer);
  });
}

function startServer(port) {
  const server = net.createServer(handleConnection);
  server.listen(port, '0.0.0.0', () => {
    const addr = server.address();
    if (addr && typeof addr === 'object') {
      process.stdout.write('Mock TCP controller listening on ' + addr.address + ':' + addr.port + '\n');
    }
  });
}

const port = process.env.MOCK_TCP_PORT ? parseInt(process.env.MOCK_TCP_PORT, 10) : 10001;
startServer(port);
