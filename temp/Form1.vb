Imports System.Net.Sockets
Imports System.Net
Imports System.Text
Imports System.ComponentModel
Imports System.Threading


Public Class Form1
    Dim SocketSend As New Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp)
    Dim datestr As String = ""
    Dim ip As IPAddress
    Dim ipPort As IPEndPoint
    Dim line As Int32
    Dim connectrc As Integer

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

    Dim owner As main


    Protected Overrides ReadOnly Property CreateParams() As CreateParams
        Get
            Dim cp As CreateParams = MyBase.CreateParams
            cp.ExStyle = cp.ExStyle Or &H2000000
            Return cp
        End Get
    End Property


    Private Sub Form1_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        Me.MaximizeBox = True
        Me.MinimizeBox = True
        CheckForIllegalCrossThreadCalls = False
        duizhong.BackColor = System.Drawing.Color.Red
        LEFT_Qrc = 1
        RIGHT_Qrc = 0
        qsselect.BackColor = SystemColors.MenuHighlight
        wqselect.BackColor = SystemColors.MenuHighlight
        AddHandler QA1.Click, AddressOf TextBox_Enter_ShowKeyboard
        AddHandler QA2.Click, AddressOf TextBox_Enter_ShowKeyboard
        AddHandler QA3.Click, AddressOf TextBox_Enter_ShowKeyboard
        AddHandler QA4.Click, AddressOf TextBox_Enter_ShowKeyboard
        AddHandler QA5.Click, AddressOf TextBox_Enter_ShowKeyboard
        AddHandler QA6.Click, AddressOf TextBox_Enter_ShowKeyboard
        AddHandler TextBox1.Click, AddressOf TextBox_Enter_ShowKeyboard
        AddHandler TextBox2.Click, AddressOf TextBox_Enter_ShowKeyboard
        'AddHandler TextBox3.Enter, AddressOf TextBox_Enter_ShowKeyboard
        AddHandler TextBox4.Click, AddressOf TextBox_Enter_ShowKeyboard

        ' 设置所有文本框为只读
        QA1.ReadOnly = True
        QA2.ReadOnly = True
        QA3.ReadOnly = True
        QA4.ReadOnly = True
        QA5.ReadOnly = True
        QA6.ReadOnly = True
        TextBox1.ReadOnly = True
        TextBox2.ReadOnly = True
        'TextBox3.ReadOnly = True
        TextBox4.ReadOnly = True
        qzq.ReadOnly = True
        qyq.ReadOnly = True
        qzh.ReadOnly = True
        qyh.ReadOnly = True
        wzq.ReadOnly = True
        wyq.ReadOnly = True
        wzh.ReadOnly = True
        wyh.ReadOnly = True
        CMDSend.ReadOnly = True

        SetStyle(ControlStyles.UserPaint, True)
        SetStyle(ControlStyles.AllPaintingInWmPaint, True)
        SetStyle(ControlStyles.DoubleBuffer, True)
    End Sub

    Public Function Button_Open_Click(sender As Object, e As EventArgs) As Integer
        Try

            Timerheart.Enabled = False
            ip = IPAddress.Parse("127.0.0.1")
            ipPort = New IPEndPoint(ip, "10001")
            SocketSend.Connect(ipPort)
            ShowMsg("成功连接到服务端")
            connectrc = 1
            Dim th As New Thread(AddressOf Receive)
            th.IsBackground = True
            th.Start(SocketSend)
            '增加一个返回值
            Return connectrc
        Catch ex As Exception
            Timerheart.Enabled = False
            MessageBox.Show(ex.Message)
            Me.Hide()

            connectrc = 0
            Return connectrc
        End Try
    End Function
    Public Sub Button1_Click(ByVal sender As System.Object, ByVal e As System.EventArgs)
        Try
            Dim Gsz_bytes() As Byte

            ' Gsz_bytes = Encoding.Unicode.GetBytes(TextBox_Send.Text)
            ' Gsz_bytes = Encoding.UTF8.GetBytes(TextBox_Send.Text) '这是可以的
            Gsz_bytes = System.Text.Encoding.ASCII.GetBytes(CMDSend.Text)
            SocketSend.Send(Gsz_bytes)


        Catch ex As Exception
            MessageBox.Show(ex.Message)
            Me.Hide()
        End Try

    End Sub

    Public Sub startTest(Form As main)
        Try
            Dim Gsz_bytes() As Byte
            owner = Form
            owner.TopMost = False
            owner.Hide()

            ' Gsz_bytes = Encoding.Unicode.GetBytes(TextBox_Send.Text)
            ' Gsz_bytes = Encoding.UTF8.GetBytes(TextBox_Send.Text) '这是可以的
            Gsz_bytes = System.Text.Encoding.ASCII.GetBytes(CMDSend.Text)
            SocketSend.Send(Gsz_bytes)

        Catch ex As Exception
            MessageBox.Show(ex.Message)
            Me.Hide()
            owner.TopMost = True
            owner.Show()
        End Try


    End Sub

    Public Function getConnected() As Integer
        Return connectrc
    End Function

    Public Sub tempTest(Form As main)
        owner = Form
        owner.TopMost = False
        owner.Hide()
    End Sub

    Private Sub Button_Close_Click(sender As Object, e As EventArgs) Handles Button_Close.Click
        Timerheart.Enabled = False
        Try
            SocketSend.Close()
            owner.Close()
            Me.Close()
        Catch ex As Exception
            MessageBox.Show(ex.Message)
            owner.Close()
            Me.Close()
        End Try

    End Sub
    Sub Receive(SocketSend)
        Dim S As Socket = SocketSend
        Dim ip As String = S.RemoteEndPoint.ToString

        Try
            While True
                Dim buffer(1024 * 1024 * 2) As Byte
                Dim length As Integer = S.Receive(buffer)
                Dim str As String = Encoding.UTF8.GetString(buffer)

                'qzq:前束角左前轮
                'qyq:前束角右前轮
                'qzh 前束角左后轮
                'qyh 前束角右后轮


                'wzq:外倾角左前轮
                'wyq:外倾角右前轮
                'wzh 外倾角左后轮
                'wyh 外倾角右后轮

                '判定数据当前是否正常，一个数据包括ST和ND，没有则判定数据无效
                '--------------------------------------------------------------------------------------------------------------------
                'qzq()qyq()qzh()qyh()wzq()wyq()wzh()wyh()
                Dim snesor As Integer = InStr(str, "SensorNG")
                If (snesor > 0) Then
                    duizhong.BackColor = System.Drawing.Color.Red

                End If

                snesor = InStr(str, "SensorOK")
                If (snesor > 0) Then
                    duizhong.BackColor = System.Drawing.Color.Lime

                End If

                Dim pos1 As Integer = InStr(str, "ST_status")
                Dim pos10 As Integer = InStr(str, "ND")
                Dim status As Integer = InStr(str, "status")
                Dim pos_qzq As Integer = InStr(str, "qzq")
                Dim pos_qyq As Integer = InStr(str, "qyq")
                Dim pos_qzh As Integer = InStr(str, "qzh")
                Dim pos_qyh As Integer = InStr(str, "qyh")


                Dim pos_wzq As Integer = InStr(str, "wzq")
                Dim pos_wyq As Integer = InStr(str, "wyq")
                Dim pos_wzh As Integer = InStr(str, "wzh")
                Dim pos_wyh As Integer = InStr(str, "wyh")
                Dim statusrc As Integer
                '--------------------------------------------------------------------------------------------------------------------
                '判定_ST_status*****qzq*****qyq*****qzh*****qyh*****wzq*****wyq*****wzh******wyh******ND

                If (pos1 > 0) And (pos10 > 0) And (pos10 > pos1) Then

                    Dim n As Integer = pos_qyq - pos_qzq - 3
                    If n > 0 Then
                        qzq.Text = Mid(str, pos_qzq + 3, n)

                    End If



                    n = pos_qzh - pos_qyq - 3
                    If n > 0 Then
                        qyq.Text = Mid(str, pos_qyq + 3, n)
                    End If



                    n = pos_qyh - pos_qzh - 3
                    If n > 0 Then
                        qzh.Text = Mid(str, pos_qzh + 3, n)
                    End If



                    n = pos_wzq - pos_qyh - 3
                    If n > 0 Then
                        qyh.Text = Mid(str, pos_qyh + 3, n)
                    End If


                    n = pos_wyq - pos_wzq - 3
                    If n > 0 Then
                        wzq.Text = Mid(str, pos_wzq + 3, n)
                    End If


                    n = pos_wzh - pos_wyq - 3
                    If n > 0 Then
                        wyq.Text = Mid(str, pos_wyq + 3, n)
                    End If



                    n = pos_wyh - pos_wzh - 3
                    If n > 0 Then
                        wzh.Text = Mid(str, pos_wzh + 3, n)
                    End If

                    n = pos10 - pos_wyh - 3
                    If n > 0 Then
                        wyh.Text = Mid(str, pos_wyh + 3, n)
                    End If


                    n = pos_qzq - pos1 - 9
                    If n > 0 And IsNumeric((Mid(str, pos1 + 9, n))) Then
                        statusrc = Convert.ToInt32(Mid(str, pos1 + 9, n))



                        If (statusrc > 0) Then
                            Button25.BackColor = System.Drawing.Color.Red
                            Button16.Enabled = False
                            Button17.Enabled = False

                        End If


                        If (statusrc = 0) Then
                            Button25.BackColor = System.Drawing.Color.Lime
                            Button16.Enabled = True
                            Button17.Enabled = True

                        End If








                    End If



                    'Timer1.Enabled = True

                    Heart.BackColor = System.Drawing.Color.Lime


                End If

                '上面取到的值和状态开始运算 还要和命令进行比对
                '先看是哪个轮子在运行，再看运行到哪一步，再比对目标和地址一样时，且无busy，则变绿，打开next 按钮


                If (InStr(str, "QSRECVOK") > 0) Or (InStr(str, "QS_HMOK") > 0) Or (InStr(str, "QS_ZEROOK") > 0) Or (InStr(str, "WQ_ZEROOK") > 0) Or (InStr(str, "WQ_HMOK") > 0) Or (InStr(str, "WQRECVOK") > 0) Then
                    Timersned.Enabled = False
                End If

                If (startqz.Enabled = False Or startrv.Enabled = False) And qsselect1 = 1 Then





                    If (qzqbtrc = 1) Then
                        Select Case steprc

                            Case 1
                                If statusrc = 0 And String.Equals(qzq.Text, QA1.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s1.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If




                            Case 2

                                If statusrc = 0 And String.Equals(qzq.Text, QA2.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s2.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If





                            Case 3
                                If statusrc = 0 And String.Equals(qzq.Text, QA3.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s3.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 4

                                If statusrc = 0 And String.Equals(qzq.Text, QA4.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s4.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 5

                                If statusrc = 0 And String.Equals(qzq.Text, QA5.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s5.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If




                            Case 6
                                If statusrc = 0 And String.Equals(qzq.Text, QA6.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s6.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If





                        End Select


                    End If










                    If (startqz.Enabled = False Or startrv.Enabled = False) And qyqbtrc = 1 Then

                        Select Case steprc

                            Case 1
                                If String.Equals(qyq.Text, QA1.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s1.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If




                            Case 2

                                If String.Equals(qyq.Text, QA2.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s2.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If





                            Case 3
                                If String.Equals(qyq.Text, QA3.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s3.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 4

                                If String.Equals(qyq.Text, QA4.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s4.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 5

                                If String.Equals(qyq.Text, QA5.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s5.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If




                            Case 6
                                If String.Equals(qyq.Text, QA6.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s6.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If





                        End Select




                    End If






















                    If (startqz.Enabled = False Or startrv.Enabled = False) And qzhbtrc = 1 Then
                        Select Case steprc

                            Case 1
                                If statusrc = 0 And String.Equals(qzh.Text, QA1.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s1.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If




                            Case 2

                                If statusrc = 0 And String.Equals(qzh.Text, QA2.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s2.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If





                            Case 3
                                If statusrc = 0 And String.Equals(qzh.Text, QA3.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s3.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 4

                                If statusrc = 0 And String.Equals(qzh.Text, QA4.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s4.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 5

                                If statusrc = 0 And String.Equals(qzh.Text, QA5.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s5.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If




                            Case 6
                                If statusrc = 0 And String.Equals(qzh.Text, QA6.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s6.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If





                        End Select


                    End If











                    If (startqz.Enabled = False Or startrv.Enabled = False) And qyhbtrc = 1 Then


                        Select Case steprc

                            Case 1
                                If statusrc = 0 And String.Equals(qyh.Text, QA1.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s1.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If




                            Case 2

                                If statusrc = 0 And String.Equals(qyh.Text, QA2.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s2.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True
                                End If





                            Case 3
                                If statusrc = 0 And String.Equals(qyh.Text, QA3.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s3.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 4

                                If statusrc = 0 And String.Equals(qyh.Text, QA4.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s4.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 5

                                If statusrc = 0 And String.Equals(qyh.Text, QA5.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s5.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True
                                End If




                            Case 6
                                If statusrc = 0 And String.Equals(qyh.Text, QA6.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s6.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If
                        End Select
                    End If
                End If


                '前束角处理结束----------------------------------------------------------------------------------------------------------------------------------------------------------------------



                '外倾角处理开始----------------------------------------------------------------------------------------------------------------------------------------------------------------------



                If (startqz.Enabled = False Or startrv.Enabled = False) And wqselect1 = 1 Then





                    If (qzqbtrc = 1) Then
                        Select Case steprc

                            Case 1
                                If statusrc = 0 And String.Equals(wzq.Text, QA1.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s1.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If

                            Case 2

                                If statusrc = 0 And String.Equals(wzq.Text, QA2.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s2.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If





                            Case 3
                                If statusrc = 0 And String.Equals(wzq.Text, QA3.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s3.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 4

                                If statusrc = 0 And String.Equals(wzq.Text, QA4.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s4.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True
                                End If



                            Case 5

                                If statusrc = 0 And String.Equals(wzq.Text, QA5.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s5.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True
                                End If




                            Case 6
                                If statusrc = 0 And String.Equals(wzq.Text, QA6.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s6.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If
                        End Select
                    End If


                    If (startqz.Enabled = False Or startrv.Enabled = False) And qyqbtrc = 1 Then

                        Select Case steprc

                            Case 1
                                If String.Equals(wyq.Text, QA1.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s1.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If


                            Case 2

                                If String.Equals(wyq.Text, QA2.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s2.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If

                            Case 3
                                If String.Equals(wyq.Text, QA3.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s3.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If

                            Case 4

                                If String.Equals(wyq.Text, QA4.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s4.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True
                                End If

                            Case 5

                                If String.Equals(wyq.Text, QA5.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s5.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If

                            Case 6
                                If String.Equals(wyq.Text, QA6.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s6.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If
                        End Select

                    End If


                    If (startqz.Enabled = False Or startrv.Enabled = False) And qzhbtrc = 1 Then
                        Select Case steprc

                            Case 1
                                If statusrc = 0 And String.Equals(wzh.Text, QA1.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s1.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If




                            Case 2

                                If statusrc = 0 And String.Equals(wzh.Text, QA2.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s2.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If


                            Case 3
                                If statusrc = 0 And String.Equals(wzh.Text, QA3.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s3.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 4

                                If statusrc = 0 And String.Equals(wzh.Text, QA4.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s4.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 5

                                If statusrc = 0 And String.Equals(wzh.Text, QA5.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s5.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If




                            Case 6
                                If statusrc = 0 And String.Equals(wzh.Text, QA6.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s6.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If
                        End Select
                    End If




                    If (startqz.Enabled = False Or startrv.Enabled = False) And qyhbtrc = 1 Then


                        Select Case steprc

                            Case 1
                                If statusrc = 0 And String.Equals(wyh.Text, QA1.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s1.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If




                            Case 2

                                If statusrc = 0 And String.Equals(wyh.Text, QA2.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s2.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If





                            Case 3
                                If statusrc = 0 And String.Equals(wyh.Text, QA3.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s3.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 4

                                If statusrc = 0 And String.Equals(wyh.Text, QA4.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s4.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If



                            Case 5

                                If statusrc = 0 And String.Equals(wyh.Text, QA5.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s5.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If




                            Case 6
                                If statusrc = 0 And String.Equals(wyh.Text, QA6.Text, StringComparison.OrdinalIgnoreCase) Then  'busy状态过了
                                    s6.BackColor = System.Drawing.Color.Lime
                                    startqz.Enabled = True
                                    startrv.Enabled = True

                                End If

                        End Select
                    End If
                End If





























































                datestr = Format(Now(), "yyyy/MM/dd H:mm:ss ffff")



                ShowMsg(datestr & ":  " & str)
                line = line + 1
                ProgressBar1.Value = line
                If line > 50 Then
                    ListLog.Text = ""
                    line = 0
                End If

            End While
        Catch ex As Exception
            Me.Hide()
        End Try
    End Sub
    Function ShowMsg(s As String)
        Try
            ListLog.AppendText(s)
            ListLog.AppendText(vbCrLf)
            ListLog.SelectionStart = ListLog.Text.Length
            'ListLog.ScrollToCaret()
        Catch ex As Exception
            Me.Hide()
        End Try
    End Function













    Private Sub Process1_Exited(sender As Object, e As EventArgs)

    End Sub

    Private Sub Button13_Click(sender As Object, e As EventArgs) Handles qzqbt.Click
        If (qzqbtrc = 0) Then


            qzqbtrc = 1

            qzqbt.BackColor = System.Drawing.Color.Lime



        ElseIf (qzqbtrc = 1) Then


            qzqbtrc = 0

            qzqbt.BackColor = SystemColors.MenuHighlight
        End If








    End Sub

    Private Sub Timerheart_Tick(sender As Object, e As EventArgs) Handles Timerheart.Tick

        '心跳程序开始/每1s向slave 发送一次，slave没有收到 将会停止系统运行



        datestr = Format(Now(), "yyyy/MM/dd H:mm:ss ffff")



        Try
            Dim Gsz_bytes() As Byte

            ' Gsz_bytes = Encoding.Unicode.GetBytes(TextBox_Send.Text)
            ' Gsz_bytes = Encoding.UTF8.GetBytes(TextBox_Send.Text) '这是可以的
            Gsz_bytes = System.Text.Encoding.ASCII.GetBytes("S1F1")
            SocketSend.Send(Gsz_bytes)
            ShowMsg(datestr & ":  S1F1")
            line = line + 1
            If line > 50 Then
                ListLog.Text = ""
                line = 0

            End If


            Heart.BackColor = System.Drawing.Color.Red

        Catch ex As Exception
            MessageBox.Show(ex.Message)
            Me.Hide()
        End Try








    End Sub

    Private Sub cmd_TextChanged(sender As Object, e As EventArgs)

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
                （connectrc = 1） And ((qsselect1 = 1） Or （wqselect1 = 1）) Then





            If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzqbtrc) And (Convert.ToDouble（QA1.Text） >= -90) And
            (Convert.ToDouble（QA1.Text） <= 90) And (Convert.ToDouble（QA2.Text） >= -90) And
            (Convert.ToDouble（QA2.Text） <= 90) And (Convert.ToDouble（QA3.Text） >= -90) And
            (Convert.ToDouble（QA3.Text） <= 90) And (Convert.ToDouble（QA4.Text） >= -90) And
            (Convert.ToDouble（QA4.Text） <= 90) And (Convert.ToDouble（QA5.Text） >= -90) And
            (Convert.ToDouble（QA5.Text） <= 90) And (Convert.ToDouble（QA6.Text） >= -90) And
            (Convert.ToDouble（QA6.Text） <= 90) Then




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

    Private Sub Label1_Click(sender As Object, e As EventArgs) Handles Label1.Click

    End Sub

    Private Sub GroupBox4_Enter(sender As Object, e As EventArgs)

    End Sub

    Private Sub LEFT_Q_Click(sender As Object, e As EventArgs)

    End Sub

    Private Sub qyqbt_Click(sender As Object, e As EventArgs) Handles qyqbt.Click


        If (qyqbtrc = 0) Then


            qyqbtrc = 1

            qyqbt.BackColor = System.Drawing.Color.Lime



        ElseIf (qyqbtrc = 1) Then


            qyqbtrc = 0

            qyqbt.BackColor = SystemColors.MenuHighlight
        End If







    End Sub

    Private Sub qzhbt_Click(sender As Object, e As EventArgs) Handles qzhbt.Click




        If (qzhbtrc = 0) Then


            qzhbtrc = 1

            qzhbt.BackColor = System.Drawing.Color.Lime



        ElseIf (qzhbtrc = 1) Then


            qzhbtrc = 0

            qzhbt.BackColor = SystemColors.MenuHighlight
        End If








    End Sub

    Private Sub qyhbt_Click(sender As Object, e As EventArgs) Handles qyhbt.Click


        If (qyhbtrc = 0) Then


            qyhbtrc = 1

            qyhbt.BackColor = System.Drawing.Color.Lime



        ElseIf (qyhbtrc = 1) Then


            qyhbtrc = 0

            qyhbt.BackColor = SystemColors.MenuHighlight

        End If



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

        relayrc = 0

        If qzqbtrc = 1 Then
            relayrc = relayrc + 1

        End If

        If qyqbtrc = 1 Then
            relayrc = relayrc + 2

        End If
        If qzhbtrc = 1 Then
            relayrc = relayrc + 4

        End If
        If qyhbtrc = 1 Then
            relayrc = relayrc + 8
        End If

        If (qsselect1 = 1) Then
            relayrc = relayrc + 16
        End If
        If (wqselect1 = 1) Then
            relayrc = relayrc + 32
        End If



        If (qsselect1 = 1) Then
            CMDSend.Text = "QS:Relay" + Convert.ToString(relayrc, 2) + pls
        End If

        If (wqselect1 = 1) Then
            CMDSend.Text = "WQ:Relay" + Convert.ToString(relayrc, 2) + pls
        End If

















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
                        End If
                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA1.Text
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



                        Timersned.Enabled = True
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



                        Timersned.Enabled = True
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

                        Timersned.Enabled = True
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


                        Timersned.Enabled = True
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



                        Timersned.Enabled = True






                End Select




            Else
                MessageBox.Show("请先设置参数！！再进行启动")

            End If

        Else

            MessageBox.Show("请先连接系统！！再进行启动")

        End If

































    End Sub








    Private Sub Button15_Click(sender As Object, e As EventArgs) Handles startqz.Click

        If connectrc = 1 Then
            If qsetrc = 1 Then

                Select Case steprc

                    Case 0
                        steprc = 1
                        s1.BackColor = System.Drawing.Color.Red
                        startqz.Enabled = False

                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA1.Text
                        End If
                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA1.Text
                        End If
                        Timersned.Enabled = True

                    Case 1
                        steprc = 2
                        s2.BackColor = System.Drawing.Color.Red
                        startqz.Enabled = False
                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA2.Text
                        End If
                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA2.Text
                        End If
                        Timersned.Enabled = True


                    Case 2
                        steprc = 3
                        s3.BackColor = System.Drawing.Color.Red
                        startqz.Enabled = False

                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA3.Text
                        End If

                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA3.Text
                        End If
                        Timersned.Enabled = True


                    Case 3
                        steprc = 4
                        s4.BackColor = System.Drawing.Color.Red
                        startqz.Enabled = False

                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA4.Text
                        End If

                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA4.Text
                        End If
                        Timersned.Enabled = True


                    Case 4
                        steprc = 5
                        s5.BackColor = System.Drawing.Color.Red
                        startqz.Enabled = False

                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA5.Text
                        End If

                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA5.Text
                        End If
                        Timersned.Enabled = True

                    Case 5
                        steprc = 6
                        s6.BackColor = System.Drawing.Color.Red
                        startqz.Enabled = False

                        If （qsselect1 = 1） And （wqselect1 = 0） Then
                            pls = "QS:Angle" + QA6.Text
                        End If

                        If （qsselect1 = 0） And （wqselect1 = 1） Then
                            pls = "WQ:Angle" + QA6.Text
                        End If








                        Timersned.Enabled = True






                End Select




            Else
                MessageBox.Show("请先设置参数！！再进行启动")

            End If

        Else

            MessageBox.Show("请先连接系统！！再进行启动")

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
                ' First character can be a minus sign
                hasMinusSign = True
            ElseIf c = "."c Then
                If hasDecimalPoint Then Return False ' Multiple decimal points are invalid
                hasDecimalPoint = True
            ElseIf Not Char.IsDigit(c) Then
                Return False
            End If
        Next

        ' Check if the input is just a minus sign (invalid)
        'If hasMinusSign AndAlso input.Length = 1 Then Return False

        Return True
    End Function





    Private Sub QA1_TextChanged(sender As Object, e As EventArgs) Handles QA1.TextChanged
        Dim input = QA1.Text


        If IsDecimal(QA1.Text) Then


        Else
            MessageBox.Show(QA1.Text + "无效输入！")
            QA1.Text = ""
        End If





    End Sub

    Private Sub QA2_TextChanged(sender As Object, e As EventArgs) Handles QA2.TextChanged
        If IsDecimal(QA2.Text) Then

        Else
            MessageBox.Show(QA2.Text + "无效输入！")
            QA2.Text = ""
        End If
    End Sub

    Private Sub QA3_TextChanged(sender As Object, e As EventArgs) Handles QA3.TextChanged
        If IsDecimal(QA3.Text) Then


        Else
            MessageBox.Show(QA3.Text + "无效输入！")
            QA3.Text = ""
        End If
    End Sub

    Private Sub QA4_TextChanged(sender As Object, e As EventArgs) Handles QA4.TextChanged
        If IsDecimal(QA4.Text) Then


        Else
            MessageBox.Show(QA4.Text + "无效输入！")
            QA4.Text = ""
        End If
    End Sub

    Private Sub QA5_TextChanged(sender As Object, e As EventArgs) Handles QA5.TextChanged
        If IsDecimal(QA5.Text) Then


        Else
            MessageBox.Show(QA5.Text + "无效输入！")
            QA5.Text = ""
        End If
    End Sub

    Private Sub QA6_TextChanged(sender As Object, e As EventArgs) Handles QA6.TextChanged
        If IsDecimal(QA6.Text) Then


        Else
            MessageBox.Show(QA6.Text + "无效输入！")
            QA6.Text = ""
        End If
    End Sub

    Private Sub Timersned_Tick(sender As Object, e As EventArgs) Handles Timersned.Tick
        Try
            Dim Gsz_bytes() As Byte

            ' Gsz_bytes = Encoding.Unicode.GetBytes(TextBox_Send.Text)
            ' Gsz_bytes = Encoding.UTF8.GetBytes(TextBox_Send.Text) '这是可以的
            Gsz_bytes = System.Text.Encoding.ASCII.GetBytes(CMDSend.Text)
            SocketSend.Send(Gsz_bytes)
            ShowMsg(datestr & CMDSend.Text)
            line = line + 1
            ProgressBar1.Value = line
            If line > 50 Then
                ListLog.Text = ""
                line = 0

            End If




        Catch ex As Exception
            MessageBox.Show("发送数据无法到达控制器！！")
            Me.Hide()
            MessageBox.Show(ex.Message)

        End Try





    End Sub

    Private Sub Heart_Click(sender As Object, e As EventArgs)

    End Sub

    Private Sub GroupBox1_Enter(sender As Object, e As EventArgs)

    End Sub

    Private Sub 手动_Enter(sender As Object, e As EventArgs)

    End Sub

    Private Sub Button2_Click(sender As Object, e As EventArgs) Handles Button2.Click
        If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And (LEFT_Qrc Or RIGHT_Qrc) And (Convert.ToDouble（TextBox1.Text） >= -90) And (qsselect1 = 1) Then
            pls = "QS:Angle" + TextBox1.Text
            Timersned.Enabled = True
        Else
            ShowMsg("输入错误")

        End If
    End Sub

    Private Sub ListLog_TextChanged(sender As Object, e As EventArgs) Handles ListLog.TextChanged

    End Sub

    Private Sub Button18_Click(sender As Object, e As EventArgs) Handles Button18.Click
        If （qsselect1 = 1） And （wqselect1 = 0） Then
            pls = "QS:Angle0"
            Timersned.Enabled = True
        End If

        If （qsselect1 = 0） And （wqselect1 = 1） Then
            pls = "WQ:Angle0"
            Timersned.Enabled = True
        End If




    End Sub

    Private Sub Button19_Click(sender As Object, e As EventArgs) Handles Button19.Click


        If （qsselect1 = 1） And （wqselect1 = 0） Then
            pls = "QS_ZERO"
            Timersned.Enabled = True
        End If

        If （qsselect1 = 0） And （wqselect1 = 1） Then
            pls = "WQ_ZERO"
            Timersned.Enabled = True
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

    Private Sub Button5_Click(sender As Object, e As EventArgs) Handles Button5.Click

        If (qzqbtrc Or qyqbtrc Or qyhbtrc Or qzhbtrc) And (LEFT_Qrc Or RIGHT_Qrc) And (Convert.ToDouble（TextBox2.Text） >= -90) And (wqselect1 = 1) Then
            pls = "WQ:Angle" + TextBox2.Text
            Timersned.Enabled = True
        Else
            ShowMsg("输入错误")

        End If





    End Sub

    Private Sub ShowNumericKeyboardForTextBox(tb As TextBox)
        ' 计算弹出位置（屏幕坐标）
        Dim pt As Point = tb.PointToScreen(New Point(0, tb.Height))
        Dim keyboard As New NumericKeyboardForm()
        keyboard.StartPosition = FormStartPosition.Manual

        ' 获取屏幕工作区域（排除任务栏）
        Dim workingArea As Rectangle = Screen.PrimaryScreen.WorkingArea

        ' 检查键盘是否会超出屏幕边界
        If pt.X + keyboard.Width + 70 > workingArea.Right Then
            pt.X = workingArea.Right - keyboard.Width - 70
        End If

        If pt.Y + keyboard.Height > workingArea.Bottom Then
            ' 如果下方空间不足，显示在文本框上方
            pt.Y = tb.PointToScreen(New Point(0, 0)).Y - keyboard.Height
        End If

        ' 确保键盘不会超出屏幕左边界和上边界
        pt.X = Math.Max(pt.X, workingArea.Left)
        pt.Y = Math.Max(pt.Y, workingArea.Top)

        keyboard.Location = pt
        keyboard.SetCurrentTextBox(tb)
        keyboard.ShowDialog(Me)
    End Sub

    Private Sub TextBox_Enter_ShowKeyboard(sender As Object, e As EventArgs)
        ShowNumericKeyboardForTextBox(DirectCast(sender, TextBox))
    End Sub


    Private Sub Button7_Click(sender As Object, e As EventArgs) Handles Button7.Click
        Me.Hide()
        owner.Show()
    End Sub

    Private Sub Button8_Click(sender As Object, e As EventArgs) Handles Button8.Click
        Dim help As New Help()
        help.Show()
    End Sub

End Class
