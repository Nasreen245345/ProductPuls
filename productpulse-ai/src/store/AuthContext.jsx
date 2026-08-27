import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../lib/constants'
import { loginUser, registerUser, fetchCurrentUser } from '../services/authService'

export const AuthContext = createContext(null)

/**
 * Session lifecycle:
 *   'loading'         — checking a stored token on first mount
 *   'authenticated'    — user is populated
 *   'unauthenticated'   — no valid session
 *
 * Only the token is persisted to localStorage (Chapter 9 §9). The user
 * profile is always re-fetched via GET /auth/me on load rather than
 * cached, so a revoked/expired token can't leave stale user data behind.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)

    if (!token) {
      setStatus('unauthenticated')
      return
    }

    fetchCurrentUser()
      .then((res) => {
        setUser(res.data)
        setStatus('authenticated')
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        setStatus('unauthenticated')
      })
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password })
    window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.data.access_token)

    const me = await fetchCurrentUser()
    setUser(me.data)
    setStatus('authenticated')
    return me.data
  }, [])

  const register = useCallback(async (payload) => {
    // Matches the API contract: register does not return a token, so the
    // caller (Register page) sends the user to /login after.
    return registerUser(payload)
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  /** Merges fields into the cached user — call after a successful profile/preferences update. */
  const updateUser = useCallback((partialUser) => {
    setUser((prev) => (prev ? { ...prev, ...partialUser } : prev))
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      logout,
      updateUser,
    }),
    [user, status, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
