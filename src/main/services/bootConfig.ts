import { app, ipcMain, shell } from 'electron'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'

export type BootConfig = {
  versionCheckUrl?: string
  versionCheckTimeoutMs?: number
}

function getBootConfigPath() {
  return path.join(app.getPath('userData'), 'boot-config.json')
}

function getDefaultBootConfigPath() {
  const candidates = [
    path.join(process.resourcesPath, 'boot-config.default.json'),
    path.join(app.getAppPath(), 'build/boot-config.default.json'),
    path.join(app.getAppPath(), 'boot-config.default.json'),
  ]
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p
    } catch {}
  }
  return null
}

function normalizeBootConfig(input: unknown): BootConfig {
  const obj = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const versionCheckUrl = typeof obj.versionCheckUrl === 'string' ? obj.versionCheckUrl.trim() : ''
  const rawTimeout = typeof obj.versionCheckTimeoutMs === 'number' ? obj.versionCheckTimeoutMs : Number(obj.versionCheckTimeoutMs)
  const versionCheckTimeoutMs = Number.isFinite(rawTimeout) ? Math.max(1000, Math.min(60000, Math.floor(rawTimeout))) : 6000

  let safeUrl = ''
  if (versionCheckUrl) {
    try {
      const u = new URL(versionCheckUrl)
      if (u.protocol === 'http:' || u.protocol === 'https:') safeUrl = versionCheckUrl
    } catch {}
  }

  return { versionCheckUrl: safeUrl, versionCheckTimeoutMs }
}

export async function ensureBootConfigExists() {
  const cfgPath = getBootConfigPath()
  try {
    await fsPromises.access(cfgPath)
    return
  } catch {}

  const defaultPath = getDefaultBootConfigPath()
  if (defaultPath) {
    try {
      const raw = await fsPromises.readFile(defaultPath, 'utf-8')
      const parsed = normalizeBootConfig(JSON.parse(raw))
      await fsPromises.mkdir(path.dirname(cfgPath), { recursive: true })
      await fsPromises.writeFile(cfgPath, JSON.stringify(parsed, null, 2), 'utf-8')
      return
    } catch {}
  }

  const fallback = normalizeBootConfig({})
  await fsPromises.mkdir(path.dirname(cfgPath), { recursive: true })
  await fsPromises.writeFile(cfgPath, JSON.stringify(fallback, null, 2), 'utf-8')
}

export async function readBootConfig(): Promise<BootConfig> {
  const cfgPath = getBootConfigPath()
  try {
    const raw = await fsPromises.readFile(cfgPath, 'utf-8')
    return normalizeBootConfig(JSON.parse(raw))
  } catch {
    return normalizeBootConfig({})
  }
}

export async function writeBootConfig(next: BootConfig): Promise<BootConfig> {
  const cfgPath = getBootConfigPath()
  const normalized = normalizeBootConfig(next)
  await fsPromises.mkdir(path.dirname(cfgPath), { recursive: true })
  await fsPromises.writeFile(cfgPath, JSON.stringify(normalized, null, 2), 'utf-8')
  return normalized
}

export async function patchBootConfig(patch: Partial<BootConfig>): Promise<BootConfig> {
  const current = await readBootConfig()
  const next = { ...current, ...patch }
  return await writeBootConfig(next)
}

export function setupBootConfigService() {
  ipcMain.handle('bootConfig:get', async () => {
    return await readBootConfig()
  })
  ipcMain.handle('bootConfig:set', async (_event, next: BootConfig) => {
    return await writeBootConfig(next)
  })
  ipcMain.handle('bootConfig:patch', async (_event, patch: Partial<BootConfig>) => {
    return await patchBootConfig(patch)
  })
  ipcMain.handle('bootConfig:open-location', async () => {
    const cfgPath = getBootConfigPath()
    shell.showItemInFolder(cfgPath)
    return { ok: true }
  })
}
