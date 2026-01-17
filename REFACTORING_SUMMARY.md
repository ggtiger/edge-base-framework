# Calibration.tsx 重构总结

## 重构目标
将 925 行的 Calibration.tsx 组件中的业务逻辑抽象出来，提高代码的可维护性和可测试性。

## 重构成果

### 1. 创建的新文件

#### 工具函数层 (`src/renderer/utils/`)
- **calibrationProtocol.ts** (200+ 行)
  - 协议相关的纯函数
  - 类型定义 (Mode, WheelId, Measurements)
  - 命令构建逻辑 (buildCommand, computeRelayrc)
  - 数据解析逻辑 (parseInboundData)
  - 验证逻辑 (validateSetpoints)
  - 工具函数 (normalizeAngleText, toNumberOrNull, etc.)

#### 自定义 Hooks 层 (`src/renderer/hooks/`)
- **useTcpConnection.ts** (180+ 行)
  - TCP 连接状态管理
  - 自动重连逻辑
  - 心跳机制
  - 日志记录
  - 流量脉冲动画

- **useWheelSelection.ts** (50+ 行)
  - 车轮选择状态
  - 前后轮联动逻辑
  - 激活车轮管理

- **useCalibrationFlow.ts** (200+ 行)
  - 校准流程状态管理
  - 步骤控制 (前进/后退/跳过/停止)
  - 参数锁定逻辑
  - 测量值管理
  - 手动测量功能

#### 组件层 (`src/renderer/components/`)
- **HelpModal.tsx** (100+ 行)
  - 帮助模态框组件
  - 键盘导航支持
  - 幻灯片切换

### 2. 重构后的 Calibration.tsx

**从 925 行减少到 333 行** (减少 64%)

#### 代码结构
```tsx
// 清晰的依赖导入
import { useTcpConnection } from '../hooks/useTcpConnection';
import { useWheelSelection } from '../hooks/useWheelSelection';
import { useCalibrationFlow } from '../hooks/useCalibrationFlow';

const Calibration: React.FC<CalibrationProps> = ({ onBack, theme, onToggleTheme }) => {
  // 简洁的状态管理
  const tcp = useTcpConnection();
  const wheels = useWheelSelection();
  const flow = useCalibrationFlow(tcp.isTcpConnected, tcp.sendTcpCmd, ...);

  // 组件只关注 UI 渲染和事件处理
  return (
    <div>
      {/* 清晰的 UI 结构 */}
    </div>
  );
};
```

## 重构优势

### 1. 关注点分离
- **协议层**: 纯函数，易于测试
- **业务逻辑层**: 自定义 Hooks，可复用
- **UI 层**: 组件只负责渲染

### 2. 可测试性提升
```typescript
// 协议函数可以独立测试
test('buildCommand', () => {
  const cmd = buildCommand('QS', 'QS:Angle10.00', { FL: true, FR: false, RL: false, RR: false });
  expect(cmd).toBe('QS:Relay10001QS:Angle10.00');
});

// Hooks 可以使用 @testing-library/react-hooks 测试
test('useTcpConnection', () => {
  const { result } = renderHook(() => useTcpConnection());
  act(() => result.current.startTest({ ip: '127.0.0.1', port: 8080 }));
  expect(result.current.testRunning).toBe(true);
});
```

### 3. 可复用性
- `useTcpConnection` 可用于其他需要 TCP 连接的页面
- `calibrationProtocol.ts` 中的函数可在其他模块使用
- `HelpModal` 可在其他页面复用

### 4. 可维护性
- 每个文件职责单一，易于理解
- 修改协议逻辑只需改 `calibrationProtocol.ts`
- 修改 TCP 逻辑只需改 `useTcpConnection.ts`

### 5. 类型安全
```typescript
// 导出的类型可在整个应用中使用
export type Mode = 'QS' | 'WQ' | null;
export type WheelId = 'FL' | 'FR' | 'RL' | 'RR';
export type Measurements = { ... };
```

## 代码对比

### 重构前
```tsx
// 925 行的单一文件
// - 所有逻辑混在一起
// - 难以测试
// - 难以复用
// - 难以维护

const Calibration = () => {
  // 100+ 行的状态定义
  const [tcpStatus, setTcpStatus] = useState(...);
  const [measurements, setMeasurements] = useState(...);
  // ... 更多状态

  // 200+ 行的业务逻辑函数
  const parseInbound = (raw: string) => { /* 100+ 行 */ };
  const buildCommand = (...) => { /* ... */ };
  // ... 更多函数

  // 300+ 行的 useEffect
  useEffect(() => { /* TCP 监听 */ }, []);
  useEffect(() => { /* 重试逻辑 */ }, []);
  // ... 更多 effects

  // 300+ 行的 JSX
  return <div>...</div>;
};
```

### 重构后
```tsx
// 333 行的清晰组件
const Calibration = () => {
  // 3 行的业务逻辑引入
  const tcp = useTcpConnection();
  const wheels = useWheelSelection();
  const flow = useCalibrationFlow(...);

  // 少量的组件特定逻辑
  useEffect(() => { /* 时钟更新 */ }, []);
  useEffect(() => { /* 命令发送 */ }, [tcp, flow, wheels]);

  // 清晰的 JSX
  return <div>...</div>;
};
```

## 文件结构

```
src/renderer/
├── utils/
│   └── calibrationProtocol.ts    # 协议工具函数
├── hooks/
│   ├── useTcpConnection.ts       # TCP 连接管理
│   ├── useWheelSelection.ts      # 车轮选择
│   └── useCalibrationFlow.ts     # 校准流程
├── components/
│   ├── HelpModal.tsx             # 帮助模态框
│   ├── ConnectionModal.tsx       # 连接模态框 (已存在)
│   ├── LeftSidebar.tsx           # 左侧栏 (已存在)
│   ├── CenterDisplay.tsx         # 中央显示 (已存在)
│   └── RightSidebar.tsx          # 右侧栏 (已存在)
└── views/
    └── Calibration.tsx           # 主组件 (重构后)
```

## 后续优化建议

1. **添加单元测试**
   - 为 `calibrationProtocol.ts` 中的函数添加测试
   - 为自定义 Hooks 添加测试

2. **类型优化**
   - 完善 `useCalibrationFlow` 中的类型定义
   - 添加更严格的类型约束

3. **性能优化**
   - 使用 `useCallback` 优化回调函数
   - 使用 `useMemo` 优化计算值

4. **错误处理**
   - 添加错误边界
   - 完善错误提示

5. **文档完善**
   - 为每个 Hook 添加 JSDoc 注释
   - 添加使用示例
