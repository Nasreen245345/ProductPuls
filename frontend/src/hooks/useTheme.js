import { useContext } from 'react'
import { ThemeContext } from '../store/ThemeContext'

/** Reads/updates the app's light-dark theme. Must be used within <ThemeProvider>. */
export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
