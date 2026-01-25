<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()>
Partial Class Form1
    Inherits System.Windows.Forms.Form

    'Form 重写 Dispose，以清理组件列表。
    <System.Diagnostics.DebuggerNonUserCode()>
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        Try
            If disposing AndAlso components IsNot Nothing Then
                components.Dispose()
            End If
        Finally
            MyBase.Dispose(disposing)
        End Try
    End Sub

    'Windows 窗体设计器所必需的
    Private components As System.ComponentModel.IContainer
    
    '数字键盘相关变量
    Private currentActiveTextBox As TextBox = Nothing
    Private NumericKeypadForm As Form = Nothing
    Private isClosingKeypad As Boolean = False ' 防止数字键盘在关闭过程中被重新显示的标志

    '注意: 以下过程是 Windows 窗体设计器所必需的
    '可以使用 Windows 窗体设计器修改它。
    '不要使用代码编辑器修改它。
    <System.Diagnostics.DebuggerStepThrough()>
    Private Sub InitializeComponent()
        Me.components = New System.ComponentModel.Container()
        Me.CMDSend = New System.Windows.Forms.TextBox()
        Me.Label4 = New System.Windows.Forms.Label()
        Me.qyh = New System.Windows.Forms.TextBox()
        Me.qzh = New System.Windows.Forms.TextBox()
        Me.qyq = New System.Windows.Forms.TextBox()
        Me.qzq = New System.Windows.Forms.TextBox()
        Me.qlinkh = New System.Windows.Forms.Button()
        Me.qlinkq = New System.Windows.Forms.Button()
        Me.Panel3 = New System.Windows.Forms.Panel()
        Me.Panel2 = New System.Windows.Forms.Panel()
        Me.Panel1 = New System.Windows.Forms.Panel()
        Me.qyhbt = New System.Windows.Forms.Button()
        Me.qzhbt = New System.Windows.Forms.Button()
        Me.qyqbt = New System.Windows.Forms.Button()
        Me.qzqbt = New System.Windows.Forms.Button()
        Me.Label1 = New System.Windows.Forms.Label()
        Me.Heart = New System.Windows.Forms.Button()
        Me.Panel8 = New System.Windows.Forms.Panel()
        Me.GroupBox2 = New System.Windows.Forms.GroupBox()
        Me.Button10 = New System.Windows.Forms.Button()
        Me.ProgressBar1 = New System.Windows.Forms.ProgressBar()
        Me.Button11 = New System.Windows.Forms.Button()
        Me.duizhong = New System.Windows.Forms.Button()
        Me.Button12 = New System.Windows.Forms.Button()
        Me.duizhong1 = New System.Windows.Forms.Button()
        Me.Button13 = New System.Windows.Forms.Button()
        Me.duizhong2 = New System.Windows.Forms.Button()
        Me.duizhong3 = New System.Windows.Forms.Button()
        Me.Button25 = New System.Windows.Forms.Button()
        Me.Button22 = New System.Windows.Forms.Button()
        Me.Timerheart = New System.Windows.Forms.Timer(Me.components)
        Me.ListLog = New System.Windows.Forms.RichTextBox()
        Me.GroupBox3 = New System.Windows.Forms.GroupBox()
        Me.starthome = New System.Windows.Forms.Button()
        Me.GroupBox4 = New System.Windows.Forms.GroupBox()
        Me.Button5 = New System.Windows.Forms.Button()
        Me.TextBox2 = New System.Windows.Forms.TextBox()
        Me.Label2 = New System.Windows.Forms.Label()
        Me.Button4 = New System.Windows.Forms.Button()
        Me.手动 = New System.Windows.Forms.GroupBox()
        Me.Button2 = New System.Windows.Forms.Button()
        Me.TextBox1 = New System.Windows.Forms.TextBox()
        Me.Label17 = New System.Windows.Forms.Label()
        Me.Button3 = New System.Windows.Forms.Button()
        Me.Button19 = New System.Windows.Forms.Button()
        Me.Button18 = New System.Windows.Forms.Button()
        Me.Button17 = New System.Windows.Forms.Button()
        Me.Button16 = New System.Windows.Forms.Button()
        Me.startqz = New System.Windows.Forms.Button()
        Me.s6 = New System.Windows.Forms.Button()
        Me.s5 = New System.Windows.Forms.Button()
        Me.s4 = New System.Windows.Forms.Button()
        Me.s3 = New System.Windows.Forms.Button()
        Me.s2 = New System.Windows.Forms.Button()
        Me.s1 = New System.Windows.Forms.Button()
        Me.startrv = New System.Windows.Forms.Button()
        Me.qset = New System.Windows.Forms.Button()
        Me.QA6 = New System.Windows.Forms.TextBox()
        Me.QA5 = New System.Windows.Forms.TextBox()
        Me.QA4 = New System.Windows.Forms.TextBox()
        Me.QA3 = New System.Windows.Forms.TextBox()
        Me.QA2 = New System.Windows.Forms.TextBox()
        Me.QA1 = New System.Windows.Forms.TextBox()
        Me.Label10 = New System.Windows.Forms.Label()
        Me.Label9 = New System.Windows.Forms.Label()
        Me.Label8 = New System.Windows.Forms.Label()
        Me.Label7 = New System.Windows.Forms.Label()
        Me.Label6 = New System.Windows.Forms.Label()
        Me.Label5 = New System.Windows.Forms.Label()
        Me.GroupBox5 = New System.Windows.Forms.GroupBox()
        Me.RadioButton8 = New System.Windows.Forms.RadioButton()
        Me.Label13 = New System.Windows.Forms.Label()
        Me.RadioButton9 = New System.Windows.Forms.RadioButton()
        Me.Label12 = New System.Windows.Forms.Label()
        Me.RadioButton10 = New System.Windows.Forms.RadioButton()
        Me.TextBox4 = New System.Windows.Forms.TextBox()
        Me.RadioButton11 = New System.Windows.Forms.RadioButton()
        Me.TextBox3 = New System.Windows.Forms.TextBox()
        Me.RadioButton12 = New System.Windows.Forms.RadioButton()
        Me.RadioButton4 = New System.Windows.Forms.RadioButton()
        Me.RadioButton13 = New System.Windows.Forms.RadioButton()
        Me.RadioButton1 = New System.Windows.Forms.RadioButton()
        Me.RadioButton7 = New System.Windows.Forms.RadioButton()
        Me.RadioButton2 = New System.Windows.Forms.RadioButton()
        Me.RadioButton6 = New System.Windows.Forms.RadioButton()
        Me.RadioButton3 = New System.Windows.Forms.RadioButton()
        Me.RadioButton5 = New System.Windows.Forms.RadioButton()
        Me.wqselect = New System.Windows.Forms.Button()
        Me.qsselect = New System.Windows.Forms.Button()
        Me.GroupBox1 = New System.Windows.Forms.GroupBox()
        Me.Button_Open = New System.Windows.Forms.Button()
        Me.Button1 = New System.Windows.Forms.Button()
        Me.Button_Close = New System.Windows.Forms.Button()
        Me.Timer1 = New System.Windows.Forms.Timer(Me.components)
        Me.Timersned = New System.Windows.Forms.Timer(Me.components)
        Me.PictureBox1 = New System.Windows.Forms.PictureBox()
        Me.PictureBox2 = New System.Windows.Forms.PictureBox()
        Me.wzq = New System.Windows.Forms.TextBox()
        Me.wyq = New System.Windows.Forms.TextBox()
        Me.wzh = New System.Windows.Forms.TextBox()
        Me.wyh = New System.Windows.Forms.TextBox()
        Me.Label3 = New System.Windows.Forms.Label()
        Me.Label11 = New System.Windows.Forms.Label()
        Me.Button6 = New System.Windows.Forms.Button()
        Me.Button7 = New System.Windows.Forms.Button()
        Me.Button8 = New System.Windows.Forms.Button()
        Me.Button9 = New System.Windows.Forms.Button()
        Me.Panel4 = New System.Windows.Forms.Panel()
        Me.Label14 = New System.Windows.Forms.Label()
        Me.Panel5 = New System.Windows.Forms.Panel()
        Me.Label15 = New System.Windows.Forms.Label()
        Me.stepjog = New System.Windows.Forms.TextBox()
        Me.Panel6 = New System.Windows.Forms.Panel()
        Me.Label16 = New System.Windows.Forms.Label()
        Me.Panel8.SuspendLayout()
        Me.GroupBox2.SuspendLayout()
        Me.GroupBox3.SuspendLayout()
        Me.GroupBox4.SuspendLayout()
        Me.手动.SuspendLayout()
        Me.GroupBox5.SuspendLayout()
        Me.GroupBox1.SuspendLayout()
        CType(Me.PictureBox1, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.PictureBox2, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.Panel4.SuspendLayout()
        Me.Panel5.SuspendLayout()
        Me.Panel6.SuspendLayout()
        Me.SuspendLayout()
        '
        'CMDSend
        '
        Me.CMDSend.Enabled = False
        Me.CMDSend.Font = New System.Drawing.Font("宋体", 7.5!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.CMDSend.Location = New System.Drawing.Point(2, 157)
        Me.CMDSend.Name = "CMDSend"
        Me.CMDSend.Size = New System.Drawing.Size(365, 19)
        Me.CMDSend.TabIndex = 1
        '
        'Label4
        '
        Me.Label4.AutoSize = True
        Me.Label4.Font = New System.Drawing.Font("宋体", 26.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label4.ForeColor = System.Drawing.Color.DarkGreen
        Me.Label4.Location = New System.Drawing.Point(36, 259)
        Me.Label4.Name = "Label4"
        Me.Label4.Size = New System.Drawing.Size(231, 35)
        Me.Label4.TabIndex = 45
        Me.Label4.Text = "选择测量单元"
        '
        'qyh
        '
        Me.qyh.Location = New System.Drawing.Point(440, 714)
        Me.qyh.Name = "qyh"
        Me.qyh.Size = New System.Drawing.Size(89, 21)
        Me.qyh.TabIndex = 44
        Me.qyh.TextAlign = System.Windows.Forms.HorizontalAlignment.Center
        '
        'qzh
        '
        Me.qzh.Location = New System.Drawing.Point(325, 714)
        Me.qzh.Name = "qzh"
        Me.qzh.Size = New System.Drawing.Size(89, 21)
        Me.qzh.TabIndex = 43
        Me.qzh.TextAlign = System.Windows.Forms.HorizontalAlignment.Center
        '
        'qyq
        '
        Me.qyq.Location = New System.Drawing.Point(440, 319)
        Me.qyq.Name = "qyq"
        Me.qyq.Size = New System.Drawing.Size(89, 21)
        Me.qyq.TabIndex = 42
        Me.qyq.TextAlign = System.Windows.Forms.HorizontalAlignment.Center
        '
        'qzq
        '
        Me.qzq.Location = New System.Drawing.Point(325, 319)
        Me.qzq.Name = "qzq"
        Me.qzq.Size = New System.Drawing.Size(89, 21)
        Me.qzq.TabIndex = 41
        Me.qzq.TextAlign = System.Windows.Forms.HorizontalAlignment.Center
        '
        'qlinkh
        '
        Me.qlinkh.BackColor = System.Drawing.SystemColors.HotTrack
        Me.qlinkh.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.qlinkh.Location = New System.Drawing.Point(118, 647)
        Me.qlinkh.Name = "qlinkh"
        Me.qlinkh.Size = New System.Drawing.Size(75, 44)
        Me.qlinkh.TabIndex = 40
        Me.qlinkh.Text = "联动"
        Me.qlinkh.UseVisualStyleBackColor = False
        '
        'qlinkq
        '
        Me.qlinkq.BackColor = System.Drawing.SystemColors.HotTrack
        Me.qlinkq.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.qlinkq.Location = New System.Drawing.Point(118, 384)
        Me.qlinkq.Name = "qlinkq"
        Me.qlinkq.Size = New System.Drawing.Size(75, 44)
        Me.qlinkq.TabIndex = 39
        Me.qlinkq.Text = "联动"
        Me.qlinkq.UseVisualStyleBackColor = False
        '
        'Panel3
        '
        Me.Panel3.BackColor = System.Drawing.SystemColors.ActiveCaptionText
        Me.Panel3.Location = New System.Drawing.Point(147, 424)
        Me.Panel3.Name = "Panel3"
        Me.Panel3.Size = New System.Drawing.Size(12, 235)
        Me.Panel3.TabIndex = 38
        '
        'Panel2
        '
        Me.Panel2.BackColor = System.Drawing.SystemColors.ActiveCaptionText
        Me.Panel2.Location = New System.Drawing.Point(63, 690)
        Me.Panel2.Name = "Panel2"
        Me.Panel2.Size = New System.Drawing.Size(191, 10)
        Me.Panel2.TabIndex = 37
        '
        'Panel1
        '
        Me.Panel1.BackColor = System.Drawing.SystemColors.ActiveCaptionText
        Me.Panel1.Location = New System.Drawing.Point(63, 381)
        Me.Panel1.Name = "Panel1"
        Me.Panel1.Size = New System.Drawing.Size(191, 10)
        Me.Panel1.TabIndex = 36
        '
        'qyhbt
        '
        Me.qyhbt.BackColor = System.Drawing.SystemColors.MenuHighlight
        Me.qyhbt.Font = New System.Drawing.Font("宋体", 15.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.qyhbt.Location = New System.Drawing.Point(251, 647)
        Me.qyhbt.Name = "qyhbt"
        Me.qyhbt.Size = New System.Drawing.Size(46, 88)
        Me.qyhbt.TabIndex = 34
        Me.qyhbt.Text = "右后轮"
        Me.qyhbt.UseVisualStyleBackColor = False
        '
        'qzhbt
        '
        Me.qzhbt.BackColor = System.Drawing.SystemColors.MenuHighlight
        Me.qzhbt.Font = New System.Drawing.Font("宋体", 15.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.qzhbt.Location = New System.Drawing.Point(22, 647)
        Me.qzhbt.Name = "qzhbt"
        Me.qzhbt.Size = New System.Drawing.Size(46, 88)
        Me.qzhbt.TabIndex = 33
        Me.qzhbt.Text = "左后轮"
        Me.qzhbt.UseVisualStyleBackColor = False
        '
        'qyqbt
        '
        Me.qyqbt.BackColor = System.Drawing.SystemColors.MenuHighlight
        Me.qyqbt.Font = New System.Drawing.Font("宋体", 15.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.qyqbt.Location = New System.Drawing.Point(252, 340)
        Me.qyqbt.Name = "qyqbt"
        Me.qyqbt.Size = New System.Drawing.Size(46, 88)
        Me.qyqbt.TabIndex = 32
        Me.qyqbt.Text = "右前轮"
        Me.qyqbt.UseVisualStyleBackColor = False
        '
        'qzqbt
        '
        Me.qzqbt.BackColor = System.Drawing.SystemColors.MenuHighlight
        Me.qzqbt.Font = New System.Drawing.Font("宋体", 15.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.qzqbt.Location = New System.Drawing.Point(22, 340)
        Me.qzqbt.Name = "qzqbt"
        Me.qzqbt.Size = New System.Drawing.Size(46, 88)
        Me.qzqbt.TabIndex = 31
        Me.qzqbt.Text = "左前轮"
        Me.qzqbt.UseVisualStyleBackColor = False
        '
        'Label1
        '
        Me.Label1.AutoSize = True
        Me.Label1.Font = New System.Drawing.Font("宋体", 15.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label1.ForeColor = System.Drawing.Color.DarkGreen
        Me.Label1.Location = New System.Drawing.Point(774, 204)
        Me.Label1.Name = "Label1"
        Me.Label1.Size = New System.Drawing.Size(219, 20)
        Me.Label1.TabIndex = 66
        Me.Label1.Text = "前束/外倾角/主销 控制"
        '
        'Heart
        '
        Me.Heart.BackColor = System.Drawing.Color.Crimson
        Me.Heart.ImageAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.Heart.Location = New System.Drawing.Point(56, 24)
        Me.Heart.Name = "Heart"
        Me.Heart.Size = New System.Drawing.Size(42, 29)
        Me.Heart.TabIndex = 64
        Me.Heart.Text = "LINK"
        Me.Heart.UseVisualStyleBackColor = False
        '
        'Panel8
        '
        Me.Panel8.Controls.Add(Me.GroupBox2)
        Me.Panel8.Location = New System.Drawing.Point(398, 3)
        Me.Panel8.Name = "Panel8"
        Me.Panel8.Size = New System.Drawing.Size(219, 181)
        Me.Panel8.TabIndex = 63
        '
        'GroupBox2
        '
        Me.GroupBox2.Controls.Add(Me.Button10)
        Me.GroupBox2.Controls.Add(Me.ProgressBar1)
        Me.GroupBox2.Controls.Add(Me.Button11)
        Me.GroupBox2.Controls.Add(Me.duizhong)
        Me.GroupBox2.Controls.Add(Me.Button12)
        Me.GroupBox2.Controls.Add(Me.duizhong1)
        Me.GroupBox2.Controls.Add(Me.Button13)
        Me.GroupBox2.Controls.Add(Me.duizhong2)
        Me.GroupBox2.Controls.Add(Me.duizhong3)
        Me.GroupBox2.Controls.Add(Me.Heart)
        Me.GroupBox2.Controls.Add(Me.Button25)
        Me.GroupBox2.Location = New System.Drawing.Point(0, 0)
        Me.GroupBox2.Name = "GroupBox2"
        Me.GroupBox2.Size = New System.Drawing.Size(214, 150)
        Me.GroupBox2.TabIndex = 69
        Me.GroupBox2.TabStop = False
        Me.GroupBox2.Text = "State"
        '
        'Button10
        '
        Me.Button10.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Button10.ImageAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.Button10.Location = New System.Drawing.Point(6, 105)
        Me.Button10.Name = "Button10"
        Me.Button10.Size = New System.Drawing.Size(42, 29)
        Me.Button10.TabIndex = 120
        Me.Button10.Text = "O1"
        Me.Button10.UseVisualStyleBackColor = True
        '
        'ProgressBar1
        '
        Me.ProgressBar1.Location = New System.Drawing.Point(104, 24)
        Me.ProgressBar1.Maximum = 60
        Me.ProgressBar1.Name = "ProgressBar1"
        Me.ProgressBar1.Size = New System.Drawing.Size(100, 29)
        Me.ProgressBar1.Step = 1
        Me.ProgressBar1.Style = System.Windows.Forms.ProgressBarStyle.Continuous
        Me.ProgressBar1.TabIndex = 73
        '
        'Button11
        '
        Me.Button11.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Button11.ImageAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.Button11.Location = New System.Drawing.Point(56, 105)
        Me.Button11.Name = "Button11"
        Me.Button11.Size = New System.Drawing.Size(42, 29)
        Me.Button11.TabIndex = 121
        Me.Button11.Text = "O2"
        Me.Button11.UseVisualStyleBackColor = True
        '
        'duizhong
        '
        Me.duizhong.ForeColor = System.Drawing.SystemColors.ControlText
        Me.duizhong.ImageAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.duizhong.Location = New System.Drawing.Point(6, 65)
        Me.duizhong.Name = "duizhong"
        Me.duizhong.Size = New System.Drawing.Size(42, 29)
        Me.duizhong.TabIndex = 72
        Me.duizhong.Text = "pos1"
        Me.duizhong.UseVisualStyleBackColor = True
        '
        'Button12
        '
        Me.Button12.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Button12.ImageAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.Button12.Location = New System.Drawing.Point(104, 105)
        Me.Button12.Name = "Button12"
        Me.Button12.Size = New System.Drawing.Size(42, 29)
        Me.Button12.TabIndex = 122
        Me.Button12.Text = "O3"
        Me.Button12.UseVisualStyleBackColor = True
        '
        'duizhong1
        '
        Me.duizhong1.ForeColor = System.Drawing.SystemColors.ControlText
        Me.duizhong1.ImageAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.duizhong1.Location = New System.Drawing.Point(56, 65)
        Me.duizhong1.Name = "duizhong1"
        Me.duizhong1.Size = New System.Drawing.Size(42, 29)
        Me.duizhong1.TabIndex = 73
        Me.duizhong1.Text = "pos2"
        Me.duizhong1.UseVisualStyleBackColor = True
        '
        'Button13
        '
        Me.Button13.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Button13.ImageAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.Button13.Location = New System.Drawing.Point(152, 105)
        Me.Button13.Name = "Button13"
        Me.Button13.Size = New System.Drawing.Size(42, 29)
        Me.Button13.TabIndex = 123
        Me.Button13.Text = "O4"
        Me.Button13.UseVisualStyleBackColor = True
        '
        'duizhong2
        '
        Me.duizhong2.ForeColor = System.Drawing.SystemColors.ControlText
        Me.duizhong2.ImageAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.duizhong2.Location = New System.Drawing.Point(104, 65)
        Me.duizhong2.Name = "duizhong2"
        Me.duizhong2.Size = New System.Drawing.Size(42, 29)
        Me.duizhong2.TabIndex = 74
        Me.duizhong2.Text = "pos3"
        Me.duizhong2.UseVisualStyleBackColor = True
        '
        'duizhong3
        '
        Me.duizhong3.ForeColor = System.Drawing.SystemColors.ControlText
        Me.duizhong3.ImageAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.duizhong3.Location = New System.Drawing.Point(152, 65)
        Me.duizhong3.Name = "duizhong3"
        Me.duizhong3.Size = New System.Drawing.Size(42, 29)
        Me.duizhong3.TabIndex = 75
        Me.duizhong3.Text = "pos4"
        Me.duizhong3.UseVisualStyleBackColor = True
        '
        'Button25
        '
        Me.Button25.ForeColor = System.Drawing.SystemColors.ControlText
        Me.Button25.ImageAlign = System.Drawing.ContentAlignment.MiddleRight
        Me.Button25.Location = New System.Drawing.Point(6, 24)
        Me.Button25.Name = "Button25"
        Me.Button25.Size = New System.Drawing.Size(42, 29)
        Me.Button25.TabIndex = 71
        Me.Button25.Text = "BUSY"
        Me.Button25.UseVisualStyleBackColor = True
        '
        'Button22
        '
        Me.Button22.Location = New System.Drawing.Point(-4, 187)
        Me.Button22.Name = "Button22"
        Me.Button22.Size = New System.Drawing.Size(1269, 14)
        Me.Button22.TabIndex = 69
        Me.Button22.UseVisualStyleBackColor = True
        '
        'Timerheart
        '
        Me.Timerheart.Interval = 1000
        '
        'ListLog
        '
        Me.ListLog.Location = New System.Drawing.Point(634, 3)
        Me.ListLog.Name = "ListLog"
        Me.ListLog.ReadOnly = True
        Me.ListLog.Size = New System.Drawing.Size(631, 46)
        Me.ListLog.TabIndex = 70
        Me.ListLog.Text = ""
        Me.ListLog.WordWrap = False
        '
        'GroupBox3
        '
        Me.GroupBox3.Controls.Add(Me.starthome)
        Me.GroupBox3.Controls.Add(Me.GroupBox4)
        Me.GroupBox3.Controls.Add(Me.Button4)
        Me.GroupBox3.Controls.Add(Me.手动)
        Me.GroupBox3.Controls.Add(Me.Button3)
        Me.GroupBox3.Controls.Add(Me.Button19)
        Me.GroupBox3.Controls.Add(Me.Button18)
        Me.GroupBox3.Controls.Add(Me.Button17)
        Me.GroupBox3.Controls.Add(Me.Button16)
        Me.GroupBox3.Controls.Add(Me.startqz)
        Me.GroupBox3.Controls.Add(Me.s6)
        Me.GroupBox3.Controls.Add(Me.s5)
        Me.GroupBox3.Controls.Add(Me.s4)
        Me.GroupBox3.Controls.Add(Me.s3)
        Me.GroupBox3.Controls.Add(Me.s2)
        Me.GroupBox3.Controls.Add(Me.s1)
        Me.GroupBox3.Controls.Add(Me.startrv)
        Me.GroupBox3.Controls.Add(Me.qset)
        Me.GroupBox3.Controls.Add(Me.QA6)
        Me.GroupBox3.Controls.Add(Me.QA5)
        Me.GroupBox3.Controls.Add(Me.QA4)
        Me.GroupBox3.Controls.Add(Me.QA3)
        Me.GroupBox3.Controls.Add(Me.QA2)
        Me.GroupBox3.Controls.Add(Me.QA1)
        Me.GroupBox3.Controls.Add(Me.Label10)
        Me.GroupBox3.Controls.Add(Me.Label9)
        Me.GroupBox3.Controls.Add(Me.Label8)
        Me.GroupBox3.Controls.Add(Me.Label7)
        Me.GroupBox3.Controls.Add(Me.Label6)
        Me.GroupBox3.Controls.Add(Me.Label5)
        Me.GroupBox3.Controls.Add(Me.GroupBox5)
        Me.GroupBox3.Location = New System.Drawing.Point(774, 223)
        Me.GroupBox3.Name = "GroupBox3"
        Me.GroupBox3.Size = New System.Drawing.Size(483, 512)
        Me.GroupBox3.TabIndex = 70
        Me.GroupBox3.TabStop = False
        '
        'starthome
        '
        Me.starthome.Location = New System.Drawing.Point(348, 269)
        Me.starthome.Name = "starthome"
        Me.starthome.Size = New System.Drawing.Size(100, 99)
        Me.starthome.TabIndex = 97
        Me.starthome.Text = "HOMESTART"
        Me.starthome.UseVisualStyleBackColor = True
        '
        'GroupBox4
        '
        Me.GroupBox4.Controls.Add(Me.Button5)
        Me.GroupBox4.Controls.Add(Me.TextBox2)
        Me.GroupBox4.Controls.Add(Me.Label2)
        Me.GroupBox4.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.GroupBox4.ForeColor = System.Drawing.Color.DarkGreen
        Me.GroupBox4.Location = New System.Drawing.Point(240, 135)
        Me.GroupBox4.Name = "GroupBox4"
        Me.GroupBox4.Size = New System.Drawing.Size(214, 115)
        Me.GroupBox4.TabIndex = 97
        Me.GroupBox4.TabStop = False
        Me.GroupBox4.Text = "外倾手动"
        '
        'Button5
        '
        Me.Button5.Location = New System.Drawing.Point(109, 70)
        Me.Button5.Name = "Button5"
        Me.Button5.Size = New System.Drawing.Size(105, 42)
        Me.Button5.TabIndex = 86
        Me.Button5.Text = "启动"
        Me.Button5.UseVisualStyleBackColor = True
        '
        'TextBox2
        '
        Me.TextBox2.Font = New System.Drawing.Font("宋体", 18.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.TextBox2.Location = New System.Drawing.Point(103, 13)
        Me.TextBox2.Name = "TextBox2"
        Me.TextBox2.Size = New System.Drawing.Size(105, 35)
        Me.TextBox2.TabIndex = 87
        '
        'Label2
        '
        Me.Label2.AutoSize = True
        Me.Label2.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label2.Location = New System.Drawing.Point(6, 23)
        Me.Label2.Name = "Label2"
        Me.Label2.Size = New System.Drawing.Size(80, 16)
        Me.Label2.TabIndex = 86
        Me.Label2.Text = "设置角度:"
        '
        'Button4
        '
        Me.Button4.Location = New System.Drawing.Point(240, 339)
        Me.Button4.Name = "Button4"
        Me.Button4.Size = New System.Drawing.Size(77, 29)
        Me.Button4.TabIndex = 87
        Me.Button4.Text = "停止回测"
        Me.Button4.UseVisualStyleBackColor = True
        '
        '手动
        '
        Me.手动.Controls.Add(Me.Button2)
        Me.手动.Controls.Add(Me.TextBox1)
        Me.手动.Controls.Add(Me.Label17)
        Me.手动.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.手动.ForeColor = System.Drawing.Color.DarkGreen
        Me.手动.Location = New System.Drawing.Point(240, 12)
        Me.手动.Name = "手动"
        Me.手动.Size = New System.Drawing.Size(214, 112)
        Me.手动.TabIndex = 96
        Me.手动.TabStop = False
        Me.手动.Text = "前束手动"
        '
        'Button2
        '
        Me.Button2.Location = New System.Drawing.Point(114, 68)
        Me.Button2.Name = "Button2"
        Me.Button2.Size = New System.Drawing.Size(100, 41)
        Me.Button2.TabIndex = 86
        Me.Button2.Text = "启动"
        Me.Button2.UseVisualStyleBackColor = True
        '
        'TextBox1
        '
        Me.TextBox1.Font = New System.Drawing.Font("宋体", 18.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.TextBox1.Location = New System.Drawing.Point(105, 13)
        Me.TextBox1.Name = "TextBox1"
        Me.TextBox1.Size = New System.Drawing.Size(100, 35)
        Me.TextBox1.TabIndex = 87
        '
        'Label17
        '
        Me.Label17.AutoSize = True
        Me.Label17.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label17.Location = New System.Drawing.Point(6, 23)
        Me.Label17.Name = "Label17"
        Me.Label17.Size = New System.Drawing.Size(80, 16)
        Me.Label17.TabIndex = 86
        Me.Label17.Text = "设置角度:"
        '
        'Button3
        '
        Me.Button3.Location = New System.Drawing.Point(240, 304)
        Me.Button3.Name = "Button3"
        Me.Button3.Size = New System.Drawing.Size(77, 29)
        Me.Button3.TabIndex = 86
        Me.Button3.Text = "停止正测"
        Me.Button3.UseVisualStyleBackColor = True
        '
        'Button19
        '
        Me.Button19.Location = New System.Drawing.Point(240, 269)
        Me.Button19.Name = "Button19"
        Me.Button19.Size = New System.Drawing.Size(77, 29)
        Me.Button19.TabIndex = 84
        Me.Button19.Text = "置零"
        Me.Button19.UseVisualStyleBackColor = True
        '
        'Button18
        '
        Me.Button18.Location = New System.Drawing.Point(130, 269)
        Me.Button18.Name = "Button18"
        Me.Button18.Size = New System.Drawing.Size(77, 29)
        Me.Button18.TabIndex = 83
        Me.Button18.Text = "回零"
        Me.Button18.UseVisualStyleBackColor = True
        '
        'Button17
        '
        Me.Button17.Location = New System.Drawing.Point(130, 339)
        Me.Button17.Name = "Button17"
        Me.Button17.Size = New System.Drawing.Size(77, 29)
        Me.Button17.TabIndex = 82
        Me.Button17.Text = "跳过"
        Me.Button17.UseVisualStyleBackColor = True
        '
        'Button16
        '
        Me.Button16.Location = New System.Drawing.Point(130, 304)
        Me.Button16.Name = "Button16"
        Me.Button16.Size = New System.Drawing.Size(77, 29)
        Me.Button16.TabIndex = 81
        Me.Button16.Text = "跳过"
        Me.Button16.UseVisualStyleBackColor = True
        '
        'startqz
        '
        Me.startqz.Location = New System.Drawing.Point(23, 304)
        Me.startqz.Name = "startqz"
        Me.startqz.Size = New System.Drawing.Size(77, 29)
        Me.startqz.TabIndex = 80
        Me.startqz.Text = "启动正测"
        Me.startqz.UseVisualStyleBackColor = True
        '
        's6
        '
        Me.s6.Location = New System.Drawing.Point(58, 229)
        Me.s6.Name = "s6"
        Me.s6.Size = New System.Drawing.Size(20, 16)
        Me.s6.TabIndex = 79
        Me.s6.UseVisualStyleBackColor = True
        '
        's5
        '
        Me.s5.Location = New System.Drawing.Point(58, 192)
        Me.s5.Name = "s5"
        Me.s5.Size = New System.Drawing.Size(20, 16)
        Me.s5.TabIndex = 79
        Me.s5.UseVisualStyleBackColor = True
        '
        's4
        '
        Me.s4.Location = New System.Drawing.Point(58, 149)
        Me.s4.Name = "s4"
        Me.s4.Size = New System.Drawing.Size(20, 16)
        Me.s4.TabIndex = 79
        Me.s4.UseVisualStyleBackColor = True
        '
        's3
        '
        Me.s3.Location = New System.Drawing.Point(58, 101)
        Me.s3.Name = "s3"
        Me.s3.Size = New System.Drawing.Size(20, 16)
        Me.s3.TabIndex = 78
        Me.s3.UseVisualStyleBackColor = True
        '
        's2
        '
        Me.s2.Location = New System.Drawing.Point(58, 58)
        Me.s2.Name = "s2"
        Me.s2.Size = New System.Drawing.Size(20, 16)
        Me.s2.TabIndex = 77
        Me.s2.UseVisualStyleBackColor = True
        '
        's1
        '
        Me.s1.Location = New System.Drawing.Point(58, 19)
        Me.s1.Name = "s1"
        Me.s1.Size = New System.Drawing.Size(20, 16)
        Me.s1.TabIndex = 76
        Me.s1.UseVisualStyleBackColor = True
        '
        'startrv
        '
        Me.startrv.Location = New System.Drawing.Point(23, 339)
        Me.startrv.Name = "startrv"
        Me.startrv.Size = New System.Drawing.Size(77, 29)
        Me.startrv.TabIndex = 72
        Me.startrv.Text = "启动回测"
        Me.startrv.UseVisualStyleBackColor = True
        '
        'qset
        '
        Me.qset.Location = New System.Drawing.Point(23, 269)
        Me.qset.Name = "qset"
        Me.qset.Size = New System.Drawing.Size(77, 29)
        Me.qset.TabIndex = 65
        Me.qset.Text = "设置"
        Me.qset.UseVisualStyleBackColor = True
        '
        'QA6
        '
        Me.QA6.Location = New System.Drawing.Point(88, 224)
        Me.QA6.Name = "QA6"
        Me.QA6.Size = New System.Drawing.Size(89, 21)
        Me.QA6.TabIndex = 75
        '
        'QA5
        '
        Me.QA5.Location = New System.Drawing.Point(88, 187)
        Me.QA5.Name = "QA5"
        Me.QA5.Size = New System.Drawing.Size(89, 21)
        Me.QA5.TabIndex = 74
        '
        'QA4
        '
        Me.QA4.Location = New System.Drawing.Point(88, 144)
        Me.QA4.Name = "QA4"
        Me.QA4.Size = New System.Drawing.Size(89, 21)
        Me.QA4.TabIndex = 73
        '
        'QA3
        '
        Me.QA3.Location = New System.Drawing.Point(88, 96)
        Me.QA3.Name = "QA3"
        Me.QA3.Size = New System.Drawing.Size(89, 21)
        Me.QA3.TabIndex = 72
        '
        'QA2
        '
        Me.QA2.Location = New System.Drawing.Point(88, 53)
        Me.QA2.Name = "QA2"
        Me.QA2.Size = New System.Drawing.Size(89, 21)
        Me.QA2.TabIndex = 71
        '
        'QA1
        '
        Me.QA1.Location = New System.Drawing.Point(88, 12)
        Me.QA1.Name = "QA1"
        Me.QA1.Size = New System.Drawing.Size(89, 21)
        Me.QA1.TabIndex = 70
        '
        'Label10
        '
        Me.Label10.AutoSize = True
        Me.Label10.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label10.Location = New System.Drawing.Point(20, 229)
        Me.Label10.Name = "Label10"
        Me.Label10.Size = New System.Drawing.Size(32, 16)
        Me.Label10.TabIndex = 5
        Me.Label10.Text = "A6:"
        '
        'Label9
        '
        Me.Label9.AutoSize = True
        Me.Label9.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label9.Location = New System.Drawing.Point(20, 192)
        Me.Label9.Name = "Label9"
        Me.Label9.Size = New System.Drawing.Size(32, 16)
        Me.Label9.TabIndex = 4
        Me.Label9.Text = "A5:"
        '
        'Label8
        '
        Me.Label8.AutoSize = True
        Me.Label8.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label8.Location = New System.Drawing.Point(20, 149)
        Me.Label8.Name = "Label8"
        Me.Label8.Size = New System.Drawing.Size(32, 16)
        Me.Label8.TabIndex = 3
        Me.Label8.Text = "A4:"
        '
        'Label7
        '
        Me.Label7.AutoSize = True
        Me.Label7.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label7.Location = New System.Drawing.Point(20, 101)
        Me.Label7.Name = "Label7"
        Me.Label7.Size = New System.Drawing.Size(32, 16)
        Me.Label7.TabIndex = 2
        Me.Label7.Text = "A3:"
        '
        'Label6
        '
        Me.Label6.AutoSize = True
        Me.Label6.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label6.Location = New System.Drawing.Point(20, 58)
        Me.Label6.Name = "Label6"
        Me.Label6.Size = New System.Drawing.Size(32, 16)
        Me.Label6.TabIndex = 1
        Me.Label6.Text = "A2:"
        '
        'Label5
        '
        Me.Label5.AutoSize = True
        Me.Label5.Font = New System.Drawing.Font("宋体", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label5.Location = New System.Drawing.Point(20, 17)
        Me.Label5.Name = "Label5"
        Me.Label5.Size = New System.Drawing.Size(32, 16)
        Me.Label5.TabIndex = 0
        Me.Label5.Text = "A1:"
        '
        'GroupBox5
        '
        Me.GroupBox5.Controls.Add(Me.RadioButton8)
        Me.GroupBox5.Controls.Add(Me.Label13)
        Me.GroupBox5.Controls.Add(Me.RadioButton9)
        Me.GroupBox5.Controls.Add(Me.Label12)
        Me.GroupBox5.Controls.Add(Me.RadioButton10)
        Me.GroupBox5.Controls.Add(Me.TextBox4)
        Me.GroupBox5.Controls.Add(Me.RadioButton11)
        Me.GroupBox5.Controls.Add(Me.TextBox3)
        Me.GroupBox5.Controls.Add(Me.RadioButton12)
        Me.GroupBox5.Controls.Add(Me.RadioButton4)
        Me.GroupBox5.Controls.Add(Me.RadioButton13)
        Me.GroupBox5.Controls.Add(Me.RadioButton1)
        Me.GroupBox5.Controls.Add(Me.RadioButton7)
        Me.GroupBox5.Controls.Add(Me.RadioButton2)
        Me.GroupBox5.Controls.Add(Me.RadioButton6)
        Me.GroupBox5.Controls.Add(Me.RadioButton3)
        Me.GroupBox5.Controls.Add(Me.RadioButton5)
        Me.GroupBox5.Font = New System.Drawing.Font("宋体", 15.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.GroupBox5.ForeColor = System.Drawing.Color.ForestGreen
        Me.GroupBox5.Location = New System.Drawing.Point(23, 385)
        Me.GroupBox5.Name = "GroupBox5"
        Me.GroupBox5.Size = New System.Drawing.Size(454, 127)
        Me.GroupBox5.TabIndex = 119
        Me.GroupBox5.TabStop = False
        Me.GroupBox5.Text = "主销后倾角"
        '
        'RadioButton8
        '
        Me.RadioButton8.AutoSize = True
        Me.RadioButton8.Location = New System.Drawing.Point(277, 95)
        Me.RadioButton8.Name = "RadioButton8"
        Me.RadioButton8.Size = New System.Drawing.Size(50, 25)
        Me.RadioButton8.TabIndex = 129
        Me.RadioButton8.TabStop = True
        Me.RadioButton8.Text = "30"
        Me.RadioButton8.UseVisualStyleBackColor = True
        '
        'Label13
        '
        Me.Label13.AutoSize = True
        Me.Label13.Font = New System.Drawing.Font("宋体", 14.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label13.Location = New System.Drawing.Point(13, 95)
        Me.Label13.Name = "Label13"
        Me.Label13.Size = New System.Drawing.Size(19, 19)
        Me.Label13.TabIndex = 107
        Me.Label13.Text = "-"
        '
        'RadioButton9
        '
        Me.RadioButton9.AutoSize = True
        Me.RadioButton9.Location = New System.Drawing.Point(229, 95)
        Me.RadioButton9.Name = "RadioButton9"
        Me.RadioButton9.Size = New System.Drawing.Size(50, 25)
        Me.RadioButton9.TabIndex = 128
        Me.RadioButton9.TabStop = True
        Me.RadioButton9.Text = "25"
        Me.RadioButton9.UseVisualStyleBackColor = True
        '
        'Label12
        '
        Me.Label12.AutoSize = True
        Me.Label12.Font = New System.Drawing.Font("宋体", 14.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label12.Location = New System.Drawing.Point(13, 40)
        Me.Label12.Name = "Label12"
        Me.Label12.Size = New System.Drawing.Size(19, 19)
        Me.Label12.TabIndex = 106
        Me.Label12.Text = "+"
        '
        'RadioButton10
        '
        Me.RadioButton10.AutoSize = True
        Me.RadioButton10.Location = New System.Drawing.Point(182, 95)
        Me.RadioButton10.Name = "RadioButton10"
        Me.RadioButton10.Size = New System.Drawing.Size(50, 25)
        Me.RadioButton10.TabIndex = 127
        Me.RadioButton10.TabStop = True
        Me.RadioButton10.Text = "20"
        Me.RadioButton10.UseVisualStyleBackColor = True
        '
        'TextBox4
        '
        Me.TextBox4.Location = New System.Drawing.Point(359, 93)
        Me.TextBox4.Name = "TextBox4"
        Me.TextBox4.Size = New System.Drawing.Size(89, 31)
        Me.TextBox4.TabIndex = 105
        '
        'RadioButton11
        '
        Me.RadioButton11.AutoSize = True
        Me.RadioButton11.Location = New System.Drawing.Point(130, 95)
        Me.RadioButton11.Name = "RadioButton11"
        Me.RadioButton11.Size = New System.Drawing.Size(50, 25)
        Me.RadioButton11.TabIndex = 126
        Me.RadioButton11.TabStop = True
        Me.RadioButton11.Text = "15"
        Me.RadioButton11.UseVisualStyleBackColor = True
        '
        'TextBox3
        '
        Me.TextBox3.Location = New System.Drawing.Point(359, 28)
        Me.TextBox3.Name = "TextBox3"
        Me.TextBox3.Size = New System.Drawing.Size(89, 31)
        Me.TextBox3.TabIndex = 104
        '
        'RadioButton12
        '
        Me.RadioButton12.AutoSize = True
        Me.RadioButton12.Location = New System.Drawing.Point(77, 95)
        Me.RadioButton12.Name = "RadioButton12"
        Me.RadioButton12.Size = New System.Drawing.Size(50, 25)
        Me.RadioButton12.TabIndex = 125
        Me.RadioButton12.TabStop = True
        Me.RadioButton12.Text = "10"
        Me.RadioButton12.UseVisualStyleBackColor = True
        '
        'RadioButton4
        '
        Me.RadioButton4.AutoSize = True
        Me.RadioButton4.Location = New System.Drawing.Point(130, 30)
        Me.RadioButton4.Name = "RadioButton4"
        Me.RadioButton4.Size = New System.Drawing.Size(50, 25)
        Me.RadioButton4.TabIndex = 120
        Me.RadioButton4.TabStop = True
        Me.RadioButton4.Text = "15"
        Me.RadioButton4.UseVisualStyleBackColor = True
        '
        'RadioButton13
        '
        Me.RadioButton13.AutoSize = True
        Me.RadioButton13.Location = New System.Drawing.Point(45, 95)
        Me.RadioButton13.Name = "RadioButton13"
        Me.RadioButton13.Size = New System.Drawing.Size(39, 25)
        Me.RadioButton13.TabIndex = 124
        Me.RadioButton13.TabStop = True
        Me.RadioButton13.Text = "5"
        Me.RadioButton13.UseVisualStyleBackColor = True
        '
        'RadioButton1
        '
        Me.RadioButton1.AutoSize = True
        Me.RadioButton1.Location = New System.Drawing.Point(45, 64)
        Me.RadioButton1.Name = "RadioButton1"
        Me.RadioButton1.Size = New System.Drawing.Size(39, 25)
        Me.RadioButton1.TabIndex = 117
        Me.RadioButton1.TabStop = True
        Me.RadioButton1.Text = "0"
        Me.RadioButton1.UseVisualStyleBackColor = True
        '
        'RadioButton7
        '
        Me.RadioButton7.AutoSize = True
        Me.RadioButton7.Location = New System.Drawing.Point(277, 30)
        Me.RadioButton7.Name = "RadioButton7"
        Me.RadioButton7.Size = New System.Drawing.Size(50, 25)
        Me.RadioButton7.TabIndex = 123
        Me.RadioButton7.TabStop = True
        Me.RadioButton7.Text = "30"
        Me.RadioButton7.UseVisualStyleBackColor = True
        '
        'RadioButton2
        '
        Me.RadioButton2.AutoSize = True
        Me.RadioButton2.Location = New System.Drawing.Point(45, 30)
        Me.RadioButton2.Name = "RadioButton2"
        Me.RadioButton2.Size = New System.Drawing.Size(39, 25)
        Me.RadioButton2.TabIndex = 118
        Me.RadioButton2.TabStop = True
        Me.RadioButton2.Text = "5"
        Me.RadioButton2.UseVisualStyleBackColor = True
        '
        'RadioButton6
        '
        Me.RadioButton6.AutoSize = True
        Me.RadioButton6.Location = New System.Drawing.Point(229, 30)
        Me.RadioButton6.Name = "RadioButton6"
        Me.RadioButton6.Size = New System.Drawing.Size(50, 25)
        Me.RadioButton6.TabIndex = 122
        Me.RadioButton6.TabStop = True
        Me.RadioButton6.Text = "25"
        Me.RadioButton6.UseVisualStyleBackColor = True
        '
        'RadioButton3
        '
        Me.RadioButton3.AutoSize = True
        Me.RadioButton3.Location = New System.Drawing.Point(85, 30)
        Me.RadioButton3.Name = "RadioButton3"
        Me.RadioButton3.Size = New System.Drawing.Size(50, 25)
        Me.RadioButton3.TabIndex = 119
        Me.RadioButton3.TabStop = True
        Me.RadioButton3.Text = "10"
        Me.RadioButton3.UseVisualStyleBackColor = True
        '
        'RadioButton5
        '
        Me.RadioButton5.AutoSize = True
        Me.RadioButton5.Location = New System.Drawing.Point(182, 30)
        Me.RadioButton5.Name = "RadioButton5"
        Me.RadioButton5.Size = New System.Drawing.Size(50, 25)
        Me.RadioButton5.TabIndex = 121
        Me.RadioButton5.TabStop = True
        Me.RadioButton5.Text = "20"
        Me.RadioButton5.UseVisualStyleBackColor = True
        '
        'wqselect
        '
        Me.wqselect.Location = New System.Drawing.Point(586, 204)
        Me.wqselect.Name = "wqselect"
        Me.wqselect.Size = New System.Drawing.Size(177, 48)
        Me.wqselect.TabIndex = 90
        Me.wqselect.Text = "选中外倾测量"
        Me.wqselect.UseVisualStyleBackColor = True
        '
        'qsselect
        '
        Me.qsselect.Location = New System.Drawing.Point(352, 204)
        Me.qsselect.Name = "qsselect"
        Me.qsselect.Size = New System.Drawing.Size(177, 48)
        Me.qsselect.TabIndex = 89
        Me.qsselect.Text = "选中前束测量"
        Me.qsselect.UseVisualStyleBackColor = True
        '
        'GroupBox1
        '
        Me.GroupBox1.Controls.Add(Me.Button_Open)
        Me.GroupBox1.Controls.Add(Me.Button1)
        Me.GroupBox1.Controls.Add(Me.Button_Close)
        Me.GroupBox1.Controls.Add(Me.CMDSend)
        Me.GroupBox1.Location = New System.Drawing.Point(3, 3)
        Me.GroupBox1.Name = "GroupBox1"
        Me.GroupBox1.Size = New System.Drawing.Size(373, 181)
        Me.GroupBox1.TabIndex = 68
        Me.GroupBox1.TabStop = False
        Me.GroupBox1.Text = "CONTROL"
        '
        'Button_Open
        '
        Me.Button_Open.Location = New System.Drawing.Point(6, 20)
        Me.Button_Open.Name = "Button_Open"
        Me.Button_Open.Size = New System.Drawing.Size(154, 73)
        Me.Button_Open.TabIndex = 6
        Me.Button_Open.Text = "连接控制系统"
        Me.Button_Open.UseVisualStyleBackColor = True
        '
        'Button1
        '
        Me.Button1.Location = New System.Drawing.Point(9, 110)
        Me.Button1.Name = "Button1"
        Me.Button1.Size = New System.Drawing.Size(147, 41)
        Me.Button1.TabIndex = 0
        Me.Button1.Text = "TEST使用"
        Me.Button1.UseVisualStyleBackColor = True
        '
        'Button_Close
        '
        Me.Button_Close.Location = New System.Drawing.Point(166, 20)
        Me.Button_Close.Name = "Button_Close"
        Me.Button_Close.Size = New System.Drawing.Size(150, 73)
        Me.Button_Close.TabIndex = 7
        Me.Button_Close.Text = "关闭系统"
        Me.Button_Close.UseVisualStyleBackColor = True
        '
        'Timer1
        '
        Me.Timer1.Interval = 20
        '
        'Timersned
        '
        Me.Timersned.Interval = 1000
        '
        'PictureBox1
        '
        Me.PictureBox1.Image = Global.TCPClient.My.Resources.Resources.底盘
        Me.PictureBox1.Location = New System.Drawing.Point(325, 337)
        Me.PictureBox1.Name = "PictureBox1"
        Me.PictureBox1.Size = New System.Drawing.Size(204, 378)
        Me.PictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage
        Me.PictureBox1.TabIndex = 71
        Me.PictureBox1.TabStop = False
        '
        'PictureBox2
        '
        Me.PictureBox2.Image = Global.TCPClient.My.Resources.Resources.底盘
        Me.PictureBox2.Location = New System.Drawing.Point(559, 340)
        Me.PictureBox2.Name = "PictureBox2"
        Me.PictureBox2.Size = New System.Drawing.Size(204, 378)
        Me.PictureBox2.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage
        Me.PictureBox2.TabIndex = 72
        Me.PictureBox2.TabStop = False
        '
        'wzq
        '
        Me.wzq.Location = New System.Drawing.Point(559, 319)
        Me.wzq.Name = "wzq"
        Me.wzq.Size = New System.Drawing.Size(89, 21)
        Me.wzq.TabIndex = 73
        Me.wzq.TextAlign = System.Windows.Forms.HorizontalAlignment.Center
        '
        'wyq
        '
        Me.wyq.Location = New System.Drawing.Point(674, 319)
        Me.wyq.Name = "wyq"
        Me.wyq.Size = New System.Drawing.Size(89, 21)
        Me.wyq.TabIndex = 74
        Me.wyq.TextAlign = System.Windows.Forms.HorizontalAlignment.Center
        '
        'wzh
        '
        Me.wzh.Location = New System.Drawing.Point(559, 714)
        Me.wzh.Name = "wzh"
        Me.wzh.Size = New System.Drawing.Size(89, 21)
        Me.wzh.TabIndex = 75
        Me.wzh.TextAlign = System.Windows.Forms.HorizontalAlignment.Center
        '
        'wyh
        '
        Me.wyh.Location = New System.Drawing.Point(674, 714)
        Me.wyh.Name = "wyh"
        Me.wyh.Size = New System.Drawing.Size(89, 21)
        Me.wyh.TabIndex = 76
        Me.wyh.TextAlign = System.Windows.Forms.HorizontalAlignment.Center
        '
        'Label3
        '
        Me.Label3.AutoSize = True
        Me.Label3.Font = New System.Drawing.Font("宋体", 26.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label3.ForeColor = System.Drawing.Color.DarkGreen
        Me.Label3.Location = New System.Drawing.Point(356, 259)
        Me.Label3.Name = "Label3"
        Me.Label3.Size = New System.Drawing.Size(159, 35)
        Me.Label3.TabIndex = 77
        Me.Label3.Text = "前束显示"
        '
        'Label11
        '
        Me.Label11.AutoSize = True
        Me.Label11.Font = New System.Drawing.Font("宋体", 26.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label11.ForeColor = System.Drawing.Color.DarkGreen
        Me.Label11.Location = New System.Drawing.Point(582, 259)
        Me.Label11.Name = "Label11"
        Me.Label11.Size = New System.Drawing.Size(159, 35)
        Me.Label11.TabIndex = 78
        Me.Label11.Text = "外倾显示"
        '
        'Button6
        '
        Me.Button6.Location = New System.Drawing.Point(3, 47)
        Me.Button6.Name = "Button6"
        Me.Button6.Size = New System.Drawing.Size(100, 52)
        Me.Button6.TabIndex = 88
        Me.Button6.Text = "JOG+"
        Me.Button6.UseVisualStyleBackColor = True
        '
        'Button7
        '
        Me.Button7.Location = New System.Drawing.Point(119, 47)
        Me.Button7.Name = "Button7"
        Me.Button7.Size = New System.Drawing.Size(100, 52)
        Me.Button7.TabIndex = 91
        Me.Button7.Text = "JOG-"
        Me.Button7.UseVisualStyleBackColor = True
        '
        'Button8
        '
        Me.Button8.Location = New System.Drawing.Point(100, 45)
        Me.Button8.Name = "Button8"
        Me.Button8.Size = New System.Drawing.Size(100, 52)
        Me.Button8.TabIndex = 92
        Me.Button8.Text = "JOG-"
        Me.Button8.UseVisualStyleBackColor = True
        '
        'Button9
        '
        Me.Button9.Location = New System.Drawing.Point(7, 45)
        Me.Button9.Name = "Button9"
        Me.Button9.Size = New System.Drawing.Size(100, 52)
        Me.Button9.TabIndex = 93
        Me.Button9.Text = "JOG+"
        Me.Button9.UseVisualStyleBackColor = True
        '
        'Panel4
        '
        Me.Panel4.Controls.Add(Me.Label14)
        Me.Panel4.Controls.Add(Me.Button7)
        Me.Panel4.Controls.Add(Me.Button6)
        Me.Panel4.Location = New System.Drawing.Point(811, 78)
        Me.Panel4.Name = "Panel4"
        Me.Panel4.Size = New System.Drawing.Size(223, 102)
        Me.Panel4.TabIndex = 94
        '
        'Label14
        '
        Me.Label14.AutoSize = True
        Me.Label14.Font = New System.Drawing.Font("宋体", 15.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label14.ForeColor = System.Drawing.Color.DarkGreen
        Me.Label14.Location = New System.Drawing.Point(4, 0)
        Me.Label14.Name = "Label14"
        Me.Label14.Size = New System.Drawing.Size(89, 20)
        Me.Label14.TabIndex = 96
        Me.Label14.Text = "前束点动"
        '
        'Panel5
        '
        Me.Panel5.Controls.Add(Me.Label15)
        Me.Panel5.Controls.Add(Me.Button8)
        Me.Panel5.Controls.Add(Me.Button9)
        Me.Panel5.Location = New System.Drawing.Point(1051, 78)
        Me.Panel5.Name = "Panel5"
        Me.Panel5.Size = New System.Drawing.Size(200, 100)
        Me.Panel5.TabIndex = 95
        '
        'Label15
        '
        Me.Label15.AutoSize = True
        Me.Label15.Font = New System.Drawing.Font("宋体", 15.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label15.ForeColor = System.Drawing.Color.DarkGreen
        Me.Label15.Location = New System.Drawing.Point(-4, 0)
        Me.Label15.Name = "Label15"
        Me.Label15.Size = New System.Drawing.Size(69, 20)
        Me.Label15.TabIndex = 97
        Me.Label15.Text = "外倾角"
        '
        'stepjog
        '
        Me.stepjog.Font = New System.Drawing.Font("宋体", 18.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.stepjog.Location = New System.Drawing.Point(674, 140)
        Me.stepjog.Name = "stepjog"
        Me.stepjog.Size = New System.Drawing.Size(100, 35)
        Me.stepjog.TabIndex = 88
        '
        'Panel6
        '
        Me.Panel6.Controls.Add(Me.Label16)
        Me.Panel6.Location = New System.Drawing.Point(629, 77)
        Me.Panel6.Name = "Panel6"
        Me.Panel6.Size = New System.Drawing.Size(179, 102)
        Me.Panel6.TabIndex = 97
        '
        'Label16
        '
        Me.Label16.AutoSize = True
        Me.Label16.Font = New System.Drawing.Font("宋体", 15.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(134, Byte))
        Me.Label16.ForeColor = System.Drawing.Color.DarkGreen
        Me.Label16.Location = New System.Drawing.Point(4, 0)
        Me.Label16.Name = "Label16"
        Me.Label16.Size = New System.Drawing.Size(99, 20)
        Me.Label16.TabIndex = 96
        Me.Label16.Text = "步距角/度"
        '
        'Form1
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 12.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.AutoSize = True
        Me.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Stretch
        Me.ClientSize = New System.Drawing.Size(1270, 744)
        Me.Controls.Add(Me.stepjog)
        Me.Controls.Add(Me.Panel5)
        Me.Controls.Add(Me.Panel4)
        Me.Controls.Add(Me.wqselect)
        Me.Controls.Add(Me.Label11)
        Me.Controls.Add(Me.qsselect)
        Me.Controls.Add(Me.Label3)
        Me.Controls.Add(Me.wyh)
        Me.Controls.Add(Me.wzh)
        Me.Controls.Add(Me.wyq)
        Me.Controls.Add(Me.wzq)
        Me.Controls.Add(Me.PictureBox2)
        Me.Controls.Add(Me.PictureBox1)
        Me.Controls.Add(Me.ListLog)
        Me.Controls.Add(Me.Button22)
        Me.Controls.Add(Me.Label1)
        Me.Controls.Add(Me.Label4)
        Me.Controls.Add(Me.qyh)
        Me.Controls.Add(Me.qzh)
        Me.Controls.Add(Me.qyq)
        Me.Controls.Add(Me.qzq)
        Me.Controls.Add(Me.qlinkh)
        Me.Controls.Add(Me.qlinkq)
        Me.Controls.Add(Me.Panel3)
        Me.Controls.Add(Me.Panel2)
        Me.Controls.Add(Me.Panel1)
        Me.Controls.Add(Me.qyhbt)
        Me.Controls.Add(Me.qzhbt)
        Me.Controls.Add(Me.qyqbt)
        Me.Controls.Add(Me.qzqbt)
        Me.Controls.Add(Me.GroupBox1)
        Me.Controls.Add(Me.Panel8)
        Me.Controls.Add(Me.Panel6)
        Me.Controls.Add(Me.GroupBox3)
        Me.FormBorderStyle = System.Windows.Forms.FormBorderStyle.None
        Me.MaximizeBox = False
        Me.MinimizeBox = False
        Me.Name = "Form1"
        Me.Text = "XDESIN"
        Me.WindowState = System.Windows.Forms.FormWindowState.Maximized
        Me.Panel8.ResumeLayout(False)
        Me.GroupBox2.ResumeLayout(False)
        Me.GroupBox3.ResumeLayout(False)
        Me.GroupBox3.PerformLayout()
        Me.GroupBox4.ResumeLayout(False)
        Me.GroupBox4.PerformLayout()
        Me.手动.ResumeLayout(False)
        Me.手动.PerformLayout()
        Me.GroupBox5.ResumeLayout(False)
        Me.GroupBox5.PerformLayout()
        Me.GroupBox1.ResumeLayout(False)
        Me.GroupBox1.PerformLayout()
        CType(Me.PictureBox1, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.PictureBox2, System.ComponentModel.ISupportInitialize).EndInit()
        Me.Panel4.ResumeLayout(False)
        Me.Panel4.PerformLayout()
        Me.Panel5.ResumeLayout(False)
        Me.Panel5.PerformLayout()
        Me.Panel6.ResumeLayout(False)
        Me.Panel6.PerformLayout()
        Me.ResumeLayout(False)
        Me.PerformLayout()

    End Sub
    Friend WithEvents Button1 As System.Windows.Forms.Button
    Friend WithEvents CMDSend As System.Windows.Forms.TextBox
    Friend WithEvents Button_Open As System.Windows.Forms.Button
    Friend WithEvents Button_Close As System.Windows.Forms.Button
    Friend WithEvents Label4 As Label
    Friend WithEvents qyh As TextBox
    Friend WithEvents qzh As TextBox
    Friend WithEvents qyq As TextBox
    Friend WithEvents qzq As TextBox
    Friend WithEvents qlinkh As Button
    Friend WithEvents qlinkq As Button
    Friend WithEvents Panel3 As Panel
    Friend WithEvents Panel2 As Panel
    Friend WithEvents Panel1 As Panel
    Friend WithEvents qyhbt As Button
    Friend WithEvents qzhbt As Button
    Friend WithEvents qyqbt As Button
    Friend WithEvents qzqbt As Button
    Friend WithEvents Label1 As Label
    Friend WithEvents GroupBox1 As GroupBox
    Friend WithEvents Heart As Button
    Friend WithEvents Panel8 As Panel
    Friend WithEvents GroupBox2 As GroupBox
    Friend WithEvents Button22 As Button
    Friend WithEvents Timerheart As Timer
    Friend WithEvents ListLog As RichTextBox
    Friend WithEvents Button25 As Button
    Friend WithEvents GroupBox3 As GroupBox
    Friend WithEvents qset As Button
    Friend WithEvents QA6 As TextBox
    Friend WithEvents QA5 As TextBox
    Friend WithEvents QA4 As TextBox
    Friend WithEvents QA3 As TextBox
    Friend WithEvents QA2 As TextBox
    Friend WithEvents QA1 As TextBox
    Friend WithEvents Label10 As Label
    Friend WithEvents Label9 As Label
    Friend WithEvents Label8 As Label
    Friend WithEvents Label7 As Label
    Friend WithEvents Label6 As Label
    Friend WithEvents Label5 As Label
    Friend WithEvents startrv As Button
    Friend WithEvents Button19 As Button
    Friend WithEvents Button18 As Button
    Friend WithEvents Button17 As Button
    Friend WithEvents Button16 As Button
    Friend WithEvents startqz As Button
    Friend WithEvents s6 As Button
    Friend WithEvents s5 As Button
    Friend WithEvents s4 As Button
    Friend WithEvents s3 As Button
    Friend WithEvents s2 As Button
    Friend WithEvents s1 As Button
    Friend WithEvents Button4 As Button
    Friend WithEvents Button3 As Button
    Friend WithEvents Timer1 As Timer
    Friend WithEvents Timersned As Timer
    Friend WithEvents duizhong As Button
    Friend WithEvents ProgressBar1 As ProgressBar
    Friend WithEvents wqselect As Button
    Friend WithEvents qsselect As Button
    Friend WithEvents PictureBox1 As PictureBox
    Friend WithEvents PictureBox2 As PictureBox
    Friend WithEvents wzq As TextBox
    Friend WithEvents wyq As TextBox
    Friend WithEvents wzh As TextBox
    Friend WithEvents wyh As TextBox
    Friend WithEvents Label3 As Label
    Friend WithEvents Label11 As Label
    Friend WithEvents Button6 As Button
    Friend WithEvents Button7 As Button
    Friend WithEvents Button8 As Button
    Friend WithEvents Button9 As Button
    Friend WithEvents Panel4 As Panel
    Friend WithEvents Label14 As Label
    Friend WithEvents Panel5 As Panel
    Friend WithEvents Label15 As Label
    Friend WithEvents stepjog As TextBox
    Friend WithEvents GroupBox4 As GroupBox
    Friend WithEvents Button5 As Button
    Friend WithEvents TextBox2 As TextBox
    Friend WithEvents Label2 As Label
    Friend WithEvents GroupBox5 As GroupBox
    Friend WithEvents RadioButton8 As RadioButton
    Friend WithEvents Label13 As Label
    Friend WithEvents RadioButton9 As RadioButton
    Friend WithEvents Label12 As Label
    Friend WithEvents RadioButton10 As RadioButton
    Friend WithEvents TextBox4 As TextBox
    Friend WithEvents RadioButton11 As RadioButton
    Friend WithEvents TextBox3 As TextBox
    Friend WithEvents RadioButton12 As RadioButton
    Friend WithEvents RadioButton4 As RadioButton
    Friend WithEvents RadioButton13 As RadioButton
    Friend WithEvents RadioButton1 As RadioButton
    Friend WithEvents RadioButton7 As RadioButton
    Friend WithEvents RadioButton2 As RadioButton
    Friend WithEvents RadioButton6 As RadioButton
    Friend WithEvents RadioButton3 As RadioButton
    Friend WithEvents RadioButton5 As RadioButton
    Friend WithEvents 手动 As GroupBox
    Friend WithEvents Button2 As Button
    Friend WithEvents TextBox1 As TextBox
    Friend WithEvents Label17 As Label
    Friend WithEvents Panel6 As Panel
    Friend WithEvents Label16 As Label
    Friend WithEvents duizhong3 As Button
    Friend WithEvents duizhong2 As Button
    Friend WithEvents duizhong1 As Button
    Friend WithEvents Button10 As Button
    Friend WithEvents Button11 As Button
    Friend WithEvents Button12 As Button
    Friend WithEvents Button13 As Button
    Friend WithEvents starthome As Button
End Class
