import { useState } from 'react'
import { Header } from './components'
import type { SetResult, WorkoutMode } from './lib/domain'

export function SummaryScreen({
  sets,
  mode,
  userName,
  partnerName,
  onSave,
  onBack,
}: {
  sets: SetResult[]
  mode: WorkoutMode
  userName: string
  partnerName?: string
  onSave: (sets: SetResult[]) => void
  onBack: () => void
}) {
  const [edited, setEdited] = useState<SetResult[]>(structuredClone(sets))

  const updateReps = (index: number, person: 'user' | 'partner', value: string) => {
    const copy = structuredClone(edited)
    const reps = value === '' ? undefined : Math.max(0, Number(value))
    if (person === 'user') copy[index].user.reps = reps
    else if (copy[index].partner) copy[index].partner!.reps = reps
    setEdited(copy)
  }

  return (
    <>
      <Header title="Workout Summary" onBack={onBack} />
      <main>
        <div className="intro compact">
          <span className="eyebrow">Workout complete</span>
          <h2>{sets.length} {sets.length === 1 ? 'set' : 'sets'}</h2>
          <p>Add reps now, or leave them blank.</p>
        </div>
        <div className="summary-list">
          {edited.map((set, index) => (
            <article className="summary-edit" key={index}>
              <div className="summary-title">
                <strong>Set {index + 1}</strong>
                <span>{set.pct}%</span>
              </div>
              <RepsRow
                name={userName}
                weight={set.user.loadedWeight}
                reps={set.user.reps}
                onChange={(value) => updateReps(index, 'user', value)}
              />
              {mode === 'partnered' && set.partner && (
                <RepsRow
                  name={partnerName!}
                  weight={set.partner.loadedWeight}
                  reps={set.partner.reps}
                  onChange={(value) => updateReps(index, 'partner', value)}
                />
              )}
            </article>
          ))}
        </div>
        <button className="primary full-width" onClick={() => onSave(edited)}>
          Save Workout
        </button>
      </main>
    </>
  )
}

function RepsRow({
  name,
  weight,
  reps,
  onChange,
}: {
  name: string
  weight: number
  reps?: number
  onChange: (value: string) => void
}) {
  return (
    <label className="reps-row">
      <span><strong>{name}</strong><small>{weight} lb</small></span>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        placeholder="Reps"
        value={reps ?? ''}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${name} reps at ${weight} pounds`}
      />
    </label>
  )
}
