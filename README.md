# MailGuardian (email-backup-app)

MailGuardian is an Electron + React desktop app for email backup and browsing.

## Current status

- IMAP account add/test/sync is enabled.
- Local backup storage location is configurable in **Settings**.
- Auto-sync interval is configurable in **Settings**.
- UI language is configurable in **Settings**.
- OAuth login (Microsoft 365 / Gmail) is currently **disabled**.

## Tech stack

- Electron
- React + TypeScript
- Vite
- Ant Design

## Development

```bash
npm install
npm run dev
```

## Build (Windows installer)

```bash
npm run generate:icons
npm run build
```

Installer output:

- `dist/MailGuardian Setup 1.0.0.exe`

## Notes

- If build fails with Windows symlink permission error, run terminal as Administrator or enable Developer Mode in Windows settings.
- If settings changes do not take effect, fully restart the Electron app (main process restart is required).
