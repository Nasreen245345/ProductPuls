import { RegisterForm } from '../../components/forms/RegisterForm'

export function Register() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-default bg-surface-card p-8">
      <h1 className="text-section-heading text-primary">Create an account</h1>
      <p className="text-body mt-1 text-secondary">Start turning feedback into product decisions.</p>

      <div className="mt-6">
        <RegisterForm />
      </div>
    </div>
  )
}
