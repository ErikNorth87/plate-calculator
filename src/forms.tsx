import { useState, type FormEvent } from 'react'
import type { BarWeight, Lift, Partner, Profile } from './lib/domain'
import { Header } from './components'

export function ProfileForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Profile | null
  onSave: (profile: Profile) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [barWeight, setBarWeight] = useState<BarWeight>(initial?.barWeight ?? 45)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (name.trim()) onSave({ name: name.trim(), barWeight })
  }

  return (
    <>
      <Header title={initial ? 'Edit Profile' : 'Welcome'} onBack={onCancel} />
      <main>
        <div className="intro">
          <span className="eyebrow">Plate Calculator</span>
          <h2>{initial ? 'Update your setup' : 'Create your local profile'}</h2>
          <p>Your information stays on this device.</p>
        </div>
        <form className="form-card" onSubmit={submit}>
          <label>
            Your name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <fieldset>
            <legend>Barbell weight</legend>
            <div className="segmented">
              {[35, 45].map((weight) => (
                <button
                  className={barWeight === weight ? 'selected' : ''}
                  type="button"
                  key={weight}
                  onClick={() => setBarWeight(weight as BarWeight)}
                >
                  {weight} lb
                </button>
              ))}
            </div>
          </fieldset>
          <button className="primary" type="submit">
            Save Profile
          </button>
        </form>
      </main>
    </>
  )
}

export function LiftForm({
  initial,
  onSave,
  onCancel,
  onDelete,
}: {
  initial?: Lift
  onSave: (name: string, oneRm: number) => void
  onCancel: () => void
  onDelete?: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [oneRm, setOneRm] = useState(initial?.oneRm.toString() ?? '')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const weight = Number(oneRm)
    if (name.trim() && weight > 0) onSave(name.trim(), weight)
  }

  return (
    <>
      <Header title={initial ? 'Edit Lift' : 'Create Lift'} onBack={onCancel} />
      <main>
        <form className="form-card" onSubmit={submit}>
          <label>
            Lift name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Back Squat"
              required
            />
          </label>
          <label>
            1 rep max (lb)
            <input
              type="number"
              min="1"
              step="0.5"
              inputMode="decimal"
              value={oneRm}
              onChange={(event) => setOneRm(event.target.value)}
              required
            />
          </label>
          <button className="primary" type="submit">
            {initial ? 'Save Changes' : 'Create Lift'}
          </button>
          {initial && onDelete && (
            <button
              className="danger-button full-width"
              type="button"
              onClick={() => {
                if (window.confirm(`Delete ${initial.name}? This removes the lift but keeps workout history.`)) {
                  onDelete()
                }
              }}
            >
              Delete Lift
            </button>
          )}
        </form>
      </main>
    </>
  )
}

export function PartnerForm({
  liftName,
  initial,
  currentOneRm,
  onSave,
  onCancel,
}: {
  liftName: string
  initial?: Partner
  currentOneRm?: number
  onSave: (name: string, oneRm: number) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [oneRm, setOneRm] = useState(currentOneRm?.toString() ?? '')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const weight = Number(oneRm)
    if (name.trim() && weight > 0) onSave(name.trim(), weight)
  }

  return (
    <>
      <Header title={initial ? 'Partner Details' : 'New Partner'} onBack={onCancel} />
      <main>
        <form className="form-card" onSubmit={submit}>
          <label>
            Partner name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            {liftName} 1 rep max (lb)
            <input
              type="number"
              min="1"
              step="0.5"
              inputMode="decimal"
              value={oneRm}
              onChange={(event) => setOneRm(event.target.value)}
              required
            />
          </label>
          <button className="primary" type="submit">
            Save Partner
          </button>
        </form>
      </main>
    </>
  )
}
