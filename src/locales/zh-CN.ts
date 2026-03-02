export default {
  common: {
    appName: 'MailGuardian',
    appSubtitle: '邮件守护者',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    refresh: '刷新',
    search: '搜索',
    loading: '加载中...',
    noData: '暂无数据',
    error: '错误',
    success: '成功'
  },
  nav: {
    dashboard: '仪表盘',
    emails: '邮件',
    accounts: '账户',
    settings: '设置',
    guide: '使用指南'
  },
  dashboard: {
    title: '仪表盘',
    description: '邮件备份概览和统计信息',
    totalAccounts: '总账户数',
    activeAccounts: '活跃账户',
    lastSync: '最后同步',
    neverSynced: '从未同步',
    addAccount: '添加账户',
    syncAll: '同步所有账户',
    mailboxAccounts: '邮箱账户'
  },
  accounts: {
    title: '账户管理',
    description: '管理您的邮箱账户并开始备份',
    addAccount: '添加账户',
    accountList: '账户列表',
    noAccounts: '还没有添加邮箱账户',
    addAccountHint: '点击上方“添加账户”按钮开始备份您的邮件',
    sync: '同步',
    syncing: '同步中...',
    testConnection: '测试连接',
    deleteTitle: '删除账户',
    deleteConfirm: '确定要删除此账户吗？',
    neverSynced: '从未同步',
    status: {
      active: '正常',
      error: '错误',
      syncing: '同步中'
    }
  },
  addAccount: {
    title: '添加邮箱账户',
    selectType: '选择账户类型',
    types: {
      imap: 'IMAP',
      microsoft365: 'Microsoft 365',
      gmail: 'Gmail'
    },
    steps: {
      step1: '输入邮箱地址，系统会自动检测并配置 IMAP 设置',
      step2: '输入密码（Gmail 需使用应用专用密码）',
      step3: '点击“测试连接”验证配置是否正确',
      step4: '测试成功后点击“添加账户”完成'
    },
    fields: {
      email: '邮箱地址',
      emailPlaceholder: 'your@email.com',
      displayName: '显示名称（可选）',
      displayNamePlaceholder: '我的邮箱账户',
      imapServer: 'IMAP 服务器',
      imapServerPlaceholder: 'imap.example.com',
      port: '端口',
      useSSL: '使用 SSL/TLS',
      username: '用户名（可选）',
      usernamePlaceholder: '通常与邮箱地址相同',
      usernameTooltip: '留空则使用邮箱地址',
      password: '密码',
      passwordPlaceholder: '您的密码或应用专用密码'
    },
    oauth: {
      microsoftTitle: 'Microsoft 365 / Outlook',
      microsoftDesc: '点击下方按钮，使用您的 Microsoft 账户登录授权',
      microsoftButton: '使用 Microsoft 账户登录',
      gmailTitle: 'Gmail',
      gmailDesc: '点击下方按钮，使用您的 Google 账户登录授权',
      gmailButton: '使用 Google 账户登录',
      authFailed: '授权失败'
    },
    validation: {
      emailRequired: '请输入邮箱地址',
      emailInvalid: '邮箱格式不正确',
      hostRequired: '请输入 IMAP 服务器地址',
      portRequired: '请输入端口',
      portInvalid: '端口号无效',
      passwordRequired: '请输入密码'
    },
    connectionSuccess: '连接成功',
    connectionFailed: '连接失败'
  },
  emails: {
    title: '邮件浏览',
    selectAccount: '选择账户',
    searchPlaceholder: '搜索邮件主题、发件人...',
    refresh: '刷新',
    totalEmails: '共 {{count}} 封邮件',
    noEmails: '暂无邮件',
    loadMore: '加载更多',
    attachments: '{{count}} 个附件',
    noSubject: '(无主题)',
    yesterday: '昨天',
    daysAgo: '{{count}} 天前',
    detail: {
      attachments: '附件 ({{count}})',
      cannotLoad: '无法加载邮件内容'
    }
  },
  guide: {
    title: '欢迎使用 MailGuardian',
    subtitle: '一个简单、安全的邮件备份工具',
    start: '开始使用',
    importantTips: '重要提示',
    tip1: 'Gmail 用户需要使用“应用专用密码”而非普通密码',
    tip2: '请确保 IMAP 功能已在邮箱设置中启用',
    tip3: '首次同步可能需要较长时间，请耐心等待',
    steps: {
      addAccountTitle: '添加邮箱账户',
      addAccountDesc: '点击“添加账户”按钮，输入邮箱地址和密码。系统会自动检测邮箱提供商并配置 IMAP 设置。',
      testConnectionTitle: '测试连接',
      testConnectionDesc: '点击“测试连接”按钮验证邮箱配置是否正确。连接成功后才能添加账户。',
      startSyncTitle: '开始同步',
      startSyncDesc: '添加账户后，点击“同步”按钮开始备份邮件。所有邮件将保存为 EML 格式到本地磁盘。',
      finishBackupTitle: '完成备份',
      finishBackupDesc: '同步完成后，您可以在仪表盘查看备份统计信息。邮件保存在桌面的 OutlookBackup 文件夹中。'
    }
  },
  settings: {
    title: '设置',
    description: '应用配置与自动同步选项',
    backupTitle: '存储位置',
    backupPath: '备份根目录',
    backupHint: '新备份将保存到此目录下（按账户分子目录）。',
    browse: '选择目录',
    syncTitle: '自动同步',
    autoSyncEnabled: '启用自动同步',
    autoSyncInterval: '同步间隔（分钟）',
    autoSyncHint: '最小 5 分钟，启用后会按周期同步所有 IMAP 账户。',
    languageTitle: '语言',
    languageLabel: '界面语言',
    save: '保存设置',
    saved: '设置已保存'
  }
}
