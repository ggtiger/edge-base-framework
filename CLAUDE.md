# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Edge Base Framework (FWACS - Four Wheel Alignment Calibration System) is an industrial host computer application built with Electron, React, and TypeScript. It provides TCP/Serial communication, system monitoring, DLL integration, and hot-update capabilities for industrial calibration equipment.

## Build and Development Commands

```bash
# Development with hot reload
npm run dev

# Type check and build (renderer + electron)
npm run build

# Build for Windows specifically
npm run build:win

# Preview production build
npm run preview
```

## Architecture

### Process Structure (Electron)

The app follows Electron's multi-process architecture:

- **Main Process** (`src/main/index.ts`): Window management, tray, IPC handlers, service initialization
- **Preload** (`src/preload/index.ts`): Exposes `window.electronAPI` via contextBridge for secure IPC
- **Renderer** (`src/renderer/`): React UI with views (Calibration, Dashboard) and components

### Main Process Services (`src/main/services/`)

| Service | File | Purpose |
|---------|------|---------|
| TCP | `tcp.ts` | TCP socket client for device communication |
| Serial | `serial.ts` | SerialPort wrapper for RS-232/USB serial devices |
| DLL | `dll.ts` | Native DLL loading via koffi for Windows integrations |
| Update | `update.ts` | Electron auto-updater integration |
| Renderer Update | `rendererUpdate.ts` | Hot-update system for renderer assets (downloads zip, extracts to userData) |
| SysInfo | `sysInfo.ts` | System information via systeminformation package |

### IPC Communication Pattern

All renderer-to-main communication uses typed IPC:
- `ipcRenderer.send()` / `ipcMain.on()` for fire-and-forget (tcp:connect, serial:open)
- `ipcRenderer.invoke()` / `ipcMain.handle()` for request-response (win:minimize, tcp:get-config)
- `win.webContents.send()` for main-to-renderer events (tcp:data-received, tcp:status-change)

### Renderer Update System

The app supports hot-updating the renderer without a full app update:
- Updates stored in `userData/renderer-updates/versions/`
- `active.json` tracks current version
- Boot-time version check via `FWACS_VERSION_CHECK_URL` env or `boot-config.json`
- Falls back to bundled renderer on failure

### Persistent Storage

Uses `electron-store` (`src/main/store.ts`) for:
- Window bounds
- TCP configuration (host/port)

### Path Alias

`@/*` maps to `src/renderer/*` in both TypeScript and Vite.

## Key External Dependencies

- **serialport**: Native serial port communication
- **koffi**: FFI for calling native DLLs
- **electron-store**: Persistent JSON storage
- **electron-updater**: Auto-update functionality
- **adm-zip**: ZIP extraction for renderer hot-updates
- **systeminformation**: Cross-platform system info

## Build Configuration

- Vite config externalizes native modules: serialport, sqlite3, electron-store, systeminformation, koffi, adm-zip
- electron-builder.json5 configures NSIS installer for Windows (x64) and DMG for macOS
- Output goes to `release/${version}/`
