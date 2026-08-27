/** Thin wrapper around localStorage with JSON parsing and safe fallbacks. No other file should call window.localStorage directly. */

export function getItem(key, fallback = null) {
  const raw = window.localStorage.getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function setItem(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function removeItem(key) {
  window.localStorage.removeItem(key)
}
