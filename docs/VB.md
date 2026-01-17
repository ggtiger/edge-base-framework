# Form1 逻辑说明（VB WinForms 校准程序）

> 维度：**按钮控制维度** + **通信维度（协议与状态机）**

## 一、整体概览

- 形式：WinForms 单窗体 `Form1`，通过 TCP 与下位机（控制器）进行交互。
- 通信：
  - 使用 `SocketSend : Socket` 连接 `127.0.0.1:10001`。
  - 独立接收线程 `Receive(SocketSend)`。
  - 定时器：
    - `Timerheart`：心跳（发送 `S1F1`）。
    - `Timer1`：根据 UI 选择组合继电器位，拼接命令内容。
    - `Timersned`：周期性发送当前命令 `CMDSend.Text`。
- 核心状态变量：
  - `connectrc`：是否已连接（1 已连 / 0 未连）。
  - `qsselect1` / `wqselect1`：当前测量模式，**前束 QS** / **外倾 WQ**。
  - `qzqbtrc`, `qyqbtrc`, `qzhbtrc`, `qyhbtrc`：四个轮位是否参与本次动作（左前 / 右前 / 左后 / 右后）。
  - `qlinkqrc`, `qlinkhrc`：前桥/后桥联动选择。
  - `LEFT_Qrc`, `RIGHT_Qrc`：左右车架选择（用于手动模式）。
  - `qsetrc`：参数 A1–A6 是否已「锁定」。
  - `steprc`：当前步骤序号（0–6），对应 A1–A6。
  - `pls`：当前「附加命令片段」，例如 `"QS:Angle1.23"`。
- 角度数据：
  - 实时值（来自控制器）：
    - 前束：`qzq, qyq, qzh, qyh`
    - 外倾：`wzq, wyq, wzh, wyh`
  - 目标设定：`QA1`–`QA6`（步进程序的 6 个目标值）。
- 日志：
  - `ListLog` 用于文本日志；`ProgressBar1` 计数显示行数。

---

## 二、按钮控制维度

下面按功能块列出所有主要按钮及其作用。

### 1. 连接与窗体控制

#### 1.1 打开连接（Button_Open_Click）

```vb
Public Function Button_Open_Click(sender As Object, e As EventArgs) As Integer
    Timerheart.Enabled = False
    ip = IPAddress.Parse("127.0.0.1")
    ipPort = New IPEndPoint(ip, "10001")
    SocketSend.Connect(ipPort)
    ShowMsg("成功连接到服务端")
    connectrc = 1
    ' 启动接收线程
    Dim th As New Thread(AddressOf Receive)
    ...
End Function
```

- 建立 TCP 连接。
- `connectrc = 1` 标记连接成功。
- 启动后台接收线程 `Receive(SocketSend)`。
- 失败时弹框、隐藏当前窗体，`connectrc = 0`。

#### 1.2 关闭连接（Button_Close.Click）

```vb
Private Sub Button_Close_Click(...) Handles Button_Close.Click
    Timerheart.Enabled = False
    SocketSend.Close()
    owner.Close()
    Me.Close()
End Sub
```

- 停止心跳，关闭 socket。
- 关闭主窗体 `owner` 和当前 `Form1`。

#### 1.3 从主窗体启动 / 暂存（startTest, tempTest）

```vb
Public Sub startTest(Form As main)
    owner = Form
    owner.TopMost = False
    owner.Hide()
    ' 发送当前 CMDSend.Text
End Sub

Public Sub tempTest(Form As main)
    owner = Form
    owner.TopMost = False
    owner.Hide()
End Sub
```

- 从外部主窗体 `main` 打开当前 Form 时使用。
- 负责切换前后台窗体，并在 `startTest` 时发一次当前命令。

#### 1.4 返回主界面 / 帮助

- `Button7.Click`：`Me.Hide()`，`owner.Show()`，返回主界面。
- `Button8.Click`：新建 `Help` 窗体并显示。

---

### 2. 模式切换 & 轮位选择

#### 2.1 测量模式选择：前束 / 外倾

```vb
Private Sub qsselect_Click(...) Handles qsselect.Click
    If qsselect1 = 0 Then
        qsselect1 = 1
        qsselect.BackColor = Color.Lime
        wqselect1 = 0
        wqselect.BackColor = SystemColors.MenuHighlight

        ' 当前模式为 QS => 前束数据使用白底
        wzq.BackColor = SystemColors.WindowText
        wyq.BackColor = SystemColors.WindowText
        wzh.BackColor = SystemColors.WindowText
        wyh.BackColor = SystemColors.WindowText

        qzq.BackColor = SystemColors.Window
        qyq.BackColor = SystemColors.Window
        qzh.BackColor = SystemColors.Window
        qyh.BackColor = SystemColors.Window
    Else
        qsselect1 = 0
        qsselect.BackColor = SystemColors.MenuHighlight
    End If
End Sub
```

```vb
Private Sub wqselect_Click(...) Handles wqselect.Click
    If wqselect1 = 0 Then
        wqselect1 = 1
        wqselect.BackColor = Color.Lime
        qsselect1 = 0
        qsselect.BackColor = SystemColors.MenuHighlight

        ' 当前模式为 WQ => 外倾数据使用白底
        wzq.BackColor = SystemColors.Window
        wyq.BackColor = SystemColors.Window
        wzh.BackColor = SystemColors.Window
        wyh.BackColor = SystemColors.Window

        qzq.BackColor = SystemColors.WindowText
        qyq.BackColor = SystemColors.WindowText
        qzh.BackColor = SystemColors.WindowText
        qyh.BackColor = SystemColors.WindowText
    Else
        wqselect1 = 0
        wqselect.BackColor = SystemColors.MenuHighlight
    End If
End Sub
```

- `qsselect1` 和 `wqselect1` 是互斥的。
- 同时通过控件背景色突出当前模式对应的角度。

#### 2.2 单轮选择按钮

- `qzqbt.Click` → 控制左前轮参与与否：

  ```vb
  If qzqbtrc = 0 Then
      qzqbtrc = 1
      qzqbt.BackColor = Color.Lime
  Else
      qzqbtrc = 0
      qzqbt.BackColor = SystemColors.MenuHighlight
  End If
  ```

- `qyqbt.Click` / `qzhbt.Click` / `qyhbt.Click` 类似：
  - 控制右前、左后、右后参与标记 `qyqbtrc`, `qzhbtrc`, `qyhbtrc`。
  - 同时用按钮背景色显示当前选择状态。

#### 2.3 前后桥联动选择

- `qlinkq.Click`（前桥联动）：

  - 若未联动：
    - `qlinkqrc = 1`。
    - 同时设置 `qzqbtrc = 1`, `qyqbtrc = 1`。
    - 三个按钮背景变 Lime。
  - 若已联动：
    - 将上述标志置 0，背景恢复为 `MenuHighlight`。

- `qlinkh.Click`（后桥联动）：

  - 类似控制 `qzhbtrc`, `qyhbtrc` 与 `qlinkhrc`。

#### 2.4 左右车架选择（用于手动）

- 逻辑在 `Timer1_Tick` 中用 `LEFT_Qrc`, `RIGHT_Qrc` 来决定继电器编码。
- 相应的按钮 `LEFT_Q` / `RIGHT_Q` 的 Click 事件在当前文件中为空实现（可能在 Designer 或其他文件中绑定）。

---

### 3. 参数设置（A1–A6）

#### 3.1 A1–A6 文本框

- 在 `Form1_Load` 中全部设为 `ReadOnly = True`，配合屏幕数字键盘输入。
- 对应的 `QA1_TextChanged` ~ `QA6_TextChanged`：

  ```vb
  If IsDecimal(QA1.Text) Then
      ' 合法数字，允许
  Else
      MessageBox.Show(QA1.Text & "无效输入！")
      QA1.Text = ""
  End If
  ```

- `IsDecimal` 自定义函数允许 `-` 和一个小数点，其余必须为数字。

#### 3.2 参数锁定 / 解锁（qset）

```vb
Private Sub Button23_Click(...) Handles qset.Click
    ' 统一格式化 A1–A6，保留两位小数
    QA1.Text = Format(Val(QA1.Text), "0.00")
    ...
    QA6.Text = Format(Val(QA6.Text), "0.00")

    ' 前置条件：A1–A6 非空、已连接、至少选择一种测量方式
    If QA1.Text <> "" AndAlso ... AndAlso (connectrc = 1) AndAlso (qsselect1 = 1 Or wqselect1 = 1) Then

        ' 检查所有 A1–A6 在 [-90, 90] 之间，并至少选中一个轮位
        If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzqbtrc) AndAlso
           所有 QA1..QA6 ∈ [-90, 90] Then

            If qsetrc = 0 Then
                ' 初次设置 -> 锁定参数
                qsetrc = 1
                禁用：前/后联动按钮、各轮位按钮、A1–A6 文本框
            Else
                ' 再次点击 -> 解除锁定
                qsetrc = 0
                启用上述所有控件
            End If
        Else
            MessageBox.Show("请至少选中轮子和方向,设置角度在-90度--90度！！")
        End If
    Else
        MessageBox.Show("请确保系统已连接且输入A1-A6角度值/且选中测量方式！！！")
    End If
End Sub
```

- `qsetrc = 1` 表示参数锁定后才能开始自动程序。
- 锁定后不可再更改选中的轮位及各 A 值。

---

### 4. 自动步骤控制（startqz / startrv + s1–s6）

#### 4.1 正向步骤启动（startqz）

```vb
Private Sub Button15_Click(...) Handles startqz.Click
    If connectrc = 1 Then
        If qsetrc = 1 Then
            Select Case steprc
                Case 0
                    steprc = 1
                    s1.BackColor = Color.Red
                    startqz.Enabled = False
                    ' 根据当前模式拼接命令
                    If qsselect1 = 1 And wqselect1 = 0 Then
                        pls = "QS:Angle" & QA1.Text
                    ElseIf qsselect1 = 0 And wqselect1 = 1 Then
                        pls = "WQ:Angle" & QA1.Text
                    End If
                    Timersned.Enabled = True
                Case 1
                    steprc = 2
                    s2.BackColor = Color.Red
                    ...
                ...
                Case 5
                    steprc = 6
                    s6.BackColor = Color.Red
                    ...
            End Select
        Else
            MessageBox.Show("请先设置参数！！再进行启动")
        End If
    Else
        MessageBox.Show("请先连接系统！！再进行启动")
    End If
End Sub
```

- 每次点击根据当前 `steprc` 进入下一步：
  - 置当前步对应的 `sX` 背景为红色（正在执行）。
  - 禁用 `startqz` 按钮避免重复触发。
  - 设置 `pls = "QS:Angle" + 当前步 A 值` 或对应的 WQ。
  - 打开 `Timersned`，开始周期发送命令。

#### 4.2 反向步骤启动（startrv）

```vb
Private Sub Button14_Click(...) Handles startrv.Click
    If connectrc = 1 AndAlso qsetrc = 1 Then
        Select Case steprc
            Case 1
                steprc = 0
                s1.BackColor = Color.Red
                startrv.Enabled = False
                ' 回到 A1
                ...
            Case 2
                steprc = 1
                s2.BackColor = Color.Red
                ...
            ...
        End Select
    ...
End Sub
```

- 逻辑类似，但用于「倒序」执行步骤（即回退调整）。

#### 4.3 步进控制按钮（下一步 / 上一步）

- `Button16_Click`（下一步）：
  - 若 `steprc < 6 And qsetrc = 1`，则 `steprc += 1`。
- `Button17_Click`（上一步）：
  - 若 `steprc > 1 And qsetrc = 1`，则 `steprc -= 1`。
- 在 `Receive` 中，当检测到当前步完成时，会启用这两个按钮，否则会被禁用。

#### 4.4 状态显示框 s1–s6

- 点击事件为空，主要作为状态灯：
  - 在 `startqz` / `startrv` 中置为红色（正在执行）。
  - 在 `Receive` 中，当实时角度与当前目标 A 值相符且 `statusrc = 0`（非 busy）时，置为绿色 `Color.Lime`，并重新启用启动按钮。

---

### 5. 手动控制按钮

#### 5.1 单角度发送（Button2 / Button5）

```vb
Private Sub Button2_Click(...) Handles Button2.Click
    If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And
       (LEFT_Qrc Or RIGHT_Qrc) And
       (Convert.ToDouble(TextBox1.Text) >= -90) And
       (qsselect1 = 1) Then

        pls = "QS:Angle" & TextBox1.Text
        Timersned.Enabled = True
    Else
        ShowMsg("输入错误")
    End If
End Sub
```

```vb
Private Sub Button5_Click(...) Handles Button5.Click
    If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And
       (LEFT_Qrc Or RIGHT_Qrc) And
       (Convert.ToDouble(TextBox2.Text) >= -90) And
       (wqselect1 = 1) Then

        pls = "WQ:Angle" & TextBox2.Text
        Timersned.Enabled = True
    Else
        ShowMsg("输入错误")
    End If
End Sub
```

- 不走 A1–A6 预设，只用 `TextBox1/2` 直接发指定角度。

#### 5.2 回零与复位

- `Button18_Click`（Angle0）：

  ```vb
  If qsselect1 = 1 And wqselect1 = 0 Then
      pls = "QS:Angle0"
      Timersned.Enabled = True
  End If
  If qsselect1 = 0 And wqselect1 = 1 Then
      pls = "WQ:Angle0"
      Timersned.Enabled = True
  End If
  ```

- `Button19_Click`（Zero / Home）：

  ```vb
  If qsselect1 = 1 And wqselect1 = 0 Then
      pls = "QS_ZERO"
      Timersned.Enabled = True
  End If
  If qsselect1 = 0 And wqselect1 = 1 Then
      pls = "WQ_ZERO"
      Timersned.Enabled = True
  End If
  ```

#### 5.3 重置参数 / 状态

- `Button3_Click` / `Button4_Click`：
  - 停止发送 `Timersned.Enabled = False`。
  - 启用 `startqz`, `startrv`。
  - 清空 A1–A6，恢复 s1–s6 和各按钮、文本框的可编辑状态。
  - 将 `steprc` 设回 0。

---

### 6. 按钮输入与状态校验总览（来自 Form1.vb）

结合 `temp/Form1.vb`，所有关键按钮在点击前都会进行显式条件校验，核心逻辑可以归纳如下：

- **参数锁定按钮 qset（Button23）**
  - 前置条件：
    - `QA1`–`QA6` 字段全部非空。
    - 已建立连接：`connectrc = 1`。
    - 至少选择了一种测量模式：`qsselect1 = 1 Or wqselect1 = 1`。
  - 数值校验：
    - 至少选择了一个轮位：`qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc`。
    - 所有 `QA1`–`QA6` 转成 `Double` 后都在 `[-90, 90]` 范围内。
  - 不满足时：
    - 若轮位/角度范围不合法：弹出 `"请至少选中轮子和方向,设置角度在-90度--90度！！"`。
    - 若未连接或模式/角度未选齐：弹出 `"请确保系统已连接且输入A1-A6角度值/且选中测量方式！！！"`。

- **自动步骤启动按钮 startqz（Button15）/ startrv（Button14）**
  - 前置条件：
    - 必须已连接：`connectrc = 1`，否则弹 `"请先连接系统！！再进行启动"`。
    - 必须已参数锁定：`qsetrc = 1`，否则弹 `"请先设置参数！！再进行启动"`。
  - 满足条件后才会根据当前 `steprc` 选择对应 `QA?` 生成 `pls = "QS:Angle..."` 或 `pls = "WQ:Angle..."`，并开启 `Timersned`。

- **自由测量按钮 Button2（前束）/ Button5（外倾）**
  - 前置条件（两者结构相同）：
    - 至少有一个轮位参与：`qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc`。
    - 左/右车架至少选中一个：`LEFT_Qrc Or RIGHT_Qrc`。
    - 文本框数值转换为 `Double` 后不小于 `-90`。
    - 对应模式已选中：`qsselect1 = 1`（前束）或 `wqselect1 = 1`（外倾）。
  - 不满足条件时：
    - 不发送命令，调用 `ShowMsg("输入错误")` 写入日志。

- **Angle0 / ZERO 按钮（Button18 / Button19）**
  - 根据当前模式决定发送 `QS:Angle0` / `WQ:Angle0` 或 `QS_ZERO` / `WQ_ZERO`：
    - 当前为 QS：`qsselect1 = 1 And wqselect1 = 0`。
    - 当前为 WQ：`qsselect1 = 0 And wqselect1 = 1`。
  - 模式未选中时按钮点击不会生效（不设置 `pls`，也不启用 `Timersned`）。

- **下一步 / 上一步 按钮（Button16 / Button17）**
  - 共同前置条件：只有在参数已锁定时才允许操作：`qsetrc = 1`。
  - `Button16`（下一步）：
    - 条件：`steprc < 6 And qsetrc = 1`，才执行 `steprc = steprc + 1`。
  - `Button17`（上一步）：
    - 条件：`steprc > 1 And qsetrc = 1`，才执行 `steprc = steprc - 1`。

- **A1–A6 文本框输入校验（QA1_TextChanged ~ QA6_TextChanged）**
  - 每个 `QA?` 文本变化时调用 `IsDecimal(QA?.Text)`：
    - 若返回 `True`：认为是合法数字（允许负号和一个小数点），不处理。
    - 若返回 `False`：弹框 `"<原文本>无效输入！"`，并清空当前文本框。

以上校验逻辑确保：只有在**连接状态正常、模式/轮位配置合理且角度输入合法**的前提下，关键按钮才会真正推动协议状态机前进或向控制器发送命令。

## 三、通信维度

### 1. TCP 连接与线程

- 打开连接时：

  - 创建 `SocketSend`，连接控制器。
  - 启动线程 `Receive(SocketSend)`，持续读取控制器发送的数据。

- 关闭连接时：

  - 停止心跳 `Timerheart`。
  - `SocketSend.Close()` 后关闭窗体。

### 2. 发送数据路径

#### 2.1 统一发送入口：Timersned_Tick

```vb
Private Sub Timersned_Tick(...) Handles Timersned.Tick
    Dim Gsz_bytes() As Byte =
        System.Text.Encoding.ASCII.GetBytes(CMDSend.Text)
    SocketSend.Send(Gsz_bytes)
    ShowMsg(datestr & CMDSend.Text)
    ...
End Sub
```

- 任何需要「持续发送」的命令都通过设置 `CMDSend.Text` + 打开 `Timersned` 来完成。
- 每次 Tick：
  - 将 `CMDSend.Text` 转成 ASCII 字节发送。
  - 写日志、更新进度条。

#### 2.2 心跳：Timerheart_Tick

```vb
Gsz_bytes = Encoding.ASCII.GetBytes("S1F1")
SocketSend.Send(Gsz_bytes)
ShowMsg(datestr & ":  S1F1")
Heart.BackColor = Color.Red
```

- 周期性发送 `"S1F1"`，并将心跳灯 `Heart` 置红。
- 当接收到正常数据后，在 `Receive` 中将 `Heart.BackColor` 置为绿色 `Lime`。

#### 2.3 继电器与角度命令的组合：Timer1_Tick

```vb
Private Sub Timer1_Tick(...) Handles Timer1.Tick
    relayrc = 0
    If qzqbtrc = 1 Then relayrc += 1
    If qyqbtrc = 1 Then relayrc += 2
    If qzhbtrc = 1 Then relayrc += 4
    If qyhbtrc = 1 Then relayrc += 8
    If qsselect1 = 1 Then relayrc += 16
    If wqselect1 = 1 Then relayrc += 32

    If qsselect1 = 1 Then
        CMDSend.Text = "QS:Relay" & Convert.ToString(relayrc, 2) & pls
    End If
    If wqselect1 = 1 Then
        CMDSend.Text = "WQ:Relay" & Convert.ToString(relayrc, 2) & pls
    End If
End Sub
```

- `relayrc` 是一个位标志：
  - bit0–3：四个轮位选中。
  - bit4：QS 模式。
  - bit5：WQ 模式。
- 通过 `Convert.ToString(relayrc, 2)` 转成二进制字符串。
- 最终命令格式形如：

  ```text
  QS:Relay<relayBits>QS:Angle1.23
  WQ:Relay<relayBits>WQ:Angle-0.50
  QS:Relay<relayBits>QS_ZERO
  ...
  ```

- `pls` 由各种按钮（startqz / startrv / Button2 / Button5 / Button18 / Button19）设定。

#### 2.4 零星一次性发送

- `Button1_Click` 和 `startTest` 直接使用当前 `CMDSend.Text` 发送一帧，不通过定时器。
- 用于快速发送任意命令（调试/外部触发）。

---

### 3. 接收与解析逻辑（Receive）

```vb
Sub Receive(SocketSend)
    Dim S As Socket = SocketSend
    While True
        Dim buffer(2 * 1024 * 1024) As Byte
        Dim length As Integer = S.Receive(buffer)
        Dim str As String = Encoding.UTF8.GetString(buffer)
        ...
    End While
End Sub
```

#### 3.1 传感器状态（SensorOK / SensorNG）

```vb
If InStr(str, "SensorNG") > 0 Then
    duizhong.BackColor = Color.Red
End If

If InStr(str, "SensorOK") > 0 Then
    duizhong.BackColor = Color.Lime
End If
```

- `duizhong` 控件颜色表示系统传感器自检是否通过。

#### 3.2 角度数据解析

- 报文格式大致类似：

  ```text
  ST_status<statusrc>qzq<值>qyq<值>qzh<值>qyh<值>wzq<值>wyq<值>wzh<值>wyh<值>ND
  ```

- 解析流程：

  - 通过 `InStr` 找到各字段关键字位置 `pos_qzq`、`pos_qyq` 等。
  - 通过前后关键字位置差值计算长度 `n`，使用 `Mid()` 取子串写入对应 TextBox。
  - 从 `"ST_status"` 后到 `qzq` 之间解析 `statusrc`：

    ```vb
    n = pos_qzq - pos1 - 9
    If n > 0 And IsNumeric(Mid(str, pos1 + 9, n)) Then
        statusrc = CInt(Mid(str, pos1 + 9, n))
    End If
    ```

- 数据有效性：必须存在 `"ST_status"` 和 `"ND"`，且 `"ND"` 在 `"ST_status"` 之后。

#### 3.3 状态灯与步进控制

- 根据 `statusrc`（类似 Busy/OK 状态）：

  ```vb
  If statusrc > 0 Then
      Button25.BackColor = Color.Red
      Button16.Enabled = False
      Button17.Enabled = False
  End If

  If statusrc = 0 Then
      Button25.BackColor = Color.Lime
      Button16.Enabled = True
      Button17.Enabled = True
  End If
  ```

- 步骤完成判定（以前束左前为例）：

  ```vb
  If (startqz.Enabled = False Or startrv.Enabled = False) And qzqbtrc = 1 Then
      Select Case steprc
          Case 1
              If statusrc = 0 And String.Equals(qzq.Text, QA1.Text, StringComparison.OrdinalIgnoreCase) Then
                  s1.BackColor = Color.Lime
                  startqz.Enabled = True
                  startrv.Enabled = True
              End If
          Case 2
              ' 对比 QA2，点亮 s2 ...
          ...
      End Select
  End If
  ```

- 对其他轮位 / 外倾角逻辑类似，只是换成对应的实时值 `qyq, qzh, qyh, wzq, wyq, wzh, wyh`。

#### 3.4 命令确认与重发停止

```vb
If InStr(str, "QSRECVOK") > 0 Or
   InStr(str, "QS_HMOK") > 0 Or
   InStr(str, "QS_ZEROOK") > 0 Or
   InStr(str, "WQ_ZEROOK") > 0 Or
   InStr(str, "WQ_HMOK") > 0 Or
   InStr(str, "WQRECVOK") > 0 Then

    Timersned.Enabled = False
End If
```

- 当控制器返回带有这些关键字的应答时，认为命令执行完成，停止重复发送。

#### 3.5 日志与心跳

- 每次接收完成后：

  - `Heart.BackColor = Color.Lime`（表明有数据从控制器返回）。
  - 调用 `ShowMsg(datestr & ":  " & str)`。
  - `line` 计数自增，超过 50 行则清空 `ListLog` 并重置计数器。

---

## 四、小结：从 VB 到新系统的映射建议

- **按钮控制维度** 可以抽象为：
  - 若干布尔状态（轮位选中、模式选中、参数锁定、当前步骤）；
  - 若干事件（连接、设置参数、启动正向/反向、手动角度、回零、归零、重置）。
- **通信维度** 则是：
  - 把上述 UI 状态编码成一个 `Relay` 位串和一个 `Angle / ZERO / Angle0` 指令片段；
  - 在定时器内拼接成完整的文本协议，周期发送；
  - 再通过接收线程解析文本报文，驱动 UI 状态机（步进、指示灯）。

如果你之后希望在 React/Electron 中完全复刻这套逻辑，可以按这两个维度分别实现：

- 用 React state/Context 管理按钮状态与步骤状态；
- 用一个统一的「命令构造器」负责根据 state 生成 `Relay + Command` 字符串，并通过当前 TCP/H5 通道发送；
- 用一个「报文解析器」把原 VB 的 `Receive` 逻辑迁移到 TypeScript。

如需要，我可以在下一步帮你把这份 VB 协议抽象成 TypeScript 的接口和状态机代码。
