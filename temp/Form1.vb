Imports System.Net.Sockets
Imports System.Net
Imports System.Text
Imports System.ComponentModel
Imports System.Threading
Imports System.Diagnostics


Public Class Form1
    Dim SocketSend As New Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp)
    Dim datestr As String = ""
    Dim ip As IPAddress
    Dim ipPort As IPEndPoint
    Dim line As Int32
    Dim connectrc As Integer
    Dim lastLogUpdateTime As DateTime = DateTime.Now
    Dim logUpdateInterval As Integer = 100
    Dim logBuffer As String = ""

    
    Dim receiveBuffer As String = ""
    Dim commandInProgress As Boolean = False
    Dim autoReconnectEnabled As Boolean = False
    Dim reconnectAttempts As Integer = 0
    Dim maxReconnectAttempts As Integer = 10
    Dim reconnectInterval As Integer = 3000
    Dim reconnectThread As Thread = Nothing

    Dim qzqbtrc As Integer
    Dim qsselect1 As Integer

    Dim wqselect1 As Integer
    Dim qyqbtrc As Integer
    Dim qzhbtrc As Integer
    Dim qyhbtrc As Integer
    Dim qlinkqrc As Integer
    Dim qlinkhrc As Integer
    Dim LEFT_Qrc As Integer
    Dim RIGHT_Qrc As Integer
    Dim relayrc As Integer
    Dim qsetrc As Integer
    Dim steprc As Integer
    Dim pls As String
    Dim statusrc As Integer



    Private Sub Form1_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        Me.MaximizeBox = False
        Me.MinimizeBox = True
        CheckForIllegalCrossThreadCalls = False

        Me.BackColor = System.Drawing.Color.FromArgb(20, 20, 30)
        Me.Text = "=== 无线控制步进电机上位机 ==="
        Me.Font = New Font("Consolas", 9.0!)
        Me.ForeColor = Color.White

        InitializeControlStyles()

        LEFT_Qrc = 1
        RIGHT_Qrc = 0
        qsselect.BackColor = System.Drawing.Color.DodgerBlue
        wqselect.BackColor = System.Drawing.Color.DodgerBlue
        
        autoReconnectEnabled = True
    End Sub

    Private Sub ResetAllControls()
    End Sub
    
    Private Sub InitializeControlStyles()
        

        Dim groupBoxes() As GroupBox = {GroupBox1, GroupBox2, GroupBox3, GroupBox4, GroupBox5, 手动}
        For Each gb In groupBoxes
            gb.Font = New Font("Consolas", 11.0!, FontStyle.Bold)
            gb.ForeColor = Color.White
            gb.BackColor = System.Drawing.Color.FromArgb(40, 40, 60)
            gb.FlatStyle = FlatStyle.Flat
            gb.Padding = New Padding(10)
            gb.Visible = True
        Next
        
        Dim allButtons() As Button = {Button_Open, Button_Close, qset, startqz, startrv, Button19, Button18, Button17, Button16, Button3, Button4, Button2, Button5, qzqbt, qyqbt, qzhbt, qyhbt, qlinkq, qlinkh, qsselect, wqselect, Button6, Button7, Button8, Button9, Button1, s1, s2, s3, s4, s5, s6, duizhong, duizhong1, duizhong2, duizhong3}
        For Each btn In allButtons
            btn.Font = New Font("微软雅黑", 10.0!, FontStyle.Bold)
            btn.FlatStyle = FlatStyle.Flat
            btn.FlatAppearance.BorderSize = 2
            btn.FlatAppearance.BorderColor = Color.Cyan
            btn.FlatAppearance.MouseOverBackColor = System.Drawing.Color.FromArgb(20, 80, 120)
            btn.FlatAppearance.MouseDownBackColor = System.Drawing.Color.FromArgb(0, 120, 200)
            btn.ForeColor = Color.White
            btn.BackColor = System.Drawing.Color.FromArgb(50, 50, 80)
            btn.Visible = True
        Next
        

        qsselect.BackColor = Color.DodgerBlue
        wqselect.BackColor = Color.DodgerBlue
        qzqbt.BackColor = Color.DodgerBlue
        qyqbt.BackColor = Color.DodgerBlue
        starthome.BackColor = Color.DodgerBlue
        starthome.ForeColor = Color.White
        starthome.FlatStyle = FlatStyle.Flat
        starthome.FlatAppearance.BorderSize = 2
        starthome.FlatAppearance.BorderColor = Color.Cyan
        
        Button_Open.Parent = GroupBox1
        Button_Close.Parent = GroupBox1
        Button1.Parent = GroupBox1

        TextBox1.Parent = 手动
        Button2.Parent = 手动
        
        TextBox2.Parent = GroupBox4
        Button5.Parent = GroupBox4
        
        qset.Parent = GroupBox3
        Button18.Parent = GroupBox3
        Button19.Parent = GroupBox3
        startqz.Parent = GroupBox3
        Button16.Parent = GroupBox3
        Button3.Parent = GroupBox3
        startrv.Parent = GroupBox3
        Button17.Parent = GroupBox3
        Button4.Parent = GroupBox3

        Dim allTextBoxes() As TextBox = {CMDSend, qzq, qyq, qzh, qyh, wzq, wyq, wzh, wyh, QA1, QA2, QA3, QA4, QA5, QA6, TextBox1, TextBox2, TextBox3, TextBox4, stepjog}
        For Each tb In allTextBoxes
            tb.Font = New Font("Consolas", 11.0!)
            tb.BorderStyle = BorderStyle.FixedSingle
            tb.BackColor = System.Drawing.Color.FromArgb(60, 60, 80)
            tb.ForeColor = Color.Lime
            tb.Padding = New Padding(5)
            tb.Visible = True
        Next
        
        Dim labels() As Label = {Label1, Label2, Label3, Label4, Label5, Label6, Label7, Label8, Label9, Label10, Label11, Label14, Label15, Label16, Label17}
        For Each lbl In labels
            lbl.Font = New Font("Consolas", 11.0!)
            lbl.ForeColor = Color.White
            lbl.Visible = True
        Next
        
        ProgressBar1.Style = ProgressBarStyle.Continuous
        ProgressBar1.BackColor = System.Drawing.Color.FromArgb(50, 50, 70)
        ProgressBar1.ForeColor = Color.Lime
        ProgressBar1.Parent = GroupBox2
        ProgressBar1.Maximum = 10

        
        Button25.Location = New System.Drawing.Point(6, 24)
        Button25.Size = New System.Drawing.Size(42, 29)
        Button25.Font = New Font("微软雅黑", 7.5!, FontStyle.Bold)

        Heart.Location = New System.Drawing.Point(54, 24)
        Heart.Size = New System.Drawing.Size(42, 29)
        Heart.Font = New Font("微软雅黑", 7.5!, FontStyle.Bold)

        ProgressBar1.Location = New System.Drawing.Point(102, 24)
        ProgressBar1.Size = New System.Drawing.Size(100, 29)


        duizhong.Location = New System.Drawing.Point(6, 65)
        duizhong.Size = New System.Drawing.Size(42, 29)
        duizhong.Font = New Font("微软雅黑", 7.5!, FontStyle.Bold)

        duizhong1.Location = New System.Drawing.Point(54, 65)
        duizhong1.Size = New System.Drawing.Size(42, 29)
        duizhong1.Font = New Font("微软雅黑", 7.5!, FontStyle.Bold)

        duizhong2.Location = New System.Drawing.Point(102, 65)
        duizhong2.Size = New System.Drawing.Size(42, 29)
        duizhong2.Font = New Font("微软雅黑", 7.5!, FontStyle.Bold)

        duizhong3.Location = New System.Drawing.Point(150, 65)
        duizhong3.Size = New System.Drawing.Size(42, 29)
        duizhong3.Font = New Font("微软雅黑", 7.5!, FontStyle.Bold)


        Button10.Location = New System.Drawing.Point(6, 106)
        Button10.Size = New System.Drawing.Size(42, 29)
        Button10.Font = New Font("微软雅黑", 7.5!, FontStyle.Bold)

        Button11.Location = New System.Drawing.Point(54, 106)
        Button11.Size = New System.Drawing.Size(42, 29)
        Button11.Font = New Font("微软雅黑", 7.5!, FontStyle.Bold)

        Button12.Location = New System.Drawing.Point(102, 106)
        Button12.Size = New System.Drawing.Size(42, 29)
        Button12.Font = New Font("微软雅黑", 7.5!, FontStyle.Bold)

        Button13.Location = New System.Drawing.Point(150, 106)
        Button13.Size = New System.Drawing.Size(42, 29)
        Button13.Font = New Font("微软雅黑", 7.5!, FontStyle.Bold)

        Heart.TextAlign = ContentAlignment.MiddleCenter
        Button25.TextAlign = ContentAlignment.MiddleCenter
        duizhong.TextAlign = ContentAlignment.MiddleCenter
        duizhong1.TextAlign = ContentAlignment.MiddleCenter
        duizhong2.TextAlign = ContentAlignment.MiddleCenter
        duizhong3.TextAlign = ContentAlignment.MiddleCenter
        
        ListLog.Font = New Font("Consolas", 10.0!)
        ListLog.BackColor = Color.Black
        ListLog.ForeColor = Color.Lime
        ListLog.BorderStyle = BorderStyle.FixedSingle
        ListLog.Multiline = True
        ListLog.ScrollBars = ScrollBars.Vertical
        ListLog.ReadOnly = True
        ListLog.Visible = True
    End Sub

    Private Sub Form1_FormClosing(sender As Object, e As FormClosingEventArgs) Handles MyBase.FormClosing
        DisconnectSocket()
        If NumericKeypadForm IsNot Nothing AndAlso Not NumericKeypadForm.IsDisposed Then
            NumericKeypadForm.Close()
        End If
    End Sub

    Protected Overrides Function ProcessCmdKey(ByRef msg As Message, keyData As Keys) As Boolean
        If keyData = Keys.Escape Then
            If NumericKeypadForm IsNot Nothing AndAlso Not NumericKeypadForm.IsDisposed AndAlso NumericKeypadForm.Visible Then
                UpdateUI(Sub()
                             isClosingKeypad = True

                             Try
                                 NumericKeypadForm.TopMost = False
                                 NumericKeypadForm.Close()
                                 NumericKeypadForm.Dispose()
                                 NumericKeypadForm = Nothing
                             Catch ex As Exception
                                 NumericKeypadForm = Nothing
                             End Try
                         End Sub)
                Return True
            End If
        ElseIf keyData = Keys.Enter Then
            ' 当数字键盘可见时，按Enter键相当于点击ENT按钮
            If NumericKeypadForm IsNot Nothing AndAlso Not NumericKeypadForm.IsDisposed AndAlso NumericKeypadForm.Visible Then
                UpdateUI(Sub()
                             ' 设置标志，防止数字键盘在关闭过程中被重新显示
                             isClosingKeypad = True

                             Try
                                 ' 确保在关闭前将TopMost设置为False，避免焦点问题
                                 NumericKeypadForm.TopMost = False
                                 NumericKeypadForm.Close()
                                 NumericKeypadForm.Dispose()
                                 NumericKeypadForm = Nothing
                             Catch ex As Exception
                                 ' 忽略可能的异常
                                 NumericKeypadForm = Nothing
                             End Try
                         End Sub)
                Return True
            End If
        End If
        Return MyBase.ProcessCmdKey(msg, keyData)
    End Function

    Private Sub UpdateUI(ByVal action As Action)
        Try
            If Not Me.IsDisposed AndAlso Me.IsHandleCreated Then
                If Me.InvokeRequired Then
                    Me.Invoke(action)
                Else
                    action()
                End If
            End If
        Catch ex As Exception
            ShowMsg("[调试] UI更新失败: " & ex.Message)
        End Try
    End Sub

    Private Sub UpdateHomingButtonColor(button As Button, status As Integer)
        If button Is Nothing Then
            Return
        End If

        Select Case status
            Case 0
                button.BackColor = Button.DefaultBackColor
                button.UseVisualStyleBackColor = True
                If button.Tag IsNot Nothing AndAlso TypeOf button.Tag Is System.Windows.Forms.Timer Then
                    Dim timer As System.Windows.Forms.Timer = DirectCast(button.Tag, System.Windows.Forms.Timer)
                    Try
                        timer.Stop()
                        timer.Dispose()
                        button.Tag = Nothing
                    Catch ex As Exception
                        ShowMsg("[调试] 停止定时器失败: " & ex.Message)
                        button.Tag = Nothing
                    End Try
                End If
            Case 1
                If button.Tag IsNot Nothing AndAlso TypeOf button.Tag Is System.Windows.Forms.Timer Then
                    Dim oldTimer As System.Windows.Forms.Timer = DirectCast(button.Tag, System.Windows.Forms.Timer)
                    Try
                        oldTimer.Stop()
                        oldTimer.Dispose()
                        button.Tag = Nothing
                    Catch ex As Exception
                        ShowMsg("[调试] 清理旧定时器失败: " & ex.Message)
                        button.Tag = Nothing
                    End Try
                End If
                
                Dim flashTimer As New System.Windows.Forms.Timer()
                flashTimer.Interval = 300

                AddHandler flashTimer.Tick, Sub(sender As Object, e As EventArgs)
                                                Try
                                                    If button.InvokeRequired Then
                                                        button.Invoke(Sub()
                                                                          If button.BackColor = Color.Yellow Then
                                                                              button.BackColor = Color.Lime
                                                                          Else
                                                                              button.BackColor = Color.Yellow
                                                                          End If
                                                                      End Sub)
                                                    Else
                                                        If button.BackColor = Color.Yellow Then
                                                            button.BackColor = Color.Lime
                                                        Else
                                                            button.BackColor = Color.Yellow
                                                        End If
                                                    End If
                                                Catch ex As Exception
                                                    ShowMsg("[调试] 闪烁定时器出错: " & ex.Message)
                                                    If sender IsNot Nothing AndAlso TypeOf sender Is System.Windows.Forms.Timer Then
                                                        Dim timer As System.Windows.Forms.Timer = DirectCast(sender, System.Windows.Forms.Timer)
                                                        timer.Stop()
                                                        timer.Dispose()
                                                        button.Tag = Nothing
                                                    End If
                                                End Try
                                            End Sub

                button.BackColor = Color.Yellow
                button.UseVisualStyleBackColor = False
                button.Tag = flashTimer
                flashTimer.Enabled = True
            Case 2
                button.BackColor = Color.Lime
                button.UseVisualStyleBackColor = False
                If button.Tag IsNot Nothing AndAlso TypeOf button.Tag Is System.Windows.Forms.Timer Then
                    Dim timer As System.Windows.Forms.Timer = DirectCast(button.Tag, System.Windows.Forms.Timer)
                    Try
                        timer.Stop()
                        timer.Dispose()
                        button.Tag = Nothing
                    Catch ex As Exception
                        ShowMsg("[调试] 停止定时器失败: " & ex.Message)
                        button.Tag = Nothing
                    End Try
                End If
            Case Else
                button.BackColor = Button.DefaultBackColor
                button.UseVisualStyleBackColor = True
        End Select
    End Sub

    ' 设置本地IP地址为192.168.4网段的函数
    Private Function SetLocalIP() As Boolean
        Try
            ShowMsg("正在设置WiFi接口IP地址为192.168.4网段...")

            ' 只尝试WiFi相关的接口名称（支持中英文）
            ' 不包含以太网和Ethernet，只针对WiFi接口
            Dim wifiInterfaces() As String = {"无线局域网", "WLAN", "Wi-Fi"}
            Dim success As Boolean = False
            
            ' 尝试使用不同的WiFi接口名称
            For Each interfaceName As String In wifiInterfaces
                Try
                    ' 使用netsh命令设置IP地址
                    Dim psi As New ProcessStartInfo()
                    psi.FileName = "cmd.exe"
                    psi.Arguments = "/c netsh interface ip set address """ & interfaceName & """ static 192.168.4.100 255.255.255.0"
                    psi.WindowStyle = ProcessWindowStyle.Hidden
                    psi.UseShellExecute = True
                    psi.Verb = "runas" ' 以管理员权限运行

                    Dim process As Process = Process.Start(psi)
                    process.WaitForExit() ' 等待命令执行完成

                    If process.ExitCode = 0 Then
                        ShowMsg("WiFi接口IP地址设置成功: 192.168.4.100 (使用接口: " & interfaceName & ")")
                        success = True
                        Exit For
                    End If
                Catch
                    ' 忽略单个接口的错误，尝试下一个
                End Try
            Next
            
            If Not success Then
                ShowMsg("WiFi接口IP设置失败，可能需要管理员权限或WiFi接口名称不正确")
                ShowMsg("请手动连接到XDESIN WiFi热点，密码: 88888888")
                ShowMsg("连接后系统将自动分配192.168.4.x网段的IP地址")
            End If
            
            Return success

        Catch ex As Exception
            ShowMsg("设置IP地址时发生错误: " & ex.Message)
            Return False
        End Try
    End Function

    ' 检查当前连接的WiFi是否为XDESIN
    Private Function CheckWiFiConnection() As Boolean
        Try
            ShowMsg("正在检查WiFi连接状态...")
            
            ' 使用netsh命令获取当前连接的WiFi名称
            Dim psi As New ProcessStartInfo()
            psi.FileName = "cmd.exe"
            psi.Arguments = "/c netsh wlan show interfaces | findstr /i ""SSID"""
            psi.WindowStyle = ProcessWindowStyle.Hidden
            psi.UseShellExecute = False
            psi.RedirectStandardOutput = True
            psi.RedirectStandardError = True

            Dim process As Process = Process.Start(psi)
            Dim output As String = process.StandardOutput.ReadToEnd()
            process.WaitForExit()
            
            ShowMsg("[调试] WiFi接口信息: " & output)
            
            ' 检查输出中是否包含XDESIN
            If output.Contains("XDESIN") OrElse output.Contains("xdesin") Then
                ShowMsg("已连接到XDESIN WiFi热点")
                Return True
            Else
                ShowMsg("未连接到XDESIN WiFi热点，请先手动连接")
                ShowMsg("WiFi名称: XDESIN，密码: 88888888")
                Return False
            End If
        Catch ex As Exception
            ShowMsg("检查WiFi连接时发生错误: " & ex.Message)
            ShowMsg("请手动确认是否已连接到XDESIN WiFi热点")
            Return False
        End Try
    End Function
    
    Private Sub Button_Open_Click(sender As Object, e As EventArgs) Handles Button_Open.Click
        Try
            ' 1. 首先检查是否已连接到XDESIN WiFi热点
            Dim isWiFiConnected As Boolean = CheckWiFiConnection()
            
            If Not isWiFiConnected Then
                ' 提示用户手动连接WiFi
                Dim result As DialogResult = MessageBox.Show(
                    "未检测到XDESIN WiFi连接，请先手动连接WiFi热点。\nWiFi名称: XDESIN\n密码: 88888888\n\n是否继续尝试连接？", 
                    "WiFi连接提示", 
                    MessageBoxButtons.YesNo, 
                    MessageBoxIcon.Warning)
                
                If result = DialogResult.No Then
                    Return
                End If
            End If
            
            ' 2. 连接前自动设置WiFi接口IP地址为同一网段
            Dim ipSetSuccess As Boolean = SetLocalIP()

            ' 等待IP设置生效
            Thread.Sleep(1000)

            ' 3. 尝试连接到服务器
            Dim connectSuccess As Boolean = False
            Dim connectAttempts As Integer = 0
            Dim maxConnectAttempts As Integer = 3
            
            While connectAttempts < maxConnectAttempts AndAlso Not connectSuccess
                Try
                    connectAttempts += 1
                    
                    ' 如果IP设置失败，提示用户正在尝试连接
                    If Not ipSetSuccess AndAlso connectAttempts = 1 Then
                        ShowMsg("WiFi IP设置失败，但仍尝试连接服务器...")
                    End If
                    
                    ' 确保使用正确的服务器IP和端口
                    ip = IPAddress.Parse("192.168.4.1")
                    ipPort = New IPEndPoint(ip, 10001)
                    
                    ' 创建新的Socket连接
                    If SocketSend.Connected Then
                        SocketSend.Close()
                    End If
                    SocketSend = New Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp)
                    
                    ' 设置连接超时
                    SocketSend.ReceiveTimeout = 8000 ' 增加超时时间到8秒
                    SocketSend.SendTimeout = 8000
                    
                    SocketSend.Connect(ipPort)
                    connectSuccess = True
                    ShowMsg("成功连接到服务器！")
                    ShowMsg("服务器地址: 192.168.4.1:10001")
                    connectrc = 1
                    
                    ' 创建接收线程
                    Dim th As New Thread(AddressOf Receive)
                    th.IsBackground = True
                    th.Start(SocketSend)
                    
                Catch connectEx As Exception
                    ShowMsg("连接服务器失败 (" & connectAttempts & "/" & maxConnectAttempts & "): " & connectEx.Message)
                    
                    If connectAttempts < maxConnectAttempts Then
                        ShowMsg("等待3秒后重试...")
                        Thread.Sleep(3000)
                    End If
                End Try
            End While
            
            If Not connectSuccess Then
                connectrc = 0
                MessageBox.Show(
                    "连接失败: 已超过最大重试次数\n\n请检查：\n1. 是否已连接到XDESIN WiFi热点\n2. WiFi密码是否正确（88888888）\n3. 下位机是否正常运行\n4. 防火墙是否阻止了连接", 
                    "连接错误", 
                    MessageBoxButtons.OK, 
                    MessageBoxIcon.Error)
                ' 清理资源
                If SocketSend.Connected Then
                    SocketSend.Close()
                End If
            End If
            
        Catch ex As Exception
            ShowMsg("连接过程中发生错误: " & ex.Message)
            MessageBox.Show("连接失败: " & ex.Message, "连接错误", MessageBoxButtons.OK, MessageBoxIcon.Error)
            connectrc = 0
            ' 清理资源
            If SocketSend.Connected Then
                SocketSend.Close()
            End If
        End Try
    End Sub
    Private Sub Button1_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Button1.Click
        Try
            Dim Gsz_bytes() As Byte
            Gsz_bytes = System.Text.Encoding.ASCII.GetBytes(CMDSend.Text)
            SocketSend.Send(Gsz_bytes)
            ShowMsg("命令已发送: " & CMDSend.Text)

        Catch ex As Exception
            MessageBox.Show("发送失败: " & ex.Message, "发送错误", MessageBoxButtons.OK, MessageBoxIcon.Error)
            ' 断开连接并重置状态
            DisconnectSocket()
        End Try

    End Sub

    '开
    Private Sub DisconnectSocket()
        Try
            If SocketSend.Connected Then
                SocketSend.Close()
            End If
            connectrc = 0
            commandInProgress = False
            ShowMsg("已与服务端断开连接")
            Heart.BackColor = System.Drawing.Color.Red

            ' 程
            If autoReconnectEnabled Then
                StartAutoReconnect()
            End If
        Catch ex As Exception
            ShowMsg("断开连接失败: " & ex.Message)
        End Try
    End Sub

    ' 启动自动重连线程
    Private Sub StartAutoReconnect()
        ' 如果重连线程已经在运行，不启动新线程
        If reconnectThread IsNot Nothing AndAlso reconnectThread.IsAlive Then
            Return
        End If

        ' 重置重连计数
        reconnectAttempts = 0

        ' 创建并启动重连线程
        reconnectThread = New Thread(AddressOf AutoReconnect)
        reconnectThread.IsBackground = True
        reconnectThread.Start()
    End Sub

    ' 自动重连方法
    Private Sub AutoReconnect()
        Try
            While reconnectAttempts < maxReconnectAttempts
                reconnectAttempts += 1
                ShowMsg("正在尝试重连 (" & reconnectAttempts & "/" & maxReconnectAttempts & ")...")

                Try
                    ' 创建新的Socket实例
                    SocketSend = New Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp)

                    ' 连接到服务器
                    SocketSend.Connect(ipPort)

                    ' 重连成功
                    ShowMsg("成功重新连接到服务端")
                    connectrc = 1

                    ' 重置所有状态变量
                    commandInProgress = False
                    receiveBuffer = ""

                    ' 发送状态同步请求
                    Try
                        Dim syncCommand As String = "SYNC_STATUS"
                        Dim commandBytes() As Byte = System.Text.Encoding.ASCII.GetBytes(syncCommand)
                        SocketSend.Send(commandBytes)
                        ShowMsg("已发送状态同步请求: " & syncCommand)
                    Catch ex As Exception
                        ShowMsg("发送状态同步请求失败: " & ex.Message)
                    End Try

                    ' 启动接收线程
                    Dim th As New Thread(AddressOf Receive)
                    th.IsBackground = True
                    th.Start(SocketSend)



                    ' 退出重连循环
                    Exit While

                Catch ex As Exception
                    ShowMsg("重连失败: " & ex.Message)

                    ' 等待一段时间后重试
                    Thread.Sleep(reconnectInterval)
                End Try
            End While

            ' 检查是否重连成功
            If reconnectAttempts >= maxReconnectAttempts Then
                ShowMsg("已达到最大重连次数，停止自动重连")
            End If
        Catch ex As Exception
            ShowMsg("自动重连线程异常: " & ex.Message)
        End Try
    End Sub

    Private Sub Button_Close_Click(sender As Object, e As EventArgs) Handles Button_Close.Click
        DisconnectSocket()
        Me.Close()
    End Sub
    '
    Private Function ExtractValue(ByVal source As String, ByVal tag As String, ByVal nextTag As String) As String
        Dim startPos As Integer = source.IndexOf(tag)
        If startPos = -1 Then Return ""

        ' 
        startPos += tag.Length

        
        Dim endPos As Integer
        If Not String.IsNullOrEmpty(nextTag) Then
            endPos = source.IndexOf(nextTag, startPos)
            If endPos = -1 Then
                ' 如果没有找到下一个标签，检查是否到了结束标记ND
                endPos = source.IndexOf("ND", startPos)
                If endPos = -1 Then
                    endPos = source.Length
                End If
            End If
        Else
            ' 
            endPos = source.IndexOf("ND", startPos)
            If endPos = -1 Then
                endPos = source.Length
            End If
        End If

        If endPos <= startPos Then Return ""

        Return source.Substring(startPos, endPos - startPos)
    End Function


    Private Sub CheckAngleStatus(ByVal currentAngle As String, ByVal targetAngle As String, ByVal status As Integer, ByVal stepIndex As Integer)
        Dim conditionMet As Boolean

        If status = 0 Then
            ' 
            conditionMet = (statusrc = 0 And String.Equals(currentAngle, targetAngle, StringComparison.OrdinalIgnoreCase))
        Else
            ' 
            conditionMet = String.Equals(currentAngle, targetAngle, StringComparison.OrdinalIgnoreCase)
        End If

        If conditionMet Then
            Dim index As Integer = stepIndex - 1
            If index >= 0 AndAlso index <= 5 Then
                UpdateUI(Sub()
                             Dim stepControls() As Control = {s1, s2, s3, s4, s5, s6}
                             stepControls(index).BackColor = System.Drawing.Color.Lime
                             startqz.Enabled = True
                             startrv.Enabled = True
                         End Sub)
            End If
        End If
    End Sub

    Private Sub Receive(ByVal SocketSend As Socket)
        Dim S As Socket = SocketSend
        Dim ip As String = S.RemoteEndPoint.ToString
        Dim receiveRetryCount As Integer = 0

        Try
            While True
                Try
                    Dim buffer(1024 * 1024 * 2) As Byte
                    Dim length As Integer

                    ' 设置接收超时，避免长时间阻塞
                    S.ReceiveTimeout = 5000 ' 5秒超时
                    length = S.Receive(buffer)

                    If length <= 0 Then
                        ShowMsg("与服务端的连接已断开")
                        Exit While
                    End If

                    ' 重置重试计数
                    receiveRetryCount = 0

                    Dim receivedStr As String = Encoding.ASCII.GetString(buffer, 0, length) ' 

                    ' 调试：输出原始数据
                    ShowMsg("[调试] 原始数据: " & receivedStr)

                    ' 将接收到的数据添加到缓冲区
                    receiveBuffer &= receivedStr

                    ' 调试：输出缓冲区状态
                    ShowMsg("[调试] 缓冲区状态: " & receiveBuffer)

                    ' 数据帧处理循环，确保处理所有完整的数据帧
                    While True
                        ' 
                        Dim stIndex As Integer = receiveBuffer.IndexOf("_ST_status")
                        Dim ndIndex As Integer = receiveBuffer.IndexOf("ND")

                        ' 调试：输出帧查找结果
                        ShowMsg("[调试] 帧查找 - ST_status位置: " & stIndex & ", ND位置: " & ndIndex)

                        ' 判定数据有效性
                        If stIndex >= 0 AndAlso ndIndex > stIndex Then
                            ' 提取完整的数据帧
                            Dim fullFrame As String = receiveBuffer.Substring(stIndex, ndIndex - stIndex + 2) ' +2 包含 "ND"

                            ' 更新缓冲区，移除已处理的完整帧
                            If ndIndex + 2 < receiveBuffer.Length Then
                                receiveBuffer = receiveBuffer.Substring(ndIndex + 2)
                            Else
                                receiveBuffer = ""
                            End If

                            ' 处理完整的数据帧
                            ProcessDataFrame(fullFrame)
                        Else
                            ' 没有完整的数据帧，跳出循环等待下一次接收
                            Exit While
                        End If
                    End While

                    ' 处理传感器状态和回原点状态（需要检查整个接收缓冲区）
                    Try
                        ' 先将当前缓冲区内容复制到临时变量，然后清空缓冲区
                        ' 这样在处理消息时收到的新消息不会被丢失
                        Dim tempBuffer As String = receiveBuffer
                        receiveBuffer = ""
                        
                        ' 按换行符分割消息，避免不同消息之间的干扰
                        Dim messages As String() = tempBuffer.Split({vbCrLf, vbLf, vbCr}, StringSplitOptions.RemoveEmptyEntries)

                        ' 处理所有消息
                        For Each msg As String In messages
                            '
                            If msg.Contains("SENSOR") Then
                                Try
                                    ' 
                                    Dim sensorParts As String() = msg.Split(",")
                                    If sensorParts.Length >= 5 Then
                                        ' 
                                        Dim sensor1 As Integer = 0 ' 
                                        Dim sensor2 As Integer = 0
                                        Dim sensor3 As Integer = 0
                                        Dim sensor4 As Integer = 0

                                        '
                                        If Integer.TryParse(sensorParts(1).Trim(), sensor1) Then
                                            If Integer.TryParse(sensorParts(2).Trim(), sensor2) Then
                                                If Integer.TryParse(sensorParts(3).Trim(), sensor3) Then
                                                    If Integer.TryParse(sensorParts(4).Trim(), sensor4) Then
                                                        ' 
                                                        UpdateUI(Sub()
                                                                     ' 
                                                                     duizhong.BackColor = If(sensor1 = 1, Color.Lime, duizhong.DefaultBackColor)
                                                                     duizhong.UseVisualStyleBackColor = (sensor1 <> 1)
                                                                     duizhong1.BackColor = If(sensor2 = 1, Color.Lime, duizhong1.DefaultBackColor)
                                                                     duizhong1.UseVisualStyleBackColor = (sensor2 <> 1)
                                                                     duizhong2.BackColor = If(sensor3 = 1, Color.Lime, duizhong2.DefaultBackColor)
                                                                     duizhong2.UseVisualStyleBackColor = (sensor3 <> 1)
                                                                     duizhong3.BackColor = If(sensor4 = 1, Color.Lime, duizhong3.DefaultBackColor)
                                                                     duizhong3.UseVisualStyleBackColor = (sensor4 <> 1)
                                                                 End Sub)
                                                    End If
                                                End If
                                            End If
                                        End If
                                    End If
                                Catch ex As Exception
                                    ShowMsg("[调试] 处理传感器消息失败: " & ex.Message)
                                End Try
                            End If

                            ' 
                            If msg.Contains("HOMING_STATUS") Then
                                Try
                                    ' 显示接收到的原始消息（用于调试）
                                    ShowMsg("[调试] 收到回原点状态消息: " & msg)
                                    
                                    ' 解析当前消息
                                    Dim homingParts As String() = msg.Split(",")
                                    ShowMsg("[调试] 消息分割结果: " & String.Join("|", homingParts))
                                    
                                    If homingParts.Length >= 5 Then
                                        
                                        Dim status1 As Integer = 0 ' 默认未动作（默认颜色）
                                        Dim status2 As Integer = 0
                                        Dim status3 As Integer = 0
                                        Dim status4 As Integer = 0

                                        
                                        If homingParts.Length > 1 Then
                                            ShowMsg("[调试] 电机0状态值: '" & homingParts(1).Trim() & "'")
                                            If Integer.TryParse(homingParts(1).Trim(), status1) Then
                                                ShowMsg("[调试] 解析成功，电机0状态: " & status1)
                                                ' 电机0状态
                                                UpdateUI(Sub()
                                                             UpdateHomingButtonColor(Button10, status1)
                                                         End Sub)
                                            Else
                                                ShowMsg("[调试] 解析失败，电机0状态值无效")
                                            End If
                                        End If

                                        ' 电机1状态
                                        If homingParts.Length > 2 Then
                                            ShowMsg("[调试] 电机1状态值: '" & homingParts(2).Trim() & "'")
                                            If Integer.TryParse(homingParts(2).Trim(), status2) Then
                                                ShowMsg("[调试] 解析成功，电机1状态: " & status2)
                                                ' 电机1状态
                                                UpdateUI(Sub()
                                                             UpdateHomingButtonColor(Button11, status2)
                                                         End Sub)
                                            Else
                                                ShowMsg("[调试] 解析失败，电机1状态值无效")
                                            End If
                                        End If

                                        ' 解析电机2
                                        If homingParts.Length > 3 Then
                                            ShowMsg("[调试] 电机2状态值: '" & homingParts(3).Trim() & "'")
                                            If Integer.TryParse(homingParts(3).Trim(), status3) Then
                                                ShowMsg("[调试] 解析成功，电机2状态: " & status3)
                                                ' 更新UI显示电
                                                UpdateUI(Sub()
                                                             UpdateHomingButtonColor(Button12, status3)
                                                         End Sub)
                                            Else
                                                ShowMsg("[调试] 解析失败，电机2状态值无效")
                                            End If
                                        End If

                                        ' 解3
                                        If homingParts.Length > 4 Then
                                            ShowMsg("[调试] 电机3状态值: '" & homingParts(4).Trim() & "'")
                                            If Integer.TryParse(homingParts(4).Trim(), status4) Then
                                                ShowMsg("[调试] 解析成功，电机3状态: " & status4)
                                                ' 更新UI显示电机3状态
                                                UpdateUI(Sub()
                                                             UpdateHomingButtonColor(Button13, status4)
                                                         End Sub)
                                            Else
                                                ShowMsg("[调试] 解析失败，电机3状态值无效")
                                            End If
                                        End If
                                    End If
                                Catch ex As Exception
                                    ShowMsg("[调试] 处理回原点消息失败: " & ex.Message)
                                End Try
                            End If
                            
                          
                            If msg.Contains("_HOMING_TIMEOUT") Then
                                Try
                                
                                    ShowMsg(datestr & ":  " & msg)
                                    
                                    ' 更新UI，停止所有回原点按钮的闪烁
                                    UpdateUI(Sub()
                                                 
                                                 UpdateHomingButtonColor(Button10, 0) ' 
                                                 UpdateHomingButtonColor(Button11, 0) ' 
                                                 UpdateHomingButtonColor(Button12, 0) ' 
                                                 UpdateHomingButtonColor(Button13, 0) '
                                                 
                                                
                                                 ShowMsg(datestr & ":  回原点过程已停止")
                                             End Sub)
                                Catch ex As Exception
                                    ShowMsg("[调试] 处理回原点超时消息失败: " & ex.Message)
                                End Try
                            End If
                        Next
                    Catch ex As Exception
                        ShowMsg("[调试] 消息处理失败: " & ex.Message)
                    Finally
                        ' 清理缓冲区，只保留未处理的消息（如果有的话）
                        receiveBuffer = ""
                    End Try



                
                    If receivedStr.Contains("QSRECVOK") OrElse receivedStr.Contains("QS_HMOK") OrElse receivedStr.Contains("QS_ZEROOK") OrElse receivedStr.Contains("WQ_ZEROOK") OrElse receivedStr.Contains("WQ_HMOK") OrElse receivedStr.Contains("WQRECVOK") Then
                        UpdateUI(Sub() Timersned.Enabled = False)
                        
                        commandInProgress = False
                        ShowMsg(datestr & ":  命令执行完成")
                    End If

                    ' 记录
                    datestr = Format(Now(), "yyyy/MM/dd H:mm:ss ffff")
                    ShowMsg(datestr & ":  " & receivedStr)
                    line = line + 1

                    ' 更新
                    UpdateUI(Sub()
                                 If Not ProgressBar1.IsDisposed Then
                                     ' 确保Value不超过Maximum
                                     ProgressBar1.Value = Math.Min(line, ProgressBar1.Maximum)
                                 End If
                             End Sub)

                    
                    If line >= ProgressBar1.Maximum Then
                        UpdateUI(Sub()
                                     If Not ListLog.IsDisposed AndAlso ListLog.IsHandleCreated Then
                                         ListLog.Text = ""
                                     End If
                                 End Sub)
                        line = 0
                    End If

                Catch receiveEx As Exception
                    receiveRetryCount += 1

                    ' 区分不同类型的异常
                    If TypeOf receiveEx Is SocketException Then
                        Dim sockEx As SocketException = DirectCast(receiveEx, SocketException)

                        
                        Select Case sockEx.SocketErrorCode
                            Case SocketError.TimedOut
                              

                                If receiveRetryCount Mod 5 = 0 Then ' 每5次超时显示一次信息
                                    ShowMsg("通信正常：等待下位机数据中 (" & receiveRetryCount & ")")
                                End If
                            Case SocketError.ConnectionReset
                                ShowMsg("连接被重置: " & sockEx.Message)
                                Exit While
                            Case SocketError.ConnectionAborted
                                ShowMsg("连接被中止: " & sockEx.Message)
                                Exit While
                            Case SocketError.NotConnected
                                ShowMsg("未连接: " & sockEx.Message)
                                Exit While
                            Case Else
                                ShowMsg("Socket异常 (" & receiveRetryCount & "/∞): " & sockEx.Message)
                        End Select
                    Else
                        ShowMsg("接收数据异常 (" & receiveRetryCount & "/∞): " & receiveEx.Message)
                    End If



                    If receiveRetryCount >= 1000 Then
                        ' 每1000次重试重置计数，避免计数器溢出
                        receiveRetryCount = 0
                    End If

                    ' 短暂等待后重试
                    Thread.Sleep(500) ' 增加等待时间到500ms
                End Try
            End While
        Catch ex As Exception
            ShowMsg("接收线程异常: " & ex.Message)
        Finally
            ' 确保UI线程安全地更新状态
            If Me.InvokeRequired Then
                Me.Invoke(Sub()
                              DisconnectSocket()
                          End Sub)
            Else
                DisconnectSocket()
            End If
        End Try
    End Sub

    ' 处理完整的数据帧
    Private Sub ProcessDataFrame(ByVal dataFrame As String)
        Try
            '提取各个角度值
            Dim qzqValue = ExtractValue(dataFrame, "qzq", "qyq")
            Dim qyqValue = ExtractValue(dataFrame, "qyq", "qzh")
            Dim qzhValue = ExtractValue(dataFrame, "qzh", "qyh")
            Dim qyhValue = ExtractValue(dataFrame, "qyh", "wzq")
            Dim wzqValue = ExtractValue(dataFrame, "wzq", "wyq")
            Dim wyqValue = ExtractValue(dataFrame, "wyq", "wzh")
            Dim wzhValue = ExtractValue(dataFrame, "wzh", "wyh")
            Dim wyhValue = ExtractValue(dataFrame, "wyh", "")

            '提取状态信息
            Dim statusStr As String = ExtractValue(dataFrame, "ST_status", "qzq")
            If IsNumeric(statusStr) Then
                statusrc = Convert.ToInt32(statusStr)
            End If

            '线程安全地更新UI
            UpdateUI(Sub()
                         qzq.Text = qzqValue
                         qyq.Text = qyqValue
                         qzh.Text = qzhValue
                         qyh.Text = qyhValue
                         wzq.Text = wzqValue
                         wyq.Text = wyqValue
                         wzh.Text = wzhValue
                         wyh.Text = wyhValue

                         If IsNumeric(statusStr) Then
                             If statusrc > 0 Then
                                 Button25.BackColor = System.Drawing.Color.Red
                                 Button16.Enabled = False
                                 Button17.Enabled = False
                             Else
                                 Button25.BackColor = System.Drawing.Color.Lime
                                 Button16.Enabled = True
                                 Button17.Enabled = True
                             End If
                         End If

                         Heart.BackColor = System.Drawing.Color.Lime
                     End Sub)

            
            If (startqz.Enabled = False Or startrv.Enabled = False) Then
                Dim targetAngles() As String = {QA1.Text, QA2.Text, QA3.Text, QA4.Text, QA5.Text, QA6.Text}
                Dim stepControls() As Control = {s1, s2, s3, s4, s5, s6}

                
                If qsselect1 = 1 Then
                    If qzqbtrc = 1 AndAlso steprc >= 1 AndAlso steprc <= targetAngles.Length Then
                        CheckAngleStatus(qzq.Text, targetAngles(steprc - 1), statusrc, steprc)
                    End If
                    If qyqbtrc = 1 AndAlso steprc >= 1 AndAlso steprc <= targetAngles.Length Then
                        CheckAngleStatus(qyq.Text, targetAngles(steprc - 1), 1, steprc) 
                    End If
                    If qzhbtrc = 1 AndAlso steprc >= 1 AndAlso steprc <= targetAngles.Length Then
                        CheckAngleStatus(qzh.Text, targetAngles(steprc - 1), statusrc, steprc)
                    End If
                    If qyhbtrc = 1 AndAlso steprc >= 1 AndAlso steprc <= targetAngles.Length Then
                        CheckAngleStatus(qyh.Text, targetAngles(steprc - 1), statusrc, steprc)
                    End If
                End If

                
                If wqselect1 = 1 Then
                    If qzqbtrc = 1 AndAlso steprc >= 1 AndAlso steprc <= targetAngles.Length Then
                        CheckAngleStatus(wzq.Text, targetAngles(steprc - 1), statusrc, steprc)
                    End If
                    If qyqbtrc = 1 AndAlso steprc >= 1 AndAlso steprc <= targetAngles.Length Then
                        CheckAngleStatus(wyq.Text, targetAngles(steprc - 1), 1, steprc) 
                    End If
                    If qzhbtrc = 1 AndAlso steprc >= 1 AndAlso steprc <= targetAngles.Length Then
                        CheckAngleStatus(wzh.Text, targetAngles(steprc - 1), statusrc, steprc)
                    End If
                    If qyhbtrc = 1 AndAlso steprc >= 1 AndAlso steprc <= targetAngles.Length Then
                        CheckAngleStatus(wyh.Text, targetAngles(steprc - 1), statusrc, steprc)
                    End If
                End If
            End If

            
            If (startqz.Enabled = False Or startrv.Enabled = False) And wqselect1 = 1 Then
                If (startqz.Enabled = False Or startrv.Enabled = False) And qyhbtrc = 1 Then
                    Select Case steprc
                        Case 1
                            If statusrc = 0 And String.Equals(wyh.Text, QA1.Text, StringComparison.OrdinalIgnoreCase) Then  
                                s1.BackColor = System.Drawing.Color.Lime
                                startqz.Enabled = True
                                startrv.Enabled = True
                            End If
                        Case 2
                            If statusrc = 0 And String.Equals(wyh.Text, QA2.Text, StringComparison.OrdinalIgnoreCase) Then  
                                s2.BackColor = System.Drawing.Color.Lime
                                startqz.Enabled = True
                                startrv.Enabled = True
                            End If
                        Case 3
                            If statusrc = 0 And String.Equals(wyh.Text, QA3.Text, StringComparison.OrdinalIgnoreCase) Then  
                                s3.BackColor = System.Drawing.Color.Lime
                                startqz.Enabled = True
                                startrv.Enabled = True
                            End If
                        Case 4
                            If statusrc = 0 And String.Equals(wyh.Text, QA4.Text, StringComparison.OrdinalIgnoreCase) Then  
                                s4.BackColor = System.Drawing.Color.Lime
                                startqz.Enabled = True
                                startrv.Enabled = True
                            End If
                        Case 5
                            If statusrc = 0 And String.Equals(wyh.Text, QA5.Text, StringComparison.OrdinalIgnoreCase) Then  
                                s5.BackColor = System.Drawing.Color.Lime
                                startqz.Enabled = True
                                startrv.Enabled = True
                            End If
                        Case 6
                            If statusrc = 0 And String.Equals(wyh.Text, QA6.Text, StringComparison.OrdinalIgnoreCase) Then  
                                s6.BackColor = System.Drawing.Color.Lime
                                startqz.Enabled = True
                                startrv.Enabled = True
                            End If
                    End Select
                End If
            End If

        Catch ex As Exception
            ShowMsg("处理数据帧异常: " & ex.Message)
        End Try
    End Sub


    '线程安全的消息显示函数
    Private Sub ShowMsg(ByVal message As String)
        Try
            ' 将消息添加到缓冲区
            logBuffer &= message & vbCrLf

            ' 检查是否需要更新UI
            Dim currentTime As DateTime = DateTime.Now
            If (currentTime - lastLogUpdateTime).TotalMilliseconds >= logUpdateInterval Then
                ' 先检查ListLog控件是否有效
                If Not ListLog.IsDisposed AndAlso ListLog.IsHandleCreated Then
                    If ListLog.InvokeRequired Then
                        ' 跨线程调用，使用委托更新UI
                        ListLog.Invoke(Sub()
                                           UpdateLogUI()
                                       End Sub)
                    Else
                        ' 同一线程，直接更新UI
                        UpdateLogUI()
                    End If
                End If
            End If
        Catch ex As Exception
            ' 记录错误但不关闭应用程序
            Debug.WriteLine("ShowMsg错误: " & ex.Message)
        End Try
    End Sub

    ' 更新日志UI的内部方法
    Private Sub UpdateLogUI()
        Try
            ' 先检查ListLog控件是否有效
            If Not ListLog.IsDisposed AndAlso ListLog.IsHandleCreated Then
                If Not String.IsNullOrEmpty(logBuffer) Then
                    ListLog.AppendText(logBuffer)
                    ListLog.SelectionStart = ListLog.Text.Length
                    ListLog.ScrollToCaret()

                    ' 清空缓冲区
                    logBuffer = ""

                    ' 更新最后更新时间
                    lastLogUpdateTime = DateTime.Now

                    ' 检查日志行数，超过限制则清空
                    If line > 10 Then
                        ListLog.Text = ""
                        line = 0
                    End If
                End If
            End If
        Catch ex As Exception
            Debug.WriteLine("UpdateLogUI错误: " & ex.Message)
        End Try
    End Sub

    ' 数字键盘功能实现

    ' 跟踪当前活动的文本框
    Private Sub TrackActiveTextBox(sender As Object, e As EventArgs) Handles QA1.GotFocus, QA2.GotFocus, QA3.GotFocus, QA4.GotFocus, QA5.GotFocus, QA6.GotFocus, TextBox1.GotFocus, TextBox2.GotFocus, TextBox3.GotFocus, TextBox4.GotFocus, stepjog.GotFocus
        currentActiveTextBox = DirectCast(sender, TextBox)
        
        If (NumericKeypadForm Is Nothing OrElse NumericKeypadForm.IsDisposed OrElse Not NumericKeypadForm.Visible) AndAlso Not isClosingKeypad Then
            ' 显示数字键盘
            ShowNumericKeypad()
        End If
    End Sub

    ' 显示数字键盘
    Private Sub ShowNumericKeypad()
        If currentActiveTextBox IsNot Nothing Then
            UpdateUI(Sub()
                         ' 只有在数字键盘不在关闭过程中时才允许显示
                         If Not isClosingKeypad Then
                             ' 在创建新实例前，确保彻底销毁旧实例
                             If NumericKeypadForm IsNot Nothing AndAlso Not NumericKeypadForm.IsDisposed Then
                                 Try
                                     NumericKeypadForm.Close()
                                     NumericKeypadForm.Dispose()
                                 Catch ex As Exception
                                     ' 忽略可能的异常
                                 Finally
                                     NumericKeypadForm = Nothing
                                 End Try
                             End If

                             ' 创建新的数字键盘实例
                             CreateNumericKeypad()

                             ' 计算数字键盘的位置，确保不会超出屏幕
                             Dim inputBoxScreenPoint As Point = currentActiveTextBox.PointToScreen(New Point(0, 0))
                             Dim screenPoint As Point

                             ' 优先显示在输入框下方
                             screenPoint = New Point(inputBoxScreenPoint.X, inputBoxScreenPoint.Y + currentActiveTextBox.Height)

                             ' 检查是否超出屏幕底部
                             If screenPoint.Y + NumericKeypadForm.Height > Screen.PrimaryScreen.WorkingArea.Height Then
                                 ' 如果超出底部，则显示在输入框上方
                                 screenPoint = New Point(inputBoxScreenPoint.X, inputBoxScreenPoint.Y - NumericKeypadForm.Height)
                             End If

                             ' 检查是否超出屏幕右侧
                             If screenPoint.X + NumericKeypadForm.Width > Screen.PrimaryScreen.WorkingArea.Width Then
                                 ' 如果超出右侧，则调整到屏幕右侧边缘
                                 screenPoint = New Point(Screen.PrimaryScreen.WorkingArea.Width - NumericKeypadForm.Width, screenPoint.Y)
                             End If

                             ' 确保不会超出屏幕左侧
                             If screenPoint.X < 0 Then
                                 screenPoint.X = 0
                             End If

                             ' 确保不会超出屏幕顶部
                             If screenPoint.Y < 0 Then
                                 screenPoint.Y = 0
                             End If

                             NumericKeypadForm.Location = screenPoint
                             NumericKeypadForm.Show()
                         End If
                     End Sub)
        End If
    End Sub

    ' 创建数字键盘表单
    Private Sub CreateNumericKeypad()
        NumericKeypadForm = New Form()
        With NumericKeypadForm
            .Text = "数字键盘"
            .Size = New Size(280, 500)  ' 进一步增大键盘高度，确保所有按钮都能显示
            .FormBorderStyle = FormBorderStyle.FixedToolWindow  ' 使用更简洁的边框样式
            .StartPosition = FormStartPosition.Manual
            .ShowInTaskbar = False
            .Font = New Font("微软雅黑", 14.0!, FontStyle.Bold)
            .ForeColor = Color.White  ' 白色文字提高对比度
            .BackColor = System.Drawing.Color.FromArgb(25, 25, 45)  ' 更深的背景色，与主界面一致
            .TopMost = True  ' 设置为最顶层窗口，避免被主表单覆盖
            .ControlBox = True  ' 显示关闭按钮
            .MaximizeBox = False
            .MinimizeBox = False
        End With

        ' 创建数字键盘按钮
        Dim buttonSize As New Size(80, 65)  ' 增大按钮尺寸，确保文字显示完整
        Dim buttons As New List(Of Button)

        ' 使用统一的变量定义按钮布局
        Dim buttonSpacingX As Integer = 10
        Dim buttonSpacingY As Integer = 10
        Dim startX As Integer = 15  ' 调整起始位置，增加左侧边距
        Dim startY As Integer = 70
        Dim buttonAreaWidth As Integer = (buttonSize.Width * 3) + (buttonSpacingX * 2)
        Dim buttonAreaHeight As Integer = (buttonSize.Height * 4) + (buttonSpacingY * 3)

        ' 确保表单足够大以容纳所有按钮
        NumericKeypadForm.ClientSize = New Size(startX * 2 + buttonAreaWidth, startY + buttonAreaHeight + buttonSize.Height + buttonSpacingY + 60) ' 60用于底部确认按钮，增加空间

        ' 数字按钮1-9
        For i As Integer = 1 To 9
            Dim button As New Button()
            With button
                .Text = i.ToString()
                .Size = buttonSize
                
                ' 调整9号按钮的位置，避免与负号按钮冲突
                If i = 9 Then
                    .Location = New Point(startX + ((i - 2) Mod 3) * (buttonSize.Width + buttonSpacingX), startY + ((i - 1) \ 3) * (buttonSize.Height + buttonSpacingY))
                Else
                    .Location = New Point(startX + ((i - 1) Mod 3) * (buttonSize.Width + buttonSpacingX), startY + ((i - 1) \ 3) * (buttonSize.Height + buttonSpacingY))
                End If
                
                .Font = New Font("微软雅黑", 16.0!, FontStyle.Bold)  ' 增大字体
                .BackColor = System.Drawing.Color.FromArgb(50, 50, 80)  ' 深灰蓝色背景
                .ForeColor = Color.Cyan  ' 霓虹青色文字
                .FlatStyle = FlatStyle.Flat
                .FlatAppearance.BorderSize = 2
                .FlatAppearance.BorderColor = Color.Cyan  ' 霓虹青色边框
                .FlatAppearance.MouseOverBackColor = System.Drawing.Color.FromArgb(20, 80, 120)  ' 深蓝色悬停
                .FlatAppearance.MouseDownBackColor = System.Drawing.Color.FromArgb(0, 120, 200)  ' 亮蓝色按下
            End With
            AddHandler button.Click, AddressOf KeypadButton_Click
            buttons.Add(button)
        Next

        ' 0 按钮
        Dim button0 As New Button()
        With button0
            .Text = "0"
            .Size = buttonSize
            .Location = New Point(startX + buttonSize.Width + buttonSpacingX, startY + 3 * (buttonSize.Height + buttonSpacingY))
            .Font = New Font("微软雅黑", 16.0!, FontStyle.Bold)
            .BackColor = System.Drawing.Color.FromArgb(50, 50, 80)  ' 深灰蓝色背景
            .ForeColor = Color.Cyan  ' 霓虹青色文字
            .FlatStyle = FlatStyle.Flat
            .FlatAppearance.BorderSize = 2
            .FlatAppearance.BorderColor = Color.Cyan  ' 霓虹青色边框
            .FlatAppearance.MouseOverBackColor = System.Drawing.Color.FromArgb(20, 80, 120)  ' 深蓝色悬停
            .FlatAppearance.MouseDownBackColor = System.Drawing.Color.FromArgb(0, 120, 200)  ' 亮蓝色按下
        End With
        AddHandler button0.Click, AddressOf KeypadButton_Click
        buttons.Add(button0)

        ' 小数点按钮
        Dim buttonDot As New Button()
        With buttonDot
            .Text = "."
            .Size = buttonSize
            .Location = New Point(startX, startY + 3 * (buttonSize.Height + buttonSpacingY))
            .Font = New Font("微软雅黑", 16.0!, FontStyle.Bold)
            .BackColor = System.Drawing.Color.FromArgb(50, 50, 80)  ' 深灰蓝色背景
            .ForeColor = Color.Cyan  ' 霓虹青色文字
            .FlatStyle = FlatStyle.Flat
            .FlatAppearance.BorderSize = 2
            .FlatAppearance.BorderColor = Color.Cyan  ' 霓虹青色边框
            .FlatAppearance.MouseOverBackColor = System.Drawing.Color.FromArgb(20, 80, 120)  ' 深蓝色悬停
            .FlatAppearance.MouseDownBackColor = System.Drawing.Color.FromArgb(0, 120, 200)  ' 亮蓝色按下
        End With
        AddHandler buttonDot.Click, AddressOf KeypadButton_Click
        buttons.Add(buttonDot)

        ' 负号按钮
        Dim buttonMinus As New Button()
        With buttonMinus
            .Text = "-"
            .Size = buttonSize
            .Location = New Point(startX + 2 * (buttonSize.Width + buttonSpacingX), startY + 2 * (buttonSize.Height + buttonSpacingY))
            .Font = New Font("微软雅黑", 16.0!, FontStyle.Bold)
            .BackColor = System.Drawing.Color.FromArgb(50, 50, 80)  ' 深灰蓝色背景
            .ForeColor = Color.Cyan  ' 霓虹青色文字
            .FlatStyle = FlatStyle.Flat
            .FlatAppearance.BorderSize = 2
            .FlatAppearance.BorderColor = Color.Cyan  ' 霓虹青色边框
            .FlatAppearance.MouseOverBackColor = System.Drawing.Color.FromArgb(20, 80, 120)  ' 深蓝色悬停
            .FlatAppearance.MouseDownBackColor = System.Drawing.Color.FromArgb(0, 120, 200)  ' 亮蓝色按下
        End With
        AddHandler buttonMinus.Click, AddressOf MinusButton_Click
        buttons.Add(buttonMinus)

        ' 清除按钮 - 科幻主题
        Dim buttonClear As New Button()
        With buttonClear
            .Text = "清除"
            .Size = buttonSize
            .Location = New Point(startX + 2 * (buttonSize.Width + buttonSpacingX), startY + 3 * (buttonSize.Height + buttonSpacingY))
            .Font = New Font("微软雅黑", 12.0!, FontStyle.Bold)
            .BackColor = System.Drawing.Color.FromArgb(60, 40, 60)  ' 深紫红色背景
            .ForeColor = Color.Red  ' 红色文字
            .FlatStyle = FlatStyle.Flat
            .FlatAppearance.BorderSize = 2
            .FlatAppearance.BorderColor = Color.Red  ' 红色边框
            .FlatAppearance.MouseOverBackColor = System.Drawing.Color.FromArgb(100, 40, 40)  ' 深红色悬停
            .FlatAppearance.MouseDownBackColor = System.Drawing.Color.FromArgb(150, 20, 20)  ' 亮红色按下
        End With
        AddHandler buttonClear.Click, AddressOf ClearButton_Click
        buttons.Add(buttonClear)

        ' 关闭按钮（调整位置，避免与标题栏重叠）
        Dim buttonClose As New Button()
        With buttonClose
            .Text = "关闭"
            .Size = New Size(120, 40)  ' 调整大小
            .Location = New Point(150, 20)  ' 调整位置到右侧
            .Font = New Font("微软雅黑", 12.0!, FontStyle.Bold)
            .BackColor = System.Drawing.Color.FromArgb(60, 40, 60)  ' 深紫红色背景
            .ForeColor = Color.Red  ' 红色文字
            .FlatStyle = FlatStyle.Flat
            .FlatAppearance.BorderSize = 2
            .FlatAppearance.BorderColor = Color.Red  ' 红色边框
            .FlatAppearance.MouseOverBackColor = System.Drawing.Color.FromArgb(100, 40, 40)  ' 深红色悬停
            .FlatAppearance.MouseDownBackColor = System.Drawing.Color.FromArgb(150, 20, 20)  ' 亮红色按下
        End With
        AddHandler buttonClose.Click, AddressOf CloseKeypadButton_Click
        buttons.Add(buttonClose)

        ' 退格按钮 - 科幻主题
        Dim buttonBackspace As New Button()
        With buttonBackspace
            .Text = "退格"
            .Size = New Size(100, 40)  ' 调整大小
            .Location = New Point(30, 20)  ' 调整位置
            .Font = New Font("微软雅黑", 12.0!, FontStyle.Bold)
            .BackColor = System.Drawing.Color.FromArgb(50, 50, 80)  ' 深灰蓝色背景
            .ForeColor = Color.Cyan  ' 霓虹青色文字
            .FlatStyle = FlatStyle.Flat
            .FlatAppearance.BorderSize = 2
            .FlatAppearance.BorderColor = Color.Cyan  ' 霓虹青色边框
            .FlatAppearance.MouseOverBackColor = System.Drawing.Color.FromArgb(20, 80, 120)  ' 深蓝色悬停
            .FlatAppearance.MouseDownBackColor = System.Drawing.Color.FromArgb(0, 120, 200)  ' 亮蓝色按下
        End With
        AddHandler buttonBackspace.Click, AddressOf BackspaceButton_Click
        buttons.Add(buttonBackspace)

        ' 
        Dim buttonEnt As New Button()
        With buttonEnt
            .Text = "确认"
            .Size = New Size(startX * 2 + buttonAreaWidth - 40, 50)  ' 根据新的布局自适应宽度
            .Location = New Point(startX + 20, startY + 4 * (buttonSize.Height + buttonSpacingY))  ' 显示在数字按钮下方
            .Font = New Font("微软雅黑", 14.0!, FontStyle.Bold)
            .BackColor = System.Drawing.Color.FromArgb(40, 60, 100)  ' 深蓝色背景
            .ForeColor = Color.Lime  ' 
            .FlatStyle = FlatStyle.Flat
            .FlatAppearance.BorderSize = 2
            .FlatAppearance.BorderColor = Color.Lime  ' 
            .FlatAppearance.MouseOverBackColor = System.Drawing.Color.FromArgb(20, 80, 150)  ' 
            .FlatAppearance.MouseDownBackColor = System.Drawing.Color.FromArgb(0, 120, 200)  ' 
        End With
        AddHandler buttonEnt.Click, AddressOf EntButton_Click
        buttons.Add(buttonEnt)

        ' 
        For Each btn In buttons
            NumericKeypadForm.Controls.Add(btn)
        Next

        ' 
        AddHandler NumericKeypadForm.FormClosed, AddressOf NumericKeypadForm_Closed
    End Sub

    ' 数字
    Private Sub KeypadButton_Click(sender As Object, e As EventArgs)
        If currentActiveTextBox IsNot Nothing Then
            Dim btn As Button = DirectCast(sender, Button)
            Dim buttonText As String = btn.Text

            UpdateUI(Sub()
                         '况
                         If buttonText = "." Then
                             ' 防止重复
                             If currentActiveTextBox.Text.Contains(".") Then
                                 Return
                             End If
                             ' 如果文本为空，自动在小数点前添加0
                             If String.IsNullOrEmpty(currentActiveTextBox.Text) Then
                                 currentActiveTextBox.AppendText("0.")
                                 Return
                             End If
                         End If

                         ' 
                         currentActiveTextBox.AppendText(buttonText)
                     End Sub)
        End If
    End Sub

    ' 清
    Private Sub ClearButton_Click(sender As Object, e As EventArgs)
        If currentActiveTextBox IsNot Nothing Then
            UpdateUI(Sub()
                         currentActiveTextBox.Clear()
                     End Sub)
        End If
    End Sub

    ' 
    Private Sub BackspaceButton_Click(sender As Object, e As EventArgs)
        If currentActiveTextBox IsNot Nothing AndAlso currentActiveTextBox.Text.Length > 0 Then
            UpdateUI(Sub()
                         currentActiveTextBox.Text = currentActiveTextBox.Text.Substring(0, currentActiveTextBox.Text.Length - 1)
                     End Sub)
        End If
    End Sub

    ' 
    Private Sub MinusButton_Click(sender As Object, e As EventArgs)
        If currentActiveTextBox IsNot Nothing Then
            UpdateUI(Sub()
                         ' 如果文本为空，直接添加负号
                         If String.IsNullOrEmpty(currentActiveTextBox.Text) Then
                             currentActiveTextBox.Text = "-"
                             Return
                         End If
                         
                         ' 如果文本已经以负号开头，移除负号
                         If currentActiveTextBox.Text.StartsWith("-") Then
                             currentActiveTextBox.Text = currentActiveTextBox.Text.Substring(1)
                             Return
                         End If
                         
                         ' 如果文本是纯数字或小数，在开头添加负号
                         currentActiveTextBox.Text = "-" & currentActiveTextBox.Text
                     End Sub)
        End If
    End Sub

    ' 数字键盘表单关闭事件
    Private Sub NumericKeypadForm_Closed(sender As Object, e As FormClosedEventArgs)
        ' 确保数字键盘引用被重置
        NumericKeypadForm = Nothing

        ' 重
        isClosingKeypad = False

       
        Me.Focus()
    End Sub

    ' 关闭数字键盘按钮点击事件
    Private Sub CloseKeypadButton_Click(sender As Object, e As EventArgs)
        UpdateUI(Sub()
                     ' 设置标志，防止数字键盘在关闭过程中被重新显示
                     isClosingKeypad = True

                     If NumericKeypadForm IsNot Nothing AndAlso Not NumericKeypadForm.IsDisposed Then
                         Try
                             ' 确保在关闭前将TopMost设置为False，避免焦点问题
                             NumericKeypadForm.TopMost = False
                             NumericKeypadForm.Close()
                             NumericKeypadForm.Dispose()
                             NumericKeypadForm = Nothing
                         Catch ex As Exception
                             ' 忽略可能的异常
                             NumericKeypadForm = Nothing
                         End Try
                     End If
                 End Sub)
    End Sub

    ' ENT按钮点击事件（确认输入并关闭数字键盘）
    Private Sub EntButton_Click(sender As Object, e As EventArgs)
        ' 关闭数字键盘
        UpdateUI(Sub()
                     ' 设置标志，防止数字键盘在关闭过程中被重新显示
                     isClosingKeypad = True

                     If NumericKeypadForm IsNot Nothing AndAlso Not NumericKeypadForm.IsDisposed Then
                         Try
                             ' 确保在关闭前将TopMost设置为False，避免焦点问题
                             NumericKeypadForm.TopMost = False
                             NumericKeypadForm.Close()
                             NumericKeypadForm.Dispose()
                             NumericKeypadForm = Nothing
                         Catch ex As Exception
                             ' 忽略可能的异常
                             NumericKeypadForm = Nothing
                         End Try
                     End If

                    
                 End Sub)
    End Sub













    Private Sub Process1_Exited(sender As Object, e As EventArgs)

    End Sub

    
    Private Sub ToggleWheelButton(button As Button, ByRef buttonState As Integer)
        If (buttonState = 0) Then
            buttonState = 1
            button.BackColor = System.Drawing.Color.Lime
        ElseIf (buttonState = 1) Then
            buttonState = 0
            button.BackColor = SystemColors.MenuHighlight
        End If
    End Sub

    Private Sub Button13_Click(sender As Object, e As EventArgs) Handles qzqbt.Click
        ToggleWheelButton(qzqbt, qzqbtrc)
    End Sub



    Private Sub Button23_Click(sender As Object, e As EventArgs) Handles qset.Click

        QA1.Text = Format(Val(QA1.Text), "0.00")

        QA2.Text = Format(Val(QA2.Text), "0.00")

        QA3.Text = Format(Val(QA3.Text), "0.00")

        QA4.Text = Format(Val(QA4.Text), "0.00")

        QA5.Text = Format(Val(QA5.Text), "0.00")

        QA6.Text = Format(Val(QA6.Text), "0.00")


        If (QA1.Text <> "") And
                (QA2.Text <> "") And
                (QA3.Text <> "") And
                (QA4.Text <> "") And
                (QA5.Text <> "") And
                (QA6.Text <> "") And
                (connectrc = 1) And ((qsselect1 = 1) Or (wqselect1 = 1)) Then





            If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzqbtrc) And (Convert.ToDouble(QA1.Text) >= -90) And
            (Convert.ToDouble(QA1.Text) <= 90) And (Convert.ToDouble(QA2.Text) >= -90) And
            (Convert.ToDouble(QA2.Text) <= 90) And (Convert.ToDouble(QA3.Text) >= -90) And
            (Convert.ToDouble(QA3.Text) <= 90) And (Convert.ToDouble(QA4.Text) >= -90) And
            (Convert.ToDouble(QA4.Text) <= 90) And (Convert.ToDouble(QA5.Text) >= -90) And
            (Convert.ToDouble(QA5.Text) <= 90) And (Convert.ToDouble(QA6.Text) >= -90) And
            (Convert.ToDouble(QA6.Text) <= 90) Then




                If (qsetrc = 0) Then


                    qsetrc = 1


                    qlinkq.Enabled = False
                    qzqbt.Enabled = False
                    qyqbt.Enabled = False
                    qzhbt.Enabled = False
                    qlinkh.Enabled = False
                    qyhbt.Enabled = False
                    QA1.Enabled = False
                    QA2.Enabled = False
                    QA3.Enabled = False
                    QA4.Enabled = False
                    QA5.Enabled = False
                    QA6.Enabled = False


                ElseIf (qsetrc = 1) Then


                    qsetrc = 0


                    qlinkq.Enabled = True
                    qzqbt.Enabled = True
                    qyqbt.Enabled = True
                    qzhbt.Enabled = True
                    qlinkh.Enabled = True
                    qyhbt.Enabled = True
                    QA1.Enabled = True
                    QA2.Enabled = True
                    QA3.Enabled = True
                    QA4.Enabled = True
                    QA5.Enabled = True
                    QA6.Enabled = True







                End If

            Else

                MessageBox.Show("请至少选中轮子和方向,设置角度在-90度--90度！！")



            End If
        Else
            MessageBox.Show("请确保系统已连接且输入A1-A6角度值/且选中测量方式！！！")
        End If

    End Sub







    Private Sub qyqbt_Click(sender As Object, e As EventArgs) Handles qyqbt.Click
        ToggleWheelButton(qyqbt, qyqbtrc)
    End Sub

    Private Sub qzhbt_Click(sender As Object, e As EventArgs) Handles qzhbt.Click
        ToggleWheelButton(qzhbt, qzhbtrc)
    End Sub

    Private Sub qyhbt_Click(sender As Object, e As EventArgs) Handles qyhbt.Click
        ToggleWheelButton(qyhbt, qyhbtrc)
    End Sub

    Private Sub starthome_Click(sender As Object, e As EventArgs) Handles starthome.Click
        Try
           
            UpdateUI(Sub()
                         UpdateHomingButtonColor(Button10, 1) ' 前左按钮开始闪烁
                         UpdateHomingButtonColor(Button11, 1) ' 前右按钮开始闪烁
                         UpdateHomingButtonColor(Button12, 1) ' 后左按钮开始闪烁
                         UpdateHomingButtonColor(Button13, 1) ' 后右按钮开始闪
                     End Sub)
            
           
            Dim homeCommand As String = "START_HOMING"
            Dim commandBytes() As Byte = System.Text.Encoding.ASCII.GetBytes(homeCommand)
            SocketSend.Send(commandBytes)
            ShowMsg("回原点指令已发送: " & homeCommand)
            ShowMsg("回原点过程已开始，按钮将开始闪烁")
        Catch ex As Exception
            MessageBox.Show("发送回原点指令失败: " & ex.Message, "发送错误", MessageBoxButtons.OK, MessageBoxIcon.Error)
            ' 断开连接并重置状态
            DisconnectSocket()
            ' 重置按钮状态
            UpdateUI(Sub()
                         UpdateHomingButtonColor(Button10, 0) ' 前左按钮重置
                         UpdateHomingButtonColor(Button11, 0) ' 前右按钮重置
                         UpdateHomingButtonColor(Button12, 0) ' 后左按钮重置
                         UpdateHomingButtonColor(Button13, 0) ' 后右按钮重置
                     End Sub)
        End Try
    End Sub

    Private Sub qlinkq_Click(sender As Object, e As EventArgs) Handles qlinkq.Click

        If (qlinkqrc = 0) Then


            qlinkqrc = 1
            qzqbtrc = 1
            qyqbtrc = 1
            qlinkq.BackColor = System.Drawing.Color.Lime
            qzqbt.BackColor = System.Drawing.Color.Lime
            qyqbt.BackColor = System.Drawing.Color.Lime








        ElseIf (qlinkqrc = 1) Then




            qlinkqrc = 0
            qzqbtrc = 0
            qyqbtrc = 0
            qlinkq.BackColor = SystemColors.MenuHighlight
            qzqbt.BackColor = SystemColors.MenuHighlight
            qyqbt.BackColor = SystemColors.MenuHighlight















        End If







    End Sub

    Private Sub qlinkh_Click(sender As Object, e As EventArgs) Handles qlinkh.Click


        If (qlinkhrc = 0) Then


            qlinkhrc = 1
            qlinkh.BackColor = System.Drawing.Color.Lime

            qzhbtrc = 1

            qzhbt.BackColor = System.Drawing.Color.Lime

            qyhbtrc = 1

            qyhbt.BackColor = System.Drawing.Color.Lime







        ElseIf (qlinkhrc = 1) Then


            qlinkhrc = 0
            qlinkh.BackColor = SystemColors.MenuHighlight


            qzhbtrc = 0

            qzhbt.BackColor = SystemColors.MenuHighlight

            qyhbtrc = 0

            qyhbt.BackColor = SystemColors.MenuHighlight




        End If













    End Sub

    Private Sub LEFT_Q_Click_1(sender As Object, e As EventArgs)












    End Sub

    Private Sub RIGHT_Q_Click(sender As Object, e As EventArgs)








    End Sub

    Private Sub Timer1_Tick(sender As Object, e As EventArgs) Handles Timer1.Tick
       
        MergeAndSendData()
    End Sub

   
    Private Sub MergeAndSendData()
        Try
            
            If commandInProgress Then
                ShowMsg("命令正在处理中，请稍候再发送新命令")
                Return
            End If

            
            Dim relayrc As Integer = 0

            If qzqbtrc = 1 Then relayrc += 1
            If qyqbtrc = 1 Then relayrc += 2
            If qzhbtrc = 1 Then relayrc += 4
            If qyhbtrc = 1 Then relayrc += 8

            If qsselect1 = 1 Then relayrc += 16
            If wqselect1 = 1 Then relayrc += 32

           
            Dim command As String
            If qsselect1 = 1 Then
                command = "QS:Relay" + Convert.ToString(relayrc, 2) + pls
            ElseIf wqselect1 = 1 Then
                command = "WQ:Relay" + Convert.ToString(relayrc, 2) + pls
            Else
                
                Return
            End If

            
            UpdateUI(Sub() CMDSend.Text = command)

            
            If SocketSend.Connected Then
                Dim isConnectionError As Boolean = False
                Try
                    
                    commandInProgress = True

                    Dim Gsz_bytes() As Byte = System.Text.Encoding.ASCII.GetBytes(command)
                    SocketSend.SendTimeout = 3000 ' 3秒发送超时
                    SocketSend.Send(Gsz_bytes)
                    ShowMsg(datestr & ": " & command)
                    line += 1
                    UpdateUI(Sub()
                                 ' 确保Value不超过Maximum
                                 ProgressBar1.Value = Math.Min(line, ProgressBar1.Maximum)
                                 If line >= ProgressBar1.Maximum Then
                                     ListLog.Text = ""
                                     line = 0
                                 End If
                             End Sub)
                Catch sendEx As Exception
                 
                    If TypeOf sendEx Is SocketException Then
                        Dim sockEx As SocketException = DirectCast(sendEx, SocketException)
                        Select Case sockEx.SocketErrorCode
                            Case SocketError.TimedOut
                                ShowMsg("发送超时: " & sockEx.Message)
                                
                            Case SocketError.ConnectionReset, SocketError.ConnectionAborted, SocketError.NotConnected
                                ShowMsg("连接异常: " & sockEx.Message)
                                isConnectionError = True
                                DisconnectSocket()
                            Case Else
                                ShowMsg("Socket发送异常: " & sockEx.Message)
                                ' 其他Socket异常尝试保持连接
                        End Select
                    Else
                        ShowMsg("发送数据异常: " & sendEx.Message)
                        ' 非Socket异常尝试保持连接
                    End If
                Finally
                    ' 如果不是连接异常，允许发送新命令
                    If Not isConnectionError Then
                        commandInProgress = False
                    End If
                End Try
            Else
                ShowMsg("发送失败: 连接已断开")
                DisconnectSocket()
            End If
        Catch ex As Exception
            ShowMsg("发送数据失败: " & ex.Message)
            commandInProgress = False ' 发送失败，允许发送新命令
            
        End Try
    End Sub

    Private Sub Button14_Click(sender As Object, e As EventArgs) Handles startrv.Click


        If connectrc = 1 Then
            If qsetrc = 1 Then

                Select Case steprc

                    Case 1
                        steprc = 0
                        s1.BackColor = System.Drawing.Color.Red
                        startrv.Enabled = False
                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA1.Text
                            MergeAndSendData() 
                        End If
                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA1.Text
                            MergeAndSendData() 
                        End If





                    Case 2

                        steprc = 1
                        s2.BackColor = System.Drawing.Color.Red
                        startrv.Enabled = False
                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA1.Text
                        End If
                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA1.Text
                        End If



                        MergeAndSendData() 
                    Case 3
                        steprc = 2
                        s3.BackColor = System.Drawing.Color.Red
                        startrv.Enabled = False

                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA2.Text
                        End If
                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA2.Text
                        End If



                        MergeAndSendData() 
                    Case 4
                        steprc = 3
                        s4.BackColor = System.Drawing.Color.Red
                        startrv.Enabled = False

                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA3.Text
                        End If
                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA3.Text
                        End If

                        MergeAndSendData() 
                    Case 5
                        steprc = 4
                        s5.BackColor = System.Drawing.Color.Red
                        startrv.Enabled = False

                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA4.Text
                        End If
                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA4.Text
                        End If



                        MergeAndSendData() 
                    Case 6
                        steprc = 5
                        s6.BackColor = System.Drawing.Color.Red
                        startrv.Enabled = False

                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA5.Text
                        End If
                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA5.Text
                        End If





                        MergeAndSendData() 






                End Select




            Else
                MessageBox.Show("请先设置参数！！再进行启动")

            End If

        Else

            MessageBox.Show("请先连接系统！！再进行启动")

        End If





































    End Sub








   
    Private Sub SetCommandByMode(ByVal stepIndex As Integer)
        Dim targetText As String
        Select Case stepIndex
            Case 0 : targetText = QA1.Text
            Case 1 : targetText = QA2.Text
            Case 2 : targetText = QA3.Text
            Case 3 : targetText = QA4.Text
            Case 4 : targetText = QA5.Text
            Case 5 : targetText = QA6.Text
            Case Else : targetText = QA1.Text
        End Select

        If （qsselect1 = 1） And （wqselect1 = 0） Then
            pls = "QS:Angle" + targetText
        ElseIf （qsselect1 = 0） And （wqselect1 = 1） Then
            pls = "WQ:Angle" + targetText
        End If
    End Sub

    Private Sub Button15_Click(sender As Object, e As EventArgs) Handles startqz.Click
        '检查Socket连接状态
        If Not SocketSend.Connected Or connectrc <> 1 Then
            MessageBox.Show("请先连接系统！！再进行启动")
            Return
        End If

        If qsetrc = 1 Then
            Select Case steprc
                Case 0
                    steprc = 1
                    s1.BackColor = System.Drawing.Color.Red
                    startqz.Enabled = False
                    SetCommandByMode(0)
                    MergeAndSendData() ' 

                Case 1
                    steprc = 2
                    s2.BackColor = System.Drawing.Color.Red
                    startqz.Enabled = False
                    SetCommandByMode(1)
                    MergeAndSendData() ' 
                Case 2
                    steprc = 3
                    s3.BackColor = System.Drawing.Color.Red
                    startqz.Enabled = False
                    SetCommandByMode(2)
                    MergeAndSendData() ' 

                Case 3
                    steprc = 4
                    s4.BackColor = System.Drawing.Color.Red
                    startqz.Enabled = False
                    SetCommandByMode(3)
                    MergeAndSendData() ' 

                Case 4
                    steprc = 5
                    s5.BackColor = System.Drawing.Color.Red
                    startqz.Enabled = False
                    SetCommandByMode(4)
                    MergeAndSendData() ' 

                Case 5
                    steprc = 6
                    s6.BackColor = System.Drawing.Color.Red
                    startqz.Enabled = False
                    SetCommandByMode(5)
                    MergeAndSendData() ' 
            End Select
        Else
            MessageBox.Show("请先设置参数！！再进行启动")
        End If
    End Sub



    Public Function IsDecimal(input As String) As Boolean
        If String.IsNullOrWhiteSpace(input) Then Return False

        ' Trim whitespace from the input
        input = input.Trim()

        Dim hasDecimalPoint As Boolean = False
        Dim hasMinusSign As Boolean = False

        For i As Integer = 0 To input.Length - 1
            Dim c As Char = input(i)

            If i = 0 AndAlso c = "-"c Then
                
                hasMinusSign = True
            ElseIf c = "."c Then
                If hasDecimalPoint Then Return False 
                hasDecimalPoint = True
            ElseIf Not Char.IsDigit(c) Then
                Return False
            End If
        Next

    

        Return True
    End Function






    Private Sub ValidateAngleInput(textBox As TextBox)
        If IsDecimal(textBox.Text) Then
            
        ElseIf Not String.IsNullOrWhiteSpace(textBox.Text) Then
            MessageBox.Show(textBox.Text + "无效输入！")
            textBox.Text = ""
        End If
    End Sub

    Private Sub QA1_TextChanged(sender As Object, e As EventArgs) Handles QA1.TextChanged
        ValidateAngleInput(QA1)
    End Sub

    Private Sub QA2_TextChanged(sender As Object, e As EventArgs) Handles QA2.TextChanged
        ValidateAngleInput(QA2)
    End Sub

    Private Sub QA3_TextChanged(sender As Object, e As EventArgs) Handles QA3.TextChanged
        ValidateAngleInput(QA3)
    End Sub

    Private Sub QA4_TextChanged(sender As Object, e As EventArgs) Handles QA4.TextChanged
        ValidateAngleInput(QA4)
    End Sub

    Private Sub QA5_TextChanged(sender As Object, e As EventArgs) Handles QA5.TextChanged
        ValidateAngleInput(QA5)
    End Sub

    Private Sub QA6_TextChanged(sender As Object, e As EventArgs) Handles QA6.TextChanged
        ValidateAngleInput(QA6)
    End Sub

    Private Sub Timersned_Tick(sender As Object, e As EventArgs) Handles Timersned.Tick
        Try
            If SocketSend.Connected Then
                Dim Gsz_bytes() As Byte = System.Text.Encoding.ASCII.GetBytes(CMDSend.Text)
                SocketSend.Send(Gsz_bytes)
                ShowMsg(datestr & CMDSend.Text)
                line = line + 1

                ' 更新进度条和日志，确保在UI线程上执行
                UpdateUI(Sub()
                             If Not ProgressBar1.IsDisposed Then
                                 ' 确保Value不超过Maximum
                                 ProgressBar1.Value = Math.Min(line, ProgressBar1.Maximum)
                             End If

                             ' 清空日志（如果达到最大值）
                             If line >= ProgressBar1.Maximum Then
                                 If Not ListLog.IsDisposed AndAlso ListLog.IsHandleCreated Then
                                     ListLog.Text = ""
                                 End If
                                 line = 0
                             End If
                         End Sub)
            Else
                Timersned.Enabled = False
                ShowMsg("发送失败: 连接已断开")
                DisconnectSocket()
            End If

        Catch ex As Exception
            Timersned.Enabled = False
            ShowMsg("发送数据失败: " & ex.Message)
            DisconnectSocket()
        End Try
    End Sub

    Private Sub Heart_Click(sender As Object, e As EventArgs) Handles Heart.Click

    End Sub

    Private Sub GroupBox1_Enter(sender As Object, e As EventArgs) Handles GroupBox1.Enter

    End Sub

    Private Sub 手动_Enter(sender As Object, e As EventArgs)

    End Sub

    Private Sub Button2_Click(sender As Object, e As EventArgs)
        If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And (LEFT_Qrc Or RIGHT_Qrc) And (Convert.ToDouble(TextBox1.Text) >= -90) And (qsselect1 = 1) Then
            pls = "QS:Angle" + TextBox1.Text
            MergeAndSendData() 
        Else
            ShowMsg("输入错误")

        End If
    End Sub

    Private Sub ListLog_TextChanged(sender As Object, e As EventArgs) Handles ListLog.TextChanged

    End Sub

    Private Sub Button18_Click(sender As Object, e As EventArgs) Handles Button18.Click
        If (qsselect1 = 1) And (wqselect1 = 0) Then
            pls = "QS:Angle0"
            MergeAndSendData() 
        End If

        If (qsselect1 = 0) And (wqselect1 = 1) Then
            pls = "WQ:Angle0"
            MergeAndSendData() 
        End If




    End Sub

    Private Sub Button19_Click(sender As Object, e As EventArgs) Handles Button19.Click


        If (qsselect1 = 1) And (wqselect1 = 0) Then
            pls = "QS_ZERO"
            MergeAndSendData() 
        End If

        If (qsselect1 = 0) And (wqselect1 = 1) Then
            pls = "WQ_ZERO"
            MergeAndSendData() 
        End If












    End Sub

    Private Sub Button3_Click(sender As Object, e As EventArgs) Handles Button3.Click
        Timersned.Enabled = False
        startqz.Enabled = True

        QA1.Text = ""

        QA2.Text = ""

        QA3.Text = ""

        QA4.Text = ""

        QA5.Text = ""

        QA6.Text = ""
        s1.BackColor = SystemColors.Control
        s2.BackColor = SystemColors.Control
        s3.BackColor = SystemColors.Control
        s4.BackColor = SystemColors.Control
        s5.BackColor = SystemColors.Control
        s6.BackColor = SystemColors.Control



        qlinkq.Enabled = True
        qzqbt.Enabled = True
        qyqbt.Enabled = True
        qzhbt.Enabled = True
        qlinkh.Enabled = True
        qyhbt.Enabled = True
        QA1.Enabled = True
        QA2.Enabled = True
        QA3.Enabled = True
        QA4.Enabled = True
        QA5.Enabled = True
        QA6.Enabled = True










        steprc = 0














    End Sub

    Private Sub s6_Click(sender As Object, e As EventArgs) Handles s6.Click

    End Sub

    Private Sub Button16_Click(sender As Object, e As EventArgs) Handles Button16.Click
        If (steprc < 6) And (qsetrc = 1) Then
            steprc = steprc + 1
        End If
    End Sub

    Private Sub s1_Click(sender As Object, e As EventArgs) Handles s1.Click

    End Sub

    Private Sub Button17_Click(sender As Object, e As EventArgs) Handles Button17.Click
        If (steprc > 1) And (qsetrc = 1) Then

            steprc = steprc - 1
        End If
    End Sub

    Private Sub Button4_Click(sender As Object, e As EventArgs) Handles Button4.Click



        Timersned.Enabled = False
        startqz.Enabled = True
        startrv.Enabled = True

        QA1.Text = ""

        QA2.Text = ""

        QA3.Text = ""

        QA4.Text = ""

        QA5.Text = ""

        QA6.Text = ""
        s1.BackColor = SystemColors.Control
        s2.BackColor = SystemColors.Control
        s3.BackColor = SystemColors.Control
        s4.BackColor = SystemColors.Control
        s5.BackColor = SystemColors.Control
        s6.BackColor = SystemColors.Control



        qlinkq.Enabled = True
        qzqbt.Enabled = True
        qyqbt.Enabled = True
        qzhbt.Enabled = True
        qlinkh.Enabled = True
        qyhbt.Enabled = True
        QA1.Enabled = True
        QA2.Enabled = True
        QA3.Enabled = True
        QA4.Enabled = True
        QA5.Enabled = True
        QA6.Enabled = True








































    End Sub















    Private Sub qsselect_Click(sender As Object, e As EventArgs) Handles qsselect.Click

        If (qsselect1 = 0) Then


            qsselect1 = 1

            qsselect.BackColor = System.Drawing.Color.Lime

            wqselect1 = 0

            wqselect.BackColor = SystemColors.MenuHighlight





            wzq.BackColor = SystemColors.WindowText
            wyq.BackColor = SystemColors.WindowText
            wzh.BackColor = SystemColors.WindowText
            wyh.BackColor = SystemColors.WindowText

            qzq.BackColor = SystemColors.Window
            qyq.BackColor = SystemColors.Window
            qzh.BackColor = SystemColors.Window
            qyh.BackColor = SystemColors.Window



        ElseIf (qsselect1 = 1) Then


            qsselect1 = 0

            qsselect.BackColor = SystemColors.MenuHighlight
        End If
















    End Sub

    Private Sub Label12_Click(sender As Object, e As EventArgs)

    End Sub

    Private Sub wqselect_Click(sender As Object, e As EventArgs) Handles wqselect.Click


        If (wqselect1 = 0) Then


            wqselect1 = 1

            wqselect.BackColor = System.Drawing.Color.Lime
            qsselect1 = 0

            qsselect.BackColor = SystemColors.MenuHighlight



            wzq.BackColor = SystemColors.Window
            wyq.BackColor = SystemColors.Window
            wzh.BackColor = SystemColors.Window
            wyh.BackColor = SystemColors.Window

            qzq.BackColor = SystemColors.WindowText
            qyq.BackColor = SystemColors.WindowText
            qzh.BackColor = SystemColors.WindowText
            qyh.BackColor = SystemColors.WindowText












        ElseIf (wqselect1 = 1) Then


            wqselect1 = 0

            wqselect.BackColor = SystemColors.MenuHighlight
        End If
















    End Sub

    Private Sub Button5_Click(sender As Object, e As EventArgs)

        If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And (LEFT_Qrc Or RIGHT_Qrc) And (Convert.ToDouble(TextBox2.Text) >= -90) And (wqselect1 = 1) Then
            pls = "WQ:Angle" + TextBox2.Text
            MergeAndSendData() 
        Else
            ShowMsg("输入错误")

        End If





    End Sub

    Private Sub Button6_Click(sender As Object, e As EventArgs) Handles Button6.Click

        If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And (LEFT_Qrc Or RIGHT_Qrc) And (qsselect1 = 1) And (stepjog.Text <> "") Then

            Dim plscurrent As String
            Dim currentpls As Single

            If qzq.Text <> "" Then
                currentpls = Val(qzq.Text)
            Else
                currentpls = 0
            End If

            plscurrent = Str(currentpls + Val(stepjog.Text))


            pls = "QS:Angle" + plscurrent
            MergeAndSendData() ' 






        Else
            ShowMsg("输入错误")

        End If












    End Sub

    Private Sub qzq_TextChanged(sender As Object, e As EventArgs) Handles qzq.TextChanged

    End Sub

    Private Sub Button7_Click(sender As Object, e As EventArgs) Handles Button7.Click


        If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And (LEFT_Qrc Or RIGHT_Qrc) And (qsselect1 = 1) And (stepjog.Text <> "") Then

            Dim plscurrent As String
            Dim currentpls As Single

            If qzq.Text <> "" Then
                currentpls = Val(qzq.Text)
            Else
                currentpls = 0
            End If

            plscurrent = Str(currentpls - Val(stepjog.Text))


            pls = "QS:Angle" + plscurrent
            MergeAndSendData() 

        Else
            ShowMsg("输入错误")

        End If









































    End Sub

    Private Sub Button2_Click_1(sender As Object, e As EventArgs) Handles Button2.Click
        If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And (LEFT_Qrc Or RIGHT_Qrc) And (Convert.ToDouble(TextBox1.Text) >= -90) And (qsselect1 = 1) Then
            pls = "QS:Angle" + TextBox1.Text
            MergeAndSendData() 
        Else
            ShowMsg("输入错误")
        End If
    End Sub

    Private Sub Button5_Click_1(sender As Object, e As EventArgs) Handles Button5.Click
        If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And (LEFT_Qrc Or RIGHT_Qrc) And (Convert.ToDouble(TextBox2.Text) >= -90) And (wqselect1 = 1) Then
            pls = "WQ:Angle" + TextBox2.Text
            MergeAndSendData() 
        Else
            ShowMsg("输入错误")
        End If
    End Sub

    Private Sub Button9_Click(sender As Object, e As EventArgs) Handles Button9.Click
        If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And (LEFT_Qrc Or RIGHT_Qrc) And (stepjog.Text <> "") Then
            Dim plscurrent As String
            Dim currentpls As Single

            If qzq.Text <> "" Then
                currentpls = Val(wzq.Text)
            Else
                currentpls = 0
            End If

            plscurrent = Str(currentpls + Val(stepjog.Text))
            pls = "WQ:Angle" + plscurrent
            MergeAndSendData() 
        Else
            ShowMsg("输入错误")
        End If
    End Sub

    Private Sub Button8_Click(sender As Object, e As EventArgs) Handles Button8.Click
        If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And (LEFT_Qrc Or RIGHT_Qrc) And (stepjog.Text <> "") Then
            Dim plscurrent As String
            Dim currentpls As Single

            If wzq.Text <> "" Then
                currentpls = Val(wzq.Text)
            Else
                currentpls = 0
            End If

            plscurrent = Str(currentpls - Val(stepjog.Text))
            pls = "WQ:Angle" + plscurrent
            MergeAndSendData() 
        Else
            ShowMsg("输入错误")
        End If
    End Sub
End Class
