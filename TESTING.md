# 测试指南

## 启动应用

```bash
cd email-backup-app
npm run dev
```

## 核心功能测试

### 1. 添加 Gmail 账户
- 点击 "Add Account"
- 输入 Gmail 地址（如 `yourname@gmail.com`）
- 系统自动填充 `imap.gmail.com:993`
- 输入应用专用密码（从 https://myaccount.google.com/apppasswords 生成）
- 点击 "Test Connection" → 应显示成功
- 点击 "Add" 保存

**预期**: 账户显示为 Active（绿色徽章）

### 2. 添加 Outlook 账户
- 输入 Outlook/Hotmail 地址
- 自动填充 `outlook.office365.com:993`
- 输入凭据并测试连接
- 保存账户

### 3. 同步邮件
- 点击账户的 "Sync" 按钮
- 观察实时进度条和邮件计数
- 等待同步完成通知

**预期**:
- 进度实时更新
- Last Sync 时间更新
- 状态恢复为 Active

### 4. 验证文件存储

```bash
# 检查备份目录
ls OutlookBackup/yourname@gmail.com/data/        # EML 文件
ls OutlookBackup/yourname@gmail.com/attachments/ # 附件
ls OutlookBackup/yourname@gmail.com/metadata/    # 元数据
```

**预期**: EML 文件、附件、元数据 JSON 都正确生成

### 5. 增量同步
- 对已同步账户再次点击 "Sync"
- 应只同步新邮件，不重复下载

### 6. 删除账户
- 点击 "Delete" → 确认
- 账户从列表移除

## 错误场景

### 无效凭据
- 输入错误密码 → 点击 "Test Connection"
- **预期**: 显示 "Authentication failed"

### 网络断开
- 同步过程中断开网络
- **预期**: 显示错误，状态变为 Error（红色）

## 性能测试

- **大邮箱**（10,000+ 邮件）: UI 保持响应，内存稳定
- **大附件**（10MB+）: 完整下载，文件大小正确

## 常见问题

**Gmail 连接失败**:
- 使用应用专用密码（不是普通密码）
- 确认 IMAP 已启用
- 检查防火墙

**同步速度慢**:
- 检查网络速度
- IMAP 服务器可能限流

## 测试清单

- [ ] Gmail 账户添加（自动检测）
- [ ] Outlook 账户添加（自动检测）
- [ ] 连接测试验证
- [ ] 单账户同步
- [ ] 多账户同步
- [ ] EML 文件保存
- [ ] 附件保存
- [ ] 元数据生成
- [ ] 增量同步（无重复）
- [ ] 账户删除
- [ ] 错误处理（无效凭据）
- [ ] 错误处理（网络断开）
