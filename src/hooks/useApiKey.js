// ─── useApiKey — manages Anthropic API key (env or localStorage override) ────
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'fincrime_api_key'

export function useApiKey() {
  const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY || ''
  const hasEnvKey = envKey && envKey !== 'your_anthropic_api_key_here'

  const [apiKey, setApiKeyState] = useState(() => {
    if (hasEnvKey) return envKey
    try { return localStorage.getItem(STORAGE_KEY) || '' } catch { return '' }
  })

  const setApiKey = (key) => {
    setApiKeyState(key)
    try { localStorage.setItem(STORAGE_KEY, key) } catch {}
  }

  const clearApiKey = () => {
    setApiKeyState('')
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const isConfigured = Boolean(apiKey && apiKey.startsWith('sk-ant'))

  return { apiKey, setApiKey, clearApiKey, isConfigured, hasEnvKey }
}
