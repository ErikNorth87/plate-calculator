import { useState } from 'react'
import { EmptyState, Header, ShareQr } from './components'
import type { Lift, Partner, Profile, Workout } from './lib/domain'
import { publicShareUrl, toNeutralWorkout } from './lib/storage'

export function HomeScreen({
  name,
  lifts,
  workouts,
  onCreate,
  onOpen,
  onEdit,
  onHistory,
  onSettings,
}: {
  name: string
  lifts: Lift[]
  workouts: Workout[]
  onCreate: () => void
  onOpen: (lift: Lift) => void
  onEdit: (lift: Lift) => void
  onHistory: () => void
  onSettings: () => void
}) {
  return (
    <>
      <Header
        title="Plate Calculator"
        action={
          <button className="icon-button" onClick={onSettings} aria-label="Settings">
            ⚙
          </button>
        }
      />
      <main>
        <div className="home-welcome">
          <span className="eyebrow">Welcome back</span>
          <h2>{name}</h2>
          <p>Choose a lift to start your workout.</p>
        </div>
        <div className="section-heading">
          <h3>Your lifts</h3>
          <button className="text-button" onClick={onCreate}>
            + New lift
          </button>
        </div>
        {lifts.length === 0 ? (
          <EmptyState>
            <p>No lifts yet.</p>
            <button className="primary" onClick={onCreate}>
              Create Your First Lift
            </button>
          </EmptyState>
        ) : (
          <div className="card-list">
            {lifts.map((lift) => (
              <article className="lift-card" key={lift.id}>
                <button className="card-main" onClick={() => onOpen(lift)}>
                  <span>{lift.name}</span>
                  <strong>{lift.oneRm} lb 1RM</strong>
                </button>
                <button className="small-button" onClick={() => onEdit(lift)}>
                  Edit
                </button>
              </article>
            ))}
          </div>
        )}
        {workouts.length > 0 && (
          <button className="secondary full-width" onClick={onHistory}>
            Workout History ({workouts.length})
          </button>
        )}
      </main>
    </>
  )
}

export function HistoryScreen({ workouts, onBack }: { workouts: Workout[]; onBack: () => void }) {
  const [selected, setSelected] = useState<Workout | null>(null)
  const download = (workout: Workout) => {
    const blob = new Blob([JSON.stringify(toNeutralWorkout(workout), null, 2)], {
      type: 'application/json',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${workout.liftName}-${workout.completedAt.slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (selected) {
    return (
      <>
        <Header title={selected.liftName} onBack={() => setSelected(null)} />
        <main>
          <p className="muted">{new Date(selected.completedAt).toLocaleString()}</p>
          <div className="summary-list">
            {selected.sets.map((set, index) => (
              <article className="summary-row" key={index}>
                <strong>Set {index + 1} · {set.pct}%</strong>
                <span>{selected.userName}: {set.user.loadedWeight} lb · {set.user.reps ?? '—'} reps</span>
                {set.partner && (
                  <span>{selected.partnerName}: {set.partner.loadedWeight} lb · {set.partner.reps ?? '—'} reps</span>
                )}
              </article>
            ))}
          </div>
          <button className="secondary full-width" onClick={() => download(selected)}>
            Export Workout JSON
          </button>
        </main>
      </>
    )
  }

  return (
    <>
      <Header title="Workout History" onBack={onBack} />
      <main className="card-list">
        {[...workouts].reverse().map((workout) => (
          <button className="history-card" key={workout.id} onClick={() => setSelected(workout)}>
            <strong>{workout.liftName}</strong>
            <span>{workout.mode === 'partnered' ? `With ${workout.partnerName}` : 'Solo'}</span>
            <small>{new Date(workout.completedAt).toLocaleString()}</small>
          </button>
        ))}
      </main>
    </>
  )
}

export function SettingsScreen({
  profile,
  partners,
  onBack,
  onEditProfile,
  onEditPartner,
  onDeletePartner,
}: {
  profile: Profile
  partners: Partner[]
  onBack: () => void
  onEditProfile: () => void
  onEditPartner: (partner: Partner) => void
  onDeletePartner: (partner: Partner) => void
}) {
  const url = publicShareUrl()
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
  }

  return (
    <>
      <Header title="Settings" onBack={onBack} />
      <main>
        <section className="settings-section">
          <div>
            <h2>{profile.name}</h2>
            <p>{profile.barWeight} lb barbell</p>
          </div>
          <button className="small-button" onClick={onEditProfile}>Edit</button>
        </section>
        {partners.length > 0 && (
          <section>
            <h3>Saved partners</h3>
            <div className="card-list">
              {partners.map((partner) => (
                <article className="lift-card" key={partner.id}>
                  <button className="card-main" onClick={() => onEditPartner(partner)}>
                    <span>{partner.name}</span>
                    <strong>{Object.keys(partner.oneRmsByLiftId).length} saved lift(s)</strong>
                  </button>
                  <button
                    className="small-button danger"
                    onClick={() => {
                      if (window.confirm(`Delete ${partner.name}?`)) onDeletePartner(partner)
                    }}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
        <section className="share-card">
          <span className="eyebrow">Share Plate Calculator</span>
          {url ? (
            <>
              <ShareQr url={url} />
              <p>Scan with an Android phone, open in Chrome, then choose <strong>Install app</strong>.</p>
              <button className="secondary full-width" onClick={copy}>
                {copied ? 'Link Copied' : 'Copy Install Link'}
              </button>
            </>
          ) : (
            <p>Publish to GitHub Pages and set <code>VITE_PUBLIC_URL</code> to enable the share QR.</p>
          )}
        </section>
      </main>
    </>
  )
}
