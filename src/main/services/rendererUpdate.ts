import { app, BrowserWindow, ipcMain } from 'electron'
import AdmZip from 'adm-zip'
import crypto from 'node:crypto'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'

const UPDATE_ROOT = 'renderer-updates'
const ACTIVE_FILE = 'active.json'

type RendererUpdateInfo = {
  active: 'bundled' | 'custom'
  customIndexHtmlPath?: string
  updateRoot: string
  activeDirName?: string
  appVersion: string
  rendererVersion: string
}

type InstallFromUrlArgs = {
  url: string
  sha256?: string
  rendererVersion?: string
}

function getUpdateRootPath() {
  return path.join(app.getPath('userData'), UPDATE_ROOT)
}

function getActiveFilePath() {
  return path.join(getUpdateRootPath(), ACTIVE_FILE)
}

function getVersionsRootPath() {
  return path.join(getUpdateRootPath(), 'versions')
}

function getTempRootPath() {
  return path.join(getUpdateRootPath(), 'temp')
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fsPromises.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

async function writeJsonFile(filePath: string, data: unknown) {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true })
  await fsPromises.writeFile(filePath, JSON.stringify(data), 'utf-8')
}

async function fileExists(filePath: string) {
  try {
    await fsPromises.access(filePath)
    return true
  } catch {
    return false
  }
}

async function resolveActiveDirPath() {
  const activeFilePath = getActiveFilePath()
  const activeInfo = await readJsonFile<{ activeDirName?: string }>(activeFilePath)
  if (activeInfo?.activeDirName) {
    return path.join(getVersionsRootPath(), activeInfo.activeDirName)
  }
  const legacyCurrentDir = path.join(getUpdateRootPath(), 'current')
  return legacyCurrentDir
}

export async function getCustomRendererPath(): Promise<string | null> {
  const activeDir = await resolveActiveDirPath()
  const candidate = path.join(activeDir, 'index.html')
  if (await fileExists(candidate)) return candidate
  return null
}

export async function getRendererUpdateInfo(): Promise<RendererUpdateInfo> {
  const custom = await getCustomRendererPath()
  const activeFilePath = getActiveFilePath()
  const activeInfo = await readJsonFile<{ activeDirName?: string; rendererVersion?: string }>(activeFilePath)
  const appVersion = app.getVersion()
  const rendererVersion = typeof activeInfo?.rendererVersion === 'string' && activeInfo.rendererVersion.trim() ? activeInfo.rendererVersion.trim() : appVersion
  if (custom) {
    return {
      active: 'custom',
      customIndexHtmlPath: custom,
      updateRoot: getUpdateRootPath(),
      activeDirName: activeInfo?.activeDirName,
      appVersion,
      rendererVersion,
    }
  }
  return { active: 'bundled', updateRoot: getUpdateRootPath(), activeDirName: activeInfo?.activeDirName, appVersion, rendererVersion: appVersion }
}

export async function loadRenderer(win: BrowserWindow) {
  if (!app.isPackaged) {
    const url = process.env['VITE_DEV_SERVER_URL']
    if (url) {
      await win.loadURL(url)
      return
    }
  }

  const customPath = await getCustomRendererPath()
  if (customPath) {
    try {
      await win.loadFile(customPath)
      return
    } catch {
      await revertToDefault()
    }
  }

  const candidates = [path.join(app.getAppPath(), 'dist/index.html'), path.join(__dirname, '../../dist/index.html')]
  let lastError: unknown = null
  for (const candidate of candidates) {
    try {
      await win.loadFile(candidate)
      return
    } catch (e) {
      lastError = e
    }
  }
  throw lastError ?? new Error('Failed to load renderer')
}

async function sha256File(filePath: string) {
  return await new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const rs = fs.createReadStream(filePath)
    rs.on('error', reject)
    rs.on('data', (chunk) => hash.update(chunk))
    rs.on('end', () => resolve(hash.digest('hex')))
  })
}

async function downloadToFile(url: string, filePath: string, onProgress?: (downloaded: number, total?: number) => void) {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true })

  const urlObj = new URL(url)
  const mod = urlObj.protocol === 'https:' ? https : urlObj.protocol === 'http:' ? http : null
  if (!mod) throw new Error(`Unsupported URL protocol: ${urlObj.protocol}`)

  await new Promise<void>((resolve, reject) => {
    const req = mod.get(urlObj, (res) => {
      const statusCode = res.statusCode ?? 0

      if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
        const redirected = new URL(res.headers.location, urlObj).toString()
        res.resume()
        downloadToFile(redirected, filePath, onProgress).then(resolve, reject)
        return
      }

      if (statusCode < 200 || statusCode >= 300) {
        res.resume()
        reject(new Error(`Download failed with status ${statusCode}`))
        return
      }

      const total = typeof res.headers['content-length'] === 'string' ? Number(res.headers['content-length']) : undefined
      let downloaded = 0

      res.on('data', (chunk) => {
        downloaded += Buffer.byteLength(chunk)
        onProgress?.(downloaded, total)
      })

      const ws = fs.createWriteStream(filePath)
      pipeline(res, ws).then(resolve, reject)
    })

    req.on('error', reject)
  })
}

async function normalizeExtractedDir(extractedRoot: string) {
  const directIndex = path.join(extractedRoot, 'index.html')
  if (await fileExists(directIndex)) return extractedRoot

  const entries = await fsPromises.readdir(extractedRoot, { withFileTypes: true })
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)
  if (dirs.length !== 1) throw new Error('Zip content is invalid (index.html not found)')

  const nestedDir = path.join(extractedRoot, dirs[0])
  const nestedIndex = path.join(nestedDir, 'index.html')
  if (!(await fileExists(nestedIndex))) throw new Error('Zip content is invalid (index.html not found)')
  return nestedDir
}

export async function installRendererUpdateFromZip(zipPath: string, rendererVersion?: string) {
  const updateRoot = getUpdateRootPath()
  const versionsRoot = getVersionsRootPath()
  const tempRoot = getTempRootPath()
  const installId = `v${Date.now()}`
  const extractionDir = path.join(tempRoot, `extract-${installId}`)
  const targetDir = path.join(versionsRoot, installId)

  await fsPromises.mkdir(extractionDir, { recursive: true })
  await fsPromises.mkdir(versionsRoot, { recursive: true })

  const zip = new AdmZip(zipPath)
  zip.extractAllTo(extractionDir, true)

  const normalized = await normalizeExtractedDir(extractionDir)
  await fsPromises.mkdir(targetDir, { recursive: true })
  await fsPromises.cp(normalized, targetDir, { recursive: true })

  const indexHtml = path.join(targetDir, 'index.html')
  if (!(await fileExists(indexHtml))) throw new Error('Install failed (index.html missing)')

  const safeRendererVersion = typeof rendererVersion === 'string' && rendererVersion.trim() ? rendererVersion.trim() : undefined
  await writeJsonFile(getActiveFilePath(), { activeDirName: installId, rendererVersion: safeRendererVersion })
  await fsPromises.rm(extractionDir, { recursive: true, force: true })

  return {
    ok: true as const,
    installId,
    updateRoot,
    indexHtml,
    rendererVersion: safeRendererVersion ?? null,
  }
}

export async function installRendererUpdateFromUrl(args: InstallFromUrlArgs, onProgress?: (downloaded: number, total?: number) => void) {
  const tempRoot = getTempRootPath()
  const installId = `v${Date.now()}`
  const zipPath = path.join(tempRoot, `renderer-${installId}.zip`)

  await downloadToFile(args.url, zipPath, onProgress)

  if (args.sha256) {
    const got = await sha256File(zipPath)
    const expected = args.sha256.trim().toLowerCase()
    if (got.toLowerCase() !== expected) throw new Error('SHA256 mismatch')
  }

  const result = await installRendererUpdateFromZip(zipPath, args.rendererVersion)
  await fsPromises.rm(zipPath, { force: true })
  return result
}

export async function revertToDefault() {
  const updateDir = getUpdateRootPath()
  if (!(await fileExists(updateDir))) return false
  await fsPromises.rm(updateDir, { recursive: true, force: true })
  return true
}

export function setupRendererUpdateService(win: BrowserWindow) {
  ipcMain.handle('rendererUpdate:get-info', async () => {
    return await getRendererUpdateInfo()
  })

  ipcMain.handle('rendererUpdate:install-from-url', async (_event, args: InstallFromUrlArgs) => {
    win.webContents.send('rendererUpdate:status', 'downloading')
    const result = await installRendererUpdateFromUrl(args, (downloaded, total) => {
      win.webContents.send('rendererUpdate:progress', { downloaded, total })
    })
    win.webContents.send('rendererUpdate:status', 'installed')
    return result
  })

  ipcMain.handle('rendererUpdate:revert', async () => {
    const ok = await revertToDefault()
    win.webContents.send('rendererUpdate:status', ok ? 'reverted' : 'no-op')
    return { ok }
  })

  ipcMain.handle('rendererUpdate:reload', async () => {
    win.webContents.send('rendererUpdate:status', 'reloading')
    win.reload()
    return { ok: true }
  })
}
