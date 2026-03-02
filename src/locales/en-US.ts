export default {
  common: {
    appName: 'MailGuardian',
    appSubtitle: 'Email Guardian',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    refresh: 'Refresh',
    search: 'Search',
    loading: 'Loading...',
    noData: 'No Data',
    error: 'Error',
    success: 'Success'
  },
  nav: {
    dashboard: 'Dashboard',
    emails: 'Emails',
    accounts: 'Accounts',
    settings: 'Settings',
    guide: 'User Guide'
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Overview and key backup statistics',
    totalAccounts: 'Total Accounts',
    activeAccounts: 'Active Accounts',
    lastSync: 'Last Sync',
    neverSynced: 'Never Synced',
    addAccount: 'Add Account',
    syncAll: 'Sync All Accounts',
    mailboxAccounts: 'Mailbox Accounts'
  },
  accounts: {
    title: 'Account Management',
    description: 'Manage your email accounts and start backup',
    addAccount: 'Add Account',
    accountList: 'Account List',
    noAccounts: 'No email accounts yet',
    addAccountHint: 'Click "Add Account" above to start backing up your emails',
    sync: 'Sync',
    syncing: 'Syncing...',
    testConnection: 'Test Connection',
    deleteTitle: 'Delete Account',
    deleteConfirm: 'Are you sure you want to delete this account?',
    neverSynced: 'Never Synced',
    status: {
      active: 'Active',
      error: 'Error',
      syncing: 'Syncing'
    }
  },
  addAccount: {
    title: 'Add Email Account',
    selectType: 'Select Account Type',
    types: {
      imap: 'IMAP',
      microsoft365: 'Microsoft 365',
      gmail: 'Gmail'
    },
    steps: {
      step1: 'Enter your email address to auto-detect IMAP settings',
      step2: 'Enter password (Gmail requires an app-specific password)',
      step3: 'Click "Test Connection" to verify configuration',
      step4: 'Click "Add Account" after successful validation'
    },
    fields: {
      email: 'Email Address',
      emailPlaceholder: 'your@email.com',
      displayName: 'Display Name (Optional)',
      displayNamePlaceholder: 'My Email Account',
      imapServer: 'IMAP Server',
      imapServerPlaceholder: 'imap.example.com',
      port: 'Port',
      useSSL: 'Use SSL/TLS',
      username: 'Username (Optional)',
      usernamePlaceholder: 'Usually same as email',
      usernameTooltip: 'Leave empty to use email address',
      password: 'Password',
      passwordPlaceholder: 'Your password or app-specific password'
    },
    oauth: {
      microsoftTitle: 'Microsoft 365 / Outlook',
      microsoftDesc: 'Sign in with your Microsoft account to authorize access',
      microsoftButton: 'Sign in with Microsoft',
      gmailTitle: 'Gmail',
      gmailDesc: 'Sign in with your Google account to authorize access',
      gmailButton: 'Sign in with Google',
      authFailed: 'Authorization Failed'
    },
    validation: {
      emailRequired: 'Please enter email address',
      emailInvalid: 'Invalid email address format',
      hostRequired: 'Please enter IMAP server address',
      portRequired: 'Please enter port',
      portInvalid: 'Invalid port number',
      passwordRequired: 'Please enter password'
    },
    connectionSuccess: 'Connection Successful',
    connectionFailed: 'Connection Failed'
  },
  emails: {
    title: 'Email Browser',
    selectAccount: 'Select Account',
    searchPlaceholder: 'Search subject, sender...',
    refresh: 'Refresh',
    totalEmails: 'Total {{count}} emails',
    noEmails: 'No Emails',
    loadMore: 'Load More',
    attachments: '{{count}} attachments',
    noSubject: '(No Subject)',
    yesterday: 'Yesterday',
    daysAgo: '{{count}} days ago',
    detail: {
      attachments: 'Attachments ({{count}})',
      cannotLoad: 'Cannot load email content'
    }
  },
  guide: {
    title: 'Welcome to MailGuardian',
    subtitle: 'A simple and secure email backup tool',
    start: 'Get Started',
    importantTips: 'Important Tips',
    tip1: 'Gmail users must use an app-specific password instead of the regular password',
    tip2: 'Make sure IMAP is enabled in your mailbox settings',
    tip3: 'The first sync may take longer. Please be patient',
    steps: {
      addAccountTitle: 'Add Email Account',
      addAccountDesc: 'Click "Add Account", then enter your email and password. The app auto-detects provider settings.',
      testConnectionTitle: 'Test Connection',
      testConnectionDesc: 'Click "Test Connection" to verify your configuration before adding the account.',
      startSyncTitle: 'Start Sync',
      startSyncDesc: 'After adding an account, click "Sync" to back up emails. Messages are saved locally as EML files.',
      finishBackupTitle: 'Backup Complete',
      finishBackupDesc: 'After sync completes, view statistics on Dashboard. Files are stored in the OutlookBackup folder.'
    }
  },
  settings: {
    title: 'Settings',
    description: 'Application preferences and auto-sync options',
    backupTitle: 'Storage Location',
    backupPath: 'Backup Root Directory',
    backupHint: 'New backups are saved under this directory (sub-folder per account).',
    browse: 'Choose Folder',
    syncTitle: 'Auto Sync',
    autoSyncEnabled: 'Enable Auto Sync',
    autoSyncInterval: 'Sync Interval (minutes)',
    autoSyncHint: 'Minimum 5 minutes. When enabled, all IMAP accounts are synced periodically.',
    languageTitle: 'Language',
    languageLabel: 'App Language',
    save: 'Save Settings',
    saved: 'Settings saved'
  }
}
