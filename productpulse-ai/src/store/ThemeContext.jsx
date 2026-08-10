import { createContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../lib/constants'

export const ThemeContext = createContext(null)

function getInitialTheme() {
  const stored = window.localStorage.getItem(STORAGE_KEYS.THEME)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Provides { theme, toggleTheme, setTheme } and keeps the `.dark` class on
 * <html> (which index.css keys off of) in sync. MVP persistence is
 * localStorage, per Chapter 9 §20; swapping to profile-based storage later
 * only touches the effect below.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(STORAGE_KEYS.THEME, theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
