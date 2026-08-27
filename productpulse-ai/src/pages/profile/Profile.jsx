import { Avatar } from '../../components/ui/Avatar'
import { ProfileForm } from '../../components/forms/ProfileForm'
import { PasswordChangeForm } from '../../components/forms/PasswordChangeForm'
import { useAuth } from '../../hooks/useAuth'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

export function Profile() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl">
      <h1 className="text-page-heading text-primary">Profile</h1>
      <p className="text-body mt-1 text-secondary">Your account details.</p>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-default bg-surface-card p-6">
        <Avatar name={user.full_name} size="lg" />
        <div>
          <p className="text-card-heading text-primary">{user.full_name}</p>
          <p className="text-small text-secondary">{user.email}</p>
          <p className="text-caption mt-0.5 text-tertiary">Member since {formatDate(user.created_at)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-default bg-surface-card p-6">
        <h2 className="text-card-heading text-primary">Edit profile</h2>
        <div className="mt-4">
          <ProfileForm />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-default bg-surface-card p-6">
        <h2 className="text-card-heading text-primary">Change password</h2>
        <div className="mt-4">
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  )
}
