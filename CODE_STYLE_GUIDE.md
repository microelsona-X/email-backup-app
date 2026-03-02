# Email Backup App - Code Style Guide

## 目录
1. [TypeScript 规范](#typescript-规范)
2. [React 规范](#react-规范)
3. [文件组织](#文件组织)
4. [命名约定](#命名约定)
5. [注释规范](#注释规范)
6. [错误处理](#错误处理)

---

## TypeScript 规范

### 基础规则
- 使用 2 空格缩进
- 使用单引号 `'` 而非双引号 `"`
- 语句末尾不使用分号
- 使用 `const` 和 `let`，禁止使用 `var`
- 优先使用箭头函数
- 使用 ES6+ 模块导入/导出

### 类型定义
```typescript
// ✅ 正确：显式类型定义
interface Account {
  id: string
  email: string
  type: AccountType
}

// ✅ 正确：使用 type 定义联合类型
type AccountType = 'imap' | 'microsoft365' | 'gmail'

// ❌ 错误：使用 any
const data: any = {}

// ✅ 正确：使用具体类型或 unknown
const data: unknown = {}
```

### 函数定义
```typescript
// ✅ 正确：箭头函数 + 显式返回类型
const createAccount = (email: string, type: AccountType): Account => {
  return {
    id: generateId(),
    email,
    type
  }
}

// ✅ 正确：async 函数
const fetchEmails = async (accountId: string): Promise<Email[]> => {
  const response = await api.get(`/emails/${accountId}`)
  return response.data
}
```

---

## React 规范

### 组件定义
```typescript
// ✅ 正确：函数组件 + TypeScript
interface AccountCardProps {
  account: Account
  onDelete: (id: string) => void
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onDelete }) => {
  return (
    <Card>
      <h3>{account.email}</h3>
      <Button onClick={() => onDelete(account.id)}>Delete</Button>
    </Card>
  )
}

export default AccountCard
```

### Hooks 使用
```typescript
// ✅ 正确：自定义 Hook
const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const data = await fetchAccounts()
      setAccounts(data)
    } catch (error) {
      console.error('Failed to load accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  return { accounts, loading, loadAccounts }
}
```

---

## 文件组织

### 目录结构
```
src/
├── components/          # 可复用组件
│   ├── AccountCard.tsx
│   └── SyncProgress.tsx
├── pages/              # 页面组件
│   ├── Dashboard.tsx
│   └── Accounts.tsx
├── stores/             # 状态管理
│   └── accountStore.ts
├── hooks/              # 自定义 Hooks
│   └── useAccounts.ts
├── types/              # 类型定义
│   └── account.ts
├── utils/              # 工具函数
│   └── format.ts
└── App.tsx
```

### 导入顺序
```typescript
// 1. React 相关
import { useState, useEffect } from 'react'
import type { FC } from 'react'

// 2. 第三方库
import { Button, Card } from 'antd'
import { create } from 'zustand'

// 3. 内部模块（按层级）
import { Account } from '@/types/account'
import { useAccounts } from '@/hooks/useAccounts'
import AccountCard from '@/components/AccountCard'

// 4. 样式文件
import './App.css'
```

---

## 命名约定

### 文件命名
- **组件文件**: PascalCase - `AccountCard.tsx`
- **工具文件**: camelCase - `formatDate.ts`
- **类型文件**: camelCase - `account.ts`
- **样式文件**: camelCase - `app.css`

### 变量命名
```typescript
// ✅ 正确：camelCase
const accountList = []
const isLoading = false
const maxRetryCount = 3

// ✅ 正确：常量使用 UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 1024 * 1024
const API_BASE_URL = 'https://api.example.com'

// ✅ 正确：布尔值使用 is/has/should 前缀
const isActive = true
const hasAttachments = false
const shouldSync = true
```

### 函数命名
```typescript
// ✅ 正确：动词开头
const fetchAccounts = async () => {}
const createAccount = (data: AccountData) => {}
const deleteAccount = (id: string) => {}
const validateEmail = (email: string) => {}

// ✅ 正确：事件处理函数使用 handle 前缀
const handleClick = () => {}
const handleSubmit = (e: FormEvent) => {}
const handleAccountDelete = (id: string) => {}
```

---

## 注释规范

### 函数注释
```typescript
/**
 * 连接到 IMAP 服务器
 * @param config IMAP 配置信息
 * @returns IMAP 客户端实例
 * @throws {ConnectionError} 连接失败时抛出
 */
const connectIMAP = async (config: IMAPConfig): Promise<ImapFlow> => {
  // 实现代码
}
```

### 代码注释
```typescript
// ✅ 正确：解释为什么这样做
// 使用 setTimeout 避免频繁触发同步
setTimeout(() => sync(), 1000)

// ❌ 错误：重复代码内容
// 设置 loading 为 true
setLoading(true)
```

---

## 错误处理

### 统一错误处理
```typescript
// ✅ 正确：使用 try-catch + 具体错误类型
const syncEmails = async (accountId: string): Promise<void> => {
  try {
    const emails = await fetchEmails(accountId)
    await saveEmails(emails)
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error('Network error:', error.message)
      throw new SyncError('Failed to sync due to network issue')
    }
    throw error
  }
}

// ✅ 正确：IPC 错误处理
window.electronAPI.send('sync-start', { accountId })
window.electronAPI.receive('sync-error', (error: string) => {
  console.error('Sync failed:', error)
  showNotification('Sync failed', error)
})
```

---

## Electron 特定规范

### IPC 通信
```typescript
// preload.ts - ✅ 正确：类型安全的 IPC
interface ElectronAPI {
  send: (channel: string, data: unknown) => void
  receive: (channel: string, callback: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

// ✅ 正确：白名单验证
const validChannels = ['sync-start', 'account-add']
if (validChannels.includes(channel)) {
  ipcRenderer.send(channel, data)
}
```

---

## 代码格式化配置

### ESLint 配置（推荐）
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "quotes": ["error", "single"],
    "semi": ["error", "never"],
    "indent": ["error", 2],
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

---

## 总结

遵循这些规范可以确保：
- 代码风格一致
- 类型安全
- 易于维护
- 团队协作顺畅
