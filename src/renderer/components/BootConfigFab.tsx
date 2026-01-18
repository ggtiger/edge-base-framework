import React, { useMemo, useState } from 'react'

type BootConfig = {
  versionCheckUrl?: string
  versionCheckTimeoutMs?: number
}

type RendererInfo = {
  appVersion: string
  rendererVersion: string
}

function validateHttpUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return { ok: true as const }
  try {
    const u = new URL(trimmed)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return { ok: false as const, message: '只支持 http/https' }
    return { ok: true as const }
  } catch {
    return { ok: false as const, message: 'URL 格式不正确' }
  }
}

export const BootConfigFab: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cfg, setCfg] = useState<BootConfig>({})
  const [info, setInfo] = useState<RendererInfo | null>(null)

  const urlValue = cfg.versionCheckUrl ?? ''
  const timeoutValue = Number.isFinite(cfg.versionCheckTimeoutMs) ? String(cfg.versionCheckTimeoutMs) : ''
  const urlValidation = useMemo(() => validateHttpUrl(urlValue), [urlValue])

  const openModal = async () => {
    setOpen(true)
    setLoading(true)
    setError(null)
    try {
      const [nextCfg, nextInfo] = await Promise.all([
        window.electronAPI.getBootConfig(),
        window.electronAPI.getRendererUpdateInfo(),
      ])
      setCfg(nextCfg ?? {})
      setInfo({ appVersion: nextInfo.appVersion, rendererVersion: nextInfo.rendererVersion })
    } catch (e: any) {
      setError(e?.message ? String(e.message) : '读取配置失败')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setOpen(false)
    setError(null)
  }

  const save = async () => {
    if (!urlValidation.ok) return
    setSaving(true)
    setError(null)
    try {
      const timeoutMs = timeoutValue.trim() ? Number(timeoutValue) : undefined
      const next: BootConfig = {
        versionCheckUrl: urlValue.trim(),
        versionCheckTimeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined,
      }
      const saved = await window.electronAPI.setBootConfig(next)
      setCfg(saved ?? next)
      setOpen(false)
    } catch (e: any) {
      setError(e?.message ? String(e.message) : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const openLocation = async () => {
    try {
      await window.electronAPI.openBootConfigLocation()
    } catch {}
  }

  return (
    <>
      <button
        type="button"
        className="fixed bottom-3 right-3 z-[120] w-10 h-10 rounded-full bg-white/40 dark:bg-slate-900/40 border border-slate-300/50 dark:border-white/10 backdrop-blur-md shadow-sm hover:shadow-md transition-opacity opacity-25 hover:opacity-100 flex items-center justify-center"
        onClick={openModal}
        aria-label="配置"
      >
        <span className="material-icons text-[18px] text-slate-700 dark:text-slate-200">settings</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-3" onClick={closeModal}>
          <div
            className="w-full max-w-lg rounded-2xl glass-panel dark:bg-panel-dark/80 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-icons text-blue-400 text-base">tune</span>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">更新服务器配置</div>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-center"
                onClick={closeModal}
                aria-label="关闭"
              >
                <span className="material-icons text-slate-700 dark:text-slate-200 text-base">close</span>
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {info && (
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>
                    应用版本：<span className="font-mono text-slate-800 dark:text-slate-100">{info.appVersion}</span>
                  </div>
                  <div>
                    UI 版本：<span className="font-mono text-slate-800 dark:text-slate-100">{info.rendererVersion}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">版本检查地址</div>
                <input
                  value={urlValue}
                  onChange={(e) => setCfg((prev) => ({ ...prev, versionCheckUrl: e.target.value }))}
                  className="w-full bg-white/80 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-white focus:border-primary outline-none transition-colors font-mono text-sm"
                  placeholder="https://example.com/check"
                  spellCheck={false}
                />
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  留空表示禁用启动时版本检查
                </div>
                {!urlValidation.ok && <div className="text-[11px] text-red-600 dark:text-red-400">{urlValidation.message}</div>}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">检查超时（毫秒）</div>
                <input
                  value={timeoutValue}
                  onChange={(e) => setCfg((prev) => ({ ...prev, versionCheckTimeoutMs: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  className="w-full bg-white/80 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-white focus:border-primary outline-none transition-colors font-mono text-sm"
                  placeholder="6000"
                  inputMode="numeric"
                />
              </div>

              {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
                  onClick={openLocation}
                  disabled={loading || saving}
                >
                  打开配置文件位置
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-white/5 transition"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
                    onClick={save}
                    disabled={loading || saving || !urlValidation.ok}
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>

              {loading && <div className="text-xs text-slate-600 dark:text-slate-400">读取中...</div>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
