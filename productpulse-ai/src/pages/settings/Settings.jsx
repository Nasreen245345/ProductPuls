import { useState } from 'react'
import { Sun, Moon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { updatePreferences } from '../../services/userService'

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { user, updateUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleThemeSelect = async (value) => {
    setTheme(value) // applies immediately, same control the header toggle uses
    setError('')
    setSuccess(false)
    try {
      const res = await updatePreferences({ theme_preference: value })
      updateUser(res.data)
    } catch {
      // The visual theme already changed locally; only the server-side sync failed.
      // Not worth blocking the UI over — the next successful save will catch it up.
    }
  }

  const handleNotificationsToggle = async (event) => {
    const email_notifications_enabled = event.target.checked
    setError('')
    setSuccess(false)
    setIsSaving(true)
    try {
      const res = await updatePreferences({ email_notifications_enabled })
      updateUser(res.data)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Unable to save preference. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-page-heading text-primary">Settings</h1>
      <p className="text-body mt-1 text-secondary">Application and account preferences.</p>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-danger-50 px-3 py-2.5 text-small text-danger-700 dark:bg-danger-500/10 dark:text-danger-500">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2.5 text-small text-success-700 dark:bg-success-500/10 dark:text-success-500">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>Preferences saved.</span>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-default bg-surface-card p-6">
        <h2 className="text-card-heading text-primary">Theme</h2>
        <p className="text-small mt-1 text-secondary">Choose how ProductPulse AI looks on this device.</p>
        <div className="mt-4 flex gap-2">
          <Button
            variant={theme === 'light' ? 'primary' : 'outline'}
            leftIcon={<Sun size={15} />}
            onClick={() => handleThemeSelect('light')}
          >
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'primary' : 'outline'}
            leftIcon={<Moon size={15} />}
            onClick={() => handleThemeSelect('dark')}
          >
            Dark
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-default bg-surface-card p-6">
        <h2 className="text-card-heading text-primary">Notifications</h2>
        <label className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-small font-medium text-primary">Email notifications</p>
            <p className="text-caption text-tertiary">Receive updates about your account by email.</p>
          </div>
          <input
            type="checkbox"
            defaultChecked={user.email_notifications_enabled}
            onChange={handleNotificationsToggle}
            disabled={isSaving}
            className="h-5 w-5 shrink-0 rounded border-default text-brand-600 focus:ring-2 focus:ring-brand-500/20"
          />
        </label>
      </div>
    </div>
  )
}
